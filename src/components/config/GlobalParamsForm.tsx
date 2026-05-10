import { useParams } from "@/context/ParamsContext"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs } from "@/components/ui/tabs"
import { useAuth } from "@/context/AuthContext"
import type { GlobalParams } from "@/types"

export function GlobalParamsForm() {
  const { params, updateParams } = useParams()
  const { isAdmin } = useAuth()

  const update = (partial: Partial<GlobalParams>) => {
    updateParams({ ...params, ...partial })
  }

  const cartTab = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Carga base (ej: 0.15)</label>
        <Input
          type="number"
          step="0.01"
          value={params.cart.baseCharge}
          disabled={!isAdmin}
          onChange={(e) => update({ cart: { ...params.cart, baseCharge: parseFloat(e.target.value) || 0 } })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Descuentos por cantidad</label>
        {params.cart.bulkDiscounts.map((d, i) => (
          <div key={i} className="flex gap-2 mt-2">
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
            <Input
              type="number"
              step="0.01"
              placeholder="Descuento %"
              value={d.discount * 100}
              disabled={!isAdmin}
              onChange={(e) => {
                const discounts = [...params.cart.bulkDiscounts]
                discounts[i] = { ...d, discount: (parseFloat(e.target.value) || 0) / 100 }
                update({ cart: { ...params.cart, bulkDiscounts: discounts } })
              }}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium">Medios de pago</label>
        {params.cart.paymentMethods.map((m, i) => (
          <div key={i} className="flex gap-2 mt-2">
            <Input
              value={m.name}
              disabled={!isAdmin}
              onChange={(e) => {
                const methods = [...params.cart.paymentMethods]
                methods[i] = { ...m, name: e.target.value }
                update({ cart: { ...params.cart, paymentMethods: methods } })
              }}
            />
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
        ))}
      </div>
    </div>
  )

  const shippingTab = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Costo fijo de envío</label>
        <Input
          type="number"
          value={params.shipping.fixedCost}
          disabled={!isAdmin}
          onChange={(e) => update({ shipping: { ...params.shipping, fixedCost: parseInt(e.target.value) || 0 } })}
        />
      </div>
      <div className="flex items-center gap-4">
        <Switch
          checked={params.shipping.freeShippingEnabled}
          onChange={(checked) => update({ shipping: { ...params.shipping, freeShippingEnabled: checked } })}
        />
        <span className="text-sm">Envío gratis habilitado</span>
      </div>
      {params.shipping.freeShippingEnabled && (
        <div>
          <label className="text-sm font-medium">Umbral de envío gratis ($)</label>
          <Input
            type="number"
            value={params.shipping.freeShippingThreshold}
            disabled={!isAdmin}
            onChange={(e) => update({ shipping: { ...params.shipping, freeShippingThreshold: parseInt(e.target.value) || 0 } })}
          />
        </div>
      )}
    </div>
  )

  const financialTab = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Inflación mensual (%)</label>
        <Input
          type="number"
          step="0.1"
          value={params.financial.monthlyInflation}
          disabled={!isAdmin}
          onChange={(e) => update({ financial: { ...params.financial, monthlyInflation: parseFloat(e.target.value) || 0 } })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Impuesto general (%)</label>
        <Input
          type="number"
          step="0.1"
          value={params.financial.generalTax}
          disabled={!isAdmin}
          onChange={(e) => update({ financial: { ...params.financial, generalTax: parseFloat(e.target.value) || 0 } })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Tipo de cambio USD/ARS</label>
        <Input
          type="number"
          value={params.financial.usdExchangeRate}
          disabled={!isAdmin}
          onChange={(e) => update({ financial: { ...params.financial, usdExchangeRate: parseInt(e.target.value) || 0 } })}
        />
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground mb-4">
            Modo solo lectura. Cambia a rol admin para editar.
          </p>
        )}
        <Tabs
          tabs={[
            { id: "cart", label: "Carrito", content: cartTab },
            { id: "shipping", label: "Envío", content: shippingTab },
            { id: "financial", label: "Financiero", content: financialTab },
          ]}
        />
      </CardContent>
    </Card>
  )
}
