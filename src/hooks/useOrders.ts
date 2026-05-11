import { useState, useEffect } from "react"
import { getOrders, subscribe } from "@/store/ordersStore"
import type { Order } from "@/types"

export { addOrder } from "@/store/ordersStore"

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(getOrders)

  useEffect(() => {
    const unsub = subscribe(() => {
      setOrders([...getOrders()])
    })
    return unsub
  }, [])

  return { data: orders, isLoading: false }
}

export function useOrder(id: string | undefined) {
  const [orders, setOrders] = useState<Order[]>(getOrders)

  useEffect(() => {
    const unsub = subscribe(() => {
      setOrders([...getOrders()])
    })
    return unsub
  }, [])

  return { data: orders.find(o => o.id === id) ?? null, isLoading: false }
}
