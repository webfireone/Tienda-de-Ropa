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

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer",
        "border hover:shadow-lg hover:shadow-primary/5",
        isCurrent
          ? "bg-primary/8 border-primary/20 shadow-sm shadow-primary/10"
          : "bg-card/40 border-white/[0.04] hover:border-primary/15 hover:bg-card/70"
      )}
      onClick={() => playSong(cancion)}
    >
      {/* Track number / Play indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {isThisPlaying ? (
          <Equalizer active={true} className="scale-[0.6]" />
        ) : isCurrent ? (
          <Pause className="w-3.5 h-3.5 text-primary" />
        ) : (
          <span className={cn(
            "text-[11px] font-mono tabular-nums transition-all",
            "text-muted-foreground/50 group-hover:hidden"
          )}>
            {index !== undefined ? String(index + 1).padStart(2, "0") : ""}
          </span>
        )}
        {!isCurrent && (
          <Play className="w-3.5 h-3.5 text-primary hidden group-hover:block ml-0.5" />
        )}
      </div>

      {/* Cover */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-lg overflow-hidden border transition-all duration-300",
          "shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
          isCurrent ? "border-primary/30" : "border-white/[0.06] group-hover:border-primary/20"
        )}>
          <img
            src={cancion.portadaUrl}
            alt={cancion.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        {isThisPlaying && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full gradient-primary shadow-lg shadow-primary/50 ring-1 ring-black/20" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-[12px] font-semibold truncate leading-tight",
          isCurrent ? "text-primary" : "text-foreground/90"
        )}>
          {cancion.titulo}
        </h4>
        <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{cancion.artista}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2.5 shrink-0">
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
