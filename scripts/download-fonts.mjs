import https from "https"
import http from "http"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const PUBLIC_FONTS = path.join(ROOT, "public", "fonts")
const FUENTES = path.join(ROOT, "fuentes")

const MENU_FONTS = [
  { name: "Inter", weights: "300;400;500;600;700;800" },
  { name: "Montserrat", weights: "400;500;600;700;800" },
  { name: "Poppins", weights: "400;500;600;700" },
  { name: "Space Grotesk", weights: "300;400;500;600;700" },
  { name: "Outfit", weights: "400;500;600;700" },
  { name: "Raleway", weights: "400;500;600;700" },
  { name: "Sora", weights: "400;500;600;700" },
  { name: "DM Sans", weights: "400;500;600;700" },
  { name: "Josefin Sans", weights: "400;500;600;700" },
  { name: "Bebas Neue", weights: "400" },
  { name: "Oswald", weights: "400;500;600;700" },
  { name: "Manrope", weights: "400;500;600;700" },
  { name: "Nunito", weights: "400;500;600;700" },
  { name: "Plus Jakarta Sans", weights: "400;500;600;700" },
  { name: "Lexend", weights: "400;500;600;700" },
  { name: "Karla", weights: "400;500;600;700" },
  { name: "Jost", weights: "400;500;600;700" },
]

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location).then(resolve).catch(reject)
        return
      }
      let data = ""
      res.on("data", (chunk) => data += chunk)
      res.on("end", () => resolve(data))
    }).on("error", reject)
  })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http
    const file = fs.createWriteStream(dest)
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      res.pipe(file)
      file.on("finish", () => { file.close(); resolve() })
    }).on("error", (err) => { fs.unlink(dest, () => {}); reject(err) })
  })
}

function sanitizeName(name) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

async function downloadFont(font) {
  const fontId = sanitizeName(font.name)
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@${font.weights}&display=swap`

  console.log(`[${font.name}] Fetching CSS...`)
  let css
  try {
    css = await get(url)
  } catch (err) {
    console.error(`[${font.name}] Failed to fetch CSS:`, err.message)
    return ""
  }

  // Find all @font-face blocks
  const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || []
  if (blocks.length === 0) {
    console.error(`[${font.name}] No @font-face blocks found`)
    return ""
  }

  const fontDir = path.join(PUBLIC_FONTS, fontId)
  const fuentesDir = path.join(FUENTES, fontId)
  fs.mkdirSync(fontDir, { recursive: true })
  fs.mkdirSync(fuentesDir, { recursive: true })

  const resultBlocks = []

  for (const block of blocks) {
    // Extract src URL
    const srcMatch = block.match(/src:\s*url\(([^)]+)\)/)
    if (!srcMatch) continue

    const fileUrl = srcMatch[1]
    const fileName = path.basename(fileUrl)
    const dest1 = path.join(fontDir, fileName)
    const dest2 = path.join(fuentesDir, fileName)

    // Check if already downloaded
    if (fs.existsSync(dest1) && fs.existsSync(dest2)) {
      console.log(`[${font.name}] Already exists: ${fileName}`)
    } else {
      console.log(`[${font.name}] Downloading: ${fileName}`)
      try {
        await downloadFile(fileUrl, dest1)
        fs.copyFileSync(dest1, dest2)
      } catch (err) {
        console.error(`[${font.name}] Failed to download ${fileName}:`, err.message)
        continue
      }
    }

    // Replace the external URL with local path
    let localBlock = block
    localBlock = localBlock.replace(/src:\s*url\([^)]+\)/g, `src: url('/fonts/${fontId}/${fileName}')`)
    // Remove unicode-range to keep it simple (covers all)
    localBlock = localBlock.replace(/unicode-range:[^;]+;/g, "")
    resultBlocks.push(localBlock)
  }

  console.log(`[${font.name}] Done (${resultBlocks.length} faces)`)
  return resultBlocks.join("\n") + "\n"
}

async function main() {
  console.log("=== Downloading Menu Fonts ===\n")

  let allCss = "/* ═══════════════════════════════════════\n   LOCAL MENU FONTS (auto-downloaded)\n   ═══════════════════════════════════════ */\n\n"

  for (const font of MENU_FONTS) {
    const css = await downloadFont(font)
    if (css) {
      allCss += css + "\n"
    }
  }

  // Write the CSS
  const cssPath = path.join(ROOT, "scripts", "menu-fonts-face.css")
  fs.writeFileSync(cssPath, allCss, "utf-8")
  console.log(`\n=== @font-face CSS written to scripts/menu-fonts-face.css ===`)
  console.log("Copy the contents into src/index.css after the Armata @font-face blocks.")
}

main().catch(console.error)
