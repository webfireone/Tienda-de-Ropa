import { useEffect, useRef } from "react"

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const posRef = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    let hidden = true

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (hidden) {
        hidden = false
        glow.classList.remove("hidden")
      }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          const { x, y } = posRef.current
          glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`
          rafRef.current = 0
        })
      }
    }

    const onMouseLeave = () => {
      hidden = true
      glow.classList.add("hidden")
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    document.addEventListener("mouseleave", onMouseLeave)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseleave", onMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow hidden" aria-hidden="true" />
}
