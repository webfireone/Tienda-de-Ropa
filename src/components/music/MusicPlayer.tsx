import { useRef, useEffect, useCallback } from "react"
import { useMusicStore } from "@/store/musicStore"
import { useRegistrarReproduccion } from "@/hooks/useMusic"
import { Equalizer } from "./Equalizer"
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Disc3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function MusicPlayer() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    setProgress, setDuration, setVolume, setIsPlaying,
    togglePlay, seek,
  } = useMusicStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const registrarReproduccion = useRegistrarReproduccion()
  const hasRegisteredPlay = useRef(false)
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Create audio element once
  useEffect(() => {
    const a = new Audio()
    a.preload = "metadata"
    audioRef.current = a

    const onTime = () => setProgress(a.currentTime)
    const onMeta = () => setDuration(a.duration)
    const onEnd = () => { setIsPlaying(false); setProgress(0); hasRegisteredPlay.current = false }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => { console.warn("Audio error:", a.src); setIsPlaying(false) }

    a.addEventListener("timeupdate", onTime)
    a.addEventListener("loadedmetadata", onMeta)
    a.addEventListener("ended", onEnd)
    a.addEventListener("play", onPlay)
    a.addEventListener("pause", onPause)
    a.addEventListener("error", onError)

    return () => {
      a.removeEventListener("timeupdate", onTime)
      a.removeEventListener("loadedmetadata", onMeta)
      a.removeEventListener("ended", onEnd)
      a.removeEventListener("play", onPlay)
      a.removeEventListener("pause", onPause)
      a.removeEventListener("error", onError)
      a.pause()
      a.src = ""
      if (playTimer.current) clearTimeout(playTimer.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When currentSong changes, load new source and play
  useEffect(() => {
    const a = audioRef.current
    if (!a || !currentSong?.archivoUrl) return

    hasRegisteredPlay.current = false
    a.src = currentSong.archivoUrl
    a.load()
    a.play().catch((err) => {
      console.warn("Play prevented:", err.message)
      setIsPlaying(false)
    })
  }, [currentSong?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync isPlaying state to audio element
  useEffect(() => {
    const a = audioRef.current
    if (!a || !a.src) return
    if (isPlaying) {
      a.play().catch((err) => {
        console.warn("Resume prevented:", err.message)
        setIsPlaying(false)
      })
    } else {
      a.pause()
    }
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Track play > 10s for ranking
  useEffect(() => {
    if (isPlaying && currentSong && !hasRegisteredPlay.current) {
      if (playTimer.current) clearTimeout(playTimer.current)
      playTimer.current = setTimeout(() => {
        if (isPlaying && currentSong) { registrarReproduccion.mutate(currentSong.id); hasRegisteredPlay.current = true }
      }, 10000)
    }
    if (!isPlaying && playTimer.current) clearTimeout(playTimer.current)
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, currentSong?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a) return
    const r = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - r.left) / r.width
    const t = pct * (duration || 1)
    a.currentTime = t
    seek(t)
  }, [duration, seek])

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
  }, [setVolume])

  const fmt = (s: number) => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00"

  const cardClasses = cn(
    "rounded-2xl border overflow-hidden relative transition-all duration-500",
    isPlaying ? "border-primary/30 animate-card-glow" : "border-primary/5"
  )

  const bgSpin = isPlaying ? "animate-cd-spin" : ""

  if (!currentSong) {
    return (
      <div className={cn(cardClasses, "p-6 text-center")}>
        <img src="/images/pasta.jpg" alt="" className={cn("absolute inset-0 w-full h-full object-cover", bgSpin)} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Disc3 className="w-8 h-8 text-white/60" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white/90 mb-1">Glamour's MUSIC</h3>
            <p className="text-sm text-white/60">Selecciona un tema para escuchar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(cardClasses, "p-5")}>
      <img src="/images/pasta.jpg" alt="" className={cn("absolute inset-0 w-full h-full object-cover", bgSpin)} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 backdrop-blur-[1px]" />
      <div className="relative z-10">
        {/* Info + Equalizer */}
        <div className="text-center mb-4 pt-2">
          <Equalizer active={isPlaying} className="justify-center mb-3" />
          <h3 className="font-display text-base font-bold text-white drop-shadow-lg">{currentSong.titulo}</h3>
          <p className="text-xs text-white/70 mt-0.5 drop-shadow">{currentSong.artista}</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/60 w-7 text-right font-mono">{fmt(progress)}</span>
          <div className="flex-1 relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group" onClick={handleSeek}>
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-highlight transition-all duration-100"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${duration ? (progress / duration) * 100 : 0}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>
          <span className="text-[10px] text-white/60 w-7 font-mono">{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 cursor-not-allowed">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={togglePlay}
            className="w-12 h-12 rounded-full gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 cursor-not-allowed">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-white/60 hover:text-white transition-colors shrink-0">
            {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-20 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={handleVolumeClick}>
            <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
