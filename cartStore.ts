import { create } from "zustand"
import { persist } from "zustand/middleware"
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

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, color: string, size: string, quantity: number) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, delta: number) => void
  clearCart: () => void
  totalItems: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (product, color, size, quantity) => {
        const colorObj = product.colors.find(c => c.name === color)
        const available = colorObj ? (colorObj.sizes[size] || 0) : 0
        if (available <= 0) return

        set(state => {
          const existing = state.items.find(i => i.productId === product.id && i.color === color && i.size === size)
          const currentQty = existing ? existing.quantity : 0
          const maxAdd = Math.max(0, available - currentQty)
          const actualQty = Math.min(quantity, maxAdd)
          
          if (actualQty <= 0) return state

          let newItems
          if (existing) {
            newItems = state.items.map(i =>
              i.productId === product.id && i.color === color && i.size === size
                ? { ...i, quantity: i.quantity + actualQty }
                : i
            )
          } else {
            newItems = [...state.items, {
              productId: product.id,
              productName: product.name,
              brand: product.brand,
              color,
              size,
              quantity: actualQty,
              price: product.price,
              imageUrl: product.imageUrl,
            }]
          }
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
          }
        })
      },
      
      removeItem: (productId, color, size) => {
        set(state => {
          const newItems = state.items.filter(i => !(i.productId === productId && i.color === color && i.size === size))
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
          }
        })
      },
      
      updateQuantity: (productId, color, size, delta) => {
        set(state => {
          const newItems = state.items.map(i => {
            if (i.productId === productId && i.color === color && i.size === size) {
              return { ...i, quantity: Math.max(1, i.quantity + delta) }
            }
            return i
          })
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
          }
        })
      },
      
      clearCart: () => set({ items: [], totalItems: 0 }),
      
      totalItems: 0,
    }),
    {
      name: "tienda-cart",
      // We don't want totalItems to trigger issues or diverge, but persist handles the whole state by default.
      // We can keep totalItems computed, but Zustand state is just stored.
    }
  )
)
