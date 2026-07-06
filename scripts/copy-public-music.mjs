import { cp, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = join(__dirname, "..", "public", "music")
const dest = join(__dirname, "..", "dist", "music")

if (existsSync(src)) {
  await mkdir(dest, { recursive: true })
  await cp(src, dest, { recursive: true })
  console.log(`[copy-public-music] Copied ${src} → ${dest}`)
} else {
  console.log(`[copy-public-music] Source not found: ${src}`)
}
