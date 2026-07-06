import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

export async function uploadAudio(songId: string, file: File, signal?: AbortSignal): Promise<string> {
  const storageRef = ref(storage, `music/${songId}.mp3`)

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file)

    if (signal) {
      signal.addEventListener("abort", () => {
        task.cancel()
        reject(new DOMException("Aborted", "AbortError"))
      }, { once: true })
    }

    task.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
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
