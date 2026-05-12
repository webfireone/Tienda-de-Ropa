import { useProducts } from "@/hooks/useFirestore"
import { Input } from "@/components/ui/input"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { useViewTransitionNavigate } from "@/hooks/useViewTransitionNavigate"
import { Search, Grid3X3, List, Store, ArrowLeft } from "lucide-react"
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal"
import type { Product } from "@/types"

export function CatalogPage() {
  const navigate = useViewTransitionNavigate()
  const { data: products = [], isLoading } = useProducts()
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesBrand = !selectedBrand || p.brand === selectedBrand
    return matchesSearch && matchesBrand
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </button>
      <PageHero title="Catálogo de Productos" subtitle={`${filtered.length} productos disponibles`} icon={Store} />

      {/* Brand filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedBrand(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${!selectedBrand ? "gradient-primary text-white shadow-sm shadow-primary/25" : "bg-card border border-primary/10 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
        >
          Todas
        </button>
        {brands.map(brand => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${selectedBrand === brand ? "gradient-primary text-white shadow-sm shadow-primary/25" : "bg-card border border-primary/10 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
          >
            {brand}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl glass-card shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent px-0 focus-visible:ring-0 h-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border transition-all ${viewMode === "grid" ? "gradient-primary text-white shadow-sm" : "border-primary/10 hover:border-primary/30"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border transition-all ${viewMode === "list" ? "gradient-primary text-white shadow-sm" : "border-primary/10 hover:border-primary/30"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              viewMode="grid"
              isAdmin={isAdmin}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              viewMode="list"
              isAdmin={isAdmin}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
