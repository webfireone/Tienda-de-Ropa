const DB_NAME = "glamours_mock_store"
const STORE_NAME = "audio_files"
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveAudioFile(songId: string, file: File): Promise<void> {
  const db = await openDB()
  const buffer = await file.arrayBuffer()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(buffer, songId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadAudioBlob(songId: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(songId)
    req.onsuccess = () => {
      if (req.result) {
        resolve(new Blob([req.result], { type: "audio/mpeg" }))
      } else {
        resolve(null)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteAudioFile(songId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(songId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
