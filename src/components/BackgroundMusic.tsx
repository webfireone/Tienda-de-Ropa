import { useRef, useState, useEffect } from "react"
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {
        setMuted(true)
        audioRef.current?.play().catch(() => {})
      })
      setPlaying(true)
      setMuted(false)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !muted
    audioRef.current.muted = newMuted
    setMuted(newMuted)
    if (newMuted && playing) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <audio
        ref={audioRef}
        src="/bg-music.mp3"
        loop
        preload="metadata"
      />

      <div
        className="fixed bottom-5 right-48 z-50 flex items-center gap-2 px-3 py-2.5 rounded-2xl glass-card border border-white/10 backdrop-blur-xl"
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
    </>
  )
}
