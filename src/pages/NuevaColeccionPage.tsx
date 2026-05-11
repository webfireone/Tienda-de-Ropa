import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProducts } from "@/hooks/useFirestore"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { ProductCard } from "@/components/products/ProductCard"
import { useAuth } from "@/context/AuthContext"
import { Sparkles, ArrowLeft } from "lucide-react"
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal"
import type { Product } from "@/types"

export function NuevaColeccionPage() {
  const navigate = useNavigate()
  const { data: products = [], isLoading } = useProducts()
  const { isAdmin } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const nuevaColeccion = products.filter(p => p.seccion === "nueva-coleccion")

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
      <PageHero title="Nueva Colección" subtitle={`${nuevaColeccion.length} productos en nueva colección`} icon={Sparkles} />

      {nuevaColeccion.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay productos en Nueva Colección</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nuevaColeccion.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
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
