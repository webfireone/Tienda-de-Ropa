import type { Sale, GlobalParams, ScenarioConfig } from "@/types"
import { calculateKpis } from "./calculations"

export type ProjectionPeriod = "monthly" | "quarterly" | "annual"

export interface Projection {
  period: string
  sales: number
  grossMargin: number
  netMargin: number
}

export function generateProjections(
  sales: Sale[],
  params: GlobalParams,
  scenario: ScenarioConfig,
  period: ProjectionPeriod
): Projection[] {
  const currentKpi = calculateKpis(sales, [], params, scenario)
  const months = period === "monthly" ? 6 : period === "quarterly" ? 4 : 3

  const projections: Projection[] = []

  for (let i = 0; i < months; i++) {
    const monthMultiplier = Math.pow(1 + (params.financial.monthlyInflation / 100) * scenario.inflationMultiplier, i)
    const salesGrowth = Math.pow(scenario.salesMultiplier, i / 12)

    projections.push({
      period: getPeriodLabel(i, period),
      sales: Math.round(currentKpi.monthlySales * salesGrowth * monthMultiplier),
      grossMargin: Math.round(currentKpi.grossMargin * salesGrowth * monthMultiplier),
      netMargin: Math.round(currentKpi.netMargin * salesGrowth * monthMultiplier),
    })
  }

  return projections
}

function getPeriodLabel(index: number, period: ProjectionPeriod): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  if (period === "monthly") {
    const m = (index + 1) % 12
    return months[m] || `Mes ${index + 1}`
  }
  if (period === "quarterly") {
    return `Q${index + 1}`
  }
  return `Año ${index + 1}`
}
