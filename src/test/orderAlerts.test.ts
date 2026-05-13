import { describe, it, expect, beforeEach } from "vitest"
import { getOrderAlerts, addOrderAlert, markOrderAlertRead } from "@/lib/orderAlerts"

const KEY = "tienda-order-alerts"

describe("orderAlerts", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY)
  })

  it("returns empty array when no alerts", () => {
    expect(getOrderAlerts()).toEqual([])
  })

  it("adds a new order alert", () => {
    addOrderAlert("ord-001", "Juan Pérez", 50000, "shipping")
    const alerts = getOrderAlerts()
    expect(alerts).toHaveLength(1)
    expect(alerts[0].id).toBe("order-ord-001")
    expect(alerts[0].type).toBe("event")
    expect(alerts[0].severity).toBe("high")
    expect(alerts[0].read).toBe(false)
  })

  it("adds multiple alerts (newest first)", () => {
    addOrderAlert("ord-001", "Juan", 50000, "shipping")
    addOrderAlert("ord-002", "María", 30000, "pickup")
    const alerts = getOrderAlerts()
    expect(alerts).toHaveLength(2)
    expect(alerts[0].id).toBe("order-ord-002")
    expect(alerts[1].id).toBe("order-ord-001")
  })

  it("marks an alert as read", () => {
    addOrderAlert("ord-001", "Juan", 50000, "shipping")
    markOrderAlertRead("ord-001")
    const alerts = getOrderAlerts()
    expect(alerts[0].read).toBe(true)
  })

  it("does not exceed 50 alerts", () => {
    for (let i = 0; i < 60; i++) {
      addOrderAlert(`ord-${i}`, `User ${i}`, 100, "shipping")
    }
    expect(getOrderAlerts()).toHaveLength(50)
  })
})
