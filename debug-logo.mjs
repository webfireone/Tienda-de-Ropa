import sharp from "sharp"

const { data, info } = await sharp("public/logos/LOGO.jpeg").raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height
const cx = Math.floor(w / 2), cy = Math.floor(h / 2)

// Sample pixels from center outward (horizontal)
const samples = []
for (let x = 0; x < w; x += 20) {
  const idx = (cy * w + x) * 3
  const r = data[idx], g = data[idx+1], b = data[idx+2]
  const brightness = Math.round((r + g + b) / 3)
  if (x === cx) samples.push(`  CENTER (${x},${cy}): r=${r} g=${g} b=${b} brightness=${brightness}`)
  else if (x < 20 || x > w - 20 || Math.abs(x - cx) < 30) 
    samples.push(`  x=${x}: r=${r} g=${g} b=${b} brightness=${brightness}`)
}

console.log("Horizontal center scan:")
samples.forEach(s => console.log(s))

// Vertical center scan  
const vsamples = []
for (let y = 0; y < h; y += 20) {
  const idx = (y * w + cx) * 3
  const r = data[idx], g = data[idx+1], b = data[idx+2]
  const brightness = Math.round((r + g + b) / 3)
  if (y === cy) vsamples.push(`  CENTER (${cx},${y}): r=${r} g=${g} b=${b} brightness=${brightness}`)
  else if (y < 20 || y > h - 20 || Math.abs(y - cy) < 30)
    vsamples.push(`  y=${y}: r=${r} g=${g} b=${b} brightness=${brightness}`)
}

console.log("\nVertical center scan:")
vsamples.forEach(s => console.log(s))

// Sample around center in a grid
console.log("\nCenter grid (5x5 around center):")
for (let dy = -2; dy <= 2; dy++) {
  let line = ""
  for (let dx = -2; dx <= 2; dx++) {
    const x = cx + dx * 40
    const y = cy + dy * 40
    const idx = (y * w + x) * 3
    const brightness = Math.round((data[idx] + data[idx+1] + data[idx+2]) / 3)
    line += `${brightness.toString().padStart(3)} `
  }
  console.log(`  ${line}`)
}
