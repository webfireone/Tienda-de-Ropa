import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "gradient-primary text-white",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "gradient-accent text-white",
    outline: "text-foreground border border-border bg-transparent",
    success: "bg-emerald-900/50 text-emerald-300 border border-emerald-800",
    warning: "bg-amber-900/50 text-amber-300 border border-amber-800",
  }
  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
