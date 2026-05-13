import { useMemo, useState } from "react"
import type { Product, Alert, AlertRule } from "@/types"
import { HOLIDAYS } from "@/lib/constants"
import { getOrderAlerts } from "@/lib/orderAlerts"

export function useAlerts(products: Product[]) {
  const [rules, setRules] = useState<AlertRule[]>([
    { id: "r1", type: "low_stock", threshold: 5, enabled: true },
    { id: "r2", type: "price_variation", threshold: 15, enabled: true },
  ])

  const alerts = useMemo(() => {
    const result: Alert[] = []

    const lowStockRule = rules.find(r => r.type === "low_stock")
    if (lowStockRule?.enabled) {
      products.forEach(p => {
        p.colors.forEach(c => {
          Object.entries(c.sizes).forEach(([size, qty]) => {
            if (qty < lowStockRule.threshold) {
              result.push({
                id: `ls-${p.id}-${c.name}-${size}`,
                type: "low_stock",
                severity: qty === 0 ? "high" : "medium",
                message: `Stock bajo en ${p.name} - ${c.name} - Talla ${size}: ${qty} unidades`,
                date: new Date().toISOString().split("T")[0],
                productId: p.id,
                read: false,
              })
            }
          })
        })
      })
    }

    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    HOLIDAYS.forEach(h => {
      const hDate = new Date(h.date)
      if (hDate >= today && hDate <= nextWeek) {
        result.push({
          id: `hol-${h.date}`,
          type: "event",
          severity: "low",
          message: `Festivo próximo: ${h.name} (${h.date})`,
          date: h.date,
          read: false,
        })
      }
    })

    result.push(...getOrderAlerts())

    return result
  }, [products, rules])

  return { alerts, rules, setRules }
}
