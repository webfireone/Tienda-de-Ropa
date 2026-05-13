import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import type { Product, Sale, GlobalParams, Order } from "@/types"
import { MOCK_PRODUCTS, MOCK_SALES, DEFAULT_PARAMS } from "@/lib/constants"
import { addOrder } from "./useOrders"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

function migrateProduct(data: Record<string, unknown>): Product {
  const hasOldSizes = "sizes" in data && data.sizes && typeof data.sizes === "object"
  const hasOldColors = "colors" in data && Array.isArray(data.colors) && data.colors.length > 0 && typeof data.colors[0] === "string"

  const migrated = { ...data } as Record<string, unknown>

  if ("cost" in migrated && !("previousPrice" in migrated)) {
    migrated.previousPrice = migrated.cost
    delete migrated.cost
  }

  if (hasOldSizes && hasOldColors) {
    const oldSizes = migrated.sizes as Record<string, number>
    const oldColors = migrated.colors as string[]
    return {
      ...migrated as unknown as Product,
      gender: (migrated.gender as Product["gender"]) || "unisex",
      colors: oldColors.map(name => ({
        name,
        sizes: { ...oldSizes },
      })),
    }
  }
  return {
    ...migrated as unknown as Product,
    gender: (migrated.gender as Product["gender"]) || "unisex",
  }
}

async function fetchCollection<T>(path: string, fallback: T[]): Promise<T[]> {
  if (USE_MOCK) return fallback
  try {
    const snapshot = await getDocs(collection(db, path))
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
    if (path === "products") {
      return (items as unknown as Record<string, unknown>[]).map(migrateProduct) as T[]
    }
    return items
  } catch {
    return fallback
  }
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetchCollection<Product>("products", MOCK_PRODUCTS),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProduct(id: string | undefined) {
  const { data: products = [] } = useProducts()
  return products.find(p => p.id === id)
}

export function useSaveProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (product: Product) => {
      if (USE_MOCK) return product
      await setDoc(doc(db, "products", product.id), product)
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return id
      await deleteDoc(doc(db, "products", id))
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (order: Order) => {
      addOrder(order)
      try {
        if (USE_MOCK) {
          await new Promise(r => setTimeout(r, 800))
          return order
        }
        await setDoc(doc(db, "orders", order.id), order)
        return order
      } catch (err) {
        console.warn("Firestore no disponible, guardando localmente:", err)
        await new Promise(r => setTimeout(r, 800))
        return order
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales"] })
    },
  })
}

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: () => fetchCollection<Sale>("sales", MOCK_SALES),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGlobalParams() {
  return useQuery({
    queryKey: ["globalParams"],
    queryFn: () => fetchCollection<GlobalParams>("config", [DEFAULT_PARAMS]).then(r => r[0] || DEFAULT_PARAMS),
    staleTime: 10 * 60 * 1000,
  })
}
