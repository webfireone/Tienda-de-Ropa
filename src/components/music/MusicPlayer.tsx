import { useEffect, useRef, useCallback } from "react"
import { useMusicStore } from "@/store/musicStore"
import { useRegistrarReproduccion } from "@/hooks/useMusic"
import { Equalizer } from "./Equalizer"
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MusicPlayer() {
  const {
    currentSong, isPlaying, progress, duration, volume, shuffle,
    setVolume, togglePlay, seek, playNext, playPrevious, toggleShuffle,
  } = useMusicStore()

  const registrarReproduccion = useRegistrarReproduccion()
  const hasRegisteredPlay = useRef(false)
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const cumulativeSeconds = useRef(0)

  useEffect(() => {
    if (isPlaying && currentSong && !hasRegisteredPlay.current) {
      playTimer.current = setInterval(() => {
        cumulativeSeconds.current += 1
        if (cumulativeSeconds.current >= 10 && !hasRegisteredPlay.current) {
          hasRegisteredPlay.current = true
          registrarReproduccion.mutate(currentSong.id)
          if (playTimer.current) clearInterval(playTimer.current)
        }
      }, 1000)
    }
    if (!isPlaying && playTimer.current) {
      clearInterval(playTimer.current)
      playTimer.current = null
    }
    return () => { if (playTimer.current) { clearInterval(playTimer.current); playTimer.current = null } }
  }, [isPlaying, currentSong?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    hasRegisteredPlay.current = false
    cumulativeSeconds.current = 0
  }, [currentSong?.id])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - r.left) / r.width
    seek(pct * (duration || 1))
  }, [duration, seek])

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
  }, [setVolume])

  const fmt = (s: number) => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00"
  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <div className="music-player-wrapper">
      {/* Ambient glow behind the card */}
      <div className={cn(
        "absolute -inset-4 rounded-3xl opacity-0 transition-opacity duration-1000 blur-2xl pointer-events-none",
        isPlaying && "opacity-100"
      )}
        style={{ background: "radial-gradient(ellipse at center, rgba(124,92,252,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)" }}
      />

      <div className={cn(
        "music-player-card relative rounded-2xl border overflow-hidden transition-all duration-700",
        isPlaying ? "border-primary/15" : "border-white/[0.04]"
      )}>
        {/* Vinyl Section */}
        <div className="relative flex justify-center py-8 px-6">
          {/* Subtle radial light behind vinyl */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            isPlaying ? "opacity-60" : "opacity-20"
          )}
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,92,252,0.08) 0%, transparent 60%)" }}
          />

          {/* The vinyl disc */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className={cn(
              "absolute -inset-3 rounded-full transition-all duration-1000 pointer-events-none",
              isPlaying
                ? "shadow-[0_0_60px_rgba(124,92,252,0.15),0_0_120px_rgba(124,92,252,0.05)]"
                : "shadow-none"
            )} />

            {/* Vinyl disc container */}
            <div className={cn(
              "relative w-44 h-44 rounded-full overflow-hidden transition-all duration-500",
              "shadow-[0_12px_50px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)]",
              isPlaying && "shadow-[0_12px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(124,92,252,0.1)]"
            )}>
              <img
                src="/images/pasta.jpg"
                alt="Glamour's Music vinyl"
                className={cn(
                  "w-full h-full object-cover",
                  isPlaying ? "vinyl-spin" : "vinyl-spin-paused"
                )}
              />
              {/* Subtle shine overlay */}
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)"
                }}
              />
            </div>

            {/* Tonearm indicator when playing */}
            <div className={cn(
              "absolute -right-2 top-4 w-1 h-16 rounded-full transition-all duration-700 origin-top",
              isPlaying
                ? "bg-gradient-to-b from-primary/40 to-transparent rotate-[15deg] opacity-100"
                : "bg-gradient-to-b from-white/10 to-transparent rotate-[30deg] opacity-40"
            )} />
          </div>
        </div>

        {/* Song Info */}
        <div className="px-6 text-center">
          {currentSong ? (
            <>
              <div className="flex justify-center mb-2">
                <Equalizer active={isPlaying} className="scale-90" />
              </div>
              <h3 className="font-display text-[15px] font-semibold text-foreground/90 truncate leading-tight">
                {currentSong.titulo}
              </h3>
              <p className="text-[11px] text-muted-foreground/60 mt-1 tracking-wide uppercase">
                {currentSong.artista}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-display text-[15px] font-semibold text-foreground/70">
                Glamour's MUSIC
              </h3>
              <p className="text-[11px] text-muted-foreground/50 mt-1">
                Seleccioná un tema para escuchar
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="px-6 mt-5">
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] text-muted-foreground/40 w-7 text-right font-mono tabular-nums">
              {fmt(progress)}
            </span>
            <div
              className="flex-1 relative h-[3px] bg-white/[0.06] rounded-full overflow-hidden cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-highlight))"
                }}
              />
              <div
                className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground/40 w-7 font-mono tabular-nums">
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 mt-4 mb-2">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={toggleShuffle}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                shuffle
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60"
              )}
              title={shuffle ? "Aleatorio activado" : "Aleatorio"}
            >
              <Shuffle className="w-3 h-3" />
            </button>
            <button
              onClick={playPrevious}
              className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/80 hover:bg-white/[0.04] transition-all active:scale-90"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={currentSong ? togglePlay : undefined}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                "shadow-lg hover:shadow-xl active:scale-95 hover:scale-105",
                currentSong
                  ? "gradient-primary text-white shadow-primary/25 hover:shadow-primary/35"
                  : "bg-white/[0.06] text-foreground/30 cursor-default shadow-none hover:shadow-none hover:scale-100"
              )}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/80 hover:bg-white/[0.04] transition-all active:scale-90"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <div className="w-8" />
          </div>
        </div>

        {/* Volume */}
        <div className="px-6 pb-6 pt-1">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
            <div
              className="w-20 h-[3px] bg-white/[0.06] rounded-full overflow-hidden cursor-pointer group"
              onClick={handleVolumeClick}
            >
              <div
                className="h-full rounded-full bg-foreground/20 group-hover:bg-foreground/30 transition-all"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom gradient line accent */}
        <div className={cn(
          "h-[1px] transition-opacity duration-1000",
          isPlaying ? "opacity-100" : "opacity-0"
        )}
          style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), var(--color-highlight), transparent)" }}
        />
      </div>
    </div>
  )
}
