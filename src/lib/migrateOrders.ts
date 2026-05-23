import { db } from "@/lib/firebase"
import { collection, getDocs, setDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getOrders } from "@/store/ordersStore"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

export async function migrateOrdersToFirestore() {
  if (USE_MOCK) return

  if (!getAuth().currentUser) return

  const localOrders = getOrders()
  if (localOrders.length === 0) return

  try {
    const snapshot = await getDocs(collection(db, "orders"))
    const firestoreIds = new Set(snapshot.docs.map(d => d.id))

    for (const order of localOrders) {
      if (!firestoreIds.has(order.id)) {
        await setDoc(doc(db, "orders", order.id), order)
      }
    }
  } catch {
    // silencio — falla si no hay permisos
  }
}
