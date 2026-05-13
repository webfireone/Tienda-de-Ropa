import { describe, it, expect } from "vitest"
import { cn, getTotalStock, getStockForSize, getAllSizes } from "@/lib/utils"
import type { Product } from "@/types"

const mockProduct: Product = {
  id: "test-1",
  name: "Test Product",
  brand: "Test Brand",
  category: "Remeras",
  gender: "unisex",
  price: 25000,
  cost: 12000,
  description: "Test description",
  imageUrl: "https://example.com/img.jpg",
  colors: [
    { name: "Negro", sizes: { S: 5, M: 10, L: 7 } },
    { name: "Blanco", sizes: { S: 3, M: 8, L: 4 } },
  ],
  material: "Algodón",
  tags: ["test"],
  seccion: "general",
  status: "active",
  createdAt: "2026-01-01",
  updatedAt: "2026-05-01",
}

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})

describe("getTotalStock", () => {
  it("returns total stock across all colors and sizes", () => {
    expect(getTotalStock(mockProduct)).toBe(37)
  })

  it("returns 0 for product with no colors", () => {
    const empty = { ...mockProduct, colors: [] }
    expect(getTotalStock(empty)).toBe(0)
  })

  it("returns 0 for undefined colors", () => {
    const empty = { ...mockProduct, colors: undefined as unknown as typeof mockProduct.colors }
    expect(getTotalStock(empty)).toBe(0)
  })
})

describe("getStockForSize", () => {
  it("returns total stock for a specific size across all colors", () => {
    expect(getStockForSize(mockProduct, "M")).toBe(18)
  })

  it("returns 0 for non-existent size", () => {
    expect(getStockForSize(mockProduct, "XXL")).toBe(0)
  })
})

describe("getAllSizes", () => {
  it("returns stock for all standard sizes", () => {
    const result = getAllSizes(mockProduct)
    expect(result.S).toBe(8)
    expect(result.M).toBe(18)
    expect(result.L).toBe(11)
    expect(result.XS).toBe(0)
    expect(result.XL).toBe(0)
    expect(result.XXL).toBe(0)
  })
})
