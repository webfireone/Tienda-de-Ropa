import sharp from "sharp"

const inputPath = "public/logos/LOGO.jpeg"
const outputDir = "public/logos"

const img = sharp(inputPath)
const meta = await img.metadata()
const { width, height } = meta
console.log(`Image: ${width}x${height}`)

// Extract raw pixel data to analyze
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

// Scan edges to find the circle boundary
function findCircleBounds(data, w, h) {
  const cx = Math.floor(w / 2)
  const cy = Math.floor(h / 2)

  // Find the first non-background pixel from the center going left
  let left = 0
  for (let x = cx; x >= 0; x--) {
    const idx = (cy * w + x) * 3
    const r = data[idx], g = data[idx+1], b = data[idx+2]
    const brightness = (r + g + b) / 3
    if (brightness > 30) { left = x; break }
  }

  let right = w - 1
  for (let x = cx; x < w; x++) {
    const idx = (cy * w + x) * 3
    const r = data[idx], g = data[idx+1], b = data[idx+2]
    const brightness = (r + g + b) / 3
    if (brightness > 30) { right = x; break }
  }

  let top = 0
  for (let y = cy; y >= 0; y--) {
    const idx = (y * w + cx) * 3
    const r = data[idx], g = data[idx+1], b = data[idx+2]
    const brightness = (r + g + b) / 3
    if (brightness > 30) { top = y; break }
  }

  let bottom = h - 1
  for (let y = cy; y < h; y++) {
    const idx = (y * w + cx) * 3
    const r = data[idx], g = data[idx+1], b = data[idx+2]
    const brightness = (r + g + b) / 3
    if (brightness > 30) { bottom = y; break }
  }

  const radius = Math.min(cx - left, right - cx, cy - top, bottom - cy)
  return { cx, cy, radius: Math.max(radius, 1) }
}

const bounds = findCircleBounds(data, width, height)
console.log(`Circle detected at (${bounds.cx}, ${bounds.cy}), radius: ${bounds.radius}`)

// Create SVG circular mask
const maskSize = bounds.radius * 2
const svgMask = `<svg width="${maskSize}" height="${maskSize}">
  <defs>
    <clipPath id="circle">
      <circle cx="${bounds.radius}" cy="${bounds.radius}" r="${bounds.radius}" />
    </clipPath>
  </defs>
  <rect width="${maskSize}" height="${maskSize}" fill="white" clip-path="url(#circle)" />
</svg>`

// Extract the circular region as PNG with transparency
await sharp(inputPath)
  .extract({
    left: bounds.cx - bounds.radius,
    top: bounds.cy - bounds.radius,
    width: maskSize,
    height: maskSize
  })
  .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
  .png()
  .toFile(`${outputDir}/logo-circle.png`)

console.log("Created logo-circle.png")

// Also create a white version (for dark backgrounds)
await sharp(inputPath)
  .extract({
    left: bounds.cx - bounds.radius,
    top: bounds.cy - bounds.radius,
    width: maskSize,
    height: maskSize
  })
  .modulate({ brightness: 2 })
  .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
  .png()
  .toFile(`${outputDir}/logo-circle-white.png`)

console.log("Created logo-circle-white.png")

// Create a version with transparent background but keep original colors
await sharp(inputPath)
  .extract({
    left: bounds.cx - bounds.radius,
    top: bounds.cy - bounds.radius,
    width: maskSize,
    height: maskSize
  })
  .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
  .png()
  .toFile(`${outputDir}/logo-circle-transparent.png`)

console.log("Created logo-circle-transparent.png")

// Analyze image colors to create a themed version
const centerSample = []
const samplePixels = 100
for (let i = 0; i < samplePixels; i++) {
  const x = bounds.cx + Math.floor(Math.random() * bounds.radius * 0.5)
  const y = bounds.cy + Math.floor(Math.random() * bounds.radius * 0.5)
  const idx = (y * width + x) * 3
  centerSample.push({ r: data[idx], g: data[idx+1], b: data[idx+2] })
}

const avgColor = centerSample.reduce((acc, c) => ({
  r: acc.r + c.r / samplePixels,
  g: acc.g + c.g / samplePixels,
  b: acc.b + c.b / samplePixels
}), { r: 0, g: 0, b: 0 })

console.log(`Average logo color: (${Math.round(avgColor.r)}, ${Math.round(avgColor.g)}, ${Math.round(avgColor.b)})`)

// Create a tinted version using the primary/theme color (violet gradient)
await sharp(inputPath)
  .extract({
    left: bounds.cx - bounds.radius,
    top: bounds.cy - bounds.radius,
    width: maskSize,
    height: maskSize
  })
  .tint({ r: 139, g: 92, b: 246 })
  .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
  .png()
  .toFile(`${outputDir}/logo-circle-theme.png`)

console.log("Created logo-circle-theme.png")

console.log("\nAll versions created in public/logos/:")
console.log("  - logo-circle.png        (original circle crop)")
console.log("  - logo-circle-white.png   (brightened for dark bg)")
console.log("  - logo-circle-transparent.png (original with transparent bg)")
console.log("  - logo-circle-theme.png   (tinted with theme violet)")
