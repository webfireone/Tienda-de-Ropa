import { readFileSync, writeFileSync } from "fs"

const SAVED_FILE = "C:\\Users\\AI01_\\.local\\share\\opencode\\tool-output\\legacy_raw.html"
const OUT = "C:\\AI\\Antigravity\\Tienda de Ropa\\Ejemplos\\legacy.csv"

const html = readFileSync(SAVED_FILE, "utf-8")

// --- Parse JSON-LD blocks for product metadata ---
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

// --- Parse product card divs for variant data ---
const cardRegex = /<div\s+class="js-product-item-private[^"]*"[^>]*data-product-id="(\d+)"[^>]*data-variants="([^"]+)"[^>]*>/g
const variantsByUrl = new Map()

let cardMatch
while ((cardMatch = cardRegex.exec(html)) !== null) {
  const productId = cardMatch[1]
  let variants
  try {
    variants = JSON.parse(cardMatch[2].replace(/&quot;/g, '"'))
  } catch (e) {
    console.log(`Failed to parse variants for product ${productId}: ${e.message}`)
    continue
  }
  if (!variants || !Array.isArray(variants) || variants.length === 0) continue

  // Build a map of color → sizes → stock
  const colorMap = {} // color -> { size -> { stock, price, comparePrice, image } }
  const allSizes = new Set()
  let productUrl = ""
  let productName = ""
  let defaultPrice = 0
  let defaultComparePrice = 0

  // Determine color-vs-size role for option0/option1 across ALL variants
  // If ALL variants have the same option0 value, it's probably a color
  const uniqueOpt0 = new Set(variants.map(v => (v.option0 || "").trim()).filter(Boolean))
  const uniqueOpt1 = new Set(variants.map(v => (v.option1 || "").trim()).filter(Boolean))
  
  const colorKeywords = ["AZUL","ROJO","ROSA","FUCSIA","GRIS","NEGRO","BLANCO","CELESTE","CRUDO","MELANGE","LIMA","AMARILLO","TURQUESA","MARRON","VERDE","BEIGE","BORDO","VIOLETA","NARANJA","DORADO","PLATEADO"]
  const sizePatterns = ["XS","S","M","L","XL","XXL","1","2","3","4","5"]

  // Single option (only option0 varies, option1 always null)
  const singleOption = uniqueOpt1.size === 0 || (uniqueOpt1.size === 1 && [...uniqueOpt1][0] === "")

  function looksLikeColor(val) {
    if (!val) return false
    const u = val.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return colorKeywords.some(k => u === k) || colorKeywords.some(k => u.startsWith(k))
  }
  function looksLikeSize(val) {
    if (!val) return false
    const u = val.toUpperCase().replace(/\s*\(.*\)/, "").trim()
    return sizePatterns.includes(u) || /^\d+$/.test(u) || /^\d+\s*\(/.test(u)
  }

  // Determine which option is color and which is size
  let colorOpt, sizeOpt
  if (singleOption) {
    // Only one varying option
    // Check if the option values look like colors (e.g. "Marrón", "Azul")
    const vals = [...uniqueOpt0]
    const colorCount = vals.filter(v => looksLikeColor(v)).length
    if (colorCount > 0 && colorCount >= vals.length / 2) {
      // The single option is colors, no size variants
      colorOpt = "option0"; sizeOpt = null
    } else {
      // The single option is sizes, use "Unico" as color
      colorOpt = null; sizeOpt = "option0"
    }
  } else {
    // Both options vary: count which looks more like color
    const opt0ColorCount = variants.filter(v => looksLikeColor(v.option0)).length
    const opt1ColorCount = variants.filter(v => looksLikeColor(v.option1)).length
    if (opt0ColorCount > opt1ColorCount) {
      colorOpt = "option0"; sizeOpt = "option1"
    } else if (opt1ColorCount > opt0ColorCount) {
      colorOpt = "option1"; sizeOpt = "option0"
    } else {
      // Tie — check sizes
      const opt0SizeCount = variants.filter(v => looksLikeSize(v.option0)).length
      const opt1SizeCount = variants.filter(v => looksLikeSize(v.option1)).length
      if (opt0SizeCount < opt1SizeCount) {
        colorOpt = "option0"; sizeOpt = "option1"
      } else {
        colorOpt = "option1"; sizeOpt = "option0"
      }
    }
  }

  for (const v of variants) {
    const opt0 = (v.option0 || "").trim()
    const opt1 = (v.option1 || "").trim()
    
    let color, size
    if (!colorOpt && !sizeOpt) {
      color = v.option0 || "Unico"
      size = "U"
    } else if (!colorOpt) {
      color = "Unico"
      size = v[sizeOpt] || "U"
    } else if (!sizeOpt) {
      color = v[colorOpt] || "Unico"
      size = "U"
    } else {
      color = v[colorOpt] || "Unico"
      size = v[sizeOpt] || "U"
    }

    const sizeNormalized = normalizeSize(size)
    allSizes.add(sizeNormalized)

    if (!colorMap[color]) colorMap[color] = {}
    if (!colorMap[color][sizeNormalized]) {
      colorMap[color][sizeNormalized] = { stockTotal: 0, price: v.price_number || 0, comparePrice: v.compare_at_price_number || 0, image: v.image_url || "" }
    }
    // Sum stock (stock can be null for "infinite")
    const stockVal = v.stock != null ? parseInt(v.stock) : 5
    colorMap[color][sizeNormalized].stockTotal += stockVal

    // Keep track of overall defaults
    if (!productUrl && v.image_url) {
      productUrl = "https://www.legacynecochea.com.ar" // we'll get real URL from LD
    }
    if (!defaultPrice && v.price_number) defaultPrice = v.price_number
    if (!defaultComparePrice && v.compare_at_price_number) defaultComparePrice = v.compare_at_price_number
  }

  // Find matching JSON-LD by name matching (crude: use product ID to find LD position)
  // Actually, the card at position i corresponds to LD at position i
  // But easier: match by extracting product name from card's title attribute
  // For now, we'll rely on JSON-LD by position
  variantsByUrl.set(productId, { colorMap, allSizes: [...allSizes], defaultPrice, defaultComparePrice })
}

console.log(`Parsed ${variantsByUrl.size} product cards with variants`)

function normalizeSize(raw) {
  if (!raw) return "U"
  const s = raw.trim()
  
  // Map "1 (S)" → "S", "2 (M)" → "M", etc.
  const numberedMatch = s.match(/^(\d+)\s*\((\w+)\)$/)
  if (numberedMatch) return numberedMatch[2]

  // Map bare numbers 1-5 to letter sizes
  const numMap = { "1":"S", "2":"M", "3":"L", "4":"XL", "5":"XXL" }
  if (numMap[s]) return numMap[s]

  // Map common size names
  const upper = s.toUpperCase()
  const simpleMap = { "S":"S", "M":"M", "L":"L", "XL":"XL", "XXL":"XXL", "XS":"XS", "UNICO":"U", "UNIQUE":"U", "ÚNICO":"U" }
  if (simpleMap[upper]) return simpleMap[upper]

  // Numeric sizes (shoes, pants)
  if (/^\d+$/.test(s)) return s

  return s
}

function getCategory(name) {
  const lower = name.toLowerCase()
  if (lower.includes("billetera") || lower.includes("carter") || lower.includes("mochil")) return "Accesorios"
  if (lower.includes("boxer") || lower.includes("bóxer")) return "Boxers"
  if (lower.includes("camisa") || lower.includes("chomba")) return "Camisas"
  if (lower.includes("remera") || lower.includes("polo")) return "Remeras"
  if (lower.includes("sweater") || lower.includes("sweter") || lower.includes("suéter")) return "Sweaters"
  if (lower.includes("camper") || lower.includes("chaqueta") || lower.includes("parka") || lower.includes("chaleco")) return "Camperas"
  if (lower.includes("pantal") || lower.includes("bermuda") || lower.includes("short") || lower.includes("jean") || lower.includes("jogg")) return "Pantalones"
  if (lower.includes("buzo") || lower.includes("hoodie")) return "Buzos"
  if (lower.includes("zapat") || lower.includes("zapatilla") || lower.includes("zapato")) return "Zapatos"
  if (lower.includes("perfume") || lower.includes("colonia")) return "Perfumes"
  if (lower.includes("gorra") || lower.includes("sombrero")) return "Gorras"
  if (lower.includes("media") || lower.includes("calcetín")) return "Medias"
  if (lower.includes("bufand") || lower.includes("cuello")) return "Bufandas"
  if (lower.includes("cintur") || lower.includes("correa")) return "Cinturones"
  return "Accesorios"
}

function extractColor(name) {
  const colors = ["Azul","Rojo","Rosa","Fucsia","Gris","Negro","Blanco","Celeste","Crudo","Melange","Lima","Amarillo","Turquesa","Marron","Verde","Beige","Bordo","Violeta","Naranja","Dorado","Plateado"]
  for (const c of colors) {
    if (name.toLowerCase().includes(c.toLowerCase())) return c
  }
  return "Unico"
}

const STANDARD_SIZES = ["XS","S","M","L","XL","XXL"]

function escapeCsv(val) {
  if (val == null) return ""
  const s = String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

// Match LD entries to product card variants by position.
// Order in HTML: product_card div → its JSON-LD script → next product_card → next JSON-LD → ...
// So ldEntries[i] corresponds to productCardIds[i].
const productCardIds = []
const idRegex = /data-product-id="(\d+)"[^>]*data-variants="/g
let idMatch
while ((idMatch = idRegex.exec(html)) !== null) {
  productCardIds.push(idMatch[1])
}

console.log(`LD blocks: ${ldEntries.length}, Product cards: ${productCardIds.length}`)

const count = Math.min(15, ldEntries.length, productCardIds.length)
const rows = []

for (let i = 0; i < count; i++) {
  const ld = ldEntries[i]
  const pid = productCardIds[i]
  const vData = variantsByUrl.get(pid)

  if (!vData) {
    console.log(`No variant data for product ${pid}, skipping`)
    continue
  }

  const name = ld.name || ""
  const url = ld.mainEntityOfPage?.["@id"] || ld.offers?.url || ""
  // Prefer JSON-LD image (more reliable), fall back to first variant image
  const firstVariantImage = vData.colorMap && Object.values(vData.colorMap)[0] && Object.values(Object.values(vData.colorMap)[0])[0]?.image
  const imageUrl = (ld.image || firstVariantImage || "").replace(/^\/\//, "https://")
  const brand = "Legacy Necochea"
  const category = getCategory(name)
  const description = (ld.description || "")
    .replace(/^Comprá online /, "")
    .replace(/\. Hacé tu pedido y pagalo online\.?$/, "")

  // Price: use variant price (selling) or LD price (full)
  const sellingPrice = vData.defaultPrice || (ld.offers?.price ? Math.round(parseFloat(ld.offers.price)) : 0)
  const cost = Math.round(sellingPrice * 0.5)

  // Build colors array and flat sizes
  const colorsArr = []
  const flatSizes = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
  const otherSizes = {}

  for (const [color, sizeMap] of Object.entries(vData.colorMap)) {
    const perSizeStock = {}
    for (const [size, data] of Object.entries(sizeMap)) {
      perSizeStock[size] = data.stockTotal
      if (STANDARD_SIZES.includes(size)) {
        flatSizes[size] += data.stockTotal
      } else {
        otherSizes[size] = (otherSizes[size] || 0) + data.stockTotal
      }
    }
    colorsArr.push({ name: color, sizes: perSizeStock })
  }

  // Put non-standard sizes into standard columns (approximate mapping)
  for (const [size, qty] of Object.entries(otherSizes)) {
    const num = parseInt(size)
    if (!isNaN(num)) {
      if (num <= 34) flatSizes["XS"] += qty
      else if (num <= 36) flatSizes["S"] += qty
      else if (num <= 38) flatSizes["M"] += qty
      else if (num <= 40) flatSizes["L"] += qty
      else if (num <= 42) flatSizes["XL"] += qty
      else flatSizes["XXL"] += qty
    } else {
      flatSizes["M"] += qty
    }
  }

  const colorsJson = JSON.stringify(colorsArr)
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
    flatSizes.XS, flatSizes.S, flatSizes.M, flatSizes.L, flatSizes.XL, flatSizes.XXL,
    "active",
  ]
  rows.push(row.join(","))
}

const header = "name,brand,category,price,cost,imageUrl,description,material,colors,tags,XS,S,M,L,XL,XXL,status"
writeFileSync(OUT, header + "\n" + rows.join("\n"), "utf-8")
console.log(`legacy.csv: ${rows.length} products written`)
