import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "..", ".env")
const envContent = readFileSync(envPath, "utf-8")

const env: Record<string, string> = {}
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrate() {
  console.log("Connecting to Firestore...")

  const q = query(collection(db, "products"), where("seccion", "==", "outlet"))
  const snap = await getDocs(q)

  console.log(`Found ${snap.size} products with seccion: "outlet"`)

  if (snap.size === 0) {
    console.log("No products to migrate.")
    return
  }

  const updates = snap.docs.map((d) => updateDoc(doc(db, "products", d.id), { seccion: "ofertas" }))
  await Promise.all(updates)

  console.log(`Updated ${updates.length} products to seccion: "ofertas"`)
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
