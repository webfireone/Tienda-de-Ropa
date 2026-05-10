export type Role = "admin" | "viewer"

export interface User {
  uid: string
  email: string
  role: Role
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  cost: number
  description: string
  imageUrl: string
  sizes: Record<string, number>
  colors: string[]
  material: string
  tags: string[]
  status: "active" | "draft" | "archived"
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  productId: string
  productName: string
  brand: string
  quantity: number
  unitPrice: number
  cost: number
  date: string
  size: string
}

export interface PaymentMethod {
  name: string
  rate: number
}

export interface GlobalParams {
  cart: {
    baseCharge: number
    paymentMethods: PaymentMethod[]
    bulkDiscounts: { minQty: number; discount: number }[]
  }
  shipping: {
    fixedCost: number
    freeShippingThreshold: number
    freeShippingEnabled: boolean
  }
  financial: {
    monthlyInflation: number
    generalTax: number
    usdExchangeRate: number
  }
}

export type Scenario = "base" | "optimistic" | "pessimistic"

export interface ScenarioConfig {
  label: string
  inflationMultiplier: number
  salesMultiplier: number
}

export interface KpiData {
  monthlySales: number
  annualSales: number
  grossMargin: number
  netMargin: number
  topProducts: { name: string; margin: number }[]
  inventoryTurnover: number
}

export interface Alert {
  id: string
  type: "low_stock" | "price_variation" | "negative_margin" | "event"
  severity: "low" | "medium" | "high"
  message: string
  date: string
  productId?: string
  read: boolean
}

export interface AlertRule {
  id: string
  type: Alert["type"]
  threshold: number
  enabled: boolean
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
}

export const CATEGORIES = [
  "Pantalones",
  "Remeras",
  "Sweaters",
  "Abrigos",
  "Camperas",
  "Camisas",
  "Blusas",
  "Jeans",
  "Shorts",
  "Faldas",
  "Vestidos",
  "Accesorios",
] as const

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const

export const PRODUCT_STATUS = ["active", "draft", "archived"] as const
