import { useState } from "react"
import { useOrders } from "@/hooks/useOrders"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { Package, Store, Truck, CreditCard, ChevronDown, ChevronUp, Search, MapPin, Phone, Mail, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/types"

const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`
const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 overflow-hidden transition-all duration-300 hover:border-primary/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left"
      >
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
          <Package className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="font-display font-semibold text-sm">{order.id}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {order.customerName}
            </span>
            <span className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
            <span className={cn(
              "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full",
              order.deliveryMethod === "pickup" ? "bg-violet-500/10 text-violet-400" : "bg-cyan-500/10 text-cyan-400"
            )}>
              {order.deliveryMethod === "pickup" ? "Retiro" : "Envío"}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-bold text-primary tabular-nums">{formatMoney(order.total)}</p>
          <p className="text-[10px] text-muted-foreground">{order.paymentMethod}</p>
        </div>

        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-primary/10 p-4 md:p-5 space-y-5 animate-fade-up">
          {/* Customer info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 border border-primary/5">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cliente</p>
                <p className="text-sm font-medium">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 border border-primary/5">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Teléfono</p>
                <p className="text-sm font-medium">{order.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 border border-primary/5">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium">{order.customerEmail || "—"}</p>
              </div>
            </div>
          </div>

          {/* Delivery + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-card/50 border border-primary/5">
              <div className="flex items-center gap-2 mb-2">
                {order.deliveryMethod === "pickup" ? (
                  <Store className="h-4 w-4 text-primary" />
                ) : (
                  <Truck className="h-4 w-4 text-primary" />
                )}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {order.deliveryMethod === "pickup" ? "Retiro por local" : "Envío a domicilio"}
                </span>
              </div>
              {order.deliveryMethod === "pickup" ? (
                <p className="text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Italia 1037, Luján, Buenos Aires
                </p>
              ) : (
                <div className="text-sm space-y-0.5">
                  <p>{order.deliveryAddress}</p>
                  {order.deliveryCity && <p className="text-muted-foreground">{order.deliveryCity}{order.deliveryPostalCode ? ` · CP ${order.deliveryPostalCode}` : ""}</p>}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-card/50 border border-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pago</span>
              </div>
              <p className="text-sm font-medium">{order.paymentMethod}</p>
              {order.paymentRate > 0 && <p className="text-xs text-muted-foreground">Recargo: +{(order.paymentRate * 100).toFixed(0)}%</p>}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Productos</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-card/50 border border-primary/5">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.brand} · {item.color} · Talle {item.size} · x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatMoney(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-primary/10 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-500">
                <span>Descuento</span>
                <span className="tabular-nums">-{formatMoney(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span className={cn("tabular-nums", order.shipping === 0 ? "text-emerald-500 font-semibold" : "")}>
                {order.shipping === 0 ? "GRATIS" : formatMoney(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-primary/10">
              <span>Total</span>
              <span className="gradient-text tabular-nums">{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const [search, setSearch] = useState("")

  const filtered = orders.filter(o =>
    !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search)
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Pedidos" subtitle={`${orders.length} pedidos recibidos`} icon={Package} />

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-primary/10 shadow-sm mb-6">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          placeholder="Buscar por ID, cliente o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-0 text-sm outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {orders.length === 0 ? "No hay pedidos todavía" : "No se encontraron pedidos"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
