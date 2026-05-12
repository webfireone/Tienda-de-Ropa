import { useRef, useState, useEffect } from "react"

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-scale"
  | "slide-left"
  | "slide-right"
  | "blur-in"
  | "clip-reveal"
  | "stagger-grid"
  | "line-expand"
  | "none"

interface RevealProps {
  children?: React.ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
  className?: string
}

const KEYFRAMES = `
@keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeDown { from { opacity:0; transform:translateY(-32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeScale { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
@keyframes slideLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
@keyframes slideRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes blurIn { from { opacity:0; filter:blur(12px); transform:scale(0.98); } to { opacity:1; filter:blur(0); transform:scale(1); } }
@keyframes clipReveal { from { clip-path:inset(100% 0 0 0); } to { clip-path:inset(0% 0 0 0); } }
@keyframes staggerGrid { from { opacity:0; transform:translateY(24px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes lineExpand { from { transform:scaleX(0); opacity:0; } to { transform:scaleX(1); opacity:1; } }
`

const ANIM_MAP: Record<AnimationVariant, string> = {
  "fade-up": "fadeUp",
  "fade-down": "fadeDown",
  "fade-scale": "fadeScale",
  "slide-left": "slideLeft",
  "slide-right": "slideRight",
  "blur-in": "blurIn",
  "clip-reveal": "clipReveal",
  "stagger-grid": "staggerGrid",
  "line-expand": "lineExpand",
  none: "none",
}

const STYLE_ID = "scroll-reveal-keyframes"

function ensureStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement("style")
  s.id = STYLE_ID
  s.textContent = KEYFRAMES
  document.head.appendChild(s)
}

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
  once = true,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    ensureStyles()
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const animName = ANIM_MAP[variant]

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible
          ? `${animName} ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s both`
          : undefined,
      }}
    >
      {children}
    </div>
  )
}

interface StaggerRevealProps {
  children: React.ReactNode
  variant?: AnimationVariant
  stagger?: number
  duration?: number
  threshold?: number
  className?: string
  childClassName?: string
}

export function StaggerReveal({
  children,
  variant = "fade-up",
  stagger = 0.08,
  duration = 0.5,
  threshold = 0.1,
  className = "",
  childClassName = "",
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    ensureStyles()
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const animName = ANIM_MAP[variant]
  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div ref={containerRef} className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className={childClassName}
          style={{
            opacity: started ? undefined : 0,
            animation: started
              ? `${animName} ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * stagger}s both`
              : undefined,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
