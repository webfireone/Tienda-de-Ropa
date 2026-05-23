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

const DISK_COLORS = [
  { ringFrom: "#ff2a6d", ringTo: "#7b2cbf", shadow: "rgba(255,42,109,0.4)", bgFrom: "#ff2a6d", bgTo: "#7b2cbf" },
  { ringFrom: "#7b2cbf", ringTo: "#00f5d4", shadow: "rgba(123,44,191,0.4)", bgFrom: "#7b2cbf", bgTo: "#00f5d4" },
  { ringFrom: "#00f5d4", ringTo: "#ff2a6d", shadow: "rgba(0,245,212,0.4)", bgFrom: "#00f5d4", bgTo: "#ff2a6d" },
  { ringFrom: "#ff2a6d", ringTo: "#00f5d4", shadow: "rgba(255,42,109,0.4)", bgFrom: "#ff2a6d", bgTo: "#00f5d4" },
  { ringFrom: "#7b2cbf", ringTo: "#ff2a6d", shadow: "rgba(123,44,191,0.4)", bgFrom: "#7b2cbf", bgTo: "#ff2a6d" },
]

const CARD_ACCENTS = [
  { barFrom: "#ff2a6d", barVia: "#7b2cbf", barTo: "#ff2a6d", glow: "rgba(255,42,109,0.15)", border: "rgba(255,42,109,0.08)" },
  { barFrom: "#7b2cbf", barVia: "#00f5d4", barTo: "#7b2cbf", glow: "rgba(123,44,191,0.15)", border: "rgba(123,44,191,0.08)" },
  { barFrom: "#00f5d4", barVia: "#7b2cbf", barTo: "#00f5d4", glow: "rgba(0,245,212,0.15)", border: "rgba(0,245,212,0.08)" },
  { barFrom: "#ff2a6d", barVia: "#00f5d4", barTo: "#ff2a6d", glow: "rgba(255,42,109,0.15)", border: "rgba(255,42,109,0.08)" },
  { barFrom: "#7b2cbf", barVia: "#ff2a6d", barTo: "#7b2cbf", glow: "rgba(123,44,191,0.15)", border: "rgba(123,44,191,0.08)" },
]

const CARD_GRADIENT_BG = [
  { from: "#ff2a6d", to: "#7b2cbf" },
  { from: "#7b2cbf", to: "#00f5d4" },
  { from: "#00f5d4", to: "#ff2a6d" },
  { from: "#ff2a6d", to: "#00f5d4" },
  { from: "#7b2cbf", to: "#ff2a6d" },
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
  const diskColor = DISK_COLORS[idx % DISK_COLORS.length]

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
      <div
        className={cn(
          "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all duration-500",
          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        )}
        style={{ background: `linear-gradient(to bottom, ${accent.barFrom}, ${accent.barVia}, ${accent.barTo})` }}
      />

      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-80"
        )}
        style={{ background: `linear-gradient(135deg, ${bgGradient.from}08, transparent, ${bgGradient.to}06)` }}
      />

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

      {/* Cover - 3D Vinyl Disc */}
      <div className="relative shrink-0 z-10">
        {/* Outer glow ring */}
        <div className={cn(
          "absolute -inset-2 rounded-full opacity-0 blur-xl transition-all duration-500 pointer-events-none",
          isThisPlaying ? "opacity-40" : "group-hover:opacity-20"
        )}
          style={{ background: `radial-gradient(circle, ${diskColor.shadow} 0%, transparent 70%)` }}
        />

        {/* Disc container with 3D effect */}
        <div className={cn(
          "relative w-[46px] h-[46px] rounded-full overflow-hidden transition-all duration-500",
          "shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)]",
          "group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.1)]",
          "group-hover:scale-105 group-hover:-rotate-3",
          isCurrent ? "ring-offset-2 ring-offset-background" : "ring-1 ring-white/[0.08] group-hover:ring-2"
        )}
          style={{
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)`,
            ...(isCurrent ? { boxShadow: `0 8px 32px ${diskColor.shadow}, 0 0 0 2px ${diskColor.shadow.replace("0.4", "0.3")}` } : {}),
          }}
        >
          {/* Colored gradient ring background */}
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{ background: `linear-gradient(135deg, ${diskColor.bgFrom}33, ${diskColor.bgTo}33)` }}
          />

          {/* Album art */}
          <img
            src={cancion.portadaUrl}
            alt={cancion.titulo}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 rounded-full",
              isThisPlaying ? "vinyl-spin" : "",
              !isThisPlaying && "group-hover:scale-110"
            )}
          />

          {/* 3D Shine overlay - glossy reflection */}
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)"
            }}
          />

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]" />

          {/* Colored border ring */}
          <div
            className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${diskColor.ringFrom}, ${diskColor.ringTo})`,
              WebkitMask: "radial-gradient(circle, transparent 68%, black 70%)",
              mask: "radial-gradient(circle, transparent 68%, black 70%)"
            }}
          />
        </div>

        {/* Center vinyl spindle */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500",
          isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="w-[10px] h-[10px] rounded-full bg-gradient-to-br from-white/80 to-white/20 shadow-[0_0_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.6)]" />
        </div>

        {/* Playing ring */}
        {isThisPlaying && (
          <div className={cn(
            "absolute -inset-2 rounded-full animate-pulse-ring pointer-events-none",
            `ring-1 ring-primary/30`
          )} />
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
