/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types"

export interface CartItem {
  productId: string
  productName: string
  brand: string
  color: string
  size: string
  quantity: number
  price: number
  imageUrl: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, color: string, size: string, quantity: number) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, delta: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
})

const STORAGE_KEY = "tienda-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, color: string, size: string, quantity: number) => {
    const colorObj = product.colors.find(c => c.name === color)
    const available = colorObj ? (colorObj.sizes[size] || 0) : 0
    if (available <= 0) return

    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id && i.color === color && i.size === size)
      const currentQty = existing ? existing.quantity : 0
      const maxAdd = Math.max(0, available - currentQty)
      const actualQty = Math.min(quantity, maxAdd)
      if (actualQty <= 0) return prev

      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.color === color && i.size === size
            ? { ...i, quantity: i.quantity + actualQty }
            : i
        )
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        color,
        size,
        quantity: actualQty,
        price: product.price,
        imageUrl: product.imageUrl,
      }]
    })
  }

  const removeItem = (productId: string, color: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.color === color && i.size === size)))
  }

  const updateQuantity = (productId: string, color: string, size: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.productId === productId && i.color === color && i.size === size) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) }
      }
      return i
    }))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
