import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down" | "neutral"
}

export function KpiCard({ title, value, subtitle, trend }: KpiCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground"

  return (
    <Card className="group hover:border-primary/20 transition-all duration-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          {trend && (
            <div className={cn("p-1.5 rounded-lg bg-muted/50", trendColor)}>
              <TrendIcon className="h-3 w-3" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-display font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
