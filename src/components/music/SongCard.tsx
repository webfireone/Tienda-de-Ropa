import { useMusicStore } from "@/store/musicStore"
import { useAuth } from "@/context/AuthContext"
import { useToggleLike, useUserLikedSongs, useSongStats } from "@/hooks/useMusic"
import { useNavigate } from "react-router-dom"
import { Heart, Play, Pause, Headphones, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Equalizer } from "./Equalizer"
import type { Cancion } from "@/types/music"

interface SongCardProps {
  cancion: Cancion
  index?: number
}

const GRADIENT_BORDERS = [
  "from-primary/20 via-highlight/20 to-primary/10",
  "from-highlight/20 via-primary/20 to-highlight/10",
  "from-primary/15 via-purple-400/20 to-highlight/15",
  "from-blue-400/20 via-primary/20 to-highlight/15",
  "from-highlight/15 via-pink-400/20 to-primary/15",
]

const GRADIENT_GLOWS = [
  "shadow-primary/15",
  "shadow-highlight/15",
  "shadow-purple-400/15",
  "shadow-blue-400/15",
  "shadow-pink-400/15",
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
  const gradientBorder = GRADIENT_BORDERS[idx % GRADIENT_BORDERS.length]
  const gradientGlow = GRADIENT_GLOWS[idx % GRADIENT_GLOWS.length]

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-500 cursor-pointer",
        "border hover:shadow-xl hover:-translate-y-0.5",
        isCurrent
          ? `bg-gradient-to-r ${gradientBorder} border-transparent shadow-lg ${gradientGlow}`
          : "bg-card/40 border-white/[0.04] hover:border-transparent hover:bg-gradient-to-r hover:from-card/80 hover:via-card/60 hover:to-card/80"
      )}
      onClick={() => playSong(cancion)}
      style={!isCurrent ? {} : {
        boxShadow: `0 8px 32px rgba(124,92,252,0.12), 0 0 0 1px rgba(124,92,252,0.08)`,
      }}
    >
      {/* Animated gradient border on hover */}
      {!isCurrent && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, #7c5cfc, #ec4899, #a78bfa, #7c5cfc)",
            backgroundSize: "300% 300%",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            animation: "gradientShift 3s ease infinite",
          }}
        />
      )}

      {/* Background glow on hover */}
      {!isCurrent && (
        <div className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #7c5cfc 0%, #ec4899 40%, transparent 70%)" }}
        />
      )}

      {/* Track number / Play indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center relative z-10">
        {isThisPlaying ? (
          <Equalizer active={true} className="scale-[0.6]" />
        ) : isCurrent ? (
          <Pause className="w-3.5 h-3.5 text-primary" />
        ) : (
          <span className={cn(
            "text-[11px] font-mono tabular-nums transition-all",
            "text-muted-foreground/50 group-hover:hidden"
          )}>
            {String(idx + 1).padStart(2, "0")}
          </span>
        )}
        {!isCurrent && (
          <Play className="w-3.5 h-3.5 text-primary hidden group-hover:block ml-0.5" />
        )}
      </div>

      {/* Cover */}
      <div className="relative shrink-0 z-10">
        <div className={cn(
          "w-10 h-10 rounded-lg overflow-hidden border transition-all duration-500",
          "shadow-[0_4px_12px_rgba(0,0,0,0.4)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] group-hover:scale-105",
          isCurrent ? "border-primary/40 ring-1 ring-primary/20" : "border-white/[0.06] group-hover:border-primary/30"
        )}>
          <img
            src={cancion.portadaUrl}
            alt={cancion.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        {isThisPlaying && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full gradient-primary shadow-lg shadow-primary/50 ring-1 ring-black/20 animate-pulse-ring" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/30 animate-ping" />
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <h4 className={cn(
          "text-[12px] font-semibold truncate leading-tight",
          isCurrent ? "text-primary" : "text-foreground/90"
        )}>
          {cancion.titulo}
        </h4>
        <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{cancion.artista}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2.5 shrink-0 relative z-10">
        <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5 tabular-nums">
          <Headphones className="w-2.5 h-2.5" />
          {stats.totalPlays}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleLike() }}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
            "hover:scale-110 active:scale-90",
            isLiked ? "text-red-500" : "text-muted-foreground/40 hover:text-red-400"
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
