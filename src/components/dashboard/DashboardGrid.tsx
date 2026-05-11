import { KpiSummary } from "./ChartPanel"
import { useParamsStore } from "@/store/paramsStore"
import { useProducts, useSales } from "@/hooks/useFirestore"
import { calculateKpis } from "@/lib/calculations"
import { KpiCard } from "./KpiCard"
import { ScenarioSelector } from "./ScenarioSelector"

export function DashboardGrid() {
  const { data: products = [] } = useProducts()
  const { data: sales = [] } = useSales()
  const { params, scenarioConfig } = useParamsStore()

  const kpis = calculateKpis(sales, products, params, scenarioConfig)
  const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Resumen de KPIs</h2>
        <ScenarioSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Ventas Mensuales" value={formatMoney(kpis.monthlySales)} subtitle="Ingresos totales" trend="up" />
        <KpiCard title="Margen Bruto" value={formatMoney(kpis.grossMargin)} subtitle="Antes de impuestos" trend="up" />
        <KpiCard title="Margen Neto" value={formatMoney(kpis.netMargin)} subtitle="Después de impuestos" />
        <KpiCard title="Rotación Inventario" value={kpis.inventoryTurnover.toFixed(2)} subtitle="Ventas / Stock promedio" />
      </div>

      <KpiSummary title="Proyecciones y Análisis" />
    </div>
  )
}
