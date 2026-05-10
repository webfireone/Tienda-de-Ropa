import { useState, useMemo } from "react"
import { useCart } from "@/context/CartContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SIZES } from "@/types"
import type { Product } from "@/types"
import { X, ShoppingCart, Minus, Plus, Package, Tag, AlertTriangle } from "lucide-react"
import { cn, getTotalStock } from "@/lib/utils"

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem, items } = useCart()
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)

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

  const seccionLabel = product.seccion === "outlet"
    ? "Outlet"
    : product.seccion === "nueva-coleccion"
    ? "Nueva Colección"
    : "General"

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-primary/10 shadow-2xl animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl bg-muted/80 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-muted to-card">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {product.seccion === "outlet" && (
                <span className="gradient-warm text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg">
                  Outlet
                </span>
              )}
              {product.seccion === "nueva-coleccion" && (
                <span className="gradient-cool text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg">
                  Nuevo
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-primary mb-1">{product.brand}</p>
              <h2 className="font-display text-2xl font-bold">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold gradient-text">
                ${product.price.toLocaleString("es-AR")}
              </span>
              {product.cost > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  ${(product.price * 1.3).toLocaleString("es-AR")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant="secondary">{product.material || "Varios"}</Badge>
              <Badge variant="outline">{seccionLabel}</Badge>
            </div>

            {/* Colors */}
            {hasColors ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(c.name); setSelectedSize(""); setQuantity(1) }}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full transition-all",
                        selectedColor === c.name
                          ? "gradient-primary text-white shadow-sm"
                          : "bg-muted/50 border border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-900/20 border border-amber-800/30">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300">Producto sin colores configurados</p>
              </div>
            )}

            {/* Sizes for selected color */}
            {selectedColor && currentColor && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Seleccionar talle <span className="text-foreground">({selectedColor})</span>
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
                          "relative w-10 h-10 rounded-xl text-sm font-medium transition-all",
                          selectedSize === size
                            ? "gradient-primary text-white shadow-sm"
                            : disabled
                            ? "bg-muted/30 text-muted-foreground/30 line-through cursor-not-allowed"
                            : "bg-muted/50 border border-primary/10 hover:border-primary/30 text-foreground"
                        )}
                      >
                        {size}
                        {inCartForSize && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-[7px] text-white flex items-center justify-center font-bold">
                            {inCartForSize.quantity}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Stock disponible: {availableStock} uds.
                  {inCartQty > 0 && ` (${inCartQty} en tu carrito)`}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
            )}

            {/* Quantity + Add */}
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-primary/10">
              {showQty && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-8 h-8 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
              <Button
                className="flex-1 gap-2"
                disabled={!isConfigured || !!cantAddReason}
                onClick={handleAdd}
              >
                <ShoppingCart className="h-4 w-4" />
                {cantAddReason ?? "Agregar al carrito"}
              </Button>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Stock total: {totalStock}</span>
              <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {product.colors.length} colores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
