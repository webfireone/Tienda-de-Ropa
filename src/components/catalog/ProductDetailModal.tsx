import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useCartStore } from "@/store/cartStore"
import { SIZES } from "@/types"
import type { Product } from "@/types"
import { X, ShoppingCart, Minus, Plus, Package, Tag, AlertTriangle, Check } from "lucide-react"
import { cn, getTotalStock } from "@/lib/utils"

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem, items } = useCartStore()
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    if ((window as any).lenis) (window as any).lenis.stop()
    return () => {
      document.body.style.overflow = prev
      if ((window as any).lenis) (window as any).lenis.start()
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollTop <= 0 && e.deltaY < 0) { e.preventDefault(); el.scrollTop = 0 }
      else if (scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0) { e.preventDefault(); el.scrollTop = scrollHeight }
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  const currentColor = product.colors.find(c => c.name === selectedColor)
  const totalStock = getTotalStock(product)
  const availableStock = currentColor ? (currentColor.sizes[selectedSize] ?? 0) : 0
  const inCart = items.find(i => i.productId === product.id && i.color === selectedColor && i.size === selectedSize)
  const inCartQty = inCart?.quantity ?? 0
  const maxQty = availableStock - inCartQty

  const hasColors = product.colors.length > 0
  const hasSizes = hasColors && product.colors.some(c => Object.values(c.sizes).some(s => s > 0))
  const isConfigured = hasColors && hasSizes

  const handleAdd = () => {
    if (!selectedColor || !selectedSize) return
    if (maxQty <= 0) return
    addItem(product, selectedColor, selectedSize, quantity)
    onClose()
  }

  const cantAddReason = useMemo(() => {
    if (!hasColors) return "Este producto no tiene colores configurados"
    if (!selectedColor) return "Seleccioná un color"
    if (!currentColor) return "Color no disponible"
    if (!selectedSize) return "Seleccioná un talle"
    if (availableStock === 0) return "Sin stock disponible"
    if (maxQty <= 0) return `Ya tenés ${inCartQty} uds. en tu carrito (stock máximo)`
    return null
  }, [hasColors, selectedColor, currentColor, selectedSize, availableStock, maxQty, inCartQty])

  const showQty = !!selectedColor && !!selectedSize && availableStock > 0 && maxQty > 0

  const modal = (
    <div className="fixed inset-0 z-[99999]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
        <div ref={scrollRef} className="relative w-full max-w-3xl rounded-2xl glass-deep border border-border shadow-2xl animate-fade-up pointer-events-auto overflow-y-auto overscroll-contain">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-md"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-5">
            {/* Image — left half (2/5) */}
            <div className="sm:col-span-2 relative bg-muted rounded-t-2xl sm:rounded-tr-none sm:rounded-l-2xl overflow-hidden aspect-[4/3] sm:aspect-auto sm:min-h-[420px]">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details — right half (3/5) */}
            <div className="sm:col-span-3 p-6 sm:p-7 flex flex-col gap-4">
              {/* Brand & Title */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary mb-1">{product.brand}</p>
                <h2 className="font-display text-xl font-bold text-foreground leading-tight">{product.name}</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold gradient-text">
                  ${product.price.toLocaleString("es-AR")}
                </span>
                {product.cost > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${(product.cost).toLocaleString("es-AR")}
                  </span>
                )}
              </div>

              {/* Category & Material */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2.5 py-1 border border-border bg-card text-muted-foreground">{product.category}</span>
                <span className="px-2.5 py-1 bg-secondary text-secondary-foreground border border-border">{product.material || "Varios"}</span>
              </div>

              <hr className="border-border" />

              {/* Colors */}
              {hasColors ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Color: <span className="text-foreground font-normal normal-case">{selectedColor || "Elegí uno"}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => { setSelectedColor(c.name); setSelectedSize(""); setQuantity(1) }}
                        className={cn(
                          "text-[11px] px-3 py-1.5 border transition-all",
                          selectedColor === c.name
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        {selectedColor === c.name && <Check className="inline h-2.5 w-2.5 mr-1 -mt-0.5" />}
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-warning/10 border border-warning/30">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                  <p className="text-[10px] font-medium text-warning">Producto sin colores configurados</p>
                </div>
              )}

              {/* Sizes */}
              {selectedColor && currentColor && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Talle: <span className="text-foreground font-normal normal-case">{selectedSize || "Seleccioná"}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map(size => {
                      const stock = currentColor.sizes[size] ?? 0
                      const inCartForSize = items.find(
                        i => i.productId === product.id && i.color === selectedColor && i.size === size
                      )
                      const remaining = stock - (inCartForSize?.quantity ?? 0)
                      const disabled = remaining <= 0
                      return (
                        <button
                          key={size}
                          disabled={disabled}
                          onClick={() => { setSelectedSize(size); setQuantity(1) }}
                          className={cn(
                            "relative min-w-[38px] py-2 px-2.5 text-xs font-medium border transition-all",
                            selectedSize === size
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : disabled
                              ? "border-border text-muted-foreground/30 line-through cursor-not-allowed bg-muted/30"
                              : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                          )}
                        >
                          {size}
                          {inCartForSize && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold shadow-sm border border-card">
                              {inCartForSize.quantity}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Stock: <span className="font-semibold text-foreground">{availableStock}</span> uds.
                    {inCartQty > 0 && (
                      <span className="text-foreground ml-1 font-medium">({inCartQty} en tu carrito)</span>
                    )}
                  </p>
                </div>
              )}

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-2 mt-auto">
                {showQty && (
                  <div className="flex items-center border border-border bg-card shadow-sm">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-9 text-center text-xs font-semibold border-x border-border h-9 flex items-center justify-center text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <button
                  disabled={!isConfigured || !!cantAddReason}
                  onClick={handleAdd}
                  className={cn(
                    "flex-1 h-11 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-sm btn-micro",
                    !isConfigured || cantAddReason
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed shadow-none"
                      : "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                  )}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {cantAddReason ?? "Agregar al carrito"}
                </button>
              </div>

              {/* Extra info */}
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> <span className="font-medium text-foreground">{totalStock}</span> stock</span>
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> <span className="font-medium text-foreground">{product.colors.length}</span> colores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(modal, document.body)
}
