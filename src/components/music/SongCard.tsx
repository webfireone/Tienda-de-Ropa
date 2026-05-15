import { useMusicStore } from "@/store/musicStore"
import { useAuth } from "@/context/AuthContext"
import { useToggleLike, useUserLikedSongs, useSongStats } from "@/hooks/useMusic"
import { useNavigate } from "react-router-dom"
import { Heart, Play, Pause, Headphones, Disc3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cancion } from "@/types/music"

interface SongCardProps {
  cancion: Cancion
}

export function SongCard({ cancion }: SongCardProps) {
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
        "group relative flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 cursor-pointer",
        "border hover:shadow-lg hover:shadow-primary/5",
        isCurrent
          ? "bg-primary/5 border-primary/25 shadow-sm shadow-primary/10"
          : "bg-card/50 border-primary/5 hover:border-primary/15 hover:bg-card/80"
      )}
      onClick={() => playSong(cancion)}
    >
      {/* Cover thumbnail 3D */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full overflow-hidden border-[1.5px] transition-all duration-500",
            "shadow-[0_3px_10px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "group-hover:shadow-[0_5px_18px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "group-hover:-translate-y-0.5",
            isCurrent
              ? "border-primary/50 shadow-[0_3px_10px_rgba(124,92,252,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
              : "border-primary/10 group-hover:border-primary/30"
          )}
        >
          <img
            src={cancion.portadaUrl}
            alt={cancion.titulo}
            className={cn(
              "w-full h-full object-cover transition-transform duration-1000",
              isThisPlaying ? "animate-cd-spin" : ""
            )}
          />
          {/* Glossy shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
        </div>
        {/* 3D bottom shadow disc */}
        <div className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-sm transition-all duration-500",
          isCurrent ? "bg-primary/25" : "bg-black/20 group-hover:bg-black/30"
        )} />
        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-b from-black/30 to-black/60 flex items-center justify-center transition-all duration-200",
          "shadow-inner",
          isThisPlaying ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}>
          {isThisPlaying ? <Pause className="w-3 h-3 text-white drop-shadow" /> : <Play className="w-3 h-3 text-white ml-0.5 drop-shadow" />}
        </div>
        {/* Playing badge */}
        {isThisPlaying && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/40 ring-1 ring-white/30">
            <Headphones className="w-2 h-2 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-[11px] font-semibold truncate flex items-center gap-1",
          isCurrent ? "text-primary" : "text-foreground"
        )}>
          {isCurrent && <Disc3 className={cn("w-2.5 h-2.5 shrink-0", isThisPlaying ? "animate-cd-spin" : "")} />}
          {cancion.titulo}
        </h4>
        <p className="text-[10px] text-muted-foreground truncate">{cancion.artista}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Headphones className="w-2.5 h-2.5" />
            {stats.totalPlays}
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Heart className={cn("w-2.5 h-2.5", isLiked ? "fill-red-500 text-red-500" : "")} />
            {stats.totalLikes}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); playSong(cancion) }}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
            "hover:bg-primary/20 active:scale-90",
            isThisPlaying ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          {isThisPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleLike() }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
          title={!user ? "Inicia sesión para calificar" : isLiked ? "Quitar like" : "Dar like"}
        >
          <Heart
            className={cn(
              "w-3 h-3 transition-all duration-300",
              isLiked
                ? "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                : "text-muted-foreground hover:text-red-400"
            )}
          />
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
