import { useState, useRef, useEffect } from "react"
import { useParamsStore } from "@/store/paramsStore"
import { useCartStore } from "@/store/cartStore"
import { useCreateOrder } from "@/hooks/useFirestore"
import { addOrderAlert } from "@/lib/orderAlerts"
import { PROVINCES } from "@/lib/argentina-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Truck, CreditCard, CheckCircle, Package, Loader2, Store, MessageCircle, ShieldCheck, ChevronDown, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import type { Order, OrderItem } from "@/types"

const MP_PAYMENT = "Mercado Pago"
const WHATSAPP_NUMBER = "5491122618116"

function buildWhatsAppMessage(order: Order): string {
  const itemsList = order.items.map(i =>
    `• ${i.productName} (${i.brand}) - ${i.color} - Talle ${i.size} - x${i.quantity} - $${(i.unitPrice * i.quantity).toLocaleString("es-AR")}`
  ).join("\n")

  const deliveryText = order.deliveryMethod === "pickup"
    ? "Retiro por local (Italia 1037, Luján)"
    : `Envío a domicilio: ${order.deliveryAddress || ""}`

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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      ;(window as any).lenis?.stop()
    } else {
      document.body.style.overflow = ""
      ;(window as any).lenis?.start()
    }
    return () => {
      document.body.style.overflow = ""
      ;(window as any).lenis?.start()
    }
  }, [open])

  const [step, setStep] = useState<"form" | "review" | "success">("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("pickup")
  const [address, setAddress] = useState("")
  const [province, setProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(params.cart.paymentMethods[0]?.name ?? "")
  const [error, setError] = useState("")
  const [processingMp, setProcessingMp] = useState(false)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = subtotal > 100000 ? subtotal * 0.1 : subtotal > 50000 ? subtotal * 0.05 : 0
  const shipping = deliveryMethod === "pickup" ? 0 : subtotal > 120000 ? 0 : params.shipping.fixedCost
  const total = subtotal - discount + shipping
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  const selectedPayment = params.cart.paymentMethods.find(m => m.name === paymentMethod)
  const surcharge = selectedPayment ? subtotal * selectedPayment.rate : 0
  const isMp = paymentMethod === MP_PAYMENT

  const currentProvince = PROVINCES.find(p => p.name === province)
  const availableCities = currentProvince?.cities ?? []

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
    const city = currentProvince?.cities.find(c => c.name === cityName)
    if (city) setPostalCode(city.postalCode)
  }

  const validateForm = (): boolean => {
    setError("")
    if (!name.trim()) { setError("Ingresá tu nombre"); return false }
    if (!phone.trim()) { setError("Ingresá tu teléfono"); return false }
    if (deliveryMethod === "shipping") {
      if (!address.trim()) { setError("Ingresá tu dirección"); return false }
      if (!province) { setError("Seleccioná tu provincia"); return false }
      if (!selectedCity) { setError("Seleccioná tu ciudad"); return false }
    }
    return true
  }

  const handleNext = () => {
    if (!validateForm()) return
    setStep("review")
  }

  const handleConfirm = async () => {
    setError("")

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
      deliveryAddress: deliveryMethod === "shipping" ? `${address.trim()}, ${selectedCity}, ${province}` : undefined,
      deliveryCity: deliveryMethod === "shipping" ? `${selectedCity}, ${province}` : undefined,
      deliveryPostalCode: deliveryMethod === "shipping" ? postalCode.trim() : undefined,
      paymentMethod: paymentMethod,
      paymentRate: selectedPayment?.rate ?? 0,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      total: total + surcharge,
      createdAt: now,
    }

    try {
      await createOrder.mutateAsync(order)
      lastOrder.current = order
      addOrderAlert(order.id, order.customerName, order.total, order.deliveryMethod)

      if (isMp) {
        setProcessingMp(true)
        const res = await fetch("/api/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orderItems,
            total: order.total,
            orderId: order.id,
            customerName: name.trim(),
            customerEmail: email.trim(),
          }),
        })
        if (!res.ok) throw new Error("Error al crear preferencia de pago")
        const data = await res.json()
        if (data.initPoint) {
          clearCart()
          window.location.href = data.initPoint
          return
        }
        throw new Error("No se obtuvo el link de pago")
      }

      clearCart()
      setStep("success")
    } catch (err) {
      setProcessingMp(false)
      setError("Ocurrió un error al procesar el pago. Intentá de nuevo.")
    }
  }

  const handleClose = () => {
    if (step === "success") clearCart()
    lastOrder.current = null
    setStep("form")
    setError("")
    setProcessingMp(false)
    onClose()
  }

  if (!open) return null

  if (step === "success") {
    const waUrl = lastOrder.current
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(lastOrder.current)}`
      : "#"

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d0d1a]/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/50 p-6 sm:p-8 text-center shadow-2xl shadow-primary/10 max-h-[90vh] overflow-y-auto checkout-scroll">
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
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors mb-3">
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

  const selectClass = "w-full h-11 rounded-xl border border-input bg-card text-foreground px-4 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0d1a]/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-6 sm:pt-20">
      <div className="w-full max-w-2xl h-dvh sm:h-auto sm:max-h-[75vh] rounded-none sm:rounded-2xl border-0 sm:border border-primary/10 bg-gradient-to-br from-card to-muted/30 shadow-2xl shadow-primary/10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Finalizar pedido</h2>
              <p className="text-[10px] text-muted-foreground">{step === "form" ? "Paso 1 de 2 — Tus datos" : "Paso 2 de 2 — Revisar y confirmar"}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 relative custom-scroll">
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-card/80 pointer-events-none z-10" />

          {/* ══════ STEP 1: FORM ══════ */}
          {step === "form" && (
            <>
              <section>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">Tus datos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Nombre completo *</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Juan Pérez" className="bg-card border-primary/10" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Teléfono *</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 11 2261-8116" className="bg-card border-primary/10" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Ej: juan@email.com" className="bg-card border-primary/10" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">Entrega</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button onClick={() => setDeliveryMethod("pickup")} className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${deliveryMethod === "pickup" ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "border-primary/10 bg-card/50 hover:border-primary/20"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${deliveryMethod === "pickup" ? "border-primary" : "border-primary/20"}`}>
                      {deliveryMethod === "pickup" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Store className="h-3.5 w-3.5 text-primary" /> Retiro por local</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Italia 1037, Luján — Sin cargo</p>
                    </div>
                  </button>
                  <button onClick={() => setDeliveryMethod("shipping")} className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${deliveryMethod === "shipping" ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "border-primary/10 bg-card/50 hover:border-primary/20"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${deliveryMethod === "shipping" ? "border-primary" : "border-primary/20"}`}>
                      {deliveryMethod === "shipping" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Envío a domicilio</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{shipping === 0 ? "Gratis" : formatMoney(shipping)}</p>
                    </div>
                  </button>
                </div>

                {deliveryMethod === "shipping" && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Dirección y altura *</label>
                      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej: Italia 1037" className="bg-card border-primary/10" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Provincia *</label>
                      <div className="relative">
                        <select value={province} onChange={e => { setProvince(e.target.value); setSelectedCity(""); setPostalCode("") }} className={selectClass}>
                          <option value="" className="bg-card">Seleccioná una provincia</option>
                          {PROVINCES.map(p => (
                            <option key={p.name} value={p.name} className="bg-card">{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Ciudad *</label>
                      <div className="relative">
                        <select value={selectedCity} onChange={e => handleCitySelect(e.target.value)} disabled={!province} className={selectClass}>
                          <option value="" className="bg-card">{province ? "Seleccioná una ciudad" : "Primero seleccioná una provincia"}</option>
                          {availableCities.map(c => (
                            <option key={c.name} value={c.name} className="bg-card">{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Código postal</label>
                      <Input value={postalCode} readOnly placeholder="Se completa automáticamente" className="bg-card/50 border-primary/10 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4 flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> Medio de pago</h3>
                <div className="space-y-2">
                  <button onClick={() => setPaymentMethod(MP_PAYMENT)} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${paymentMethod === MP_PAYMENT ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "border-primary/10 bg-card/50 hover:border-primary/20"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === MP_PAYMENT ? "border-primary" : "border-primary/20"}`}>
                      {paymentMethod === MP_PAYMENT && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#00B1EA]/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-[#00B1EA]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Mercado Pago</p>
                        <p className="text-[11px] text-muted-foreground">Tarjeta crédito, débito, transferencia</p>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-semibold ml-auto bg-emerald-500/10 px-2 py-0.5 rounded-full">Sin recargo</span>
                    </div>
                  </button>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/10" /></div>
                    <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-wider">O pagá al retirar</span></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {params.cart.paymentMethods.map(m => (
                      <button key={m.name} onClick={() => setPaymentMethod(m.name)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all duration-200 ${paymentMethod === m.name ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "border-primary/10 bg-card/50 hover:border-primary/20"}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === m.name ? "border-primary" : "border-primary/20"}`}>
                          {paymentMethod === m.name && <div className="w-2 h-2 rounded-full gradient-primary" />}
                        </div>
                        <span>{m.name}</span>
                        {m.rate > 0 && <span className="text-[10px] text-muted-foreground ml-auto">+{(m.rate * 100).toFixed(0)}%</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ══════ STEP 2: REVIEW ══════ */}
          {step === "review" && (
            <>
              <section className="rounded-xl bg-card/50 border border-primary/10 p-4 space-y-3">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Datos personales</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Nombre:</span> {name}</p>
                  <p><span className="text-muted-foreground">Teléfono:</span> {phone}</p>
                  {email && <p><span className="text-muted-foreground">Email:</span> {email}</p>}
                </div>
              </section>

              <section className="rounded-xl bg-card/50 border border-primary/10 p-4 space-y-3">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                  {deliveryMethod === "pickup" ? <Store className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                  {deliveryMethod === "pickup" ? "Retiro por local" : "Envío a domicilio"}
                </h3>
                {deliveryMethod === "pickup" ? (
                  <p className="text-sm">Italia 1037, Luján, Buenos Aires</p>
                ) : (
                  <div className="text-sm space-y-1">
                    <p>{address}</p>
                    <p>{selectedCity}, {province}</p>
                    <p>CP: {postalCode}</p>
                  </div>
                )}
              </section>

              <section className="rounded-xl bg-card/50 border border-primary/10 p-4 space-y-3">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> Medio de pago</h3>
                <div className="flex items-center gap-2">
                  {isMp ? (
                    <><ShieldCheck className="h-4 w-4 text-[#00B1EA]" /><span className="text-sm font-medium">Mercado Pago</span><span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">Sin recargo</span></>
                  ) : (
                    <span className="text-sm font-medium">{paymentMethod}{surcharge > 0 ? ` (${(selectedPayment?.rate ?? 0) * 100}% recargo)` : ""}</span>
                  )}
                </div>
              </section>

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
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{formatMoney(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-500"><span>Descuento</span><span className="tabular-nums">-{formatMoney(discount)}</span></div>}
                  {surcharge > 0 && <div className="flex justify-between text-muted-foreground"><span>Recargo ({paymentMethod})</span><span className="tabular-nums">+{formatMoney(surcharge)}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>Envío</span><span className={`tabular-nums ${shipping === 0 ? "text-emerald-500 font-semibold" : ""}`}>{shipping === 0 ? "GRATIS" : formatMoney(shipping)}</span></div>
                  <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-primary/10"><span>Total</span><span className="gradient-text tabular-nums">{formatMoney(total + surcharge)}</span></div>
                </div>
              </section>
            </>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-t border-primary/10 bg-card/30 shrink-0">
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1 border-primary/10">Cancelar</Button>
              <Button onClick={handleNext} className="flex-1 btn-shine gap-2">
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1 border-primary/10 gap-2">
                <ChevronLeft className="h-4 w-4" /> Volver
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createOrder.isPending || processingMp}
                className={`flex-1 ${isMp ? "bg-[#00B1EA] hover:bg-[#0099CC] text-white" : "btn-shine"}`}
              >
                {createOrder.isPending || processingMp ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {processingMp ? "Redirigiendo a Mercado Pago..." : "Procesando..."}</>
                ) : isMp ? (
                  <>Pagar con Mercado Pago · {formatMoney(total + surcharge)}</>
                ) : (
                  <>Confirmar pedido · {formatMoney(total + surcharge)}</>
                )}
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
