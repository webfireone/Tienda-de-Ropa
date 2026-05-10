import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import type { Promotion, Subscriber } from "@/types"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

function genId() { return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2) }

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      if (USE_MOCK) return []
      const q = query(collection(db, "promotions"), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion))
    },
  })
}

export function useSubscribers() {
  return useQuery({
    queryKey: ["subscribers"],
    queryFn: async (): Promise<Subscriber[]> => {
      if (USE_MOCK) return []
      const snap = await getDocs(collection(db, "subscribers"))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber))
    },
  })
}

export function useSavePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Promotion, "id" | "createdAt"> & { id?: string; createdAt?: string }) => {
      if (USE_MOCK) return
      const id = data.id || genId()
      const docData = {
        ...data,
        id,
        createdAt: data.createdAt || new Date().toISOString(),
      }
      await setDoc(doc(db, "promotions", id), docData)
      qc.invalidateQueries({ queryKey: ["promotions"] })
    },
  })
}

export function useDeletePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return
      await deleteDoc(doc(db, "promotions", id))
      qc.invalidateQueries({ queryKey: ["promotions"] })
    },
  })
}
