import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateGenderField() {
  const snapshot = await getDocs(collection(db, "products"))
  const batch = writeBatch(db)
  let count = 0

  snapshot.forEach(docSnap => {
    const data = docSnap.data()
    if (!("gender" in data) || !data.gender) {
      batch.update(doc(db, "products", docSnap.id), { gender: "unisex" })
      count++
    }
  })

  await batch.commit()
  console.log(`Migración completa: ${count} productos actualizados con gender: "unisex"`)
}

migrateGenderField().catch(console.error)
