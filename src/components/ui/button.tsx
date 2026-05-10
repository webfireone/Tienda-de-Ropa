import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  const variants = {
    default: "gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] rounded-xl",
    destructive: "gradient-accent text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 rounded-xl",
    outline: "border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-xl",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl",
    ghost: "hover:bg-secondary/50 text-muted-foreground hover:text-foreground rounded-xl",
    link: "text-primary underline-offset-4 hover:underline",
  }
  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 px-4 py-1.5 text-xs",
    lg: "h-13 px-8 py-3 text-base",
    icon: "h-10 w-10",
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
