import { useEffect, useRef, useCallback } from "react"
import { useCanciones, useRegistrarReproduccion } from "@/hooks/useMusic"
import { useMusicStore } from "@/store/musicStore"
import { MusicSection } from "@/components/music/MusicSection"
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Music } from "lucide-react"
import { cn } from "@/lib/utils"

export function MusicPage() {
  const { data: canciones = [] } = useCanciones()
  const activeSongs = canciones.filter(c => c.activo)

  const store = useMusicStore()
  const setPlaylist = store.setPlaylist

  useEffect(() => {
    if (activeSongs.length > 0) {
      setPlaylist(activeSongs)
    }
  }, [activeSongs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    currentSong, isPlaying, progress, duration, volume, shuffle,
    setVolume, togglePlay, seek, playNext, playPrevious, toggleShuffle,
  } = store

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

  const coverUrl = currentSong?.portadaUrl || ""
  const songTitle = currentSong?.titulo || ""
  const songArtist = currentSong?.artista || ""

  return (
    <div className="relative min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Blurred background */}
        <div className="absolute inset-0 transition-all duration-1000">
          {coverUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${coverUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]" />
          )}
          <div className="absolute inset-0 backdrop-blur-[80px] bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-20">
          {currentSong ? (
            <>
              {/* Cover Art */}
              <div className="relative mb-8">
                <div className={cn(
                  "w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-700",
                  isPlaying && "shadow-[0_0_60px_rgba(124,92,252,0.15)]"
                )}>
                  <img
                    src={coverUrl}
                    alt={songTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isPlaying && (
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-highlight/5 to-transparent blur-2xl -z-10" />
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light text-white mb-3 tracking-tight">
                {songTitle}
              </h1>

              {/* Artist */}
              <p className="text-lg sm:text-xl text-white/70 font-light">
                {songArtist}
              </p>

              {/* Big Play Button */}
              <button
                onClick={togglePlay}
                className="mt-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-7 h-7 sm:w-8 sm:h-8" /> : <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />}
              </button>
            </>
          ) : (
            <>
              {/* Empty State */}
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Music className="w-10 h-10 text-white/60" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light text-white mb-3">
                Glamour's MUSIC
              </h1>
              <p className="text-lg text-white/50">
                Seleccioná un tema para escuchar
              </p>
              <div className="mt-8 flex items-center gap-2 text-white/30 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                <span>{activeSongs.length} canciones disponibles</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Content Section (Song List + Ranking) */}
      {activeSongs.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-32 -mt-20">
          <MusicSection canciones={activeSongs} />
        </section>
      )}

      {/* Sticky Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Progress bar (top of the bar) */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--color-primary), var(--color-highlight))"
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Left: Cover + Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 ring-1 ring-white/10">
                {coverUrl ? (
                  <img src={coverUrl} alt={songTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-4 h-4 text-white/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentSong ? songTitle : "Glamour's MUSIC"}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {currentSong ? songArtist : `${activeSongs.length} canciones`}
                </p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleShuffle}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                  shuffle
                    ? "text-primary"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={playPrevious}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white/80 transition-all shrink-0"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={currentSong ? togglePlay : undefined}
                disabled={!currentSong}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shrink-0",
                  currentSong
                    ? "gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                    : "bg-white/10 text-white/30"
                )}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={playNext}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white/80 transition-all shrink-0"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Time + Volume */}
            <div className="hidden sm:flex items-center gap-3 flex-1 justify-end">
              <span className="text-xs text-white/40 font-mono tabular-nums shrink-0">
                {fmt(progress)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                  className="text-white/40 hover:text-white/70 transition-colors shrink-0"
                >
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <div
                  className="w-20 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                  onClick={handleVolumeClick}
                >
                  <div
                    className="h-full rounded-full bg-white/30 group-hover:bg-white/50 transition-all"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sticky player */}
      <div className="h-20" />
    </div>
  )
}
