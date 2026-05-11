import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Order } from "@/types"

interface OrdersStore {
  orders: Order[]
  addOrder: (order: Order) => void
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set(state => ({ orders: [order, ...state.orders] })),
    }),
    { name: "tienda-orders" },
  ),
)
