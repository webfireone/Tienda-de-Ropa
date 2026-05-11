import { useRef, useState } from "react"
import { cn, getTotalStock } from "@/lib/utils"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  index?: number
  viewMode?: "grid" | "list"
  isAdmin?: boolean
  onSelect: (product: Product) => void
}

export function ProductCard({ product, index = 0, viewMode = "grid", isAdmin, onSelect }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const totalStock = getTotalStock(product)
  const sectionBadge = product.seccion === "outlet"
    ? { label: "OUTLET", className: "gradient-warm" }
    : product.seccion === "nueva-coleccion"
    ? { label: "NUEVO", className: "gradient-cool" }
    : null

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode === "list") return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -y * 12, y: x * 12 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className="flex items-center gap-6 p-4 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer animate-fade-up"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => onSelect(product)}
      >
        <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {sectionBadge && (
              <span className={cn("text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full text-white", sectionBadge.className)}>
                {sectionBadge.label}
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-semibold mb-0.5">{product.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{product.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">${product.price.toLocaleString("es-AR")}</p>
          <p className={cn("text-xs", totalStock < 10 ? "text-destructive" : "text-muted-foreground")}>
            Stock: {totalStock}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(product)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-muted to-card overflow-hidden mb-3 shadow-sm transition-all duration-500"
        style={{
          transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
          transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.5s ease-out" : "transform 0.1s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/40 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute top-3 left-3 z-[2] flex flex-col gap-2">
          {sectionBadge && (
            <span className={cn("text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full text-white shadow-lg", sectionBadge.className)}>
              {sectionBadge.label}
            </span>
          )}
          {totalStock > 0 && totalStock < 10 && (
            <Badge variant="destructive" className="text-[9px] px-2.5 py-1">
              Poco stock
            </Badge>
          )}
        </div>

        {totalStock === 0 && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#0d0d1a]/60 backdrop-blur-[1px]">
            <span className="text-xs font-semibold tracking-wider uppercase text-white/60">Sin stock</span>
          </div>
        )}

        {isAdmin && (
          <div className="absolute bottom-3 right-3 z-[2]">
            <span className="text-white text-[10px] font-semibold tracking-wide uppercase gradient-primary px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
              <Eye className="h-3 w-3" />
              Ver
            </span>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]" />
        <div className="absolute bottom-3 left-3 right-3 z-[2]">
          <div className="h-[1px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
          {product.brand}
        </p>
        <h3 className="font-display text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {product.description}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <p className="text-sm font-bold text-primary">
            ${product.price.toLocaleString("es-AR")}
          </p>
          {product.seccion === "outlet" && (
            <span className="text-[9px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">
              DESCUENTO
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
