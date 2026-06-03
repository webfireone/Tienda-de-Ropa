import jwt from "jsonwebtoken"
const GB = 1024 * 1024 * 1024
const MB = 1024 * 1024

const headers = { Accept: "application/json" }

async function getJson(url, token, tokenType = "Bearer") {
  const res = await fetch(url, { headers: { ...headers, Authorization: `${tokenType} ${token}` } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchGitHub() {
  const token = process.env.GH_TOKEN
  if (!token) return { configured: false, error: "Token no configurado (GH_TOKEN)" }

  try {
    const user = await getJson("https://api.github.com/user", token, "Bearer")
    const login = user.login

    const [actions, storage] = await Promise.allSettled([
      getJson(`https://api.github.com/users/${login}/settings/billing/actions`, token, "Bearer"),
      getJson(`https://api.github.com/users/${login}/settings/billing/shared-storage`, token, "Bearer"),
    ])

    const actionsData = actions.status === "fulfilled" ? actions.value : null
    const storageData = storage.status === "fulfilled" ? storage.value : null

    return {
      configured: true,
      avatar: user.avatar_url,
      username: login,
      name: user.name || login,
      profile: user.html_url,
      actions: actionsData
        ? {
            includedMinutes: actionsData.included_minutes,
            usedMinutes: actionsData.total_minutes_used,
            percentUsed: Math.round((actionsData.total_minutes_used / actionsData.included_minutes) * 100),
          }
        : null,
      storage: storageData
        ? {
            includedMB: 500,
            usedMB: Math.round(storageData.estimated_storage_for_month / MB),
            percentUsed: Math.round((storageData.estimated_storage_for_month / (500 * MB)) * 100),
          }
        : null,
    }
  } catch (err) {
    return { configured: true, error: err.message }
  }
}

async function fetchVercel() {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) return { configured: false, error: "Token no configurado (VERCEL_API_TOKEN)" }

  try {
    const userData = await getJson("https://api.vercel.com/v2/user", token)
    const user = userData.user

    let teamId = user.id
    try {
      const teamsData = await getJson("https://api.vercel.com/v1/teams", token)
      if (teamsData.teams?.length > 0) {
        teamId = teamsData.teams[0].id
      }
    } catch {}

    let usageData = null
    try {
      usageData = await getJson(`https://api.vercel.com/v1/teams/${teamId}/usage`, token)
    } catch {
      try {
        usageData = await getJson(`https://api.vercel.com/v1/teams/team_${teamId}/usage`, token)
      } catch {
        try {
          usageData = await getJson(`https://api.vercel.com/v1/teams/null/usage`, token)
        } catch {}
      }
    }

    const extract = (field) => {
      if (!usageData || !usageData.usage?.[field]) return null
      const d = usageData.usage[field]
      return {
        used: d.used ?? d.total ?? d.current,
        limit: d.limit ?? d.included ?? d.max,
        unit: d.unit || (field === "bandwidth" ? "GB" : ""),
      }
    }

    const bw = extract("bandwidth")
    const inv = extract("functions")
    const cpu = extract("activeCpu") || extract("active_cpu") || extract("cpu")
    const build = extract("builds") || extract("build") || extract("buildMinutes")

    return {
      configured: true,
      username: user.username,
      avatar: user.avatar || null,
      bandwidth: bw ? { ...bw, percentUsed: bw.limit ? Math.round((bw.used / bw.limit) * 100) : 0 } : null,
      invocations: inv ? { ...inv, percentUsed: inv.limit ? Math.round((inv.used / inv.limit) * 100) : 0 } : null,
      activeCpu: cpu ? { ...cpu, percentUsed: cpu.limit ? Math.round((cpu.used / cpu.limit) * 100) : 0 } : null,
      buildMinutes: build ? { ...build, percentUsed: build.limit ? Math.round((build.used / build.limit) * 100) : 0 } : null,
    }
  } catch (err) {
    return { configured: true, error: err.message }
  }
}

async function fetchRender() {
  const token = process.env.RENDER_API_KEY
  if (!token) return { configured: false, error: "Token no configurado (RENDER_API_KEY)" }

  try {
    const services = await getJson("https://api.render.com/v1/services", token, "Bearer")

    const webServices = services.filter((s) => s.service?.type === "web_service")
    const activeWeb = webServices.filter((s) => !s.service?.suspended)
    const staticSites = services.filter((s) => s.service?.type === "static_site")

    const hasUsageData = services.length > 0
    const hourLimit = 750
    const usedHours = null

    return {
      configured: true,
      total: services.length,
      webServices: webServices.length,
      staticSites: staticSites.length,
      activeWeb: activeWeb.length,
      suspended: services.filter((s) => s.service?.suspended).length,
      label: services.filter((s) => s.service?.suspended).length > 0 ? "Suspendido (cuota agotada)" : `${services.length} servicios`,
      instanceHours: usedHours
        ? { used: usedHours, limit: hourLimit, percentUsed: Math.round((usedHours / hourLimit) * 100) }
        : null,
      hasUsageData,
    }
  } catch (err) {
    return { configured: true, error: err.message }
  }
}

async function fetchFirebase() {
  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID

  if (!saB64 || !projectId) {
    return { configured: false, error: "Service Account no configurado (FIREBASE_SERVICE_ACCOUNT_B64)" }
  }

  try {
    const sa = JSON.parse(Buffer.from(saB64, "base64").toString())
    let jwt
    try {
      jwt = await getGcpToken(sa)
    } catch (e) {
      return { configured: true, error: `Error GCP: ${e.message}` }
    }
    if (!jwt) throw new Error("No se pudo obtener token GCP")

    const end = new Date().toISOString()
    const start = new Date(Date.now() - 7 * 86400000).toISOString()

    const [reads, writes, deletes, egress] = await Promise.allSettled([
      queryFirestoreMetric(projectId, jwt, "firestore.googleapis.com/document/read_count", start, end),
      queryFirestoreMetric(projectId, jwt, "firestore.googleapis.com/document/write_count", start, end),
      queryFirestoreMetric(projectId, jwt, "firestore.googleapis.com/document/delete_count", start, end),
      queryFirestoreMetric(projectId, jwt, "firestore.googleapis.com/network/sent_bytes_count", start, end),
    ])

    const extractMetric = (r) => {
      if (r.status !== "fulfilled") return { error: r.reason?.message }
      const v = r.value
      if (v?.error) {
        if (v.error.includes("billing")) return { spark: true, error: "Requiere plan Blaze" }
        return { error: v.error }
      }
      return v
    }

    return {
      configured: true,
      projectId,
      reads: extractMetric(reads),
      writes: extractMetric(writes),
      deletes: extractMetric(deletes),
      egress: extractMetric(egress),
      period: "7d",
    }
  } catch (err) {
    return { configured: true, error: err.message }
  }
}


async function getGcpToken(sa) {
  try {
    const key = sa.private_key.replace(/\\n/g, "\n").trim()

    const signed = jwt.sign(
      {
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/monitoring.read",
        aud: "https://oauth2.googleapis.com/token",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      },
      key,
      { algorithm: "RS256", header: { alg: "RS256", typ: "JWT" } }
    )

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signed,
      }),
    })
    const data = await res.text()
    if (!res.ok) {
      throw new Error(`${res.status}: ${data}`)
    }
    return JSON.parse(data).access_token
  } catch (e) {
    throw new Error(`getGcpToken: ${e.message}`)
  }
}

async function queryFirestoreMetric(projectId, token, metric, start, end) {
  const url = `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?filter=metric.type%3D%22${metric}%22&interval.startTime=${start}&interval.endTime=${end}&aggregation.alignmentPeriod=86400s&aggregation.perSeriesAligner=ALIGN_RATE`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) {
    console.error(`Firebase metric ${metric} error:`, data.error?.message || res.status)
    return { error: data.error?.message || `HTTP ${res.status}` }
  }

  const points = data.timeSeries?.[0]?.points || []
  let total = 0
  for (const p of points) {
    const v = p.value?.int64Value || p.value?.doubleValue || 0
    total += Number(v)
  }

  if (metric.includes("sent_bytes")) {
    return { bytes: total }
  }
  return { count: Math.round(total) }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  try {
    const data = await Promise.all([fetchGitHub(), fetchVercel(), fetchRender(), fetchFirebase()])

    res.json({
      github: data[0],
      vercel: data[1],
      render: data[2],
      firebase: data[3],
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
