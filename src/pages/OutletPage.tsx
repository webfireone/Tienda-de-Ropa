import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProducts } from "@/hooks/useFirestore"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { Badge } from "@/components/ui/badge"
import { Tag, ArrowLeft } from "lucide-react"
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal"
import { getTotalStock } from "@/lib/utils"
import type { Product } from "@/types"

export function OutletPage() {
  const navigate = useNavigate()
  const { data: products = [], isLoading } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const outletProducts = products.filter(p => p.seccion === "outlet")

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
      <PageHero title="Outlet" subtitle={`${outletProducts.length} productos con descuento`} icon={Tag} />

      {outletProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay productos en Outlet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outletProducts.map((product, i) => {
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
                  <div className="absolute top-3 left-3 gradient-warm text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg">
                    Outlet
                  </div>
                  {totalStock < 10 && (
                    <Badge variant="destructive" className="absolute top-3 right-3">Poco stock</Badge>
                  )}
                </div>
                <h3 className="font-display text-sm font-semibold mb-0.5">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-1 truncate">{product.description}</p>
                <p className="text-sm font-semibold text-primary">${product.price.toLocaleString("es-AR")}</p>
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
