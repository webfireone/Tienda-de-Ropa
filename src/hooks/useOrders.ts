import { useQuery } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { getOrders, subscribe } from "@/store/ordersStore"
import { useState, useEffect } from "react"
import type { Order } from "@/types"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

export { addOrder } from "@/store/ordersStore"

async function fetchOrders(): Promise<Order[]> {
  if (USE_MOCK) return getOrders()
  try {
    const snapshot = await getDocs(collection(db, "orders"))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
  } catch {
    return getOrders()
  }
}

export function useOrders() {
  const [localOrders, setLocalOrders] = useState<Order[]>(getOrders)

  useEffect(() => {
    if (!USE_MOCK) return
    const unsub = subscribe(() => setLocalOrders([...getOrders()]))
    return unsub
  }, [])

  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: USE_MOCK ? Infinity : 10 * 1000,
    initialData: USE_MOCK ? localOrders : undefined,
  })
}
