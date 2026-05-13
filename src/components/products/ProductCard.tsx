import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

type GridSize = "hero" | "tall" | "regular"

interface ProductCardProps {
  product: Product
  index?: number
  viewMode?: "grid" | "list"
  size?: GridSize
  isAdmin?: boolean
  onSelect: (product: Product) => void
}

export function ProductCard({ product, index = 0, viewMode = "grid", size = "regular", isAdmin, onSelect }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
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
    setTilt({ x: -y * 10, y: x * 10 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className="group flex items-center gap-5 p-3 rounded-2xl border border-transparent hover:border-primary/20 transition-all duration-500 cursor-pointer animate-fade-up bg-card/30 hover:bg-card/60"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => onSelect(product)}
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {sectionBadge && (
              <span className={cn("text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full text-white", sectionBadge.className)}>
                {sectionBadge.label}
              </span>
            )}
            {isAdmin && (
              <span className="w-4 h-4 rounded-full gradient-primary flex items-center justify-center text-white text-[8px]">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-semibold mb-0.5 group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{product.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary text-lg">${product.price.toLocaleString("es-AR")}</p>
          <p className={cn("text-xs", totalStock < 10 ? "text-destructive" : "text-muted-foreground")}>
            Stock: {totalStock}
          </p>
        </div>
      </div>
    )
  }

  const imageAspect = size === "hero"
    ? "max-sm:aspect-[2/3] aspect-[3/5]"
    : "aspect-[3/4]"

  const glowIntensity = size === "hero" ? 0.25 : size === "tall" ? 0.2 : 0.15

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer animate-fade-up h-full"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(product)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn("relative rounded-2xl overflow-hidden transition-all duration-500 max-sm:h-auto h-full", imageAspect)}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)" : "transform 0.1s ease-out",
          boxShadow: tilt.x === 0 && tilt.y === 0
            ? size === "hero"
              ? "0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)"
              : "0 8px 30px rgba(0,0,0,0.4)"
            : `0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,92,252,${glowIntensity})`,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl border transition-all duration-500 pointer-events-none z-10"
          style={{
            borderColor: "transparent",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        />

        <div
          className="absolute inset-0 rounded-2xl border transition-all duration-500 pointer-events-none z-10"
          style={{
            border: "1px solid transparent",
            boxShadow: "inset 0 0 0 1px rgba(124,92,252,0)",
            ...(tilt.x !== 0 || tilt.y !== 0 ? {
              border: "1px solid rgba(124,92,252,0.3)",
              boxShadow: "inset 0 0 0 1px rgba(124,92,252,0.1)",
            } : {}),
          }}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a30] to-[#161627]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-shimmer" />
          </div>
        )}

        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imageLoaded ? "opacity-100" : "opacity-0",
            "group-hover:scale-105"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Editorial lighting overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a15]/60 via-[20%] to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a15]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {sectionBadge && (
            <span className={cn("text-[9px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full text-white shadow-lg", sectionBadge.className)}>
              {sectionBadge.label}
            </span>
          )}
          {totalStock > 0 && totalStock < 10 && (
            <span className="text-[9px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 border border-white/10">
              Poco stock
            </span>
          )}
        </div>

        {totalStock === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm bg-black/30">
              Sin stock
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 delay-75 flex items-center gap-2">
          {isAdmin && (
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          )}
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:border-white/20 transition-all duration-300 hover:scale-110">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-20">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn(
                "uppercase mb-0.5 text-white/40",
                size === "hero" ? "text-[10px] font-semibold tracking-[0.25em]" : "text-[9px] font-semibold tracking-[0.2em]"
              )}>
                {product.brand}
              </p>
              <h3 className={cn(
                "font-display font-semibold leading-tight text-white mb-1 line-clamp-2 group-hover:text-white/90 transition-colors",
                size === "hero" ? "text-base" : "text-sm"
              )}>
                {product.name}
              </h3>
              <p className={cn(
                "text-white/50 line-clamp-1 mb-2",
                size === "hero" ? "text-xs" : "text-[11px]"
              )}>
                {product.description}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className={cn(
                "font-display font-bold text-white",
                size === "hero" ? "text-xl" : "text-lg"
              )}>
                ${product.price.toLocaleString("es-AR")}
              </p>
              {product.seccion === "outlet" && (
                <p className="text-[9px] font-bold text-rose-300 tracking-wider">DESCUENTO</p>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-100">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/70 group-hover:text-white transition-colors">
              Ver producto
            </span>
            <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTotalStock(product: Product): number {
  return product.colors.reduce((total, color) => {
    return total + Object.values(color.sizes).reduce((sum, qty) => sum + qty, 0)
  }, 0)
}
