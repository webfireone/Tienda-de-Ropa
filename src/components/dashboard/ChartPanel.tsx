import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParamsStore } from "@/store/paramsStore"
import { useProducts, useSales } from "@/hooks/useFirestore"
import { generateProjections, type ProjectionPeriod } from "@/lib/projections"
import { calculateKpis, calculateInventoryTurnoverByBrand } from "@/lib/calculations"
import { useState } from "react"
import { Select } from "@/components/ui/select"

interface ChartPanelProps {
  title: string
}

export function KpiSummary({ title }: ChartPanelProps) {
  const { data: products = [] } = useProducts()
  const { data: sales = [] } = useSales()
  const { params, scenarioConfig } = useParamsStore()
  const [period, setPeriod] = useState<ProjectionPeriod>("monthly")

  const kpis = calculateKpis(sales, products, params, scenarioConfig)
  const projections = generateProjections(sales, params, scenarioConfig, period)
  const turnoverByBrand = calculateInventoryTurnoverByBrand(sales, products)
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as ProjectionPeriod)}
          options={[
            { value: "monthly", label: "Mensual" },
            { value: "quarterly", label: "Trimestral" },
            { value: "annual", label: "Anual" },
          ]}
          className="w-36"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Ventas Mensuales", value: formatMoney(kpis.monthlySales) },
            { label: "Margen Bruto", value: formatMoney(kpis.grossMargin), color: "text-emerald-600" },
            { label: "Margen Neto", value: formatMoney(kpis.netMargin) },
            { label: "Rotación Inventario", value: kpis.inventoryTurnover.toFixed(2) },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/50 border border-primary/5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
              <p className={`text-xl font-display font-bold ${item.color || ""}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Proyecciones</h4>
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/5 bg-muted/50">
                  {["Período", "Ventas", "Margen Bruto", "Margen Neto"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projections.map((p, i) => (
                  <tr key={i} className="border-b border-primary/5 last:border-0">
                    <td className="py-3 px-4 font-medium">{p.period}</td>
                    <td className="py-3 px-4">{formatMoney(p.sales)}</td>
                    <td className="py-3 px-4 text-emerald-600">{formatMoney(p.grossMargin)}</td>
                    <td className="py-3 px-4">{formatMoney(p.netMargin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-primary/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top 3 Prendas</h4>
            <ol className="list-decimal list-inside text-sm space-y-2">
              {kpis.topProducts.map((p, i) => (
                <li key={i} className="text-muted-foreground">
                  {p.name}
                  <span className="font-semibold text-foreground ml-2">{formatMoney(p.margin)}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-primary/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Rotación por Marca</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(turnoverByBrand).map(([brand, turnover]) => (
                <div key={brand} className="flex justify-between">
                  <span className="text-muted-foreground">{brand}</span>
                  <span className="font-semibold">{turnover.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
