import { useEffect, useState } from "react"
import { apiUrl } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Navigate } from "react-router-dom"
import { Server, GitBranch, Triangle, Cloud, BarChart3, ExternalLink, RefreshCw, CheckCircle, XCircle, HelpCircle, Database, Activity, HardDrive, Zap, Globe, Clock } from "lucide-react"

type ServiceStatus = {
  configured: boolean
  error?: string
  [key: string]: any
}

type StatusData = {
  github: ServiceStatus
  vercel: ServiceStatus
  render: ServiceStatus
  firebase: ServiceStatus
  timestamp: string
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GiB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MiB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${bytes} B`
}

function ProgressBar({ used, limit, unit, color }: { used: number; limit: number; unit?: string; color?: string }) {
  const pct = Math.min((used / limit) * 100, 100)
  const barColor =
    color ||
    (pct >= 90 ? "#ff2a6d" : pct >= 70 ? "#ff8c2a" : pct >= 40 ? "#f5d300" : "#00f5d4")

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {formatNum(used)} {unit || ""}
        </span>
        <span className="text-muted-foreground">
          de {formatNum(limit)} {unit || ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}40` }}
        />
      </div>
      <div className="flex justify-between text-[10px]">
        <span style={{ color: barColor }} className="font-semibold">
          {pct.toFixed(0)}%
        </span>
        <span className="text-muted-foreground">{(limit - used).toFixed(0)} disponible</span>
      </div>
    </div>
  )
}

function MiniBar({ used, limit, label, icon: Icon }: { used: number; limit: number; label: string; icon: any }) {
  const pct = Math.min((used / limit) * 100, 100)
  const warn = pct >= 70 && pct < 90
  const danger = pct >= 90
  const color = danger ? "#ff2a6d" : warn ? "#ff8c2a" : "#00f5d4"

  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-muted-foreground truncate">{label}</span>
          <span className="font-mono text-[10px]" style={{ color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}

function formatNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString("es-AR")
}

function ServiceCard({
  title,
  icon: Icon,
  color,
  status,
  children,
}: {
  title: string
  icon: any
  color: string
  status: ServiceStatus
  children: React.ReactNode
}) {
  const StatusIcon = !status.configured ? HelpCircle : status.error ? XCircle : CheckCircle
  const statusColor = !status.configured ? "text-muted-foreground" : status.error ? "text-[#ff2a6d]" : "text-[#00f5d4]"

  return (
    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 overflow-hidden transition-all duration-300 hover:border-primary/20">
      {/* header */}
      <div className="flex items-center gap-3 p-4 md:p-5 border-b border-primary/5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          {status.configured ? (
            <p className="text-xs text-muted-foreground truncate">
              {status.username || status.name || status.ownerId || status.projectId || status.label || "Conectado"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No conectado</p>
          )}
        </div>
        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
      </div>

      {/* body */}
      <div className="p-4 md:p-5 space-y-3">
        {status.error && !status.configured ? (
          <div className="text-xs text-muted-foreground space-y-2">
            <p>API key no configurada.</p>
            <p className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded">Agregar en Vercel Dashboard → Environment Variables</p>
          </div>
        ) : status.error ? (
          <div className="text-xs text-[#ff2a6d]/80 flex items-start gap-2">
            <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{status.error}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <div className="flex items-center gap-3 p-4 md:p-5 border-b border-primary/5">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          <div className="h-2 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="p-4 md:p-5 space-y-3">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export function StatusServiciosPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStatus = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(apiUrl("/api/status-servicios"))
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />

  const dashHref = (platform: string) => {
    const links: Record<string, string> = {
      github: "https://github.com/settings/billing",
      vercel: "https://vercel.com/usage",
      render: "https://dashboard.render.com/usage",
      firebase: "https://console.firebase.google.com/project/tienda-de-ropa-35bea/usage",
    }
    return links[platform] || "#"
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                Estado de Servicios
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Consumo actual de las plataformas gratuitas
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  Actualizado: {new Date(data.timestamp).toLocaleTimeString("es-AR")}
                </span>
              )}
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#ff2a6d]/10 border border-[#ff2a6d]/20 text-xs text-[#ff2a6d]/80">
            Error al cargar: {error}
          </div>
        )}

        {loading && !data ? (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : data ? (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {([
                ["GitHub", data.github.configured && !data.github.error, GitBranch, "#fff"],
                ["Vercel", data.vercel.configured && !data.vercel.error, Triangle, "#fff"],
                ["Render", data.render.configured && !data.render.error, Cloud, "#fff"],
                ["Firebase", data.firebase.configured && !data.firebase.error, Database, "#fff"],
              ] as const).map(([name, ok, Icon, _color]) => (
                <div
                  key={name}
                  className="rounded-xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 p-3 md:p-4 text-center"
                >
                  <Icon className="h-5 w-5 mx-auto mb-1.5" style={{ color: ok ? "#00f5d4" : "#adb5bd" }} />
                  <p className="text-xs font-semibold">{name}</p>
                  <p className={`text-[10px] ${ok ? "text-[#00f5d4]" : "text-muted-foreground"}`}>
                    {ok ? "Conectado" : "No configurado"}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              {/* GITHUB */}
              <ServiceCard title="GitHub" icon={GitBranch} color="#fff" status={data.github}>
                {data.github.actions && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">Actions — Minutos CI/CD</span>
                      </div>
                      <ProgressBar used={data.github.actions.usedMinutes} limit={data.github.actions.includedMinutes} unit="min" />
                    </div>
                    {data.github.storage && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold">Packages Storage</span>
                        </div>
                        <ProgressBar used={data.github.storage.usedMB} limit={data.github.storage.includedMB} unit="MB" />
                      </div>
                    )}
                    <a
                      href={dashHref("github")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver dashboard
                    </a>
                  </div>
                )}
              </ServiceCard>

              {/* VERCEL */}
              <ServiceCard title="Vercel" icon={Triangle} color="#fff" status={data.vercel}>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold">Uso del plan Hobby</span>
                </div>
                <div className="space-y-1">
                  {data.vercel.bandwidth && (
                    <MiniBar used={data.vercel.bandwidth.used} limit={data.vercel.bandwidth.limit} label="Ancho de banda" icon={Activity} />
                  )}
                  {data.vercel.invocations && (
                    <MiniBar used={data.vercel.invocations.used} limit={data.vercel.invocations.limit} label="Invocaciones de funciones" icon={Zap} />
                  )}
                  {data.vercel.activeCpu && (
                    <MiniBar used={data.vercel.activeCpu.used} limit={data.vercel.activeCpu.limit} label="CPU activo (horas)" icon={Server} />
                  )}
                  {data.vercel.buildMinutes && (
                    <MiniBar used={data.vercel.buildMinutes.used} limit={data.vercel.buildMinutes.limit} label="Minutos de build" icon={BarChart3} />
                  )}
                </div>
                {!data.vercel.bandwidth && !data.vercel.invocations && (
                  <p className="text-xs text-muted-foreground">
                    Datos de uso no disponibles automáticamente para plan Hobby.
                  </p>
                )}
                <a
                  href={dashHref("vercel")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver dashboard de uso
                </a>
              </ServiceCard>

              {/* RENDER */}
              <ServiceCard title="Render" icon={Cloud} color="#fff" status={data.render}>
                {data.render.total !== undefined ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Server className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">Servicios ({data.render.total})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] text-muted-foreground">Web Services</p>
                          <p className="font-bold font-mono">{data.render.webServices}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] text-muted-foreground">Static Sites</p>
                          <p className="font-bold font-mono">{data.render.staticSites}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#ff2a6d]" />
                      <span className="text-xs text-[#ff2a6d] font-semibold">
                        {data.render.suspended > 0
                          ? `${data.render.suspended} suspendido${data.render.suspended > 1 ? "s" : ""} (cuota agotada)`
                          : "Todos activos"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-primary/5">
                      <p className="text-[10px] text-muted-foreground mb-1">Límite de horas</p>
                      <p className="text-xs font-semibold">750 h/mes para todos los servicios combinados</p>
                      {data.render.activeWeb > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {data.render.activeWeb} web service{data.render.activeWeb > 1 ? "s" : ""} activo{data.render.activeWeb > 1 ? "s" : ""} consumiendo horas
                        </p>
                      )}
                    </div>
                    <a
                      href={dashHref("render")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver dashboard
                    </a>
                  </div>
                ) : (
                  !data.render.error && (
                    <p className="text-xs text-muted-foreground">API conectada pero datos de uso no disponibles.</p>
                  )
                )}
              </ServiceCard>

              {/* FIREBASE */}
              <ServiceCard title="Firebase" icon={Database} color="#ff8c00" status={data.firebase}>
                {data.firebase.reads !== undefined && !data.firebase.reads?.spark ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">Firestore — Hoy</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] text-muted-foreground">Lecturas</p>
                          <p className="text-xs font-bold font-mono tabular-nums" style={{ color: (data.firebase.reads?.count || 0) > 40000 ? "#ff2a6d" : "#00f5d4" }}>
                            {formatNum(data.firebase.reads?.count || 0)}
                          </p>
                          <p className="text-[8px] text-muted-foreground">/ 50K</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] text-muted-foreground">Escrituras</p>
                          <p className="text-xs font-bold font-mono tabular-nums" style={{ color: (data.firebase.writes?.count || 0) > 15000 ? "#ff2a6d" : "#00f5d4" }}>
                            {formatNum(data.firebase.writes?.count || 0)}
                          </p>
                          <p className="text-[8px] text-muted-foreground">/ 20K</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] text-muted-foreground">Borrados</p>
                          <p className="text-xs font-bold font-mono tabular-nums" style={{ color: (data.firebase.deletes?.count || 0) > 15000 ? "#ff2a6d" : "#00f5d4" }}>
                            {formatNum(data.firebase.deletes?.count || 0)}
                          </p>
                          <p className="text-[8px] text-muted-foreground">/ 20K</p>
                        </div>
                      </div>
                    </div>
                    {data.firebase.egress?.bytes !== undefined && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold">Egress (hoy)</span>
                        </div>
                        <p className="text-xs font-mono tabular-nums">
                          {formatBytes(data.firebase.egress.bytes)} / 10 GiB/mes
                        </p>
                      </div>
                    )}
                    <a
                      href={dashHref("firebase")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver dashboard
                    </a>
                  </div>
                ) : data.firebase.reads?.spark ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-semibold text-amber-400">Spark Plan</span>
                      <span className="text-[10px] text-muted-foreground">— Las métricas detalladas requieren el plan Blaze</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conexión establecida correctamente con Firebase.
                    </p>
                    <a
                      href={dashHref("firebase")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver Firebase Console
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Firebase funciona correctamente (Spark plan).
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Para ver métricas en tiempo real, configurá el Service Account de Google Cloud como variable de entorno.
                    </p>
                    <a
                      href={dashHref("firebase")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver Firebase Console
                    </a>
                  </div>
                )}
              </ServiceCard>
            </div>

            {/* Límites de referencia */}
            <div className="mt-8 rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Límites del plan gratuito — Referencia</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-muted-foreground text-[10px] uppercase tracking-wider">
                      <th className="text-left py-2 pr-4">Recurso</th>
                      <th className="text-left py-2 pr-4">Límite</th>
                      <th className="text-left py-2">Se renueva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    <tr><td className="py-2 pr-4"><GitBranch className="h-3 w-3 inline mr-1.5" />GitHub Actions</td><td className="py-2 pr-4 font-mono">2.000 min/mes</td><td className="py-2">Cada mes</td></tr>
                    <tr><td className="py-2 pr-4"><GitBranch className="h-3 w-3 inline mr-1.5" />GitHub Packages</td><td className="py-2 pr-4 font-mono">500 MB</td><td className="py-2">—</td></tr>
                    <tr><td className="py-2 pr-4"><Triangle className="h-3 w-3 inline mr-1.5" />Vercel Bandwidth</td><td className="py-2 pr-4 font-mono">100 GB/mes</td><td className="py-2">30 días</td></tr>
                    <tr><td className="py-2 pr-4"><Triangle className="h-3 w-3 inline mr-1.5" />Vercel Functions</td><td className="py-2 pr-4 font-mono">1M invocaciones/mes</td><td className="py-2">30 días</td></tr>
                    <tr><td className="py-2 pr-4"><Triangle className="h-3 w-3 inline mr-1.5" />Vercel Build</td><td className="py-2 pr-4 font-mono">6.000 min/mes</td><td className="py-2">30 días</td></tr>
                    <tr><td className="py-2 pr-4"><Cloud className="h-3 w-3 inline mr-1.5" />Render Instancia</td><td className="py-2 pr-4 font-mono">750 h/mes</td><td className="py-2">Cada mes</td></tr>
                    <tr><td className="py-2 pr-4"><Database className="h-3 w-3 inline mr-1.5" />Firestore Lecturas</td><td className="py-2 pr-4 font-mono">50.000/día</td><td className="py-2">Medianoche PT</td></tr>
                    <tr><td className="py-2 pr-4"><Database className="h-3 w-3 inline mr-1.5" />Firestore Escrituras</td><td className="py-2 pr-4 font-mono">20.000/día</td><td className="py-2">Medianoche PT</td></tr>
                    <tr><td className="py-2 pr-4"><Database className="h-3 w-3 inline mr-1.5" />Firestore Datos</td><td className="py-2 pr-4 font-mono">1 GiB total</td><td className="py-2">—</td></tr>
                    <tr><td className="py-2 pr-4"><Database className="h-3 w-3 inline mr-1.5" />Firestore Egress</td><td className="py-2 pr-4 font-mono">10 GiB/mes</td><td className="py-2">Cada mes</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
