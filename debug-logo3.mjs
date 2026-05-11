import sharp from "sharp"

const { data, info } = await sharp("public/logos/LOGO.jpeg").raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height

// Sample corners to determine background color
function avgColor(px, py, size) {
  let r = 0, g = 0, b = 0, count = 0
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const x = Math.min(px + dx, w - 1)
      const y = Math.min(py + dy, h - 1)
      const idx = (y * w + x) * 3
      r += data[idx]; g += data[idx+1]; b += data[idx+2]; count++
    }
  }
  return { r: r/count, g: g/count, b: b/count }
}

console.log("=== Background color samples (50x50 patches) ===")
console.log("Top-left:", avgColor(0, 0, 50))
console.log("Top-right:", avgColor(w-50, 0, 50))
console.log("Bottom-left:", avgColor(0, h-50, 50))
console.log("Bottom-right:", avgColor(w-50, h-50, 50))
console.log("Center (20x20):", avgColor(w/2-10, h/2-10, 20))

// Color distance from beige background
function colorDist(idx) {
  const r = data[idx], g = data[idx+1], b = data[idx+2]
  return Math.sqrt((r-240)**2 + (g-230)**2 + (b-218)**2)
}

// Scan center row finding circle edges
console.log("\n=== Scanning center row (y=446) for circle edges ===")
const cy = Math.floor(h / 2)

// Find left edge: scan from left center toward left edge
let leftEdge = 0
for (let x = Math.floor(w/2); x >= 0; x--) {
  const idx = (cy * w + x) * 3
  const dist = colorDist(idx)
  if (dist > 50) { leftEdge = x; break }
}

// Find right edge: scan from center toward right edge
let rightEdge = w - 1
for (let x = Math.floor(w/2); x < w; x++) {
  const idx = (cy * w + x) * 3
  const dist = colorDist(idx)
  if (dist > 50) { rightEdge = x; break }
}

console.log("Left edge at x:", leftEdge)
console.log("Right edge at x:", rightEdge)

// Scan center column
let topEdge = 0
for (let y = Math.floor(h/2); y >= 0; y--) {
  const idx = (y * w + Math.floor(w/2)) * 3
  const dist = colorDist(idx)
  if (dist > 50) { topEdge = y; break }
}

let bottomEdge = h - 1
for (let y = Math.floor(h/2); y < h; y++) {
  const idx = (y * w + Math.floor(w/2)) * 3
  const dist = colorDist(idx)
  if (dist > 50) { bottomEdge = y; break }
}

console.log("Top edge at y:", topEdge)
console.log("Bottom edge at y:", bottomEdge)

// Now try with a broader scan: find all pixels that differ from background
console.log("\n=== Finding all non-background pixels ===")
const nonBg = []
for (let y = 0; y < h; y += 4) {
  for (let x = 0; x < w; x += 4) {
    const idx = (y * w + x) * 3
    const d = colorDist(idx)
    if (d > 60) nonBg.push({ x, y, r: data[idx], g: data[idx+1], b: data[idx+2] })
  }
}

if (nonBg.length > 0) {
  const minX = Math.min(...nonBg.map(p => p.x))
  const maxX = Math.max(...nonBg.map(p => p.x))
  const minY = Math.min(...nonBg.map(p => p.y))
  const maxY = Math.max(...nonBg.map(p => p.y))
  console.log(`Non-background bounds: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`)
  console.log(`Count: ${nonBg.length} pixels (sampled every 4px)`)

  // Also check - is the non-background area circular?
  const cx2 = Math.floor((minX + maxX) / 2)
  const cy2 = Math.floor((minY + maxY) / 2)
  const rx = Math.floor((maxX - minX) / 2)
  const ry = Math.floor((maxY - minY) / 2)
  console.log(`Center: (${cx2}, ${cy2}), radius X: ${rx}, radius Y: ${ry}`)
}
