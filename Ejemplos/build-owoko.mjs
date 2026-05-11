import { readFileSync, writeFileSync } from "fs"

const SAVED_FILE = "C:\\Users\\AI01_\\.local\\share\\opencode\\tool-output\\tool_e0ffdf7d7001NfTY5a6WYCy7zm"
const OUT = "C:\\AI\\Antigravity\\Tienda de Ropa\\Ejemplos\\owoko.csv"

const html = readFileSync(SAVED_FILE, "utf-8")

// Extract all JSON-LD Product blocks (allowing extra attributes on script tag)
const ldEntries = []
const ldRegex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
let m
while ((m = ldRegex.exec(html)) !== null) {
  try {
    const parsed = JSON.parse(m[1].trim())
    if (parsed["@type"] === "Product") {
      ldEntries.push(parsed)
    }
  } catch {}
}

console.log(`Found ${ldEntries.length} Product JSON-LD blocks`)

// Extract selling prices from HTML: data-product-price attribute gives price in cents
// Match them to URLs by finding the nearest preceding product link
const urlPriceMap = {}
const urlFullPriceMap = {}

// Collect all product-cards to associate URLs with prices
const cardRegex = /<div class="item-description"[^>]*data-store="product-item-info-(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<script\s+type="application\/ld\+json"/g
let cardMatch
while ((cardMatch = cardRegex.exec(html)) !== null) {
  const block = cardMatch[2]
  
  // Extract URL from <a href>
  const urlM = block.match(/href="(https:\/\/www\.owoko\.com\.ar\/productos\/[^"]+)"[^>]*class="item-link"/)
  if (!urlM) continue
  const url = urlM[1]
  
  // Selling price from data-product-price (in cents)
  const spM = block.match(/data-product-price="(\d+)"/)
  if (spM) {
    const cents = parseInt(spM[1])
    const price = Math.round(cents / 100)
    if (!urlPriceMap[url] || price < urlPriceMap[url]) {
      urlPriceMap[url] = price
    }
  }
  
  // Compare price from visible text
  const fpM = block.match(/js-compare-price-display[^>]*>\s*\$?([\d.]+)\s*</)
  if (fpM) {
    const price = parseFloat(fpM[1].replace(/\./g, ""))
    if (!urlFullPriceMap[url] || price < urlFullPriceMap[url]) {
      urlFullPriceMap[url] = price
    }
  }
}

console.log(`Matched ${Object.keys(urlPriceMap).length} selling prices, ${Object.keys(urlFullPriceMap).length} compare prices`)

// Take first 15 LD products
const products = ldEntries.slice(0, 15)

// ---------- helpers ----------

function parsePrice(priceStr) {
  return Math.round(parseFloat(priceStr))
}

function extractSizesFromName(name) {
  name = name.replace("6M - 2A", "6 a 24 meses")
  const m3 = name.match(/(\d+)\s*a\s+(\d+)\s*años/i)
  if (m3) {
    const sizes = []
    for (let i = parseInt(m3[1]); i <= parseInt(m3[2]); i++) sizes.push("A" + i)
    return sizes
  }
  const me = name.match(/(\d+)\s*a\s+(\d+)\s*mese/i)
  if (me) {
    const from = parseInt(me[1]), to = parseInt(me[2])
    const monthSizes = {0:"0M",3:"3M",6:"6M",12:"12M",18:"18M",24:"24M"}
    const allMonths = [0,3,6,12,18,24]
    const sizes = []
    for (const ms of allMonths) {
      if (ms >= from && ms <= to) sizes.push(monthSizes[ms])
    }
    return sizes.length > 0 ? sizes : ["U"]
  }
  const m2 = name.match(/(\d+)\s*M\s*-\s*(\d+)(?:\s*[Aa])?/)
  if (m2) {
    const from = parseInt(m2[1]), to = parseInt(m2[2])
    const monthMap = {6:"6M",12:"12M",18:"18M",24:"24M"}
    const allMonths = [0,3,6,12,18,24]
    const sizes = []
    for (const ms of allMonths) {
      if (ms >= from && ms <= to && monthMap[ms]) sizes.push(monthMap[ms])
    }
    return sizes.length > 0 ? sizes : ["U"]
  }
  return ["U"]
}

function getCategory(name) {
  const lower = name.toLowerCase()
  if (lower.includes("polo body") || lower.includes("body")) return "Bodies"
  if (lower.includes("mono")) return "Monos"
  if (lower.includes("pantal")) return "Pantalones"
  if (lower.includes("camper")) return "Camperas"
  if (lower.includes("abrigo")) return "Abrigos"
  if (lower.includes("polera")) return "Poleras"
  if (lower.includes("remera")) return "Remeras"
  if (lower.includes("buzo")) return "Buzos"
  if (lower.includes("pijama")) return "Pijamas"
  return "Accesorios"
}

function extractColor(name) {
  const colors = ["Azul","Rojo","Rosa","Fucsia","Gris","Negro","Blanco","Celeste","Crudo","Melange","Lima","Amarillo","Turquesa"]
  for (const c of colors) {
    if (name.includes(c)) return c
  }
  return "Unico"
}

function escapeCsv(val) {
  if (val == null) return ""
  const s = String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

const sizeToStd = {"0M":"XS","3M":"S","6M":"M","12M":"L","18M":"XL","24M":"XXL"}

function simpleHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

// ---------- build CSV ----------

const rows = []

for (const p of products) {
  const name = p.name || ""
  const url = p.mainEntityOfPage?.["@id"] || p.offers?.url || ""
  const imageUrl = (p.image || "").replace(/^\/\//, "https://")
  const fullPrice = p.offers?.price ? parsePrice(p.offers.price) : 0
  const stock = p.offers?.inventoryLevel?.value ?? 10
  const brand = "Owoko"
  const category = getCategory(name)
  const description = (p.description || "")
    .replace(/^Comprá online /, "")
    .replace(/\. Hacé tu pedido y pagalo online\.?$/, "")

  // Selling price from HTML or use description text
  let sellingPrice = fullPrice
  if (urlPriceMap[url]) {
    sellingPrice = urlPriceMap[url]
  } else {
    const descPrice = p.description?.match(/\$([\d.]+)/)
    if (descPrice) sellingPrice = parseFloat(descPrice[1].replace(/\./g, ""))
  }

  const cost = Math.round(sellingPrice * 0.5)
  const color = extractColor(name)
  const sizes = extractSizesFromName(name)

  const perSizeStock = {}
  const stockPerSize = Math.max(1, Math.floor(stock / sizes.length))
  let remaining = stock
  for (let i = 0; i < sizes.length; i++) {
    const sz = sizes[i]
    if (i === sizes.length - 1) {
      perSizeStock[sz] = remaining
    } else {
      const h = simpleHash(name + color + sz)
      const extra = h % 3
      const qty = Math.max(1, stockPerSize + extra - 1)
      perSizeStock[sz] = qty
      remaining -= qty
    }
  }

  const colorsArr = [{ name: color, sizes: perSizeStock }]
  const colorsJson = JSON.stringify(colorsArr)

  const stdSizes = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
  for (const [sz, qty] of Object.entries(perSizeStock)) {
    const mapped = sizeToStd[sz]
    if (mapped) stdSizes[mapped] += qty
    else {
      if (sz.startsWith("A")) {
        const age = parseInt(sz.substring(1))
        if (age <= 3) stdSizes["M"] += qty
        else if (age <= 5) stdSizes["L"] += qty
        else stdSizes["XL"] += qty
      } else {
        stdSizes["M"] += qty
      }
    }
  }

  const tags = category.toLowerCase()

  const row = [
    escapeCsv(name),
    escapeCsv(brand),
    escapeCsv(category),
    sellingPrice,
    cost,
    escapeCsv(imageUrl),
    escapeCsv(description),
    "",
    escapeCsv(colorsJson),
    escapeCsv(tags),
    stdSizes.XS, stdSizes.S, stdSizes.M, stdSizes.L, stdSizes.XL, stdSizes.XXL,
    "active",
  ]
  rows.push(row.join(","))
}

const header = "name,brand,category,price,cost,imageUrl,description,material,colors,tags,XS,S,M,L,XL,XXL,status"
writeFileSync(OUT, header + "\n" + rows.join("\n"), "utf-8")
console.log(`owoko.csv: ${products.length} products written`)
