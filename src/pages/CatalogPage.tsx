import { useProducts } from "@/hooks/useFirestore"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Grid3X3, List, ArrowLeft } from "lucide-react"
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal"
import { GENDERS, type Product } from "@/types"

const CATEGORIES = ["Todos", "Remeras", "Pantalones", "Buzos", "Camisas", "Accesorios", "Calzado", "Bolsos", "Gorras", "Carteras"]

type CardSize = "hero" | "tall" | "regular"

const EDITORIAL_PATTERN: CardSize[] = [
  "hero",
  "regular", "tall", "regular",
  "regular", "regular", "tall",
  "tall", "regular", "regular",
  "regular", "tall",
]

function getCardSize(index: number): CardSize {
  return EDITORIAL_PATTERN[index % EDITORIAL_PATTERN.length]
}

export function CatalogPage() {
  const navigate = useNavigate()
  const { data: products = [], isLoading } = useProducts()
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [visibleCount, setVisibleCount] = useState(24)
  const headerRef = useRef<HTMLDivElement>(null)

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<string>("Todos")

  const categories = CATEGORIES.filter(cat => {
    if (cat === "Todos") return true
    return products.some(p => p.category.toLowerCase().includes(cat.toLowerCase()))
  })

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || p.category.toLowerCase().includes(selectedCategory.toLowerCase())
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
    const matchesGender = selectedGender === "Todos" || !p.gender || p.gender === selectedGender
    return matchesSearch && matchesCategory && matchesBrand && matchesGender
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  useEffect(() => {
    setVisibleCount(24)
  }, [selectedCategory, search, selectedBrands, selectedGender])

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
  }

  const getGridClass = (size: CardSize): string => {
    switch (size) {
      case "hero": return "col-span-2 row-span-2 max-sm:row-span-1"
      case "tall": return "col-span-1 row-span-2 max-sm:row-span-1"
      default: return "col-span-1 row-span-1"
    }
  }

  const getSkeletonClass = (size: CardSize): string => {
    switch (size) {
      case "hero": return "col-span-2 row-span-2 max-sm:row-span-1"
      case "tall": return "col-span-1 row-span-2 max-sm:row-span-1"
      default: return "col-span-1 row-span-1"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-sm:auto-rows-auto auto-rows-[320px]">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`${getSkeletonClass(EDITORIAL_PATTERN[i % EDITORIAL_PATTERN.length])} rounded-2xl overflow-hidden`}
              >
                <ProductCardSkeleton viewMode="grid" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Editorial Header */}
      <div ref={headerRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-5">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-5 tracking-widest uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Inicio
          </button>

          <div className="flex items-end justify-between gap-6 mb-5">
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-primary font-semibold mb-1.5">Colección</p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                Catálogo
              </h1>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block pb-2">
              {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
            </p>
          </div>

          {/* Marcas elegantes */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-0.5">
            <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/50 font-medium shrink-0 mr-1">Marcas</span>
            {brands.map(brand => {
              const isActive = selectedBrands.includes(brand)
              return (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`shrink-0 px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 whitespace-nowrap rounded-full ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_2px_12px_rgba(124,92,252,0.35)]"
                      : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] border border-white/[0.06]"
                  }`}
                >
                  {brand}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky: Categorías + Género + Buscar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Fila única: Categorías | Género | Buscar+Vista */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scrollbar-none py-3">
            {/* Categorías */}
            <div className="flex items-center gap-0.5 shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1 text-[11px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap rounded-full ${
                    selectedCategory === cat
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border/40 shrink-0" />

            {/* Género */}
            <div className="flex items-center gap-0.5 shrink-0">
              {["Todos", ...GENDERS].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`shrink-0 px-3 py-1 text-[11px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap rounded-full ${
                    selectedGender === g
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g === "Todos" ? g : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>

            {/* Buscar + Vista */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <div className="relative w-36">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-xs border-border/40 bg-muted/40 focus:bg-muted transition-colors rounded-full"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/30 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-full transition-all ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-muted-foreground mb-2">Sin resultados</p>
            <p className="text-sm text-muted-foreground">Probá con otros filtros o buscá algo diferente</p>
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-sm:auto-rows-auto auto-rows-[280px]">
              {visible.map((product, i) => {
                const size = getCardSize(i)
                return (
                  <div
                    key={product.id}
                    className={`${getGridClass(size)} animate-fade-up overflow-hidden rounded-2xl`}
                    style={{ animationDelay: `${(i % 12) * 50}ms` }}
                  >
                    <ProductCard
                      product={product}
                      index={i}
                      viewMode="grid"
                      size={size}
                      isAdmin={isAdmin}
                      onSelect={setSelectedProduct}
                    />
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount(v => v + 24)}
                  className="px-8 py-3 text-xs font-medium tracking-widest uppercase border border-foreground rounded-full hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Ver más ({filtered.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {visible.map((product, i) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <ProductCard
                  product={product}
                  index={i}
                  viewMode="list"
                  isAdmin={isAdmin}
                  onSelect={setSelectedProduct}
                />
              </div>
            ))}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount(v => v + 24)}
                  className="px-8 py-3 text-xs font-medium tracking-widest uppercase border border-foreground rounded-full hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Ver más
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
