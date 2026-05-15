export const GENDERS = ["hombre", "mujer", "niños", "bebes", "unisex"] as const
export type Gender = typeof GENDERS[number]

export type Role = "admin" | "viewer"

export interface User {
  uid: string
  email: string
  name: string
  role: Role
}

export interface ProductColor {
  name: string
  sizes: Record<string, number>
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  gender: Gender
  price: number
  previousPrice: number
  description: string
  imageUrl: string
  colors: ProductColor[]
  material: string
  tags: string[]
  seccion: "general" | "ofertas" | "nueva-coleccion"
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
  date: string
  size: string
}

export interface OrderItem {
  productId: string
  productName: string
  brand: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  imageUrl: string
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryMethod: "shipping" | "pickup"
  deliveryAddress?: string
  deliveryCity?: string
  deliveryPostalCode?: string
  paymentMethod: string
  paymentRate: number
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  createdAt: string
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
    announcementBannerEnabled: boolean
    announcementBannerText: string
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

export const SECCIONES = ["general", "ofertas", "nueva-coleccion"] as const

export interface Promotion {
  id: string
  title: string
  description: string
  discountPercent: number
  promoCode: string
  startDate: string
  endDate: string
  bannerImage: string
  active: boolean
  createdAt: string
}

export interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  source: string
  active: boolean
}
