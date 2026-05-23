import { useMusicStore } from "@/store/musicStore"
import { useMonthlyRanking, useReproducciones } from "@/hooks/useMusic"
import { Trophy, Play, Pause, Music, Crown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cancion } from "@/types/music"

interface MonthlyRankingProps {
  canciones: Cancion[]
  compact?: boolean
}

const MEDAL_STYLES = [
  { emoji: "🥇", bg: "from-[#ff2a6d]/20 to-[#7b2cbf]/10", border: "border-[#ff2a6d]/30", text: "text-[#ff2a6d]", glow: "rgba(255,42,109,0.2)" },
  { emoji: "🥈", bg: "from-[#7b2cbf]/20 to-[#00f5d4]/10", border: "border-[#7b2cbf]/30", text: "text-[#7b2cbf]", glow: "rgba(123,44,191,0.2)" },
  { emoji: "🥉", bg: "from-[#00f5d4]/20 to-[#7b2cbf]/10", border: "border-[#00f5d4]/30", text: "text-[#00f5d4]", glow: "rgba(0,245,212,0.2)" },
  { emoji: "", bg: "from-[#ff2a6d]/10 to-[#7b2cbf]/5", border: "border-[#ff2a6d]/15", text: "text-muted-foreground", glow: "rgba(255,42,109,0.1)" },
]

export function MonthlyRanking({ canciones, compact }: MonthlyRankingProps) {
  const ranking = useMonthlyRanking()
  const { currentSong, isPlaying, playSong } = useMusicStore()
  const { data: reproducciones = [] } = useReproducciones()
  const today = new Date().toISOString().slice(0, 10)
  const todayPlays = reproducciones.filter(r => r.fechaReproduccion.slice(0, 10) === today).length

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
      <div className="glass-deep rounded-2xl p-5 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <h3 className="font-display text-sm font-semibold">Top 5 del Mes</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <TrendingUp className="w-3 h-3" />
            <span>{todayPlays} hoy</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
            <Music className="w-5 h-5 opacity-30" />
          </div>
          <p className="text-xs text-muted-foreground/60">Sin datos aún</p>
          <p className="text-[9px] text-muted-foreground/30 mt-1">Reproduce canciones para ver el ranking</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-deep rounded-2xl p-5 border border-white/[0.04] overflow-hidden relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <h3 className="font-display text-sm font-semibold">
            <span className="bg-gradient-to-r from-[#ff2a6d] via-[#7b2cbf] to-[#00f5d4] bg-clip-text text-transparent">Top 5 del Mes</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <TrendingUp className="w-3 h-3" />
          <span>{todayPlays} hoy</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {ranking.map((entry) => {
          const cancion = canciones.find(c => c.id === entry.cancionId)
          const isThisPlaying = currentSong?.id === entry.cancionId && isPlaying
          const medal = MEDAL_STYLES[Math.min(entry.posicion - 1, 3)]

          return (
            <div
              key={entry.cancionId}
              className={cn(
                "group relative flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 cursor-pointer",
                "hover:bg-white/[0.03]",
                isThisPlaying ? `bg-gradient-to-r ${medal.bg} ring-1 ${medal.border}` : ""
              )}
              onClick={() => cancion && playSong(cancion)}
            >
              {/* Position badge */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-300",
                "border bg-gradient-to-b",
                entry.posicion <= 3 ? `${medal.border} ${medal.bg} ${medal.text}` : "border-white/[0.06] bg-white/[0.03] text-muted-foreground/40"
              )}>
                {entry.posicion <= 3 ? medal.emoji : `#${entry.posicion}`}
              </div>

              {/* Cover */}
              <div className="relative shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full overflow-hidden border transition-all duration-300",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
                  isThisPlaying ? "border-primary/40" : "border-white/[0.06] group-hover:border-primary/20"
                )}>
                  <img src={entry.portadaUrl} alt={entry.titulo}
                    className={cn("w-full h-full object-cover", isThisPlaying ? "animate-cd-spin" : "")}
                  />
                </div>
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isThisPlaying ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold truncate transition-colors", isThisPlaying ? "text-primary" : "text-foreground/90")}>{entry.titulo}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate">{entry.artista}</p>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-xs font-bold",
                  entry.posicion === 1 ? "gradient-text" : entry.posicion <= 3 ? "text-foreground/80" : "text-muted-foreground/60"
                )}>{entry.puntaje}</p>
                <p className="text-[8px] text-muted-foreground/40">pts</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
