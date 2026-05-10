import { useParams, useNavigate } from "react-router-dom"
import { useProducts, useSaveProduct } from "@/hooks/useFirestore"
import { InventoryTable } from "@/components/catalog/InventoryTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Package } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import type { Product } from "@/types"

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: products = [] } = useProducts()
  const { isAdmin } = useAuth()
  const saveProduct = useSaveProduct()

  const product = products.find(p => p.id === id)

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Package className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/catalog")}>Volver</Button>
      </div>
    )
  }

  if (!isAdmin) {
    navigate("/catalog", { replace: true })
    return null
  }

  const handleUpdate = (updated: Product) => {
    saveProduct.mutate(updated)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-0.5">Producto</p>
            <h2 className="font-display text-2xl font-bold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario por Talle</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable product={product} onUpdate={handleUpdate} />
          <Button className="mt-6 gap-2" onClick={() => saveProduct.mutate(product)} disabled={saveProduct.isPending}>
            <Save className="h-4 w-4" />
            {saveProduct.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
