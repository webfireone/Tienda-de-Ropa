import { useMusicStore } from "@/store/musicStore"
import { useAuth } from "@/context/AuthContext"
import { useToggleLike, useUserLikedSongs, useSongStats } from "@/hooks/useMusic"
import { useNavigate } from "react-router-dom"
import { Heart, Play, Pause, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"
import { Equalizer } from "./Equalizer"
import type { Cancion } from "@/types/music"

interface SongCardProps {
  cancion: Cancion
  index?: number
}

const CARD_ACCENTS = [
  { bar: "from-primary via-highlight to-primary", glow: "rgba(124,92,252,0.15)", border: "rgba(124,92,252,0.08)" },
  { bar: "from-highlight via-pink-400 to-highlight", glow: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.08)" },
  { bar: "from-purple-400 via-primary to-purple-400", glow: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.08)" },
  { bar: "from-blue-400 via-primary to-blue-400", glow: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.08)" },
  { bar: "from-amber-400 via-highlight to-amber-400", glow: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.08)" },
]

const CARD_GRADIENT_BG = [
  "from-primary/[0.03] via-transparent to-highlight/[0.02]",
  "from-highlight/[0.03] via-transparent to-primary/[0.02]",
  "from-purple-400/[0.03] via-transparent to-primary/[0.02]",
  "from-blue-400/[0.03] via-transparent to-highlight/[0.02]",
  "from-amber-400/[0.03] via-transparent to-highlight/[0.02]",
]

export function SongCard({ cancion, index }: SongCardProps) {
  const { currentSong, isPlaying, playSong } = useMusicStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toggleLike = useToggleLike()
  const likedSongs = useUserLikedSongs()
  const stats = useSongStats(cancion.id)

  const isCurrent = currentSong?.id === cancion.id
  const isThisPlaying = isCurrent && isPlaying
  const isLiked = likedSongs.has(cancion.id)

  const idx = index !== undefined ? index : 0
  const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]
  const bgGradient = CARD_GRADIENT_BG[idx % CARD_GRADIENT_BG.length]

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 pr-4 rounded-xl transition-all duration-500 cursor-pointer",
        "border overflow-hidden",
        isCurrent
          ? "border-primary/20 shadow-xl"
          : "border-white/[0.04] hover:shadow-2xl hover:-translate-y-0.5 hover:border-white/[0.08]"
      )}
      onClick={() => playSong(cancion)}
      style={isCurrent ? {
        boxShadow: `0 8px 40px ${accent.glow}, 0 0 0 1px ${accent.border}`,
      } : undefined}
    >
      {/* Left accent bar */}
      <div className={cn(
        "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all duration-500",
        `bg-gradient-to-b ${accent.bar}`,
        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-70"
      )} />

      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 transition-all duration-500",
        `bg-gradient-to-br ${bgGradient}`,
        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-80"
      )} />

      {/* Hover glow */}
      <div
        className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-[0.08] transition-all duration-700 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent.glow.replace("0.15", "1")} 0%, transparent 70%)` }}
      />

      {/* Playing glow */}
      {isThisPlaying && (
        <div
          className="absolute -inset-2 rounded-xl opacity-30 transition-all duration-700 blur-2xl pointer-events-none animate-glow"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent.glow.replace("0.15", "0.6")} 0%, transparent 70%)` }}
        />
      )}

      {/* Track number / Play indicator */}
      <div className="w-7 shrink-0 flex items-center justify-center relative z-10">
        {isThisPlaying ? (
          <Equalizer active={true} className="scale-[0.55]" />
        ) : isCurrent ? (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Pause className="w-3 h-3 text-primary" />
          </div>
        ) : (
          <span className={cn(
            "text-[11px] font-mono tabular-nums transition-all duration-300",
            "text-muted-foreground/40 group-hover:hidden"
          )}>
            {String(idx + 1).padStart(2, "0")}
          </span>
        )}
        {!isCurrent && (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <Play className="w-3 h-3 text-primary ml-0.5" />
          </div>
        )}
      </div>

      {/* Cover - Vinyl style */}
      <div className="relative shrink-0 z-10">
        <div className={cn(
          "relative w-[42px] h-[42px] rounded-full overflow-hidden transition-all duration-500",
          "shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          isCurrent ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : "ring-1 ring-white/[0.06] group-hover:ring-primary/20"
        )}>
          <img
            src={cancion.portadaUrl}
            alt={cancion.titulo}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isThisPlaying ? "vinyl-spin" : "",
              !isThisPlaying && "group-hover:scale-110"
            )}
          />
          {/* Vinyl shine overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)"
            }}
          />
        </div>
        {/* Center dot */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500",
          isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            isThisPlaying ? "bg-primary shadow-[0_0_8px_rgba(124,92,252,0.6)]" : "bg-white/30"
          )} />
        </div>
        {/* Playing ring */}
        {isThisPlaying && (
          <div className="absolute -inset-1.5 rounded-full border border-primary/20 animate-pulse-ring pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <h4 className={cn(
          "text-[13px] font-semibold truncate leading-tight transition-colors duration-300",
          isCurrent ? "text-primary" : "text-foreground/90 group-hover:text-foreground"
        )}>
          {cancion.titulo}
        </h4>
        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 tracking-wide">{cancion.artista}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 shrink-0 relative z-10">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300",
          "bg-white/[0.03] border border-white/[0.04]",
          "group-hover:bg-white/[0.05] group-hover:border-white/[0.08]"
        )}>
          <Headphones className="w-2.5 h-2.5 text-muted-foreground/40" />
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground/60">
            {stats.totalPlays}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleLike() }}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
            "hover:scale-110 active:scale-90",
            isLiked
              ? "text-red-500 bg-red-500/10"
              : "text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/5"
          )}
          title={!user ? "Inicia sesión para calificar" : isLiked ? "Quitar like" : "Dar like"}
        >
          <Heart className={cn(
            "w-3.5 h-3.5 transition-all duration-300",
            isLiked && "fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
          )} />
        </button>
      </div>
    </div>
  )

  function handleLike() {
    if (!user) {
      navigate("/login")
      return
    }
    toggleLike.mutate(cancion.id)
  }
}
