import { useRef, useState, useEffect } from "react"
import { Music, Play, Pause, Volume2, VolumeX, X } from "lucide-react"

const TRACKS = ["/bg-music-1.mp3", "/bg-music-2.mp3", "/bg-music-3.mp3"]

function getRandomTrack(exclude?: string): string {
  const available = exclude ? TRACKS.filter(t => t !== exclude) : TRACKS
  return available[Math.floor(Math.random() * available.length)]
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showMini, setShowMini] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(() => getRandomTrack())

  useEffect(() => {
    setMounted(true)
    const wasShown = sessionStorage.getItem("musicPromptShown")
    if (wasShown) {
      setShowMini(true)
    }
  }, [])

  useEffect(() => {
    if (!started) return
    const audio = audioRef.current
    if (!audio) return
    audio.muted = false
    audio.play().catch(() => {})
    setPlaying(true)
    setShowMini(true)
    sessionStorage.setItem("musicPromptShown", "1")
  }, [started])

  const playNext = () => {
    const next = getRandomTrack(currentTrack)
    setCurrentTrack(next)
    if (audioRef.current) {
      audioRef.current.src = next
      audioRef.current.play().catch(() => {})
    }
  }

  const startMusic = () => {
    setStarted(true)
  }

  const dismiss = () => {
    setDismissed(true)
    setShowMini(true)
    sessionStorage.setItem("musicPromptShown", "1")
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !muted
    audioRef.current.muted = newMuted
    setMuted(newMuted)
  }

  if (!mounted || dismissed) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack}
        preload="metadata"
        onEnded={playNext}
      />

      {/* Modal de música */}
      {!started && !showMini && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

          <div className="relative bg-[#161627] border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl shadow-violet-500/10">
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/30">
              <Music className="h-10 w-10 text-white" />
            </div>

            <h3 className="font-display text-2xl font-bold text-white/90 mb-2">
              Glamours Música
            </h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Esta experiencia musical fue pensada para vos.<br />
              Activá la música para disfrutarla completa.
            </p>

            <button
              onClick={startMusic}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
            >
              Activá la música
            </button>

            <button
              onClick={dismiss}
              className="mt-3 text-xs text-muted-foreground hover:text-white/60 transition-colors"
            >
              No, gracias
            </button>
          </div>
        </div>
      )}

      {/* Mini reproductor */}
      {showMini && started && (
        <div
          className="fixed bottom-5 right-48 z-50 flex items-center gap-2 px-3 py-2.5 rounded-2xl glass-card border border-white/10 backdrop-blur-xl animate-fade-up"
          style={{ minWidth: 180 }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 shrink-0 shadow-lg shadow-violet-500/30">
            <Music className="h-3.5 w-3.5 text-white" />
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-all shrink-0"
            >
              {playing ? (
                <Pause className="h-3 w-3 text-white" />
              ) : (
                <Play className="h-3 w-3 text-white ml-0.5" />
              )}
            </button>

            <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: playing ? "100%" : "0%" }}
              />
            </div>

            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-all shrink-0"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5 text-white/50" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-white/80" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
