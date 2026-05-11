import { useOrdersStore } from "@/store/ordersStore"
import type { Order } from "@/types"

export function addOrder(order: Order) {
  useOrdersStore.getState().addOrder(order)
}

export function useOrders() {
  const orders = useOrdersStore(s => s.orders)
  return { data: orders, isLoading: false }
}

export function useOrder(id: string | undefined) {
  const orders = useOrdersStore(s => s.orders)
  return { data: orders.find(o => o.id === id) ?? null, isLoading: false }
}
