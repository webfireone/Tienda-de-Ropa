import sharp from "sharp"

const { data, info } = await sharp("public/logos/LOGO.jpeg").raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height
const cx = Math.floor(w / 2), cy = Math.floor(h / 2)

function isGold(r, g, b) {
  return r > 180 && g > 150 && b < 120 && (r - b) > 80
}

function findEdge(dx, dy) {
  let x = cx, y = cy
  while (x >= 0 && x < w && y >= 0 && y < h) {
    const idx = (y * w + x) * 3
    const r = data[idx], g = data[idx+1], b = data[idx+2]
    if (isGold(r, g, b)) return { x, y }
    x += dx; y += dy
  }
  return null
}

const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]
const edges = dirs.map(d => findEdge(d[0], d[1])).filter(e => e !== null)
const xs = edges.map(e => e.x), ys = edges.map(e => e.y)
const minX = Math.min(...xs), maxX = Math.max(...xs)
const minY = Math.min(...ys), maxY = Math.max(...ys)
const estCx = Math.floor((minX + maxX) / 2)
const estCy = Math.floor((minY + maxY) / 2)
const radius = Math.floor(Math.max(maxX - minX, maxY - minY) / 2) + 10

console.log(`Circle: center=(${estCx},${estCy}), radius=${radius}`)

// Determine safe crop within image bounds
const cropSize = Math.min(radius * 2, w, h)
const cropLeft = Math.max(0, estCx - Math.floor(cropSize / 2))
const cropTop = Math.max(0, estCy - Math.floor(cropSize / 2))
const actualW = Math.min(cropSize, w - cropLeft)
const actualH = Math.min(cropSize, h - cropTop)
const actualSize = Math.min(actualW, actualH)
const adjRadius = Math.floor(actualSize / 2) - 5

console.log(`Crop: ${cropLeft}x${cropTop} ${actualSize}x${actualSize}, radius=${adjRadius}`)

// Extract full circle once
const extracted = await sharp("public/logos/LOGO.jpeg")
  .extract({ left: cropLeft, top: cropTop, width: actualSize, height: actualSize })
  .toBuffer()

const svgMask = `<svg width="${actualSize}" height="${actualSize}">
  <defs><clipPath id="c"><circle cx="${actualSize/2}" cy="${actualSize/2}" r="${adjRadius}" /></clipPath></defs>
  <rect width="${actualSize}" height="${actualSize}" fill="white" clip-path="url(#c)" />
</svg>`

// Full size with transparency
await sharp(extracted)
  .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
  .png()
  .toFile("public/logos/logo-recortado.png")
console.log("logo-recortado.png done")

// 80px for header - use the already-saved PNG
await sharp("public/logos/logo-recortado.png")
  .resize(80, 80)
  .png()
  .toFile("public/logos/logo-header.png")
console.log("logo-header.png done")

// Brightened version
await sharp("public/logos/logo-recortado.png")
  .resize(80, 80)
  .modulate({ brightness: 1.3 })
  .png()
  .toFile("public/logos/logo-header-bright.png")
console.log("logo-header-bright.png done")
