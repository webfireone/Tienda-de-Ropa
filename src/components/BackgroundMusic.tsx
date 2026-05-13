import { useRef, useState, useEffect } from "react"
import { Music, Play, Pause, Volume2, VolumeX, X } from "lucide-react"

const TRACKS = ["/bg-music-1.mp3", "/bg-music-2.mp3"]

function getRandomTrack(exclude?: string): string {
  const available = exclude ? TRACKS.filter(t => t !== exclude) : TRACKS
  return available[Math.floor(Math.random() * available.length)]
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(() => getRandomTrack())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!started) return
    const audio = audioRef.current
    if (!audio) return
    audio.muted = false
    audio.play().catch(() => {})
    setPlaying(true)
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

  if (!mounted) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack}
        preload="metadata"
        onEnded={playNext}
      />

      {/* Modal de música */}
      {!started && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {}} />

          <div className="relative bg-[#161627] border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl shadow-violet-500/10">
            <button
              onClick={() => {}}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 cursor-default"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/30">
              <Music className="h-10 w-10 text-white" />
            </div>

            <h3 className="font-display text-2xl font-bold text-white/90 mb-2">
              Glamours MODA & MUSICA
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Esta experiencia musical que también es una Moda.
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Activá la música para disfrutarla completa.
            </p>

            <button
              onClick={startMusic}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
            >
              Activá la música
            </button>
          </div>
        </div>
      )}

      {/* Mini reproductor */}
      {started && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-1 py-1 pr-3 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(236,72,153,0.1))",
            boxShadow: "0 8px 32px rgba(124,92,252,0.2)",
          }}
        >
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 hover:opacity-90 transition-all shrink-0 shadow-lg shadow-violet-500/30"
          >
            {playing ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-500"
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
