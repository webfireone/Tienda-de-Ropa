import sharp from "sharp"

const { data, info } = await sharp("public/logos/LOGO.jpeg").raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height

// The user says there's a circle. Let me sample pixel values 
// along concentric rings from center outward to find the circle boundary.
// A circle would show a consistent color transition at a given radius.

const cx = Math.floor(w / 2), cy = Math.floor(h / 2)

// Sample rings at increasing radii
console.log("=== Concentric ring analysis ===")
for (let r = 5; r <= 500; r += 5) {
  const samples = []
  for (let angle = 0; angle < 360; angle += 5) {
    const rad = angle * Math.PI / 180
    const x = Math.round(cx + r * Math.cos(rad))
    const y = Math.round(cy + r * Math.sin(rad))
    if (x >= 0 && x < w && y >= 0 && y < h) {
      const idx = (y * w + x) * 3
      samples.push((data[idx] + data[idx+1] + data[idx+2]) / 3)
    }
  }
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  const range = max - min
  
  // Print where there's significant change
  if (r < 30 || (range > 100 && r < 200) || r % 50 === 0) {
    console.log(`r=${r}: avg=${avg.toFixed(0)}, min=${min.toFixed(0)}, max=${max.toFixed(0)}, range=${range.toFixed(0)}`)
  }
}

// Also save a visualization to understand the structure
// Sample a grid and look for specific colors
console.log("\n=== Color map (center 300x300) ===")
const step = 15
for (let y = Math.max(0, cy - 150); y < Math.min(h, cy + 150); y += step) {
  let line = ""
  for (let x = Math.max(0, cx - 150); x < Math.min(w, cx + 150); x += step) {
    const idx = (y * w + x) * 3
    const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3
    if (brightness < 50) line += "██"
    else if (brightness < 100) line += "▓▓"
    else if (brightness < 150) line += "▒▒"
    else if (brightness < 200) line += "░░"
    else line += "  "
  }
  console.log(line)
}
