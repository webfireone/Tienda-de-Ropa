import { describe, it, expect } from "vitest"
import { generateProjections } from "@/lib/projections"
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

const mockSales: Sale[] = [
  { id: "s1", productId: "p1", productName: "Test", brand: "Test", quantity: 10, unitPrice: 25000, date: "2026-01-15", size: "M" },
]

describe("generateProjections", () => {
  it("generates monthly projections for 6 months", () => {
    const projs = generateProjections(mockSales, defaultParams, baseScenario, "monthly")
    expect(projs).toHaveLength(6)
  })

  it("generates quarterly projections for 4 quarters", () => {
    const projs = generateProjections(mockSales, defaultParams, baseScenario, "quarterly")
    expect(projs).toHaveLength(4)
  })

  it("generates annual projections for 3 years", () => {
    const projs = generateProjections(mockSales, defaultParams, baseScenario, "annual")
    expect(projs).toHaveLength(3)
  })

  it("each projection has period and sales", () => {
    const projs = generateProjections(mockSales, defaultParams, baseScenario, "monthly")
    projs.forEach(p => {
      expect(p).toHaveProperty("period")
      expect(p).toHaveProperty("sales")
    })
  })
})
