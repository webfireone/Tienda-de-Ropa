import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { useSaveProduct } from "@/hooks/useFirestore"
import { Globe, Loader2, AlertCircle, CheckCircle2, Eye, ArrowLeft } from "lucide-react"
import type { ImportResult, Product, ProductColor } from "@/types"

interface ScrapedProduct {
  name: string
  brand: string
  category: string
  gender: Product["gender"]
  price: number
  cost: number
  description: string
  imageUrl: string
  material: string
  colors: ProductColor[]
  tags: string[]
  status: Product["status"]
  seccion: Product["seccion"]
}

const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
]

const STORE_TYPE_LABELS: Record<string, string> = {
  tiendanube: "Tiendanube (JSON-LD + variantes)",
  shopify: "Shopify (products.json)",
  generic: "Genérico (JSON-LD básico)",
}

export function WebImportDialog() {
  const { isAdmin } = useAuth()
  const saveProduct = useSaveProduct()

  const [url, setUrl] = useState("")
  const [proxyUrl, setProxyUrl] = useState(CORS_PROXIES[0])
  const [maxProducts, setMaxProducts] = useState("15")
  const [loading, setLoading] = useState(false)
  const [detectedType, setDetectedType] = useState<string | null>(null)
  const [scraped, setScraped] = useState<ScrapedProduct[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState("")

  const handleScrape = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError("")
    setScraped(null)
    setDetectedType(null)

    const attempts: { label: string; fetchUrl: string }[] = []

    // Build fetch strategies: direct → user proxy → fallback proxies → API endpoints
    const rawUrl = url.trim()
    attempts.push({ label: "directo", fetchUrl: rawUrl })
    if (proxyUrl.trim()) {
      attempts.push({ label: "proxy", fetchUrl: proxyUrl.trim() + encodeURIComponent(rawUrl) })
    }
    for (const fallback of CORS_PROXIES) {
      if (fallback !== proxyUrl.trim()) {
        attempts.push({ label: `proxy: ${new URL(fallback).hostname}`, fetchUrl: fallback + encodeURIComponent(rawUrl) })
      }
    }

    // Also try common API endpoints (Shopify products.json, etc.)
    for (const apiUrl of buildApiUrls(rawUrl)) {
      attempts.push({ label: `API: ${apiUrl}`, fetchUrl: apiUrl })
      if (proxyUrl.trim()) {
        attempts.push({ label: `proxy+API: ${apiUrl}`, fetchUrl: proxyUrl.trim() + encodeURIComponent(apiUrl) })
      }
    }

    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.fetchUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const content = await res.text()

        // Try detected type first, then fallback to all parsers
        let detectedType: string | null = null
        try { detectedType = detectStoreType(content) } catch { /* fallback */ }
        setDetectedType(detectedType)

        const typesToTry = [detectedType, "shopify", "tiendanube", "generic"].filter(Boolean) as string[]
        const seen = new Set<string>()
        for (const type of typesToTry) {
          if (seen.has(type)) continue
          seen.add(type)
          const products = parseProducts(content, type, parseInt(maxProducts) || 15)
          if (products.length > 0) {
            setDetectedType(type)
            setScraped(products)
            setSelected(new Set(products.map((_, i) => i)))
            setLoading(false)
            return
          }
        }
      } catch {
        // attempt failed, try next
      }
    }

    setError("No se encontraron productos en la página. Verificá que la URL sea correcta o probá con otra tienda.")
    setLoading(false)
  }

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleScrape()
  }

  const handleImport = async () => {
    if (!scraped) return
    setResult(null)
    const errors: string[] = []
    let imported = 0

    for (const idx of selected) {
      const s = scraped[idx]
      const missing: string[] = []
      if (!s.name) missing.push("name")
      if (!s.brand) missing.push("brand")
      if (!s.category) missing.push("category")
      if (!s.price) missing.push("price")
      if (!s.cost) missing.push("cost")
      if (!s.imageUrl) missing.push("imageUrl")

      if (missing.length > 0) {
        errors.push(`${s.name || `Producto #${idx + 1}`}: faltan (${missing.join(", ")})`)
        continue
      }

      try {
        const product: Product = {
          id: crypto.randomUUID(),
          name: s.name,
          brand: s.brand,
          category: s.category,
          gender: (s.gender as Product["gender"]) || "unisex",
          price: s.price,
          cost: s.cost,
          description: s.description || "",
          imageUrl: s.imageUrl,
          colors: s.colors.length > 0 ? s.colors : [{ name: "Unico", sizes: { U: 0 } }],
          material: s.material || "",
          tags: s.tags,
          status: s.status || "active",
          seccion: s.seccion || "general",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await saveProduct.mutateAsync(product)
        imported++
      } catch (err) {
        errors.push(`${s.name}: error al guardar (${err})`)
      }
    }
    setResult({ success: errors.length === 0, imported, errors })
  }

  const toggleAll = () => {
    if (!scraped) return
    if (selected.size === scraped.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(scraped.map((_, i) => i)))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <CardTitle>Importar desde Pagina WEB</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">Solo administradores pueden importar datos.</p>
        ) : scraped ? (
          <>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setScraped(null); setResult(null) }}>
                <ArrowLeft className="h-3 w-3 mr-1" /> Volver
              </Button>
              <p className="text-sm text-muted-foreground">
                {scraped.length} productos encontrados
              </p>
              {detectedType && (
                <Badge variant="secondary" className="ml-auto">
                  {STORE_TYPE_LABELS[detectedType] || detectedType}
                </Badge>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 border rounded-xl p-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pb-2 border-b">
                <input type="checkbox" checked={selected.size === scraped.length} onChange={toggleAll} />
                Seleccionar todos
              </label>
              {scraped.map((p, i) => (
                <label key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => {
                      const next = new Set(selected)
                      if (next.has(i)) { next.delete(i) } else { next.add(i) }
                      setSelected(next)
                    }}
                    className="mt-1"
                  />
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.brand} · ${p.price?.toLocaleString("es-AR")} · {p.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.colors?.length || 0} colores · Total stock: {p.colors?.reduce((a, c) => a + Object.values(c.sizes).reduce((b, s) => b + s, 0), 0) || 0}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{p.category}</Badge>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={selected.size === 0 || saveProduct.isPending}
                className="flex-1"
              >
                {saveProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Importar {selected.size} producto{selected.size !== 1 ? "s" : ""}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-xl ${result.success ? "bg-emerald-900/30 border border-emerald-800" : "bg-rose-900/30 border border-rose-800"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
                  <Badge variant={result.success ? "success" : "destructive"}>
                    {result.success ? "Importado" : "Errores"}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-emerald-300">{result.imported} registros importados</p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-rose-300 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Ingresá la URL de una tienda online para extraer productos automáticamente y luego importarlos.
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="web-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">URL de la tienda</label>
                <Input
                  id="web-url"
                  placeholder="https://www.tienda.com.ar/productos/"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max-products" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cantidad máxima de productos</label>
                <Input
                  id="max-products"
                  type="number"
                  min={1}
                  max={100}
                  value={maxProducts}
                  onChange={e => setMaxProducts(e.target.value)}
                />
              </div>

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">Configuración avanzada</summary>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-border">
                  <div className="space-y-1">
                    <label htmlFor="proxy-url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Proxy CORS (se intenta directo + 2 proxies automáticamente)</label>
                    <Input
                      id="proxy-url"
                      placeholder={CORS_PROXIES[0]}
                      value={proxyUrl}
                      onChange={e => setProxyUrl(e.target.value)}
                    />
                  </div>
                </div>
              </details>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-900/30 border border-rose-800">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <Badge variant="destructive">Error</Badge>
                </div>
                <p className="text-sm text-rose-300 whitespace-pre-wrap">{error}</p>
              </div>
            )}

            <Button onClick={handleScrape} disabled={!url.trim() || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              {loading ? "Extrayendo productos..." : "Extraer productos"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- URL helpers ----------

function buildApiUrls(rawUrl: string): string[] {
  const urls: string[] = []
  const clean = rawUrl.replace(/\/+$/, "")

  // Shopify collection/products API
  if (/\/collections\//.test(clean)) {
    urls.push(`${clean}/products.json?limit=250`)
  }
  if (/\/products\//.test(clean)) {
    urls.push(`${clean}.json`)
  }

  // Base domain products.json
  try {
    const parsed = new URL(clean)
    urls.push(`${parsed.origin}/products.json?limit=250`)
  } catch { /* invalid URL */ }

  return urls
}

// ---------- Auto-detection ----------

function detectStoreType(content: string): string {
  // Shopify: valid JSON with "products" array
  try {
    const json = JSON.parse(content)
    if (json.products && Array.isArray(json.products) && json.products.length > 0) {
      return "shopify"
    }
  } catch { /* not JSON */ }

  // Tiendanube: has js-product-item-private (clase exclusiva de Tiendanube)
  if (/js-product-item-private/.test(content)) {
    return "tiendanube"
  }

  // Shopify HTML: has window.Shopify o data-shopify
  if (/window\.Shopify/.test(content) || /data-shopify/.test(content)) {
    return "shopify"
  }

  // Generic: has JSON-LD Product blocks
  if (/<script\s+type="application\/ld\+json"[\s\S]*?"@type"\s*:\s*"Product"/.test(content)) {
    return "generic"
  }

  throw new Error("No se pudo detectar el tipo de tienda. Asegurate de que la URL sea válida y el proxy funcione.")
}

// ---------- Parsing functions ----------

function parseProducts(html: string, storeType: string, max: number): ScrapedProduct[] {
  switch (storeType) {
    case "shopify":
      return parseShopify(html, max)
    case "generic":
      return parseGeneric(html, max)
    case "tiendanube":
    default:
      return parseTiendanube(html, max)
  }
}

interface JsonLdProduct {
  [key: string]: unknown
  name?: string
  description?: string
  image?: string
  category?: string
  offers?: {
    price?: string | number
    seller?: { name?: string }
    inventoryLevel?: { value?: number }
  }
  brand?: { name?: string }
}

interface TiendanubeVariant {
  option0?: string
  option1?: string
  stock?: string | number
  price_number?: number
  [key: string]: unknown
}

function parseTiendanube(html: string, max: number): ScrapedProduct[] {
  const products: ScrapedProduct[] = []

  // 1. Parse JSON-LD blocks
  const ldBlocks: JsonLdProduct[] = []
  const ldRegex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim()) as JsonLdProduct
      if (parsed["@type"] === "Product") {
        ldBlocks.push(parsed)
      }
    } catch { /* skip */ }
  }

  // 2. Parse product card divs for variant data
  const variantMap = new Map<string, TiendanubeVariant[]>()
  const cardRegex = /<div\s+class="js-product-item-private[^"]*"[^>]*data-product-id="(\d+)"[^>]*data-variants="([^"]+)"[^>]*>/g
  let cardMatch
  while ((cardMatch = cardRegex.exec(html)) !== null) {
    try {
      const variants = JSON.parse(cardMatch[2].replace(/&quot;/g, '"'))
      if (Array.isArray(variants) && variants.length > 0) {
        variantMap.set(cardMatch[1], variants)
      }
    } catch { /* skip */ }
  }

  // 3. Get product IDs in order from HTML
  const productIds: string[] = []
  const idRegex = /data-product-id="(\d+)"[^>]*data-variants="/g
  let idMatch
  while ((idMatch = idRegex.exec(html)) !== null) {
    productIds.push(idMatch[1])
  }

  const count = Math.min(max, ldBlocks.length, productIds.length)

  for (let i = 0; i < count; i++) {
    const ld = ldBlocks[i]
    const pid = productIds[i]
    const variants = variantMap.get(pid) || []
    const name = ld.name || ""

    const { colorMap, defaultPrice } = variants.length > 0
      ? extractVariants(variants)
      : { colorMap: {} as Record<string, Record<string, { stockTotal: number }>>, defaultPrice: 0 }

    const colors: ProductColor[] = Object.entries(colorMap).map(([color, sizeMap]) => ({
      name: color,
      sizes: Object.fromEntries(Object.entries(sizeMap).map(([size, data]) => [size, data.stockTotal])),
    }))

    const sellingPrice = defaultPrice || (ld.offers?.price ? Math.round(Number(ld.offers.price)) : 0)

    products.push({
      name,
      brand: ld.offers?.seller?.name || "Tienda",
      category: guessCategory(name),
      gender: "unisex" as const,
      price: sellingPrice,
      cost: Math.round(sellingPrice * 0.5),
      description: (ld.description || "").replace(/^Comprá online /, "").replace(/\. Hacé tu pedido y pagalo online\.?$/, ""),
      imageUrl: (ld.image || "").replace(/^\/\//, "https://"),
      material: "",
      colors,
      tags: [guessCategory(name).toLowerCase()],
      status: "active",
      seccion: "general",
    })
  }

  return products
}

function extractVariants(variants: TiendanubeVariant[]) {
  const colorKeywords = ["AZUL","ROJO","ROSA","FUCSIA","GRIS","NEGRO","BLANCO","CELESTE","CRUDO","MELANGE","LIMA","AMARILLO","TURQUESA","MARRON","VERDE","BEIGE","BORDO","VIOLETA","NARANJA","DORADO","PLATEADO"]
  const sizePatterns = ["XS","S","M","L","XL","XXL","1","2","3","4","5"]

  const uniqueOpt0 = new Set(variants.map(v => (v.option0 || "").trim()).filter(Boolean))
  const uniqueOpt1 = new Set(variants.map(v => (v.option1 || "").trim()).filter(Boolean))
  const singleOption = uniqueOpt1.size === 0 || (uniqueOpt1.size === 1 && [...uniqueOpt1][0] === "")

  const looksLikeColor = (val: string) => {
    if (!val) return false
    const u = val.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return colorKeywords.some(k => u === k) || colorKeywords.some(k => u.startsWith(k))
  }
  const looksLikeSize = (val: string) => {
    if (!val) return false
    const u = val.toUpperCase().replace(/\s*\(.*\)/, "").trim()
    return sizePatterns.includes(u) || /^\d+$/.test(u) || /^\d+\s*\(/.test(u)
  }

  let colorOpt: string | null, sizeOpt: string | null
  if (singleOption) {
    const vals = [...uniqueOpt0]
    const colorCount = vals.filter(v => looksLikeColor(v)).length
    if (colorCount > 0 && colorCount >= vals.length / 2) {
      colorOpt = "option0"; sizeOpt = null
    } else {
      colorOpt = null; sizeOpt = "option0"
    }
  } else {
    const opt0ColorCount = variants.filter(v => looksLikeColor(v.option0 ?? "")).length
    const opt1ColorCount = variants.filter(v => looksLikeColor(v.option1 ?? "")).length
    if (opt0ColorCount > opt1ColorCount) {
      colorOpt = "option0"; sizeOpt = "option1"
    } else if (opt1ColorCount > opt0ColorCount) {
      colorOpt = "option1"; sizeOpt = "option0"
    } else {
      const opt0SizeCount = variants.filter(v => looksLikeSize(v.option0 ?? "")).length
      const opt1SizeCount = variants.filter(v => looksLikeSize(v.option1 ?? "")).length
      if (opt0SizeCount < opt1SizeCount) {
        colorOpt = "option0"; sizeOpt = "option1"
      } else {
        colorOpt = "option1"; sizeOpt = "option0"
      }
    }
  }

  const colorMap: Record<string, Record<string, { stockTotal: number }>> = {}
  let defaultPrice = 0

  for (const v of variants) {
    let color: string, size: string
    if (!colorOpt && !sizeOpt) {
      color = v.option0 ?? "Unico"; size = "U"
    } else if (!colorOpt) {
      color = "Unico"; size = (v[sizeOpt!] as string) || "U"
    } else if (!sizeOpt) {
      color = (v[colorOpt] as string) || "Unico"; size = "U"
    } else {
      color = (v[colorOpt] as string) || "Unico"; size = (v[sizeOpt] as string) || "U"
    }

    size = normalizeSize(size)
    if (!colorMap[color]) colorMap[color] = {}
    if (!colorMap[color][size]) {
      colorMap[color][size] = { stockTotal: 0 }
    }
    const stockVal = v.stock != null ? parseInt(String(v.stock)) : 5
    colorMap[color][size].stockTotal += stockVal

    if (!defaultPrice && v.price_number) defaultPrice = v.price_number
  }

  return { colorMap, defaultPrice }
}

function normalizeSize(raw: string): string {
  if (!raw) return "U"
  const s = raw.trim()
  const numberedMatch = s.match(/^(\d+)\s*\((\w+)\)$/)
  if (numberedMatch) return numberedMatch[2]
  const numMap: Record<string, string> = { "1":"S", "2":"M", "3":"L", "4":"XL", "5":"XXL" }
  if (numMap[s]) return numMap[s]
  const upper = s.toUpperCase()
  const simpleMap: Record<string, string> = { "S":"S", "M":"M", "L":"L", "XL":"XL", "XXL":"XXL", "XS":"XS", "UNICO":"U", "UNIQUE":"U", "ÚNICO":"U" }
  if (simpleMap[upper]) return simpleMap[upper]
  if (/^\d+$/.test(s)) return s
  return s
}

function parseShopify(html: string, max: number): ScrapedProduct[] {
  const products: ScrapedProduct[] = []
  try {
    const json = JSON.parse(html)
    const items = Array.isArray(json) ? json : json.products || []
    for (const item of items.slice(0, max)) {
      const name = item.title || ""
      const price = parseFloat(item.variants?.[0]?.price || "0")
      const imageUrl = item.images?.[0]?.src || item.image?.src || ""
      const colors: ProductColor[] = []

      // Group variants by color
      const colorGroups: Record<string, Record<string, number>> = {}
      for (const v of item.variants || []) {
        const color = v.option1 || v.option2 || "Unico"
        const size = v.option1 === color ? (v.option2 || "U") : (v.option1 || "U")
        if (!colorGroups[color]) colorGroups[color] = {}
        colorGroups[color][size] = (colorGroups[color][size] || 0) + (v.inventory_quantity || 0)
      }
      for (const [color, sizes] of Object.entries(colorGroups)) {
        colors.push({ name: color, sizes })
      }

      products.push({
        name,
        brand: item.vendor || "Shopify",
        category: item.product_type || (item.tags?.[0] || "General"),
        gender: "unisex" as const,
        price: Math.round(price),
        cost: Math.round(price * 0.5),
        description: (item.body_html || "").replace(/<[^>]*>/g, ""),
        imageUrl: imageUrl.startsWith("//") ? "https:" + imageUrl : imageUrl,
        material: "",
        colors,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        status: "active",
        seccion: "general",
      })
    }
  } catch { /* not valid JSON */ }
  return products
}

function parseGeneric(html: string, max: number): ScrapedProduct[] {
  const products: ScrapedProduct[] = []

  // Parse JSON-LD blocks only (no variant data)
  const ldRegex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let m
  let count = 0
  while ((m = ldRegex.exec(html)) !== null && count < max) {
    try {
      const parsed = JSON.parse(m[1].trim())
      if (parsed["@type"] !== "Product") continue
      const name = parsed.name || ""
      const price = parsed.offers?.price ? Math.round(parseFloat(parsed.offers.price)) : 0

      products.push({
        name,
        brand: parsed.offers?.seller?.name || parsed.brand?.name || "Tienda",
        category: parsed.category || guessCategory(name),
        gender: "unisex" as const,
        price,
        cost: Math.round(price * 0.5),
        description: (parsed.description || "").replace(/^Comprá online /, ""),
        imageUrl: (parsed.image || "").replace(/^\/\//, "https://"),
        material: "",
        colors: [{ name: "Unico", sizes: { U: parsed.offers?.inventoryLevel?.value || 10 } }],
        tags: [guessCategory(name).toLowerCase()],
        status: "active",
        seccion: "general",
      })
      count++
    } catch { /* skip */ }
  }

  return products
}

function guessCategory(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("billetera") || lower.includes("carter") || lower.includes("mochil")) return "Accesorios"
  if (lower.includes("boxer") || lower.includes("bóxer")) return "Accesorios"
  if (lower.includes("camisa") || lower.includes("chomba") || lower.includes("blusa")) return "Camisas"
  if (lower.includes("remera") || lower.includes("polo")) return "Remeras"
  if (lower.includes("sweater") || lower.includes("sweter") || lower.includes("suéter")) return "Sweaters"
  if (lower.includes("camper") || lower.includes("chaqueta") || lower.includes("parka") || lower.includes("chaleco")) return "Camperas"
  if (lower.includes("pantal") || lower.includes("bermuda") || lower.includes("short") || lower.includes("jean") || lower.includes("jogg")) return "Pantalones"
  if (lower.includes("buzo") || lower.includes("hoodie")) return "Sweaters"
  if (lower.includes("zapat") || lower.includes("zapatilla") || lower.includes("zapato")) return "Accesorios"
  if (lower.includes("vestido")) return "Vestidos"
  if (lower.includes("falda")) return "Faldas"
  if (lower.includes("mono") || lower.includes("enterito") || lower.includes("body")) return "Vestidos"
  return "Accesorios"
}
