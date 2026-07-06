import { cp, mkdir, readdir } from "fs/promises"
import { existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = join(__dirname, "..", "public", "music")
const dest = join(__dirname, "..", "dist", "music")

if (existsSync(src)) {
  await mkdir(dest, { recursive: true })
  await cp(src, dest, { recursive: true })
  const destFiles = await readdir(dest)
  console.log(`[copy-public-music] Copied ${src} → ${dest} (${destFiles.length} files)`)
  const hasNew = destFiles.includes("cuando-te-vas.mp3")
  console.log(`[copy-public-music] cuando-te-vas.mp3 present: ${hasNew}`)
} else {
  console.log(`[copy-public-music] Source not found: ${src}`)
}
