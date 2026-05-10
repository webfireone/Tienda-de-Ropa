import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product } from "@/types"
import { SIZES } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTotalStock(product: Product): number {
  if (!product.colors || !Array.isArray(product.colors)) return 0
  return product.colors.reduce((sum, c) => {
    if (!c || typeof c === "string" || !c.sizes) return sum
    return sum + Object.values(c.sizes).reduce((a, b) => a + b, 0)
  }, 0)
}

export function getStockForSize(product: Product, size: string): number {
  if (!product.colors || !Array.isArray(product.colors)) return 0
  return product.colors.reduce((sum, c) => {
    if (!c || typeof c === "string" || !c.sizes) return sum
    return sum + (c.sizes[size] || 0)
  }, 0)
}

export function getAllSizes(product: Product): Record<string, number> {
  const result: Record<string, number> = {}
  SIZES.forEach(s => {
    result[s] = getStockForSize(product, s)
  })
  return result
}
