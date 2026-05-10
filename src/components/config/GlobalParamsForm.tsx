import { useParams } from "@/context/ParamsContext"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { Info, ShoppingCart, Truck, DollarSign, Plus, Trash2 } from "lucide-react"
import type { GlobalParams } from "@/types"

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-start gap-1 mb-1">
        <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">{help}</p>
      </div>
      {children}
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="border-primary/10 shadow-sm">
      <div className="p-5 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5 space-y-5">{children}</CardContent>
    </Card>
  )
}

export function GlobalParamsForm() {
  const { params, updateParams } = useParams()
  const { isAdmin } = useAuth()

  const update = (partial: Partial<GlobalParams>) => {
    updateParams({ ...params, ...partial })
  }

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
          Modo solo lectura. Iniciá sesión como administrador para editar.
        </div>
      )}

      {/* Carrito */}
      <SectionCard icon={ShoppingCart} title="Carrito" description="Configuración del carrito de compras y precios">
        <Field
          label="Carga base"
          help="Porcentaje de ganancia que se suma al costo de cada producto para definir su precio de venta. Ej: 0.15 = 15% de margen."
        >
          <Input
            type="number"
            step="0.01"
            value={params.cart.baseCharge}
            disabled={!isAdmin}
            onChange={(e) => update({ cart: { ...params.cart, baseCharge: parseFloat(e.target.value) || 0 } })}
          />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Descuentos por volumen</label>
            {isAdmin && (
              <button
                onClick={() => update({ cart: { ...params.cart, bulkDiscounts: [...params.cart.bulkDiscounts, { minQty: 0, discount: 0 }] } })}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" /> Agregar escala
              </button>
            )}
          </div>
          <p className="flex items-start gap-1 mb-1">
            <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Descuento automático cuando el cliente compra muchas unidades del mismo producto. Se aplica en el carrito.
            </span>
          </p>
          {params.cart.bulkDiscounts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin descuentos por volumen configurados.</p>
          ) : (
            <div className="space-y-2">
              {params.cart.bulkDiscounts.map((d, i) => (
                <div key={i} className="flex items-end gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Desde</label>
                    <Input
                      type="number"
                      placeholder="Mín. unidades"
                      value={d.minQty}
                      disabled={!isAdmin}
                      onChange={(e) => {
                        const discounts = [...params.cart.bulkDiscounts]
                        discounts[i] = { ...d, minQty: parseInt(e.target.value) || 0 }
                        update({ cart: { ...params.cart, bulkDiscounts: discounts } })
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Descuento</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="% descuento"
                      value={d.discount * 100}
                      disabled={!isAdmin}
                      onChange={(e) => {
                        const discounts = [...params.cart.bulkDiscounts]
                        discounts[i] = { ...d, discount: (parseFloat(e.target.value) || 0) / 100 }
                        update({ cart: { ...params.cart, bulkDiscounts: discounts } })
                      }}
                    />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        const discounts = params.cart.bulkDiscounts.filter((_, j) => j !== i)
                        update({ cart: { ...params.cart, bulkDiscounts: discounts } })
                      }}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Medios de pago</label>
          <p className="flex items-start gap-1 mb-1">
            <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Formas de pago disponibles en el carrito. La tasa es el recargo por cuotas (ej: 15% para 3 cuotas).
            </span>
          </p>
          <div className="space-y-2">
            {params.cart.paymentMethods.map((m, i) => (
              <div key={i} className="flex items-end gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex-[2]">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nombre</label>
                  <Input
                    value={m.name}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const methods = [...params.cart.paymentMethods]
                      methods[i] = { ...m, name: e.target.value }
                      update({ cart: { ...params.cart, paymentMethods: methods } })
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Recargo %</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Tasa"
                    value={m.rate * 100}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const methods = [...params.cart.paymentMethods]
                      methods[i] = { ...m, rate: (parseFloat(e.target.value) || 0) / 100 }
                      update({ cart: { ...params.cart, paymentMethods: methods } })
                    }}
                  />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      const methods = params.cart.paymentMethods.filter((_, j) => j !== i)
                      update({ cart: { ...params.cart, paymentMethods: methods } })
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={() => update({ cart: { ...params.cart, paymentMethods: [...params.cart.paymentMethods, { name: "", rate: 0 }] } })}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2"
            >
              <Plus className="h-3 w-3" /> Agregar medio de pago
            </button>
          )}
        </div>
      </SectionCard>

      {/* Envío */}
      <SectionCard icon={Truck} title="Envío" description="Costos y condiciones de envío">
        <Field
          label="Costo fijo de envío"
          help="Precio en pesos que se cobra por cada envío. Este monto se suma automáticamente al total del carrito."
        >
          <Input
            type="number"
            value={params.shipping.fixedCost}
            disabled={!isAdmin}
            onChange={(e) => update({ shipping: { ...params.shipping, fixedCost: parseInt(e.target.value) || 0 } })}
          />
        </Field>

        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
          <div>
            <label className="text-sm font-medium text-foreground">Envío gratis</label>
            <p className="flex items-start gap-1 mt-1">
              <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                Si está activado, los clientes no pagan envío cuando superan cierto monto de compra.
              </span>
            </p>
          </div>
          <Switch
            checked={params.shipping.freeShippingEnabled}
            onChange={(checked) => update({ shipping: { ...params.shipping, freeShippingEnabled: checked } })}
          />
        </div>

        {params.shipping.freeShippingEnabled && (
          <Field
            label="Umbral de envío gratis"
            help="Monto mínimo de compra (en pesos) para que el envío sea gratuito. Ej: 120000 = envío gratis en compras mayores a $120.000."
          >
            <Input
              type="number"
              value={params.shipping.freeShippingThreshold}
              disabled={!isAdmin}
              onChange={(e) => update({ shipping: { ...params.shipping, freeShippingThreshold: parseInt(e.target.value) || 0 } })}
            />
          </Field>
        )}
      </SectionCard>

      {/* Financiero */}
      <SectionCard icon={DollarSign} title="Financiero" description="Parámetros económicos para cálculos y reportes">
        <Field
          label="Inflación mensual"
          help="Porcentaje de inflación estimada por mes. Se usa en los reportes del Dashboard para proyectar escenarios futuros (base, optimista, pesimista)."
        >
          <Input
            type="number"
            step="0.1"
            value={params.financial.monthlyInflation}
            disabled={!isAdmin}
            onChange={(e) => update({ financial: { ...params.financial, monthlyInflation: parseFloat(e.target.value) || 0 } })}
          />
        </Field>

        <Field
          label="Impuesto general"
          help="Porcentaje de impuesto que se aplica sobre el precio de venta. Se muestra en detalle del carrito y se incluye en los cálculos de margen del Dashboard."
        >
          <Input
            type="number"
            step="0.1"
            value={params.financial.generalTax}
            disabled={!isAdmin}
            onChange={(e) => update({ financial: { ...params.financial, generalTax: parseFloat(e.target.value) || 0 } })}
          />
        </Field>

        <Field
          label="Tipo de cambio USD/ARS"
          help="Cotización del dólar blue/oficial usada para calcular costos en pesos en los reportes del Dashboard. Los productos se importan con precios en ARS."
        >
          <Input
            type="number"
            value={params.financial.usdExchangeRate}
            disabled={!isAdmin}
            onChange={(e) => update({ financial: { ...params.financial, usdExchangeRate: parseInt(e.target.value) || 0 } })}
          />
        </Field>
      </SectionCard>
    </div>
  )
}
