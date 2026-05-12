interface ProductCardSkeletonProps {
  viewMode?: "grid" | "list"
}

export function ProductCardSkeleton({ viewMode = "grid" }: ProductCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-6 p-4 rounded-2xl bg-card border border-primary/10 shimmer">
        <div className="w-20 h-20 rounded-xl bg-muted/50 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-16 rounded bg-muted/50" />
          <div className="h-4 w-48 rounded bg-muted/50" />
          <div className="h-3 w-32 rounded bg-muted/50" />
        </div>
        <div className="text-right shrink-0 space-y-2">
          <div className="h-4 w-20 rounded bg-muted/50" />
          <div className="h-3 w-14 rounded bg-muted/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full rounded-2xl overflow-hidden bg-card/30">
      <div className="h-full rounded-2xl shimmer" />
    </div>
  )
}
