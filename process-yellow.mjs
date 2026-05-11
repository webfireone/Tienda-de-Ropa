import sharp from "sharp"

// Original extracted circle (802x802, transparent bg)
const src = "public/logos/logo-recortado.png"
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true })
const w = info.width, h = info.height

// Collect all pixels
const pixels = []
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
    if (a > 0) pixels.push({ x, y, r, g, b, a })
  }
}

// Find min/max brightness of non-transparent pixels
let minB = 255, maxB = 0
pixels.forEach(p => {
  const b = (p.r + p.g + p.b) / 3
  if (b < minB) minB = b
  if (b > maxB) maxB = b
})
console.log(`Non-transparent pixels: ${pixels.length}`)
console.log(`Brightness range: ${minB.toFixed(0)} - ${maxB.toFixed(0)}`)

// Gold typically has high R, medium G, low B
// Black text has very low R, G, B
// Pink gradient has high R, medium G, high B
// Cream bg has high R, G, B

// Let me sample some pixel clusters
const clusters = {
  text: [],
  gold: [],
  pink: [],
  cream: []
}

// Text is darkest (black)
const textThreshold = minB + (maxB - minB) * 0.15
// Cream is lightest
const creamThreshold = maxB - (maxB - minB) * 0.2

pixels.forEach(p => {
  const b = (p.r + p.g + p.b) / 3
  const isReddish = p.r > p.g * 0.8 && p.g > p.b * 0.5
  const isGoldish = p.r > 180 && p.g > 120 && p.b < 130
  
  if (b < textThreshold) clusters.text.push(p)
  else if (isGoldish) clusters.gold.push(p)
  else if (p.r > 160 && p.b > 100 && p.g < 180) clusters.pink.push(p)
  else if (b > creamThreshold) clusters.cream.push(p)
})

console.log(`\nPixel clusters:`)
console.log(`Text (dark): ${clusters.text.length} px — avg brightness: ${(clusters.text.reduce((s,p)=>(s.r+p.r)/2,0) + clusters.text.reduce((s,p)=>(s.g+p.g)/2,0) + clusters.text.reduce((s,p)=>(s.b+p.b)/2,0))/3}`)
console.log(`Gold: ${clusters.gold.length} px`)
console.log(`Pink: ${clusters.pink.length} px`)
console.log(`Cream: ${clusters.cream.length} px`)

// Sample some text pixels
console.log(`\nSample text pixels:`)
clusters.text.slice(0, 5).forEach(p => {
  console.log(`  (${p.x},${p.y}): r=${p.r} g=${p.g} b=${p.b} a=${p.a}`)
})

// Create version with yellow text and enhanced gold
const newData = Buffer.from(data)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4
    const r = newData[idx], g = newData[idx+1], b = newData[idx+2], a = newData[idx+3]
    if (a === 0) continue
    
    const brightness = (r + g + b) / 3
    const isDark = brightness < textThreshold + 20
    
    if (isDark) {
      // Text: change black → bright yellow
      newData[idx] = 255     // R
      newData[idx+1] = 215   // G 
      newData[idx+2] = 0     // B
    }
  }
}

// Save processed version
const rawImage = Buffer.from(newData)
await sharp(rawImage, { raw: { width: w, height: h, channels: 4 } })
  // .resize(160, 160)
  .png()
  .toFile("public/logos/logo-recortado-yellow.png")
console.log("\nCreated logo-recortado-yellow.png")
