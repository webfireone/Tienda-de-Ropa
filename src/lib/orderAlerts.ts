import type { Alert } from "@/types"

const KEY = "tienda-order-alerts"

export function getOrderAlerts(): Alert[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function addOrderAlert(orderId: string, customerName: string, total: number, deliveryMethod: string) {
  const alerts = getOrderAlerts()
  const alert: Alert = {
    id: `order-${orderId}`,
    type: "event",
    severity: "high",
    message: `🛍️ Nuevo pedido ${orderId} - ${customerName} - $${total.toLocaleString("es-AR")} - ${deliveryMethod === "pickup" ? "Retiro" : "Envío"}`,
    date: new Date().toISOString().split("T")[0],
    read: false,
  }
  alerts.unshift(alert)
  localStorage.setItem(KEY, JSON.stringify(alerts.slice(0, 50)))
}

export function markOrderAlertRead(orderId: string) {
  const alerts = getOrderAlerts()
  const updated = alerts.map(a =>
    a.id === `order-${orderId}` ? { ...a, read: true } : a
  )
  localStorage.setItem(KEY, JSON.stringify(updated))
}
