import { describe, it, expect } from "vitest"
import { calculateFinalPrice, calculateGrossMargin, calculateNetMargin, calculateKpis } from "@/lib/calculations"
import type { Sale, GlobalParams, ScenarioConfig } from "@/types"

const defaultParams: GlobalParams = {
  cart: {
    baseCharge: 0.15,
    paymentMethods: [{ name: "Efectivo", rate: 0 }],
    bulkDiscounts: [],
  },
  shipping: {
    fixedCost: 5000,
    freeShippingThreshold: 100000,
    freeShippingEnabled: true,
    announcementBannerEnabled: true,
    announcementBannerText: "Free shipping",
  },
  financial: {
    monthlyInflation: 3.5,
    generalTax: 21,
    usdExchangeRate: 1200,
  },
}

const baseScenario: ScenarioConfig = {
  label: "Base",
  inflationMultiplier: 1,
  salesMultiplier: 1,
}

const mockSale: Sale = {
  id: "s1",
  productId: "p1",
  productName: "Test",
  brand: "Test",
  quantity: 10,
  unitPrice: 25000,
  cost: 12000,
  date: "2026-01-15",
  size: "M",
}

describe("calculateFinalPrice", () => {
  it("adjusts price for inflation and tax (base scenario)", () => {
    const price = calculateFinalPrice(10000, defaultParams, baseScenario)
    expect(price).toBeGreaterThan(10000)
  })

  it("applies optimistic scenario (lower inflation)", () => {
    const optimistic: ScenarioConfig = { label: "Optimistic", inflationMultiplier: 0.7, salesMultiplier: 1.2 }
    const base = calculateFinalPrice(10000, defaultParams, baseScenario)
    const opt = calculateFinalPrice(10000, defaultParams, optimistic)
    expect(opt).toBeLessThan(base)
  })
})

describe("calculateGrossMargin", () => {
  it("calculates gross margin correctly", () => {
    const margin = calculateGrossMargin(mockSale)
    expect(margin).toBe((25000 - 12000) * 10)
  })
})

describe("calculateNetMargin", () => {
  it("calculates net margin accounting for tax, shipping, inflation", () => {
    const margin = calculateNetMargin(mockSale, defaultParams, baseScenario)
    expect(margin).toBeLessThan(calculateGrossMargin(mockSale))
  })
})

describe("calculateKpis", () => {
  it("returns complete KPI data structure", () => {
    const kpis = calculateKpis([mockSale], [], defaultParams, baseScenario)
    expect(kpis).toHaveProperty("monthlySales")
    expect(kpis).toHaveProperty("annualSales")
    expect(kpis).toHaveProperty("grossMargin")
    expect(kpis).toHaveProperty("netMargin")
    expect(kpis).toHaveProperty("topProducts")
    expect(kpis).toHaveProperty("inventoryTurnover")
  })

  it("calculates monthly sales correctly", () => {
    const kpis = calculateKpis([mockSale], [], defaultParams, baseScenario)
    expect(kpis.monthlySales).toBe(25000 * 10)
  })
})
