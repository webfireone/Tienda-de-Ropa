import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore"
import type { Cancion, Reproduccion, LikeCancion, MonthlyRankingEntry } from "@/types/music"
import { MOCK_SONGS } from "@/types/music"
import { useAuth } from "@/context/AuthContext"
import { loadAudioBlob, deleteAudioFile } from "@/lib/mockStorage"
import { deleteAudio } from "@/lib/audioStorage"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const MOCK_STORAGE_KEY = "glamours_mock_canciones"
function loadMockCanciones(): Cancion[] {
  try {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return MOCK_SONGS.map(c => ({ ...c }))
}
function saveMockCanciones(canciones: Cancion[]) {
  try {
    const sanitized = canciones.map(c => ({
      ...c,
      archivoUrl: c.archivoUrl.startsWith("data:") ? "" : c.archivoUrl,
    }))
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(sanitized))
  } catch { /* ignore */ }
}

let mockCanciones: Cancion[] | null = null
let mockInitPromise: Promise<void> | null = null

async function ensureMockInit(): Promise<void> {
  if (mockCanciones !== null) { console.log("[ensureMockInit] already initialized, count:", mockCanciones.length); return }
  if (mockInitPromise) return mockInitPromise

  mockInitPromise = (async () => {
    const raw = loadMockCanciones()
    const result: Cancion[] = []
    for (const c of raw) {
      const original = MOCK_SONGS.find(m => m.id === c.id)
      if (original) {
        result.push({ ...original })
        continue
      }
      if (c.archivoUrl && !c.archivoUrl.startsWith("blob:") && !c.archivoUrl.startsWith("data:")) {
        result.push(c)
        continue
      }
      try {
        const blob = await loadAudioBlob(c.id)
        if (blob) {
          const dataUrl = await blobToDataUrl(blob)
          result.push({ ...c, archivoUrl: dataUrl })
          continue
        }
      } catch { /* ignore */ }
    }
    mockCanciones = result
    saveMockCanciones(mockCanciones)
  })()

  return mockInitPromise
}

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
  if (USE_MOCK) {
    if (path === "music_songs") {
      await ensureMockInit()
      return (mockCanciones ?? []) as unknown as T[]
    }
    return fallback
  }
  try {
    const snapshot = await getDocs(collection(db, path))
    const firestoreDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
    if (path === "music_songs") {
      const active = (firestoreDocs as unknown as Cancion[]).filter(s => !(s as any).deleted)
      if (active.length === 0) {
        const seeded = await getDoc(doc(db, "_meta", "music_seeded"))
        if (!seeded.exists()) {
          await setDoc(doc(db, "_meta", "music_seeded"), { seeded: true, seededAt: new Date().toISOString() })
          for (const s of MOCK_SONGS) {
            await setDoc(doc(db, "music_songs", s.id), s)
          }
          const seededSnapshot = await getDocs(collection(db, path))
          return seededSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as T[]
        }
        return [] as unknown as T[]
      }
      return active as unknown as T[]
    }
    return firestoreDocs.length > 0 ? firestoreDocs : fallback
  } catch {
    return fallback
  }
}

export function useCanciones() {
  return useQuery({
    queryKey: ["music", "canciones"],
    queryFn: async () => {
      const songs = await fetchMusicCollection<Cancion>("music_songs", MOCK_SONGS)
      for (const song of songs) {
        if (!song.archivoUrl) {
          try {
            const blob = await loadAudioBlob(song.id)
            if (blob) {
              song.archivoUrl = await blobToDataUrl(blob)
            }
          } catch { /* ignore */ }
        }
      }
      return songs
    },
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
      if (USE_MOCK) {
        mockCanciones = null
        mockInitPromise = null
        await ensureMockInit()
        const idx = mockCanciones!.findIndex(c => c.id === cancion.id)
        if (idx >= 0) {
          mockCanciones![idx] = cancion
        } else {
          mockCanciones!.push(cancion)
        }
        saveMockCanciones(mockCanciones!)
        return cancion
      }
      await setDoc(doc(db, "music_songs", cancion.id), cancion)
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
      if (USE_MOCK) {
        await ensureMockInit()
        mockCanciones = mockCanciones!.filter(c => c.id !== id)
        saveMockCanciones(mockCanciones)
        try { await deleteAudioFile(id) } catch { /* ignore */ }
        return id
      }
      try {
        await updateDoc(doc(db, "music_songs", id), { deleted: true, _deletedAt: new Date().toISOString() })
      } catch (err) {
        if ((err as any)?.code === "not-found") {
          await setDoc(doc(db, "music_songs", id), { deleted: true, _deletedAt: new Date().toISOString() })
        } else {
          throw err
        }
      }
      try { await deleteAudio(id) } catch { /* ignore */ }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "canciones"] })
    },
    onError: (err) => {
      console.error("[useDeleteCancion] Error details:", err)
    },
  })
}

export function useResetMusicCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK) return 0
      const snapshot = await getDocs(collection(db, "music_songs"))
      const docs = snapshot.docs
      for (const d of docs) {
        await deleteDoc(doc(db, "music_songs", d.id))
        try { await deleteAudio(d.id) } catch { /* ignore */ }
      }
      await setDoc(doc(db, "_meta", "music_seeded"), { seeded: true, resetAt: new Date().toISOString() })
      return docs.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music", "canciones"] })
    },
    onError: (err) => {
      console.error("[useResetMusicCollection] Error:", err)
    },
  })
}

export function useReproducciones() {
  return useQuery({
    queryKey: ["music", "reproducciones"],
    queryFn: () => fetchMusicCollection<Reproduccion>("music_plays", []),
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
        await setDoc(doc(db, "music_plays", play.id), play)
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
    queryFn: () => fetchMusicCollection<LikeCancion>("music_likes", []),
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
        const existingDoc = await getDoc(doc(db, "music_likes", existingLikeId))
        if (existingDoc.exists()) {
          await deleteDoc(doc(db, "music_likes", existingLikeId))
          return { cancionId, liked: false }
        }
        await setDoc(doc(db, "music_likes", existingLikeId), {
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
