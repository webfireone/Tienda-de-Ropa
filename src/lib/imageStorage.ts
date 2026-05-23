import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

const MAX_WIDTH = 600
const MAX_HEIGHT = 600
const QUALITY = 0.6

async function resizeImage(file: File, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT, quality = QUALITY): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("No se pudo comprimir la imagen"))
        },
        "image/jpeg",
        quality
      )
    }
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"))
    img.src = URL.createObjectURL(file)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function tryUploadOrDataUrl(imageId: string, file: File): Promise<string> {
  const blob = await resizeImage(file)
  const dataUrl = await blobToDataUrl(blob)

  if (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key") {
    return dataUrl
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 15_000)
    )
    const storageRef = ref(storage, `products/${imageId}.jpg`)
    await Promise.race([uploadBytes(storageRef, blob), timeout])
    return getDownloadURL(storageRef)
  } catch {
    return dataUrl
  }
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  return tryUploadOrDataUrl(productId, file)
}

export async function uploadImageFile(imageId: string, file: File): Promise<string> {
  return tryUploadOrDataUrl(imageId, file)
}

export async function uploadDataUrlImage(imageId: string, dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const file = new File([blob], `${imageId}.jpg`, { type: "image/jpeg" })
  return tryUploadOrDataUrl(imageId, file)
}
