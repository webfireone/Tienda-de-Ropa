import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import type { Cancion, Reproduccion, LikeCancion, MonthlyRankingEntry } from "@/types/music"
import { MOCK_SONGS } from "@/types/music"
import { useAuth } from "@/context/AuthContext"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getCurrentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function isCurrentMonth(dateStr: string): boolean {
  const monthKey = dateStr.slice(0, 7)
  return monthKey === getCurrentMonthKey()
}

async function fetchMusicCollection<T>(path: string, fallback: T[]): Promise<T[]> {
  if (USE_MOCK) return fallback
  try {
    const snapshot = await getDocs(collection(db, path))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
  } catch {
    return fallback
  }
}

export function useCanciones() {
  return useQuery({
    queryKey: ["music", "canciones"],
    queryFn: () => fetchMusicCollection<Cancion>("music/songs", MOCK_SONGS),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCancion(id: string | undefined) {
  const { data: canciones = [] } = useCanciones()
  return canciones.find(c => c.id === id)
}

export function useSaveCancion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cancion: Cancion) => {
      if (USE_MOCK) return cancion
      await setDoc(doc(db, "music/songs", cancion.id), cancion)
      return cancion
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "canciones"] })
    },
  })
}

export function useDeleteCancion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return id
      await deleteDoc(doc(db, "music/songs", id))
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "canciones"] })
    },
  })
}

export function useReproducciones() {
  return useQuery({
    queryKey: ["music", "reproducciones"],
    queryFn: () => fetchMusicCollection<Reproduccion>("music/plays", []),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRegistrarReproduccion() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (cancionId: string) => {
      const play: Reproduccion = {
        id: generateId(),
        cancionId,
        usuarioId: user?.uid ?? null,
        fechaReproduccion: new Date().toISOString(),
      }
      if (!USE_MOCK) {
        await setDoc(doc(db, "music/plays", play.id), play)
      }
      return play
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "reproducciones"] })
    },
  })
}

export function useLikes() {
  return useQuery({
    queryKey: ["music", "likes"],
    queryFn: () => fetchMusicCollection<LikeCancion>("music/likes", []),
    staleTime: 5 * 60 * 1000,
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (cancionId: string) => {
      const existingLikeId = `${cancionId}_${user?.uid}`
      if (!USE_MOCK) {
        const existingDoc = await getDoc(doc(db, "music/likes", existingLikeId))
        if (existingDoc.exists()) {
          await deleteDoc(doc(db, "music/likes", existingLikeId))
          return { cancionId, liked: false }
        }
        await setDoc(doc(db, "music/likes", existingLikeId), {
          cancionId,
          usuarioId: user?.uid ?? "",
          fechaLike: new Date().toISOString(),
        })
        return { cancionId, liked: true }
      }
      return { cancionId, liked: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "likes"] })
    },
  })
}

export function useMonthlyRanking(): MonthlyRankingEntry[] {
  const { data: canciones = [] } = useCanciones()
  const { data: reproducciones = [] } = useReproducciones()
  const { data: likes = [] } = useLikes()

  const monthPlays = reproducciones.filter(r => isCurrentMonth(r.fechaReproduccion))
  const monthLikes = likes.filter(l => isCurrentMonth(l.fechaLike))

  const playsBySong: Record<string, number> = {}
  monthPlays.forEach(p => {
    playsBySong[p.cancionId] = (playsBySong[p.cancionId] || 0) + 1
  })

  const likesBySong: Record<string, number> = {}
  monthLikes.forEach(l => {
    likesBySong[l.cancionId] = (likesBySong[l.cancionId] || 0) + 1
  })

  const allIds = new Set([...Object.keys(playsBySong), ...Object.keys(likesBySong), ...canciones.filter(c => c.activo).map(c => c.id)])

  const ranked = Array.from(allIds)
    .map(id => {
      const cancion = canciones.find(c => c.id === id)
      const reproducciones = playsBySong[id] || 0
      const likes = likesBySong[id] || 0
      const puntaje = (likes * 2) + reproducciones
      return {
        posicion: 0,
        cancionId: id,
        titulo: cancion?.titulo ?? "Desconocido",
        artista: cancion?.artista ?? "",
        portadaUrl: cancion?.portadaUrl ?? "",
        puntaje,
        likes,
        reproducciones,
      }
    })
    .filter(e => e.puntaje > 0 || canciones.find(c => c.id === e.cancionId)?.activo)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 5)
    .map((entry, i) => ({ ...entry, posicion: i + 1 }))

  return ranked
}

export function useUserLikedSongs() {
  const { data: likes = [] } = useLikes()
  const { user } = useAuth()
  if (!user) return new Set<string>()
  return new Set(likes.filter(l => l.usuarioId === user.uid).map(l => l.cancionId))
}

export function useSongStats(cancionId: string) {
  const { data: reproducciones = [] } = useReproducciones()
  const { data: likes = [] } = useLikes()

  const totalPlays = reproducciones.filter(r => r.cancionId === cancionId).length
  const monthPlays = reproducciones.filter(r => r.cancionId === cancionId && isCurrentMonth(r.fechaReproduccion)).length
  const totalLikes = likes.filter(l => l.cancionId === cancionId).length
  const monthLikes = likes.filter(l => l.cancionId === cancionId && isCurrentMonth(l.fechaLike)).length

  return { totalPlays, monthPlays, totalLikes, monthLikes }
}
