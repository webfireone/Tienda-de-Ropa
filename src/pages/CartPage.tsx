import { useCartStore } from "@/store/cartStore"
import { useParamsStore } from "@/store/paramsStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { ShoppingCartIcon, Trash2, Minus, Plus, CreditCard, Truck, ShoppingBag } from "lucide-react"

export function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const { params, updateParams } = useParamsStore()
  const { isAdmin } = useAuth()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = subtotal > 100000 ? subtotal * 0.1 : subtotal > 50000 ? subtotal * 0.05 : 0
  const shipping = subtotal > 120000 ? 0 : params.shipping.fixedCost
  const total = subtotal - discount + shipping
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Carrito de Compra" subtitle={`${items.length} artículos`} icon={ShoppingBag} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
                <Button onClick={() => window.location.href = "/catalog"}>
                  Explorar productos
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item, i) => (
              <Card key={`${item.productId}-${item.color}-${item.size}-${i}`} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.brand} - {item.color} - Talle {item.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.color, item.size, -1)} className="w-8 h-8 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-muted transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.color, item.size, 1)} className="w-8 h-8 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-muted transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="w-24 text-right font-semibold">{formatMoney(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.productId, item.color, item.size)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Descuento</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">GRATIS</span> : formatMoney(shipping)}</span>
              </div>
              <div className="border-t border-primary/5 pt-4 flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span className="gradient-text">{formatMoney(total)}</span>
              </div>
              <Button className="w-full btn-shine">Finalizar Compra</Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Parámetros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Solo visible para administradores</p>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Medios de pago
                  </h4>
                  {params.cart.paymentMethods.map((m, i) => (
                    <div key={i} className="flex justify-between text-sm p-3 rounded-lg bg-muted/50 mb-2">
                      <span>{m.name}</span>
                      <span className="text-muted-foreground">{(m.rate * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2">
                    <Truck className="h-3 w-3" /> Envío
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-2">
                    <span className="text-sm">Envío gratis</span>
                    <Switch
                      checked={params.shipping.freeShippingEnabled}
                      onChange={(checked) => updateParams({
                        ...params,
                        shipping: { ...params.shipping, freeShippingEnabled: checked }
                      })}
                    />
                  </div>
                  <div className="flex justify-between text-sm p-3 rounded-lg bg-muted/50">
                    <span>Costo fijo</span>
                    <span>{formatMoney(params.shipping.fixedCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
