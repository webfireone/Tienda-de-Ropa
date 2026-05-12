import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"

const HERO_IMAGES = Array.from({ length: 25 }, (_, i) => `/inicio/inicio-${i + 1}.jpg`)

export function HeroSection() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [currentImage] = useState(() =>
    HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]
  )

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl border border-white/5 min-h-[600px]"
      style={{ background: "var(--color-background)" }}
    >
      <div className="hero-grid absolute inset-0 opacity-[0.03]" />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 origin-center"
          style={{ scale: imageScale, opacity: imageOpacity }}
        >
          <img
            src={currentImage}
            alt="Hero"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)] via-[var(--color-background)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/60 via-transparent to-[var(--color-background)]/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col justify-center min-h-[600px] max-w-2xl px-12 md:px-16"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">
            Moda Unisex · Desde 2019
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <span className="block text-white/90">GLAMOURS</span>
          <span className="block text-white/20 text-4xl md:text-5xl font-light tracking-[0.15em] mt-1">
            colección
          </span>
        </motion.h1>

        <motion.div
          className="h-px w-16 bg-gradient-to-r from-violet-500/60 to-transparent mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        />

        <motion.p
          className="text-sm text-white/40 leading-relaxed max-w-sm mb-10 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Estilo propio, calidad artesanal. Cada prenda cuenta una historia.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <button
            onClick={() => navigate("/catalog")}
            className="group relative overflow-hidden px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white text-xs font-semibold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/20 transition-all duration-500"
          >
            <span className="relative z-10">Ver colección</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
          <button
            onClick={() => navigate("/nueva-coleccion")}
            className="px-8 py-4 rounded-full text-white/40 text-xs font-medium tracking-wide hover:text-white/70 transition-colors duration-300"
          >
            Nueva colección →
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 right-10 z-10 hidden md:flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="w-8 h-px bg-white/20" />
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/20">
          Otoño-Invierno 2026
        </span>
      </motion.div>
    </div>
  )
}

export function DecorativeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: "var(--color-background)" }} />
      <div className="hero-grid absolute inset-0 opacity-[0.03]" />
    </div>
  )
}

export function PageHero({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/5 p-8 mb-8"
      style={{ background: "var(--color-background)" }}
    >
      <div className="hero-grid absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 flex items-center gap-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-white/60" />
          </div>
        )}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20 mb-1">
            {subtitle || "GLAMOURS"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white/90 tracking-tight">
            {title}
          </h1>
        </div>
      </div>
    </div>
  )
}
