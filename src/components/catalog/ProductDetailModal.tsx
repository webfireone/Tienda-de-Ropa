import { useState, useMemo, useEffect } from "react"
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

  useEffect(() => {
    // Bloquear scroll de fondo
    document.body.style.overflow = "hidden"
    if ((window as any).lenis) (window as any).lenis.stop()

    return () => {
      // Restaurar scroll
      document.body.style.overflow = ""
      if ((window as any).lenis) (window as any).lenis.start()
    }
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

  const sectionBadge = product.seccion === "outlet"
    ? { label: "OUTLET", className: "bg-red-600 text-white" }
    : product.seccion === "nueva-coleccion"
    ? { label: "NUEVO", className: "bg-black text-white" }
    : null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-muted/80 hover:bg-secondary backdrop-blur-sm transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute inset-4 flex items-start justify-center overflow-y-auto pointer-events-none">
        <div className="relative w-full max-w-5xl my-4 rounded-xl bg-card border border-border shadow-2xl animate-fade-up pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image — left half */}
            <div className="relative bg-muted rounded-t-xl md:rounded-tr-none md:rounded-l-xl overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain max-h-[60vh] md:max-h-none"
              />
              {sectionBadge && (
                <span className={`absolute top-5 left-5 text-[10px] font-semibold tracking-widest px-3 py-1.5 ${sectionBadge.className}`}>
                  {sectionBadge.label}
                </span>
              )}
            </div>

          {/* Details — right half */}
          <div className="p-8 md:p-10 flex flex-col gap-5">
            {/* Brand & Title */}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">{product.brand}</p>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-1">
              <span className="font-display text-3xl font-bold gradient-text">
                ${product.price.toLocaleString("es-AR")}
              </span>
              {product.cost > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ${(product.cost).toLocaleString("es-AR")}
                </span>
              )}
            </div>

            {/* Category & Material */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 border border-border bg-card text-muted-foreground">{product.category}</span>
              <span className="px-3 py-1.5 bg-secondary text-secondary-foreground border border-border">{product.material || "Varios"}</span>
            </div>

            <hr className="border-border" />

            {/* Colors */}
            {hasColors ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Color: <span className="text-foreground font-normal normal-case">{selectedColor || "Elegí uno"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(c.name); setSelectedSize(""); setQuantity(1) }}
                      className={cn(
                        "text-xs px-4 py-2 border transition-all",
                        selectedColor === c.name
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                      )}
                    >
                      {selectedColor === c.name && <Check className="inline h-3 w-3 mr-1.5 -mt-0.5" />}
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <p className="text-xs font-medium text-warning">Producto sin colores configurados</p>
              </div>
            )}

            {/* Sizes */}
            {selectedColor && currentColor && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Talle: <span className="text-foreground font-normal normal-case">{selectedSize || "Seleccioná"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
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
                          "relative min-w-[44px] py-2.5 px-3 text-sm font-medium border transition-all",
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : disabled
                            ? "border-border text-muted-foreground/30 line-through cursor-not-allowed bg-muted/30"
                            : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        {size}
                        {inCartForSize && (
                          <span className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold shadow-sm border border-card">
                            {inCartForSize.quantity}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Stock: <span className="font-semibold text-foreground">{availableStock}</span> uds.
                  {inCartQty > 0 && (
                    <span className="text-foreground ml-1.5 font-medium">({inCartQty} en tu carrito)</span>
                  )}
                </p>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mt-3">
              {showQty && (
                <div className="flex items-center border border-border bg-card shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold border-x border-border h-10 flex items-center justify-center text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <button
                disabled={!isConfigured || !!cantAddReason}
                onClick={handleAdd}
                className={cn(
                  "flex-1 h-12 text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm",
                  !isConfigured || cantAddReason
                    ? "bg-muted text-muted-foreground/50 cursor-not-allowed shadow-none"
                    : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                {cantAddReason ?? "Agregar al carrito"}
              </button>
            </div>

            {/* Extra info */}
            <div className="flex items-center gap-5 text-xs text-muted-foreground pt-4 mt-1 border-t border-border">
              <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Stock total: <span className="font-medium text-foreground">{totalStock}</span></span>
              <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> <span className="font-medium text-foreground">{product.colors.length}</span> colores</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
