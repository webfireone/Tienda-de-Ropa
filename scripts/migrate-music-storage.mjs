/**
 * Script de migración: sube MP3s desde una carpeta local a Firebase Storage
 * y actualiza el archivoUrl en Firestore.
 *
 * Las canciones que se subieron desde el panel admin y solo están en IndexedDB
 * deben migrarse desde el botón "Migrar Audio" en el panel admin.
 *
 * Uso:
 *   1. Descargar la service account desde Firebase Console:
 *      Config. del proyecto → Cuentas de servicio → Firebase Admin SDK → Generar clave privada
 *   2. node scripts/migrate-music-storage.mjs <ruta-service-account.json> [ruta-carpeta-mp3]
 *
 *   Por defecto busca MP3 en ./public/music/
 */

import { readFileSync, existsSync } from "fs"
import { readdir } from "fs/promises"
import { join, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = resolve(__dirname, "..")

async function main() {
  const serviceAccountPath = process.argv[2]
  if (!serviceAccountPath) {
    console.error("Uso: node scripts/migrate-music-storage.mjs <ruta-service-account.json> [ruta-carpeta-mp3]")
    console.error("")
    console.error("Ejemplo:")
    console.error("  node scripts/migrate-music-storage.mjs ./firebase-key.json")
    console.error("  node scripts/migrate-music-storage.mjs C:/Users/tu/Downloads/firebase-key.json ./public/music/")
    process.exit(1)
  }

  let serviceAccount
  try {
    const fullPath = resolve(process.cwd(), serviceAccountPath)
    serviceAccount = JSON.parse(readFileSync(fullPath, "utf-8"))
  } catch {
    console.error(`No se pudo leer el archivo de service account: ${serviceAccountPath}`)
    process.exit(1)
  }

  const musicDir = resolve(process.cwd(), process.argv[3] || join(ROOT, "public", "music"))
  if (!existsSync(musicDir)) {
    console.error(`La carpeta de MP3 no existe: ${musicDir}`)
    process.exit(1)
  }

  const projectId = serviceAccount.project_id
  const storageBucket = `${projectId}.firebasestorage.app`

  console.log("=".repeat(60))
  console.log("Migración de Audio a Firebase Storage")
  console.log("=".repeat(60))
  console.log(`Proyecto:     ${projectId}`)
  console.log(`Storage:      ${storageBucket}`)
  console.log(`Carpeta MP3:  ${musicDir}`)
  console.log("")

  // Cargar Firebase Admin SDK dinámicamente
  const admin = await import("firebase-admin")

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
    })
  }

  const db = admin.firestore()
  const bucket = admin.storage().bucket()

  // Leer archivos MP3
  const files = (await readdir(musicDir)).filter(f => f.toLowerCase().endsWith(".mp3"))
  console.log(`Archivos MP3 encontrados: ${files.length}`)

  // Leer canciones desde Firestore
  const snapshot = await db.collection("music_songs").get()
  const songs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`Canciones en Firestore: ${songs.length}`)
  console.log("")

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const song of songs) {
    if (song.archivoUrl) {
      console.log(`  [SKIP] ${song.titulo.padEnd(30)} ya tiene archivoUrl`)
      skipped++
      continue
    }

    const songTitle = normalize(song.titulo)
    const match = files.find(f => normalize(f.replace(/\.mp3$/i, "")) === songTitle)

    if (!match) {
      console.log(`  [FAIL] ${song.titulo.padEnd(30)} no se encontró MP3 (búscalo manualmente)`)
      failed++
      continue
    }

    const filePath = join(musicDir, match)
    const fileBuf = readFileSync(filePath)

    try {
      const dest = `music/${song.id}.mp3`
      await bucket.file(dest).save(fileBuf, {
        metadata: { contentType: "audio/mpeg" },
      })
      await bucket.file(dest).makePublic()

      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(dest)}?alt=media`

      await db.collection("music_songs").doc(song.id).update({ archivoUrl: downloadUrl })

      console.log(`  [OK]   ${song.titulo.padEnd(30)} → ${downloadUrl.slice(0, 70)}...`)
      migrated++
    } catch (err) {
      console.error(`  [ERR]  ${song.titulo.padEnd(30)} ${err.message}`)
      failed++
    }
  }

  console.log("")
  console.log("=".repeat(60))
  console.log(`Resumen: ${migrated} migradas, ${skipped} ya tenían URL, ${failed} fallaron`)
  console.log("=".repeat(60))
  console.log("")
  if (failed > 0) {
    console.log("Nota: Las canciones que fallaron solo están en IndexedDB del navegador.")
    console.log("Usá el botón 'Migrar Audio' en el panel admin para migrarlas.")
  }
}

function normalize(s) {
  return s.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

main().catch(console.error)
