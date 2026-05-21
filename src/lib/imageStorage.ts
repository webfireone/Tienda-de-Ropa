const MAX_WIDTH = 800
const MAX_HEIGHT = 800
const QUALITY = 0.7

export async function uploadProductImage(_productId: string, file: File): Promise<string> {
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

      const dataUrl = canvas.toDataURL("image/jpeg", QUALITY)
      resolve(dataUrl)
    }
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"))
    img.src = URL.createObjectURL(file)
  })
}
