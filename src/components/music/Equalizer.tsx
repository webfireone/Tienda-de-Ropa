import { cn } from "@/lib/utils"

interface EqualizerProps {
  active: boolean
  className?: string
}

export function Equalizer({ active, className }: EqualizerProps) {
  return (
    <div className={cn("equalizer-container", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "eq-bar",
            active ? `animate-equalizer-bar${i > 1 ? `-${i}` : ""}` : "opacity-20"
          )}
        />
      ))}
    </div>
  )
}
