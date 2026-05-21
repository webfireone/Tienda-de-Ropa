import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `products/images/${productId}-${Date.now()}.${ext}`
  const storageRef = ref(storage, fileName)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
