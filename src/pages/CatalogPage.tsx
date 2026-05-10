import { useProducts } from "@/hooks/useFirestore"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Grid3X3, List, Store, ArrowLeft, Eye } from "lucide-react"
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal"
import { getTotalStock } from "@/lib/utils"
import type { Product } from "@/types"

export function CatalogPage() {
  const navigate = useNavigate()
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
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Cargando...
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

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-card border border-primary/10 shadow-sm">
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
          {filtered.map((product, i) => {
            const totalStock = getTotalStock(product)
            return (
              <div
                key={product.id}
                className="group cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelectedProduct(product)}
              >
                  <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-muted to-card overflow-hidden mb-3 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-500">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {totalStock < 10 && (
                    <Badge variant="destructive" className="absolute top-3 left-3">Poco stock</Badge>
                  )}
                  {isAdmin && (
                    <div className="absolute bottom-3 right-3">
                      <span className="text-white text-[10px] font-semibold tracking-wide uppercase gradient-primary px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Eye className="h-3 w-3" />
                        Ver
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-sm font-semibold mb-0.5">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-1 truncate">{product.description}</p>
                <p className="text-sm font-semibold text-primary">${product.price.toLocaleString("es-AR")}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product, i) => {
            const totalStock = getTotalStock(product)
            return (
              <div
                key={product.id}
                className="flex items-center gap-6 p-4 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-primary">${product.price.toLocaleString("es-AR")}</p>
                  <p className={`text-xs ${totalStock < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                    Stock: {totalStock}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
