import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Package, ArrowRight } from "lucide-react"
import type { Product } from "@/types"

interface BrandCardProps {
  product: Product
}

export function BrandCard({ product }: BrandCardProps) {
  const navigate = useNavigate()
  const totalStock = Object.values(product.sizes).reduce((a, b) => a + b, 0)

  return (
    <Card className="group overflow-hidden hover:border-primary/20 transition-all duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center gap-4 relative">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden border border-border/50 animate-float">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
          </div>
        </CardHeader>
      </div>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>Stock total</span>
          </div>
          <Badge variant={totalStock > 20 ? "default" : "destructive"}>
            {totalStock} uds.
          </Badge>
        </div>
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/30">
          <span className="text-sm text-muted-foreground">Precio base</span>
          <span className="font-semibold text-base">${product.price.toLocaleString("es-AR")}</span>
        </div>
        <Button
          variant="outline"
          className="w-full group/btn"
          onClick={() => navigate(`/catalog/${product.id}`)}
        >
          <span>Ver detalle</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  )
}
