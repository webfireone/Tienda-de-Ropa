import { create } from "zustand"
import type { Cancion } from "@/types/music"

interface MusicStore {
  currentSong: Cancion | null
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  isLiked: boolean

  setCurrentSong: (song: Cancion | null) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setIsLiked: (liked: boolean) => void
  togglePlay: () => void
  seek: (value: number) => void
  playSong: (song: Cancion) => void
}

export const useMusicStore = create<MusicStore>((set) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.7,
  isLiked: false,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setIsLiked: (liked) => set({ isLiked: liked }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (value) => set({ progress: value }),

  playSong: (song) => {
    const wasSame = song.id === useMusicStore.getState().currentSong?.id
    if (wasSame) {
      set((s) => ({ isPlaying: !s.isPlaying }))
    } else {
      set({ currentSong: song, isPlaying: true, progress: 0, isLiked: false })
    }
  },
}))
