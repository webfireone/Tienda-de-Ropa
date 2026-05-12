import { useRef, useCallback } from "react"

export function useMagneticHover() {
  const ref = useRef<HTMLElement | null>(null)

  const magneticRef = useCallback((el: HTMLElement | null) => {
    if (ref.current) {
      ref.current.removeEventListener("mousemove", onMove)
      ref.current.removeEventListener("mouseleave", onLeave)
    }
    ref.current = el
    if (el) {
      el.classList.add("magnetic")
      el.addEventListener("mousemove", onMove)
      el.addEventListener("mouseleave", onLeave)
    }
  }, [])

  return magneticRef
}

function onMove(this: HTMLElement, e: MouseEvent) {
  const rect = this.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  const dist = Math.sqrt(x * x + y * y)
  const maxDist = Math.max(rect.width, rect.height)
  const strength = Math.max(0, 1 - dist / maxDist)
  const tx = x * strength * 0.25
  const ty = y * strength * 0.25
  this.style.transform = `translate(${tx}px, ${ty}px)`
}

function onLeave(this: HTMLElement) {
  this.style.transform = "translate(0, 0)"
}
