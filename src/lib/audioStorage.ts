import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

export async function uploadAudio(songId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `music/${songId}.mp3`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteAudio(songId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `music/${songId}.mp3`)
    await deleteObject(storageRef)
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && (err as any).code === "storage/object-not-found") return
    throw err
  }
}
