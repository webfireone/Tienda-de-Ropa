import { create } from "zustand"
import type { Cancion } from "@/types/music"

let audioEl: HTMLAudioElement | null = null

let _playThresholdCb: ((songId: string) => void) | null = null
let _lastRegisteredSong = ""

export function setPlayThresholdCb(cb: (songId: string) => void) {
  _playThresholdCb = cb
}

type StoreCallbacks = {
  setProgress: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (p: boolean) => void
  setAudioError: (e: string | null) => void
  onEnded: () => void
  setPlayRegistered: (v: boolean) => void
}

function setupAudioEvents(a: HTMLAudioElement, store: StoreCallbacks) {
  a.preload = "metadata"
  a.addEventListener("timeupdate", () => {
    if (!audioEl) return
    store.setProgress(audioEl.currentTime)
    const songId = audioEl.dataset.songId
    if (songId && audioEl.currentTime >= 10 && _lastRegisteredSong !== songId) {
    _lastRegisteredSong = songId
    store.setPlayRegistered(true)
    _playThresholdCb?.(songId)
    }
  })
  a.addEventListener("loadedmetadata", () => {
    if (audioEl) store.setDuration(audioEl.duration)
  })
  a.addEventListener("ended", () => {
    store.onEnded()
  })
  a.addEventListener("error", () => {
    const mediaErr = audioEl?.error
    const msg = mediaErr
      ? `Error ${mediaErr.code}: ${mediaErr.message}`
      : "Error al cargar el audio"
    store.setAudioError(msg)
    if (!a.paused) {
      store.setIsPlaying(false)
    }
  })
  a.addEventListener("canplay", () => {
    store.setAudioError(null)
  })
}

function initAudio(store: StoreCallbacks) {
  if (!audioEl) {
    audioEl = new Audio()
    setupAudioEvents(audioEl, store)
  }
  return audioEl
}

function createNewAudio(store: StoreCallbacks) {
  if (audioEl) {
    audioEl.pause()
    audioEl.src = ""
  }
  audioEl = new Audio()
  setupAudioEvents(audioEl, store)
  return audioEl
}

function playNewSong(song: Cancion, storeCallbacks: StoreCallbacks, get: () => MusicStore, set: (s: Partial<MusicStore>) => void) {
  if (!song.archivoUrl) {
    set({ isPlaying: false, audioError: "URL de audio no disponible" })
    return
  }
  _lastRegisteredSong = ""
  const el = createNewAudio(storeCallbacks)
  el.dataset.songId = song.id
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
    playRegistered: false,
  })
  el.play().catch(() => {
    set({ isPlaying: false, audioError: "Error al reproducir" })
  })
}

interface MusicStore {
  currentSong: Cancion | null
  playlist: Cancion[]
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  isLiked: boolean
  audioError: string | null
  hasJustChanged: boolean
  shuffle: boolean
  playRegistered: boolean

  setCurrentSong: (song: Cancion | null) => void
  setPlaylist: (songs: Cancion[]) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setIsLiked: (liked: boolean) => void
  setAudioError: (error: string | null) => void
  togglePlay: () => void
  toggleShuffle: () => void
  seek: (value: number) => void
  playSong: (song: Cancion) => void
  playNext: () => void
  playPrevious: () => void
}

export const useMusicStore = create<MusicStore>((set, get) => {
  const storeActions: StoreCallbacks = {
    setProgress: (p: number) => set({ progress: p }),
    setDuration: (d: number) => set({ duration: d }),
    setIsPlaying: (p: boolean) => set({ isPlaying: p }),
    setAudioError: (e: string | null) => set({ audioError: e }),
    setPlayRegistered: (v: boolean) => set({ playRegistered: v }),
    onEnded: () => {
      // Auto-play next song when current ends
      const { playlist, currentSong, shuffle } = get()
      if (playlist.length > 1) {
        const idx = playlist.findIndex(s => s.id === currentSong?.id)
        let nextIdx: number
        if (shuffle) {
          do { nextIdx = Math.floor(Math.random() * playlist.length) } while (nextIdx === idx)
        } else {
          nextIdx = (idx + 1) % playlist.length
        }
        const nextSong = playlist[nextIdx]
        if (nextSong?.archivoUrl) {
          playNewSong(nextSong, storeActions, get, set)
          return
        }
      }
      set({ isPlaying: false, audioError: null })
    },
  }

  return {
    currentSong: null,
    playlist: [],
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.7,
    isLiked: false,
    audioError: null,
    hasJustChanged: false,
    shuffle: false,
    playRegistered: false,

    setCurrentSong: (song) => set({ currentSong: song }),
    setPlaylist: (songs) => set({ playlist: songs }),
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
        set({ isPlaying: false })
      } else {
        set({ isPlaying: true })
        a.play().catch(() => set({ isPlaying: false, audioError: "Error al reproducir" }))
      }
    },

    toggleShuffle: () => set({ shuffle: !get().shuffle }),

    seek: (value) => {
      set({ progress: value })
      if (audioEl) audioEl.currentTime = value
    },

    playSong: (song) => {
      const wasSame = song.id === get().currentSong?.id
      const a = initAudio(storeActions)

      if (wasSame) {
        if (get().isPlaying) {
          a.pause()
          set({ isPlaying: false })
        } else {
          set({ isPlaying: true })
          a.play().catch(() => {
            set({ isPlaying: false, audioError: "Error al reproducir" })
          })
        }
        return
      }

      playNewSong(song, storeActions, get, set)
    },

    playNext: () => {
      const { playlist, currentSong, shuffle } = get()
      if (playlist.length === 0) return
      const idx = playlist.findIndex(s => s.id === currentSong?.id)
      let nextIdx: number
      if (shuffle) {
        do { nextIdx = Math.floor(Math.random() * playlist.length) } while (nextIdx === idx && playlist.length > 1)
      } else {
        nextIdx = (idx + 1) % playlist.length
      }
      playNewSong(playlist[nextIdx], storeActions, get, set)
    },

    playPrevious: () => {
      const { playlist, currentSong, progress } = get()
      if (playlist.length === 0) return
      // If more than 3 seconds in, restart current song
      if (progress > 3) {
        if (audioEl) { audioEl.currentTime = 0; set({ progress: 0 }) }
        return
      }
      const idx = playlist.findIndex(s => s.id === currentSong?.id)
      const prevIdx = idx <= 0 ? playlist.length - 1 : idx - 1
      playNewSong(playlist[prevIdx], storeActions, get, set)
    },
  }
})
