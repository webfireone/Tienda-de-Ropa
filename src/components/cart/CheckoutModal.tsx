import { useState, useRef } from "react"
import { useParamsStore } from "@/store/paramsStore"
import { useCartStore } from "@/store/cartStore"
import { useCreateOrder } from "@/hooks/useFirestore"
import { addOrderAlert } from "@/lib/orderAlerts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Truck, CreditCard, CheckCircle, Package, Loader2, Store, MessageCircle } from "lucide-react"
import type { Order, OrderItem } from "@/types"

const WHATSAPP_NUMBER = "5491122618116"

function buildWhatsAppMessage(order: Order): string {
  const itemsList = order.items.map(i =>
    `• ${i.productName} (${i.brand}) - ${i.color} - Talle ${i.size} - x${i.quantity} - $${(i.unitPrice * i.quantity).toLocaleString("es-AR")}`
  ).join("\n")

  const deliveryText = order.deliveryMethod === "pickup"
    ? "Retiro por local (Italia 1037, Luján)"
    : `Envío a domicilio: ${order.deliveryAddress}${order.deliveryCity ? `, ${order.deliveryCity}` : ""}`

  return encodeURIComponent(
    `🛍️ *NUEVO PEDIDO* - ${order.id}\n\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📞 *Tel:* ${order.customerPhone}\n` +
    `📦 *Entrega:* ${deliveryText}\n` +
    `💳 *Pago:* ${order.paymentMethod}\n` +
    `💰 *Total:* $${order.total.toLocaleString("es-AR")}\n\n` +
    `*Productos:*\n${itemsList}\n\n` +
    `📍 Italia 1037, Luján, Buenos Aires`
  )
}

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, clearCart } = useCartStore()
  const { params } = useParamsStore()
  const createOrder = useCreateOrder()
  const lastOrder = useRef<Order | null>(null)

  const [step, setStep] = useState<"form" | "success">("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("pickup")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(params.cart.paymentMethods[0]?.name ?? "")
  const [error, setError] = useState("")

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = subtotal > 100000 ? subtotal * 0.1 : subtotal > 50000 ? subtotal * 0.05 : 0
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 120000 ? 0 : params.shipping.fixedCost
  const total = subtotal - discount + shipping
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  const selectedPayment = params.cart.paymentMethods.find(m => m.name === paymentMethod)
  const surcharge = selectedPayment ? subtotal * selectedPayment.rate : 0

  const handleSubmit = async () => {
    setError("")

    if (!name.trim()) { setError("Ingresá tu nombre"); return }
    if (!phone.trim()) { setError("Ingresá tu teléfono"); return }
    if (deliveryMethod === "shipping" && !address.trim()) { setError("Ingresá tu dirección"); return }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const now = new Date().toISOString()

    const orderItems: OrderItem[] = items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      brand: i.brand,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.price,
      imageUrl: i.imageUrl,
    }))

    const order: Order = {
      id: orderId,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      deliveryMethod,
      deliveryAddress: deliveryMethod === "shipping" ? address.trim() : undefined,
      deliveryCity: deliveryMethod === "shipping" ? city.trim() : undefined,
      deliveryPostalCode: deliveryMethod === "shipping" ? postalCode.trim() : undefined,
      paymentMethod: paymentMethod,
      paymentRate: selectedPayment?.rate ?? 0,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      total,
      createdAt: now,
    }

    try {
      await createOrder.mutateAsync(order)
      lastOrder.current = order
      addOrderAlert(order.id, order.customerName, order.total, order.deliveryMethod)
      clearCart()
      setStep("success")
    } catch {
      setError("Ocurrió un error al procesar el pedido. Intentá de nuevo.")
    }
  }

  const handleClose = () => {
    if (step === "success") {
      clearCart()
    }
    lastOrder.current = null
    setStep("form")
    setError("")
    onClose()
  }

  if (!open) return null

  if (step === "success") {
    const waUrl = lastOrder.current
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(lastOrder.current)}`
      : "#"

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d0d1a]/80 backdrop-blur-sm p-4" onClick={handleClose}>
        <div className="relative w-full max-w-md rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/50 p-8 text-center shadow-2xl shadow-primary/10" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">¡Pedido confirmado!</h3>
          <p className="text-sm text-muted-foreground mb-1">Gracias por tu compra, {name}.</p>
          <p className="text-xs text-muted-foreground mb-6">
            {deliveryMethod === "pickup"
              ? "Pasá a retirar por Italia 1037, Luján. Te esperamos."
              : "Te enviamos el seguimiento por WhatsApp."}
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors mb-3"
          >
            <MessageCircle className="h-4 w-4" />
            Notificar pedido por WhatsApp
          </a>

          <Button onClick={handleClose} variant="outline" className="w-full border-primary/10">
            Volver a la tienda
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0d0d1a]/80 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="min-h-full flex items-start justify-center pt-8 pb-20" onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-2xl rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-display font-bold text-lg">Finalizar pedido</h2>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 md:p-6 space-y-6">
            {/* Customer info */}
            <section>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">Tus datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Nombre completo *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Juan Pérez" className="bg-card/50 border-primary/10" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Teléfono *</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 11 2261-8116" className="bg-card/50 border-primary/10" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Ej: juan@email.com" className="bg-card/50 border-primary/10" />
                </div>
              </div>
            </section>

            {/* Delivery method */}
            <section>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                    deliveryMethod === "pickup"
                      ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-primary/10 bg-card/50 hover:border-primary/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    deliveryMethod === "pickup" ? "border-primary" : "border-primary/20"
                  }`}>
                    {deliveryMethod === "pickup" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-primary" />
                      Retiro por local
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Italia 1037, Luján — Sin cargo</p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod("shipping")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                    deliveryMethod === "shipping"
                      ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-primary/10 bg-card/50 hover:border-primary/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    deliveryMethod === "shipping" ? "border-primary" : "border-primary/20"
                  }`}>
                    {deliveryMethod === "shipping" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      Envío a domicilio
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {shipping === 0 ? "Gratis" : formatMoney(shipping)}
                    </p>
                  </div>
                </button>
              </div>

              {deliveryMethod === "shipping" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Dirección *</label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle y número" className="bg-card/50 border-primary/10" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Código postal</label>
                    <Input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="6700" className="bg-card/50 border-primary/10" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Ciudad</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad" className="bg-card/50 border-primary/10" />
                  </div>
                </div>
              )}
            </section>

            {/* Payment method */}
            <section>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4 flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                Medio de pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {params.cart.paymentMethods.map(m => (
                  <button
                    key={m.name}
                    onClick={() => setPaymentMethod(m.name)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all duration-200 ${
                      paymentMethod === m.name
                        ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-primary/10 bg-card/50 hover:border-primary/20"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === m.name ? "border-primary" : "border-primary/20"
                    }`}>
                      {paymentMethod === m.name && <div className="w-2 h-2 rounded-full gradient-primary" />}
                    </div>
                    <span>{m.name}</span>
                    {m.rate > 0 && <span className="text-[10px] text-muted-foreground ml-auto">+{(m.rate * 100).toFixed(0)}%</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* Order summary */}
            <section className="rounded-xl bg-card/50 border border-primary/10 p-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Resumen del pedido</h3>
              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.productName}</p>
                      <p className="text-[10px] text-muted-foreground">{item.color} · Talle {item.size} · x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold tabular-nums">{formatMoney(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/10 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatMoney(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Descuento</span>
                    <span className="tabular-nums">-{formatMoney(discount)}</span>
                  </div>
                )}
                {surcharge > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Recargo ({paymentMethod})</span>
                    <span className="tabular-nums">+{formatMoney(surcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className={`tabular-nums ${shipping === 0 ? "text-emerald-500 font-semibold" : ""}`}>
                    {shipping === 0 ? "GRATIS" : formatMoney(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-primary/10">
                  <span>Total</span>
                  <span className="gradient-text tabular-nums">{formatMoney(total + surcharge)}</span>
                </div>
              </div>
            </section>

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-5 border-t border-primary/10 bg-card/30">
            <Button variant="outline" onClick={handleClose} className="flex-1 border-primary/10">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createOrder.isPending}
              className="flex-1 btn-shine"
            >
              {createOrder.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <>Confirmar pedido · {formatMoney(total + surcharge)}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
