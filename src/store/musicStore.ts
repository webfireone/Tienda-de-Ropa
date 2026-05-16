import { create } from "zustand"
import type { Cancion } from "@/types/music"

// Audio element persistente a nivel de módulo
let audioEl: HTMLAudioElement | null = null

function initAudio(store: {
  setProgress: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (p: boolean) => void
  setAudioError: (e: string | null) => void
}) {
  if (audioEl) return audioEl
  audioEl = new Audio()
  audioEl.preload = "metadata"

  audioEl.addEventListener("timeupdate", () => {
    if (audioEl) store.setProgress(audioEl.currentTime)
  })
  audioEl.addEventListener("loadedmetadata", () => {
    if (audioEl) store.setDuration(audioEl.duration)
  })
  audioEl.addEventListener("ended", () => {
    store.setIsPlaying(false)
  })
  audioEl.addEventListener("error", () => {
    console.warn("Audio error:", audioEl?.src)
    store.setAudioError("Error al cargar el audio")
    store.setIsPlaying(false)
  })
  return audioEl
}

interface MusicStore {
  currentSong: Cancion | null
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  isLiked: boolean
  audioError: string | null
  hasJustChanged: boolean

  setCurrentSong: (song: Cancion | null) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setIsLiked: (liked: boolean) => void
  setAudioError: (error: string | null) => void
  togglePlay: () => void
  seek: (value: number) => void
  playSong: (song: Cancion) => void
}

export const useMusicStore = create<MusicStore>((set, get) => {
  const storeActions = {
    setProgress: (p: number) => set({ progress: p }),
    setDuration: (d: number) => set({ duration: d }),
    setIsPlaying: (p: boolean) => set({ isPlaying: p }),
    setAudioError: (e: string | null) => set({ audioError: e }),
  }

  return {
    currentSong: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.7,
    isLiked: false,
    audioError: null,
    hasJustChanged: false,

    setCurrentSong: (song) => set({ currentSong: song }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => {
      set({ volume })
      if (audioEl) audioEl.volume = volume
    },
    setIsLiked: (liked) => set({ isLiked: liked }),
    setAudioError: (error) => set({ audioError: error }),

    togglePlay: () => {
      const { isPlaying } = get()
      const a = initAudio(storeActions)
      if (isPlaying) {
        a.pause()
      } else {
        a.play().catch(() => set({ isPlaying: false, audioError: "Error al reproducir" }))
      }
    },

    seek: (value) => {
      set({ progress: value })
      if (audioEl) audioEl.currentTime = value
    },

    playSong: (song) => {
      const wasSame = song.id === get().currentSong?.id
      const a = initAudio(storeActions)

      console.log("[musicStore] playSong:", song.titulo, "url:", song.archivoUrl?.slice(0, 80))

      if (wasSame) {
        if (get().isPlaying) {
          a.pause()
        } else {
          a.play().catch((err) => {
            console.warn("[musicStore] resume failed:", err)
            set({ isPlaying: false, audioError: "Error al reproducir" })
          })
        }
        return
      }

      a.src = song.archivoUrl || ""
      a.volume = get().volume
      set({
        currentSong: song,
        isPlaying: true,
        progress: 0,
        duration: 0,
        isLiked: false,
        audioError: null,
        hasJustChanged: true,
      })

      a.play().catch((err) => {
        console.error("[musicStore] play failed:", err, "src:", a.src)
        set({ isPlaying: false, audioError: "Error al reproducir el audio" })
      })
    },
  }
})
