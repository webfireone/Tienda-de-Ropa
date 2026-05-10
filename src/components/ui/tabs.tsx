import { cn } from "@/lib/utils"
import { useState, type ReactNode } from "react"

interface TabsProps {
  tabs: { id: string; label: string; content: ReactNode }[]
  className?: string
}

export function Tabs({ tabs, className }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.id)
  return (
    <div className={cn("w-full", className)}>
      <div className="flex border-b border-primary/5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all duration-300 relative",
              active === t.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {active === t.id && (
              <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full gradient-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tabs.find(t => t.id === active)?.content}
      </div>
    </div>
  )
}
