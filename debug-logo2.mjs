import sharp from "sharp"

const { data, info } = await sharp("public/logos/LOGO.jpeg").raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height
const cx = Math.floor(w / 2), cy = Math.floor(h / 2)

// Fine scan from center outward - find where brightness crosses threshold
function scanLine(xStart, yStart, dx, dy, threshold = 150) {
  let x = xStart, y = yStart
  const points = []
  while (x >= 0 && x < w && y >= 0 && y < h) {
    const idx = (y * w + x) * 3
    const b = (data[idx] + data[idx+1] + data[idx+2]) / 3
    points.push({ x, y, b: Math.round(b) })
    x += dx
    y += dy
  }
  return points
}

// Scan left, right, up, down
console.log("=== Scanning from center outward (fine: 1px steps) ===")
console.log("CENTER at", cx, cy)
const idx = (cy * w + cx) * 3
console.log("Center color:", `r=${data[idx]} g=${data[idx+1]} b=${data[idx+2]}`, `brightness=${Math.round((data[idx]+data[idx+1]+data[idx+2])/3)}`)

for (const [label, dx, dy] of [["RIGHT", 1, 0], ["LEFT", -1, 0], ["DOWN", 0, 1], ["UP", 0, -1]]) {
  const pts = scanLine(cx, cy, dx, dy)
  // Find first transition from dark (<50) to light (>150)
  let firstLight = -1
  let lastDark = -1
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].b < 50 && lastDark < 0) lastDark = i
    if (lastDark >= 0 && pts[i].b > 150 && firstLight < 0) firstLight = i
  }
  const dist = Math.abs(pts[firstLight]?.x - cx || pts[firstLight]?.y - cy || 0)
  console.log(`${label}: lastDark at ${JSON.stringify(pts[lastDark])}, firstLight at ${JSON.stringify(pts[firstLight])}, distance=${dist}px`)
}
