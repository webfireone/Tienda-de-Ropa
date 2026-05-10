import { useMemo, useState } from "react"
import type { Product, Alert, AlertRule, GlobalParams } from "@/types"
import { HOLIDAYS } from "@/lib/constants"

export function useAlerts(products: Product[], params: GlobalParams) {
  const [rules, setRules] = useState<AlertRule[]>([
    { id: "r1", type: "low_stock", threshold: 5, enabled: true },
    { id: "r2", type: "price_variation", threshold: 15, enabled: true },
    { id: "r3", type: "negative_margin", threshold: 0, enabled: true },
  ])

  const alerts = useMemo(() => {
    const result: Alert[] = []

    const lowStockRule = rules.find(r => r.type === "low_stock")
    if (lowStockRule?.enabled) {
      products.forEach(p => {
        Object.entries(p.sizes).forEach(([size, qty]) => {
          if (qty < lowStockRule.threshold) {
            result.push({
              id: `ls-${p.id}-${size}`,
              type: "low_stock",
              severity: qty === 0 ? "high" : "medium",
              message: `Stock bajo en ${p.name} - Talla ${size}: ${qty} unidades`,
              date: new Date().toISOString().split("T")[0],
              productId: p.id,
              read: false,
            })
          }
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

    return result
  }, [products, rules, params])

  return { alerts, rules, setRules }
}
