import { useMemo } from "react"
import { motion, useTransform, type MotionValue } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
  drift: number
  color: "violet" | "pink" | "blue" | "white"
}

const COLORS = {
  violet: "rgba(124,92,252,",
  pink: "rgba(236,72,153,",
  blue: "rgba(96,165,250,",
  white: "rgba(255,255,255,",
}

const PARTICLE_CONFIG: Omit<Particle, "id" | "x" | "y">[] = [
  { size: 3, duration: 8, delay: 0, opacity: 0.6, drift: 30, color: "violet" },
  { size: 5, duration: 12, delay: 1, opacity: 0.4, drift: -20, color: "pink" },
  { size: 2, duration: 6, delay: 0.5, opacity: 0.8, drift: 15, color: "white" },
  { size: 4, duration: 10, delay: 2, opacity: 0.5, drift: -40, color: "blue" },
  { size: 6, duration: 15, delay: 0.3, opacity: 0.3, drift: 25, color: "violet" },
  { size: 2, duration: 7, delay: 1.5, opacity: 0.7, drift: -15, color: "pink" },
  { size: 3, duration: 9, delay: 0.8, opacity: 0.6, drift: 35, color: "white" },
  { size: 5, duration: 11, delay: 2.5, opacity: 0.4, drift: -30, color: "blue" },
  { size: 4, duration: 8, delay: 1.2, opacity: 0.5, drift: 20, color: "violet" },
  { size: 2, duration: 6, delay: 0.2, opacity: 0.8, drift: -25, color: "pink" },
  { size: 3, duration: 13, delay: 3, opacity: 0.4, drift: 40, color: "white" },
  { size: 6, duration: 9, delay: 0.7, opacity: 0.3, drift: -35, color: "blue" },
]

function ParticleOrb({ particle, scrollYProgress }: { particle: Particle; scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.5], [particle.opacity, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])
  const drift = useTransform(scrollYProgress, [0, 1], [0, particle.drift * 0.3])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        opacity,
        y,
        x: drift,
        background: `${COLORS[particle.color]}${particle.opacity})`,
        boxShadow: `
          0 0 ${particle.size * 2}px ${COLORS[particle.color]}${particle.opacity * 0.5}),
          0 0 ${particle.size * 4}px ${COLORS[particle.color]}${particle.opacity * 0.2})
        `,
      }}
      animate={{
        y: [particle.y, particle.y - 20 - Math.random() * 30, particle.y],
        x: [particle.x, particle.x + particle.drift * 0.1, particle.x],
        opacity: [particle.opacity * 0.6, particle.opacity, particle.opacity * 0.6],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

function FloatingRing({ delay, x, y, size, scrollYProgress }: { delay: number; x: number; y: number; size: number; scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 0])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none border border-white/[0.04]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        opacity,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

interface HeroParticlesProps {
  scrollYProgress: MotionValue<number>
}

export function HeroParticles({ scrollYProgress }: HeroParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return PARTICLE_CONFIG.map((config, i) => ({
      ...config,
      id: i,
      x: 5 + Math.random() * 55,
      y: 10 + Math.random() * 70,
    }))
  }, [])

  const rings = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 60,
      y: 20 + Math.random() * 50,
      size: 40 + Math.random() * 120,
      delay: i * 1.5,
    }))
  }, [])

  const glowOpacity = useTransform(scrollYProgress, [0, 0.4], [0.5, 0])
  const glowScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.8])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map(p => (
        <ParticleOrb key={p.id} particle={p} scrollYProgress={scrollYProgress} />
      ))}

      {rings.map(r => (
        <FloatingRing key={r.id} delay={r.delay} x={r.x} y={r.y} size={r.size} scrollYProgress={scrollYProgress} />
      ))}

      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          left: "60%",
          top: "20%",
          opacity: glowOpacity,
          scale: glowScale,
          background: "radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          left: "70%",
          bottom: "10%",
          opacity: glowOpacity,
          scale: glowScale,
          background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
