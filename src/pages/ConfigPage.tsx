import { GlobalParamsForm } from "@/components/config/GlobalParamsForm"
import { Settings } from "lucide-react"

export function ConfigPage() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 p-6" style={{ background: "var(--color-background)" }}>
        <div className="hero-grid absolute inset-0 opacity-20" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-3">
            <Settings className="h-3 w-3" />
            Configuración
          </div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Parámetros Globales</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Carrito, envíos y parámetros financieros con recálculo automático
          </p>
        </div>
      </div>
      <GlobalParamsForm />
    </div>
  )
}
