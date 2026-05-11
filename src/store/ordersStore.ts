import type { Order } from "@/types"

const STORAGE_KEY = "tienda-orders"

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch (e) {
    console.warn("Error guardando pedidos:", e)
  }
}

let ordersCache: Order[] = loadOrders()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(fn => fn())
}

export function getOrders(): Order[] {
  return ordersCache
}

export function addOrder(order: Order) {
  ordersCache = [order, ...ordersCache]
  saveOrders(ordersCache)
  notify()
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
