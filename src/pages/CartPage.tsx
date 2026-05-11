import { useCartStore } from "@/store/cartStore"
import { useParamsStore } from "@/store/paramsStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ShoppingCartIcon, Trash2, Minus, Plus, CreditCard, Truck, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react"
import { CheckoutModal } from "@/components/cart/CheckoutModal"
import { useNavigate } from "react-router-dom"

export function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const { params, updateParams } = useParamsStore()
  const { isAdmin } = useAuth()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = subtotal > 100000 ? subtotal * 0.1 : subtotal > 50000 ? subtotal * 0.05 : 0
  const shipping = subtotal > 120000 ? 0 : params.shipping.fixedCost
  const total = subtotal - discount + shipping
  const freeShipProgress = Math.min(100, (subtotal / 120000) * 100)
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
    }),
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>
        <PageHero title="Carrito de Compra" subtitle={`${items.length} ${items.length === 1 ? "artículo" : "artículos"}`} icon={ShoppingBag} />

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-card to-muted/50 backdrop-blur-sm">
                <CardContent className="py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10">
                    <ShoppingCartIcon className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-display font-semibold mb-2">Tu carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mb-6">Explorá nuestro catálogo y encontrá tu próximo look</p>
                  <Button onClick={() => navigate("/catalog")} className="btn-shine">
                    Explorar productos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                    layout
                  >
                    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-card to-muted/30 hover:border-primary/20 transition-all duration-300 group">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-center gap-4 md:gap-5">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted overflow-hidden shrink-0 shadow-sm">
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-sm md:text-base leading-tight mb-0.5">{item.productName}</p>
                            <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-primary/20" style={{ backgroundColor: item.color.toLowerCase() }} />
                                {item.color}
                              </span>
                              <span>Talle {item.size}</span>
                              <span className="text-primary font-medium">${item.price.toLocaleString("es-AR")} c/u</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="flex items-center gap-1 bg-card border border-primary/10 rounded-xl p-0.5">
                              <button
                                onClick={() => updateQuantity(item.productId, item.color, item.size, -1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.color, item.size, 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-bold text-primary tabular-nums">{formatMoney(item.price * item.quantity)}</p>
                              <button
                                onClick={() => removeItem(item.productId, item.color, item.size)}
                                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6">
                <Card className="border-primary/10 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm sticky top-24">
                  <CardContent className="p-6 space-y-5">
                    <h3 className="font-display font-bold text-lg">
                      <span className="gradient-text">Resumen</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-500">Descuento progresivo</span>
                          <span className="font-semibold text-emerald-500 tabular-nums">-{formatMoney(discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span className={`font-semibold tabular-nums ${shipping === 0 ? "text-emerald-500" : ""}`}>
                          {shipping === 0 ? "GRATIS" : formatMoney(shipping)}
                        </span>
                      </div>

                      {shipping > 0 && (
                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-rose-500 transition-all duration-700"
                              style={{ width: `${freeShipProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground text-right">
                            {formatMoney(120000 - subtotal)} más para envío gratis
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-primary/10 pt-4 flex justify-between items-center">
                      <span className="font-display text-base font-bold">Total</span>
                      <span className="font-display text-xl font-bold gradient-text tabular-nums">{formatMoney(total)}</span>
                    </div>

                    <Button onClick={() => setCheckoutOpen(true)} className="w-full btn-shine h-11 text-sm" size="lg">
                      Finalizar Compra
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Pago seguro</span>
                      <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Envío rápido</span>
                    </div>
                  </CardContent>
                </Card>

                {isAdmin && (
                  <Card className="border-primary/10 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                          <CreditCard className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold tracking-wider uppercase">Parámetros</span>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Medios de pago</h4>
                        {params.cart.paymentMethods.map((m, i) => (
                          <div key={i} className="flex justify-between text-xs p-2 rounded-lg bg-muted/50 mb-1.5">
                            <span>{m.name}</span>
                            <span className="text-muted-foreground">{(m.rate * 100).toFixed(0)}% recargo</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Envío</h4>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 mb-1.5">
                          <span className="text-xs">Envío gratis</span>
                          <Switch
                            checked={params.shipping.freeShippingEnabled}
                            onChange={(checked) => updateParams({
                              ...params,
                              shipping: { ...params.shipping, freeShippingEnabled: checked }
                            })}
                          />
                        </div>
                        <div className="flex justify-between text-xs p-2 rounded-lg bg-muted/50">
                          <span>Costo fijo</span>
                          <span className="tabular-nums">{formatMoney(params.shipping.fixedCost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}
