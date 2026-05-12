import { DecorativeBackground } from "@/components/dashboard/Decorative3D"

export function AdminHomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <DecorativeBackground />
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center px-6">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="gradient-text-animated">Zona de Parametria</span>
            <br />
            <span className="gradient-text-shimmer">GLAMOURS</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-violet-500/60 to-transparent" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30">Panel de Administración</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-rose-500/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
