import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

const MAX_WIDTH = 800
const MAX_HEIGHT = 800
const QUALITY = 0.7

function isMockMode(): boolean {
  return !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"
}

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
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
        QUALITY
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

async function uploadBlob(storagePath: string, blob: Blob): Promise<string> {
  const storageRef = ref(storage, storagePath)
  await uploadBytes(storageRef, blob)
  return getDownloadURL(storageRef)
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const blob = await resizeImage(file)

  if (isMockMode()) {
    return blobToDataUrl(blob)
  }

  return uploadBlob(`products/${productId}.jpg`, blob)
}

export async function uploadImageFile(imageId: string, file: File): Promise<string> {
  const blob = await resizeImage(file)

  if (isMockMode()) {
    return blobToDataUrl(blob)
  }

  return uploadBlob(`products/${imageId}.jpg`, blob)
}

export async function uploadDataUrlImage(imageId: string, dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const file = new File([blob], `${imageId}.jpg`, { type: "image/jpeg" })
  return uploadImageFile(imageId, file)
}
