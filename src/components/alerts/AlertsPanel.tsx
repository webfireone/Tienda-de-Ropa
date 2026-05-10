import { useProducts } from "@/hooks/useFirestore"
import { useParams } from "@/context/ParamsContext"
import { useAlerts } from "@/hooks/useAlerts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { AlertTriangle, Bell, Settings2 } from "lucide-react"

export function AlertsPanel() {
  const { data: products = [] } = useProducts()
  const { params } = useParams()
  const { alerts, rules, setRules } = useAlerts(products, params)
  const { isAdmin } = useAuth()

  const updateRule = (id: string, updates: Partial<typeof rules[0]>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle>Alertas Activas ({alerts.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No hay alertas activas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-primary/10">
                  <Badge variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "warning" : "outline"}>
                    {alert.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <CardTitle>Reglas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider capitalize">
                  {rule.type.replace("_", " ")}
                </span>
                <Switch
                  checked={rule.enabled}
                  onChange={(checked) => updateRule(rule.id, { enabled: checked })}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Umbral:</span>
                <Input
                  type="number"
                  className="h-8 w-20"
                  value={rule.threshold}
                  disabled={!isAdmin}
                  onChange={(e) => updateRule(rule.id, { threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
