import { describe, it, expect, beforeEach } from "vitest"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "@/types"

const mockProduct: Product = {
  id: "p1",
  name: "Test Product",
  brand: "Test Brand",
  category: "Remeras",
  gender: "unisex",
  price: 25000,
  cost: 12000,
  description: "Test",
  imageUrl: "https://example.com/img.jpg",
  colors: [
    { name: "Negro", sizes: { S: 5, M: 10, L: 7 } },
  ],
  material: "Algodón",
  tags: ["test"],
  seccion: "general",
  status: "active",
  createdAt: "2026-01-01",
  updatedAt: "2026-05-01",
}

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], totalItems: 0 })
  })

  it("starts with empty cart", () => {
    const { items, totalItems } = useCartStore.getState()
    expect(items).toHaveLength(0)
    expect(totalItems).toBe(0)
  })

  it("adds item to cart", () => {
    useCartStore.getState().addItem(mockProduct, "Negro", "M", 2)
    const { items, totalItems } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe("p1")
    expect(items[0].quantity).toBe(2)
    expect(totalItems).toBe(2)
  })

  it("increments quantity when adding same item", () => {
    useCartStore.getState().addItem(mockProduct, "Negro", "M", 2)
    useCartStore.getState().addItem(mockProduct, "Negro", "M", 3)
    const { items, totalItems } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
    expect(totalItems).toBe(5)
  })

  it("removes item from cart", () => {
    useCartStore.getState().addItem(mockProduct, "Negro", "M", 2)
    useCartStore.getState().removeItem("p1", "Negro", "M")
    const { items, totalItems } = useCartStore.getState()
    expect(items).toHaveLength(0)
    expect(totalItems).toBe(0)
  })

  it("clears entire cart", () => {
    useCartStore.getState().addItem(mockProduct, "Negro", "M", 2)
    useCartStore.getState().clearCart()
    const { items, totalItems } = useCartStore.getState()
    expect(items).toHaveLength(0)
    expect(totalItems).toBe(0)
  })

  it("does not add item if stock is 0", () => {
    const noStock: Product = {
      ...mockProduct,
      colors: [{ name: "Negro", sizes: { M: 0 } }],
    }
    useCartStore.getState().addItem(noStock, "Negro", "M", 1)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })
})
