import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "..", ".env")

function loadEnv() {
  if (!existsSync(envPath)) return {}
  const lines = readFileSync(envPath, "utf8").split("\n")
  const env = {}
  for (const line of lines) {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = loadEnv()
const API_KEY = env.VITE_FIREBASE_API_KEY || "AIzaSyDpaNWYpfAI45bMQKoOHzIGKWvESKVIx50"

const firebaseConfig = {
  apiKey: API_KEY,
  projectId: env.VITE_FIREBASE_PROJECT_ID || "tienda-de-ropa-35bea",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

function groupBy(products, keyFn) {
  const groups = new Map()
  for (const p of products) {
    const key = keyFn(p)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  }
  return groups
}

function pickBest(dupes) {
  return dupes.reduce((best, p) => {
    const bestScore = countFields(best)
    const curScore = countFields(p)
    return curScore > bestScore ? p : best
  })
}

function countFields(p) {
  let score = 0
  if (p.name) score += 2
  if (p.brand) score += 1
  if (p.category) score += 1
  if (p.price) score += 1
  if (p.description && p.description.length > 10) score += 1
  if (p.imageUrl) score += 1
  if (p.colors && p.colors.length > 0) score += 2
  if (p.updatedAt) score += 1
  return score
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const email = process.env.FB_EMAIL || "admin@tiendaropa.com"
  const password = process.env.FB_PASSWORD || ""

  console.log("Conectando a Firebase...")
  const snap = await getDocs(collection(db, "products"))
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  console.log(`Total productos en Firestore: ${products.length}`)

  const groups = groupBy(products, (p) => normalize(p.name) + "|" + normalize(p.brand))
  const duplicates = []

  for (const [key, dupes] of groups) {
    if (dupes.length > 1) {
      const best = pickBest(dupes)
      const toDelete = dupes.filter((p) => p.id !== best.id)
      duplicates.push({ key, best, toDelete })
    }
  }

  if (duplicates.length === 0) {
    console.log("No se encontraron productos duplicados.")
    return
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`Se encontraron ${duplicates.length} grupos con duplicados:`)
  console.log(`${"=".repeat(60)}`)

  let totalToDelete = 0
  for (const group of duplicates) {
    totalToDelete += group.toDelete.length
    console.log(`\n📦 "${group.best.name || "sin nombre"}" (${group.best.brand || "sin marca"})`)
    console.log(`   Conservar: ${group.best.id} (score: ${countFields(group.best)})`)
    for (const d of group.toDelete) {
      console.log(`   Eliminar: ${d.id} "${d.name || "sin nombre"}" (score: ${countFields(d)})`)
    }
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`Total a eliminar: ${totalToDelete} productos`)
  console.log(`${"=".repeat(60)}`)

  if (dryRun || totalToDelete === 0) {
    console.log("\n✅ Dry-run completo. No se eliminó nada.")
    return
  }

  if (!password) {
    console.log("\n❌ No se proporcionó contraseña. Usá FB_PASSWORD=...")
    process.exit(1)
  }

  console.log("\nAutenticando via REST API...")
  let idToken
  try {
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    )
    const authData = await authRes.json()
    if (!authRes.ok) {
      console.error(`Error de autenticación: ${authData.error?.message || authRes.status}`)
      process.exit(1)
    }
    idToken = authData.idToken
    console.log(`Autenticado como ${email}`)
  } catch (err) {
    console.error(`Error de red en auth: ${err.message}`)
    process.exit(1)
  }

  const dbUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products`

  let deleted = 0
  let failed = 0
  for (const group of duplicates) {
    for (const d of group.toDelete) {
      try {
        const delRes = await fetch(`${dbUrl}/${d.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!delRes.ok) {
          const errBody = await delRes.text()
          console.error(`  ❌ Error al eliminar ${d.id}: ${delRes.status} ${errBody}`)
          failed++
        } else {
          console.log(`  ✅ Eliminado: ${d.id} (${d.name || "sin nombre"})`)
          deleted++
        }
      } catch (err) {
        console.error(`  ❌ Error de red al eliminar ${d.id}: ${err.message}`)
        failed++
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`Resultado: ${deleted} eliminados, ${failed} fallos`)
  console.log(`${"=".repeat(60)}`)
}

main().catch((err) => {
  console.error("Error general:", err)
  process.exit(1)
})
