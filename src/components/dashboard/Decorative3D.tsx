import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import type { ComponentType } from "react"

const HERO_IMAGES = Array.from({ length: 25 }, (_, i) => `/inicio/inicio-${i + 1}.jpg`)

function FloatingOrb({ className, size = "md", delay = 0, idx = 0 }: { className?: string; size?: "sm" | "md" | "lg"; delay?: number; idx?: number }) {
  const sizes = { sm: "w-20 h-20", md: "w-32 h-32", lg: "w-48 w-48" }
  const gradients = [
    "from-violet-500/20 to-fuchsia-500/20",
    "from-rose-500/20 to-amber-500/20",
    "from-cyan-500/20 to-blue-500/20",
    "from-emerald-500/20 to-teal-500/20",
  ]
  const gradient = gradients[idx % gradients.length]

  return (
    <div
      className={cn("absolute animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn(sizes[size], "rounded-full bg-gradient-to-br", gradient, "blur-xl")} />
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
      <div className={cn("w-16 h-16 border border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl", shapeClasses[shape])}>
        <div className="w-full h-full rounded-inherit gradient-primary opacity-20" />
      </div>
    </div>
  )
}

function OrbitingRing({ className, size = 280, reverse = false }: { className?: string; size?: number; reverse?: boolean }) {
  return (
    <div className={cn("absolute", className)} style={{ width: size, height: size }}>
      <div className={cn("w-full h-full rounded-full border border-primary/20", reverse ? "animate-orbit-reverse" : "animate-orbit")}>
        <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full gradient-primary shadow-lg shadow-primary/50 animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-0 w-2 h-2 -mr-1 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50" style={{ animationDelay: '-3s' }} />
      </div>
    </div>
  )
}

const PARTICLE_COLORS = [
  "bg-white/40",
  "bg-violet-400/40",
  "bg-rose-400/35",
  "bg-cyan-400/35",
  "bg-amber-400/35",
  "bg-fuchsia-400/30",
]

function Particles({ count = 50 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const size = 2 + Math.random() * 4
    return {
      id: i,
      left: Math.random() * 100,
      top: 30 + Math.random() * 70,
      size,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      drift: -50 + Math.random() * 100,
      opacity: 0.4 + Math.random() * 0.6,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }
  })

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className={cn("absolute rounded-full pointer-events-none animate-particle", p.color)}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ['--p-duration' as string]: `${p.duration}s`,
            ['--p-delay' as string]: `${p.delay}s`,
            ['--p-drift' as string]: `${p.drift}px`,
            ['--p-opacity' as string]: p.opacity,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

function MouseGlow() {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1]"
      onMouseMove={handleMouse}
    >
      <div
        className="absolute w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, rgba(236,72,153,0.08) 30%, rgba(124,92,252,0.03) 50%, transparent 70%)',
          transition: 'left 0.3s ease-out, top 0.3s ease-out',
        }}
      />
    </div>
  )
}

export function DecorativeBackground() {
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] animate-gradient-slow" style={{ backgroundSize: '200% 200%' }} />
      <div className="hero-grid absolute inset-0 opacity-30 animate-grid-pulse" />

      <MouseGlow />
      <Particles count={50} />

      {/* Rotating images */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] via-[#0d0d1a]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/40 z-10" />
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center scale-110 transition-opacity duration-1000 ${i === imgIndex ? "opacity-20" : "opacity-0"}`}
            loading="lazy"
          />
        ))}
      </div>

      {/* Floating orbs */}
      <FloatingOrb className="top-10 right-20" size="lg" delay={0} idx={0} />
      <FloatingOrb className="bottom-10 right-40" size="md" delay={1.5} idx={1} />
      <FloatingOrb className="top-20 left-1/3" size="sm" delay={0.8} idx={2} />
      <FloatingOrb className="top-1/3 right-1/4" size="sm" delay={2.5} idx={3} />

      {/* Geometric shapes */}
      <GeometricShape className="top-16 right-32" shape="diamond" delay={0.5} />
      <GeometricShape className="bottom-16 left-20" shape="hex" delay={1.2} />
      <GeometricShape className="top-1/2 right-16" shape="square" delay={2} />
      <GeometricShape className="bottom-1/3 left-1/3" shape="hex" delay={1.8} />

      {/* Orbiting rings */}
      <OrbitingRing className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={320} />
      <OrbitingRing className="top-1/3 right-1/4" size={160} reverse />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0d0d1a] to-transparent pointer-events-none" />
    </div>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border border-primary/10 min-h-[520px] animate-gradient-slow" style={{ backgroundSize: '200% 200%' }}>
      <div className="hero-grid absolute inset-0 opacity-30 animate-grid-pulse" />

      <MouseGlow />
      <Particles count={50} />

      {/* Ghost editorial image (rotating) */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden md:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] via-[#0d0d1a]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/20 z-10" />
        <div className="absolute inset-0 bg-[#0d0d1a]/5 z-[1]" />
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center scale-110 transition-opacity duration-1000 ${i === imgIndex ? "opacity-40" : "opacity-0"}`}
            loading="lazy"
          />
        ))}
      </div>

      {/* Floating orbs */}
      <FloatingOrb className="top-10 right-20" size="lg" delay={0} idx={0} />
      <FloatingOrb className="bottom-10 right-40" size="md" delay={1.5} idx={1} />
      <FloatingOrb className="top-20 left-1/3" size="sm" delay={0.8} idx={2} />
      <FloatingOrb className="top-1/3 right-1/4" size="sm" delay={2.5} idx={3} />

      {/* Geometric shapes */}
      <GeometricShape className="top-16 right-32" shape="diamond" delay={0.5} />
      <GeometricShape className="bottom-16 left-20" shape="hex" delay={1.2} />
      <GeometricShape className="top-1/2 right-16" shape="square" delay={2} />
      <GeometricShape className="bottom-1/3 left-1/3" shape="hex" delay={1.8} />

      {/* Orbiting rings */}
      <OrbitingRing className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={320} />
      <OrbitingRing className="top-1/3 right-1/4" size={160} reverse />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center h-full min-h-[520px] max-w-xl px-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-primary/10 text-xs font-semibold text-primary mb-6 w-fit shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Tienda de Ropa · Moda Unisex
        </div>

        {/* Title */}
        <motion.h1 
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="gradient-text">Estilo que</span>
          <br />
          <span className="gradient-text">te define</span>
        </motion.h1>

        {/* Decorative accent */}
        <motion.div 
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="h-[1px] w-12 bg-gradient-to-r from-violet-500/60 to-transparent" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30">Colección 2026</span>
        </motion.div>

        {/* Description */}
        <motion.p 
          className="text-base text-muted-foreground leading-relaxed max-w-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Descubrí las últimas tendencias en moda unisex. Calidad, estilo y compromiso en cada prenda.
        </motion.p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/catalog")}
            className="relative overflow-hidden px-7 py-3 rounded-xl gradient-primary text-white text-sm font-semibold tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 btn-shine"
          >
            Ver Colección
          </button>
          <button
            onClick={() => navigate("/outlet")}
            className="px-7 py-3 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm text-white/80 text-sm font-semibold tracking-wide hover:bg-card/60 hover:border-primary/30 hover:text-white transition-all duration-300"
          >
            Outlet
          </button>
        </div>
      </div>

      {/* Season badge */}
      <div className="absolute bottom-5 right-6 z-20 hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/50">Otoño-Invierno 2026</span>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0d0d1a] to-transparent pointer-events-none" />
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
