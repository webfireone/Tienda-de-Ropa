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
  { size: 5, duration: 8, delay: 0, opacity: 0.7, drift: 40, color: "violet" },
  { size: 8, duration: 12, delay: 1, opacity: 0.5, drift: -30, color: "pink" },
  { size: 4, duration: 6, delay: 0.5, opacity: 0.8, drift: 20, color: "white" },
  { size: 6, duration: 10, delay: 2, opacity: 0.6, drift: -50, color: "blue" },
  { size: 10, duration: 15, delay: 0.3, opacity: 0.4, drift: 35, color: "violet" },
  { size: 4, duration: 7, delay: 1.5, opacity: 0.7, drift: -20, color: "pink" },
  { size: 5, duration: 9, delay: 0.8, opacity: 0.7, drift: 45, color: "white" },
  { size: 7, duration: 11, delay: 2.5, opacity: 0.5, drift: -40, color: "blue" },
  { size: 6, duration: 8, delay: 1.2, opacity: 0.6, drift: 25, color: "violet" },
  { size: 4, duration: 6, delay: 0.2, opacity: 0.8, drift: -30, color: "pink" },
  { size: 5, duration: 13, delay: 3, opacity: 0.5, drift: 50, color: "white" },
  { size: 8, duration: 9, delay: 0.7, opacity: 0.4, drift: -45, color: "blue" },
  { size: 6, duration: 10, delay: 1.8, opacity: 0.6, drift: 30, color: "violet" },
  { size: 4, duration: 7, delay: 2.2, opacity: 0.7, drift: -35, color: "pink" },
]

function ParticleOrb({ particle, scrollYProgress }: { particle: Particle; scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.5], [particle.opacity, 0])
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
        x: drift,
        background: `${COLORS[particle.color]}${particle.opacity})`,
        boxShadow: `
          0 0 ${particle.size * 2}px ${COLORS[particle.color]}${particle.opacity * 0.6}),
          0 0 ${particle.size * 4}px ${COLORS[particle.color]}${particle.opacity * 0.3})
        `,
      }}
      animate={{
        y: ["0px", `${-20 - (particle.id % 4) * 8}px`, "0px"],
        scale: [1, 1.2, 1],
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
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.4, 0])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none border border-white/[0.05]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        opacity,
      }}
      animate={{
        scale: [1, 1.15, 1],
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
      x: 55 + Math.random() * 40,
      y: 5 + Math.random() * 85,
    }))
  }, [])

  const rings = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 50 + Math.random() * 45,
      y: 10 + Math.random() * 70,
      size: 60 + Math.random() * 160,
      delay: i * 1.5,
    }))
  }, [])

  const glowOpacity = useTransform(scrollYProgress, [0, 0.4], [0.6, 0])
  const glowScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.7])

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {particles.map(p => (
        <ParticleOrb key={p.id} particle={p} scrollYProgress={scrollYProgress} />
      ))}

      {rings.map(r => (
        <FloatingRing key={r.id} delay={r.delay} x={r.x} y={r.y} size={r.size} scrollYProgress={scrollYProgress} />
      ))}

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          left: "55%",
          top: "0%",
          opacity: glowOpacity,
          scale: glowScale,
          background: "radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 65%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          left: "65%",
          bottom: "0%",
          opacity: glowOpacity,
          scale: glowScale,
          background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 65%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
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
