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
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).put(reader.result, songId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function loadAudioDataUrl(songId: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(songId)
    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result as string)
      } else {
        resolve(null)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",")
  const mime = parts[0].match(/:(.*?);/)?.[1] || "audio/mpeg"
  const binary = atob(parts[1])
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

export async function loadAudioBlob(songId: string): Promise<Blob | null> {
  const dataUrl = await loadAudioDataUrl(songId)
  if (!dataUrl) return null
  return dataUrlToBlob(dataUrl)
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
