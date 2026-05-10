import { cn } from "@/lib/utils"
import type { ComponentType } from "react"

function FloatingOrb({ className, size = "md", delay = 0, idx = 0 }: { className?: string; size?: "sm" | "md" | "lg"; delay?: number; idx?: number }) {
  const sizes = { sm: "w-20 h-20", md: "w-32 h-32", lg: "w-48 w-48" }
  const gradients = [
    "from-violet-500/15 to-fuchsia-500/15",
    "from-rose-500/15 to-amber-500/15",
    "from-cyan-500/15 to-blue-500/15",
    "from-emerald-500/15 to-teal-500/15",
  ]
  const gradient = gradients[idx % gradients.length]

  return (
    <div
      className={cn("absolute animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn(
        sizes[size],
        "rounded-full bg-gradient-to-br",
        gradient,
        "blur-xl"
      )} />
    </div>
  )
}

function GeometricShape({ className, shape = "circle", delay = 0 }: { className?: string; shape?: "circle" | "square" | "diamond" | "hex"; delay?: number }) {
  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-2xl",
    diamond: "rotate-45 rounded-xl",
    hex: "rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]",
  }

  return (
    <div
      className={cn("absolute animate-float-reverse", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn(
        "w-16 h-16 border border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl",
        shapeClasses[shape]
      )}>
        <div className="w-full h-full rounded-inherit gradient-primary opacity-10" />
      </div>
    </div>
  )
}

function OrbitingRing({ className, size = 280, reverse = false }: { className?: string; size?: number; reverse?: boolean }) {
  return (
    <div className={cn("absolute", className)} style={{ width: size, height: size }}>
      <div className={cn(
        "w-full h-full rounded-full border border-primary/10",
        reverse ? "animate-orbit-reverse" : "animate-orbit"
      )}>
        <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full gradient-primary shadow-lg shadow-primary/50 animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-0 w-2 h-2 -mr-1 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50" style={{ animationDelay: '-3s' }} />
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border border-primary/10 min-h-[400px] p-10">
      <div className="hero-grid absolute inset-0 opacity-30" />

      <FloatingOrb className="top-10 right-20" size="lg" delay={0} idx={0} />
      <FloatingOrb className="bottom-10 right-40" size="md" delay={1.5} idx={1} />
      <FloatingOrb className="top-20 left-1/3" size="sm" delay={0.8} idx={2} />

      <GeometricShape className="top-16 right-32" shape="diamond" delay={0.5} />
      <GeometricShape className="bottom-16 left-20" shape="hex" delay={1.2} />
      <GeometricShape className="top-1/2 right-16" shape="square" delay={2} />

      <OrbitingRing className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={300} />
      <OrbitingRing className="top-1/4 right-1/4" size={180} reverse />

      <div className="relative z-10 flex flex-col justify-center h-full max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-primary/10 text-xs font-semibold text-primary mb-6 w-fit shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Tienda de Ropa · Moda Unisex
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
          <span className="gradient-text">Estilo que</span>
          <br />
          <span className="gradient-text">te define</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
          Descubrí las últimas tendencias en moda unisex. Calidad, estilo y compromiso en cada prenda.
        </p>
      </div>
    </div>
  )
}

export function PageHero({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: ComponentType<{ className?: string }> }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border border-primary/10 p-8 mb-8">
      <div className="hero-grid absolute inset-0 opacity-20" />
      <FloatingOrb className="top-5 right-10" size="sm" delay={0.3} idx={0} />
      <FloatingOrb className="bottom-5 right-20" size="sm" delay={1} idx={1} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Icon className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            {subtitle || "Tienda de Ropa"}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold">
          <span className="gradient-text">{title}</span>
        </h1>
      </div>
    </div>
  )
}
