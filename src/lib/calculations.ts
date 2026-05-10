import type { Product, GlobalParams, ScenarioConfig, KpiData, Sale } from "@/types"
import { getTotalStock } from "@/lib/utils"

export function calculateFinalPrice(
  basePrice: number,
  params: GlobalParams,
  scenario: ScenarioConfig
): number {
  const inflationAdjusted = basePrice * (1 + (params.financial.monthlyInflation / 100) * scenario.inflationMultiplier)
  const withTax = inflationAdjusted * (1 + params.financial.generalTax / 100)
  return Math.round(withTax)
}

export function calculateGrossMargin(sale: Sale): number {
  return (sale.unitPrice - sale.cost) * sale.quantity
}

export function calculateNetMargin(
  sale: Sale,
  params: GlobalParams,
  scenario: ScenarioConfig
): number {
  const gross = calculateGrossMargin(sale)
  const tax = sale.unitPrice * sale.quantity * (params.financial.generalTax / 100)
  const shipping = params.shipping.fixedCost
  const inflationCost = sale.cost * sale.quantity * ((params.financial.monthlyInflation / 100) * scenario.inflationMultiplier)
  return gross - tax - shipping - inflationCost
}

export function calculateKpis(
  sales: Sale[],
  products: Product[],
  params: GlobalParams,
  scenario: ScenarioConfig
): KpiData {
  const monthlySales = sales.reduce((acc, s) => acc + s.unitPrice * s.quantity, 0)
  const annualSales = monthlySales * 12

  const grossMargin = sales.reduce((acc, s) => acc + calculateGrossMargin(s), 0)
  const netMargin = sales.reduce((acc, s) => acc + calculateNetMargin(s, params, scenario), 0)

  const productMargins: Record<string, number> = {}
  sales.forEach(s => {
    const margin = calculateGrossMargin(s)
    productMargins[s.productName] = (productMargins[s.productName] || 0) + margin
  })

  const topProducts = Object.entries(productMargins)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, margin]) => ({ name, margin }))

  const totalStock = products.reduce((acc, p) => {
    return acc + getTotalStock(p)
  }, 0)

  const totalSold = sales.reduce((acc, s) => acc + s.quantity, 0)
  const avgStock = products.length > 0 ? totalStock / products.length : 1
  const inventoryTurnover = totalSold / avgStock

  return {
    monthlySales,
    annualSales,
    grossMargin,
    netMargin,
    topProducts,
    inventoryTurnover,
  }
}

export function calculateInventoryTurnoverByBrand(sales: Sale[], products: Product[]): Record<string, number> {
  const result: Record<string, number> = {}
  const brands = [...new Set(products.map(p => p.brand))]
  brands.forEach(brand => {
    const brandSales = sales.filter(s => s.brand === brand)
    const brandProducts = products.filter(p => p.brand === brand)
    const totalSold = brandSales.reduce((acc, s) => acc + s.quantity, 0)
    const totalStock = brandProducts.reduce((acc, p) => acc + getTotalStock(p), 0)
    result[brand] = totalStock > 0 ? totalSold / totalStock : 0
  })
  return result
}
