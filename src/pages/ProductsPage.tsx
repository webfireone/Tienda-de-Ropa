import { ProductManager } from "@/components/products/ProductManager"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { Package } from "lucide-react"

export function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Productos" subtitle="Gestión de productos" icon={Package} />
      <ProductManager />
    </div>
  )
}
