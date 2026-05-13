import { useProducts } from "@/hooks/useFirestore"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Grid3X3, List, ArrowLeft, SlidersHorizontal } from "lucide-react"
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
  const [showFilters, setShowFilters] = useState(false)
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
    const matchesGender = selectedGender === "Todos" || p.gender === selectedGender
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
      case "hero": return "col-span-2 row-span-2"
      case "tall": return "col-span-1 row-span-2"
      default: return "col-span-1 row-span-1"
    }
  }

  const getSkeletonClass = (size: CardSize): string => {
    switch (size) {
      case "hero": return "col-span-2 row-span-2"
      case "tall": return "col-span-1 row-span-2"
      default: return "col-span-1 row-span-1"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[320px]">
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
      <div ref={headerRef} className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-6">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 tracking-wide uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Inicio
          </button>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold mb-2">Colección</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Catálogo
              </h1>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block pb-1">
              {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Controls */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 text-xs font-medium tracking-wide rounded-full transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-none">
              {["Todos", ...GENDERS].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`shrink-0 px-3 py-1 text-[11px] font-medium tracking-wide rounded-full border transition-all duration-300 whitespace-nowrap ${
                    selectedGender === g
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                  }`}
                >
                  {g === "Todos" ? g : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border/30 shrink-0 mx-1" />

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs border-border/50 bg-muted/30 focus:bg-muted transition-colors rounded-full"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium rounded-full border transition-all ${
                showFilters || selectedBrands.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {selectedBrands.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                  {selectedBrands.length}
                </span>
              )}
            </button>

            <div className="flex items-center border border-border/50 rounded-full overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="pb-3 border-t border-border/30 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Marcas</p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                      selectedBrands.includes(brand)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[280px]">
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
