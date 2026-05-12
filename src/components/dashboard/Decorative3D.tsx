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
      className="relative overflow-hidden rounded-3xl min-h-[620px] border border-white/[0.06]"
      style={{ background: "var(--color-background)" }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-64 h-64 rounded-full bg-fuchsia-600/8 blur-3xl pointer-events-none" />

      {/* Image layer */}
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
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] 0%, #0d0d1a/60 40%, #0d0d1a/20 100%" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] 0%, transparent 40%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent 60%, rgba(13,13,26,0.8) 100%" />
        {/* Editorial light leak */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-violet-400/5 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-center min-h-[620px] max-w-2xl px-12 md:px-16"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/25">
            Moda Unisex · Luján, Buenos Aires
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <span className="block gradient-text">GLAMOURS</span>
          <span className="block text-white/15 text-3xl md:text-4xl font-light tracking-[0.25em] mt-2">
            colección
          </span>
        </motion.h1>

        <motion.div
          className="h-px w-12 bg-gradient-to-r from-violet-400/50 to-transparent mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        />

        <motion.p
          className="text-sm text-white/35 leading-relaxed max-w-sm mb-10 font-light"
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
            className="group relative overflow-hidden px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/20 transition-all duration-500"
          >
            <span className="relative z-10">Ver colección</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
          <button
            onClick={() => navigate("/nueva-coleccion")}
            className="px-8 py-4 rounded-full text-white/35 text-[11px] font-medium tracking-wide hover:text-white/60 transition-colors duration-300"
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
        <div className="w-8 h-px bg-white/15" />
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/15">
          Otoño-Invierno 2026
        </span>
      </motion.div>
    </div>
  )
}

export function DecorativeBackground() {
  return null
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
