import { useMusicStore } from "@/store/musicStore"
import { useMonthlyRanking } from "@/hooks/useMusic"
import { Trophy, Play, Pause, Music, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cancion } from "@/types/music"

interface MonthlyRankingProps {
  canciones: Cancion[]
  compact?: boolean
}

export function MonthlyRanking({ canciones, compact }: MonthlyRankingProps) {
  const ranking = useMonthlyRanking()
  const { currentSong, isPlaying, playSong } = useMusicStore()

  if (compact) {
    if (ranking.length === 0) return null

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Crown className="w-3 h-3 text-yellow-400 shrink-0" />
        {ranking.map((entry, i) => (
          <span key={entry.cancionId} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-muted-foreground/30 mx-0.5">|</span>}
            <button
              onClick={() => { const c = canciones.find(cc => cc.id === entry.cancionId); if (c) playSong(c) }}
              className={cn(
                "hover:text-primary transition-colors truncate max-w-[80px]",
                currentSong?.id === entry.cancionId && isPlaying ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {entry.posicion === 1 ? "🥇" : entry.posicion === 2 ? "🥈" : entry.posicion === 3 ? "🥉" : `#${entry.posicion}`}
              {" "}{entry.titulo}
            </button>
          </span>
        ))}
      </div>
    )
  }

  if (ranking.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="font-display text-sm font-semibold">Top 5 del Mes</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <Music className="w-6 h-6 mb-2 opacity-40" />
          <p className="text-xs">Sin datos aún</p>
        </div>
      </div>
    )
  }

  const getMedal = (pos: number) => {
    switch(pos) {
      case 1: return { emoji: "🥇", cls: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" }
      case 2: return { emoji: "🥈", cls: "text-gray-300 border-gray-300/30 bg-gray-300/10" }
      case 3: return { emoji: "🥉", cls: "text-amber-600 border-amber-600/30 bg-amber-600/10" }
      default: return { emoji: `#${pos}`, cls: "text-muted-foreground border-primary/10 bg-primary/5" }
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-4 h-4 text-yellow-400" />
        <h3 className="font-display text-sm font-semibold">Top 5 del Mes</h3>
      </div>

      <div className="space-y-1.5">
        {ranking.map((entry) => {
          const cancion = canciones.find(c => c.id === entry.cancionId)
          const isThisPlaying = currentSong?.id === entry.cancionId && isPlaying
          const medal = getMedal(entry.posicion)

          return (
            <div
              key={entry.cancionId}
              className={cn(
                "group relative flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200 cursor-pointer",
                "hover:bg-secondary/40",
                isThisPlaying ? "bg-primary/5 ring-1 ring-primary/15" : ""
              )}
              onClick={() => cancion && playSong(cancion)}
            >
              {/* Position */}
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border shrink-0 text-[11px]", medal.cls)}>
                {medal.emoji}
              </div>

              {/* Cover */}
              <div className="relative shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full overflow-hidden border",
                  isThisPlaying ? "border-primary/40" : "border-primary/10"
                )}>
                  <img src={entry.portadaUrl} alt={entry.titulo}
                    className={cn("w-full h-full object-cover", isThisPlaying ? "animate-cd-spin" : "")}
                  />
                </div>
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isThisPlaying ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold truncate", isThisPlaying ? "text-primary" : "text-foreground")}>{entry.titulo}</p>
                <p className="text-[10px] text-muted-foreground truncate">{entry.artista}</p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className="text-xs font-bold gradient-text">{entry.puntaje}</p>
                <p className="text-[8px] text-muted-foreground">pts</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
