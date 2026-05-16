import { create } from "zustand"
import type { Cancion } from "@/types/music"

let audioEl: HTMLAudioElement | null = null

function setupAudioEvents(a: HTMLAudioElement, store: {
  setProgress: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (p: boolean) => void
  setAudioError: (e: string | null) => void
}) {
  a.preload = "metadata"
  a.addEventListener("timeupdate", () => {
    if (audioEl) store.setProgress(audioEl.currentTime)
  })
  a.addEventListener("loadedmetadata", () => {
    if (audioEl) store.setDuration(audioEl.duration)
  })
  a.addEventListener("ended", () => {
    store.setIsPlaying(false)
    store.setAudioError(null)
  })
  a.addEventListener("error", () => {
    const mediaErr = audioEl?.error
    const msg = mediaErr
      ? `Error ${mediaErr.code}: ${mediaErr.message}`
      : "Error al cargar el audio"
    console.warn("[audio] error event:", msg, "src:", audioEl?.src)
    store.setAudioError(msg)
    if (!a.paused) {
      store.setIsPlaying(false)
    }
  })
  a.addEventListener("canplay", () => {
    store.setAudioError(null)
  })
}

function initAudio(store: {
  setProgress: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (p: boolean) => void
  setAudioError: (e: string | null) => void
}) {
  if (!audioEl) {
    audioEl = new Audio()
    setupAudioEvents(audioEl, store)
  }
  return audioEl
}

function createNewAudio(store: {
  setProgress: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (p: boolean) => void
  setAudioError: (e: string | null) => void
}) {
  if (audioEl) {
    audioEl.pause()
    audioEl.src = ""
  }
  audioEl = new Audio()
  setupAudioEvents(audioEl, store)
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

      console.log("[musicStore] playSong:", song.titulo, "id:", song.id, "url:", song.archivoUrl)

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

      if (!song.archivoUrl) {
        set({ isPlaying: false, audioError: "URL de audio no disponible" })
        return
      }

      const el = createNewAudio(storeActions)
      el.volume = get().volume
      el.src = song.archivoUrl
      set({
        currentSong: song,
        isPlaying: true,
        progress: 0,
        duration: 0,
        isLiked: false,
        audioError: null,
        hasJustChanged: true,
      })
      el.play().then(() => {
        console.log("[musicStore] play OK:", song.titulo)
      }).catch((err: unknown) => {
        const name = err instanceof Error ? err.name : typeof err
        const urlPreview = el.src ? el.src.substring(0, 60) : "(empty)"
        console.error("[musicStore] play FAILED:", name, "src:", urlPreview, "songId:", song.id)
        set({ isPlaying: false, audioError: `Error (${name}): ${urlPreview}` })
      })
    },
  }
})
