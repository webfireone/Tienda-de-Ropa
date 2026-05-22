import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import type { ImportResult, Product } from "@/types"
import { useSaveProduct } from "@/hooks/useFirestore"
import { SIZES } from "@/types"

export function ImportDialog() {
  const { isAdmin } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [localImages, setLocalImages] = useState<{ name: string; dataUrl: string }[]>([])
  const saveProduct = useSaveProduct()

  const handleImageFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const readers: Promise<{ name: string; dataUrl: string }>[] = []
    for (const file of files) {
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve({ name: file.name, dataUrl: reader.result as string })
          reader.readAsDataURL(file)
        })
      )
    }
    Promise.all(readers).then(setLocalImages)
  }, [])

  const getImageUrl = useCallback((path: string): string => {
    if (!path) return ""
    const isLocalPath = /^[a-zA-Z]:\\/.test(path) || path.startsWith("/") || path.startsWith("..") || path.startsWith("./")
    if (!isLocalPath) return path
    const filename = path.split(/[/\\]/).pop()?.toLowerCase() || ""
    if (!filename) return path
    const match = localImages.find(img => img.name.toLowerCase() === filename)
    return match ? match.dataUrl : path
  }, [localImages])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)

    try {
      let data: Record<string, string>[] = []

      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        const parsed = Papa.parse<Record<string, string>>(text, { header: true })
        data = parsed.data
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buf = await file.arrayBuffer()
        const workbook = XLSX.read(buf, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)
      } else {
        setResult({ success: false, imported: 0, errors: ["Formato no soportado. Usá CSV o XLSX."] })
        return
      }
      const errors: string[] = []
      let imported = 0
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        
        const name = String(row["Nombre"] ?? row["name"] ?? "")
        const brand = String(row["Marca"] ?? row["brand"] ?? "")
        const category = String(row["Categoría"] ?? row["category"] ?? "")
        const priceStr = String(row["Precio"] ?? row["price"] ?? "")

        const missing: string[] = []
        if (!name) missing.push("Nombre")
        if (!brand) missing.push("Marca")
        if (!category) missing.push("Categoría")
        if (!priceStr) missing.push("Precio")

        if (missing.length > 0) {
          errors.push(`Fila ${i + 1}: faltan campos requeridos (${missing.join(", ")})`)
          continue
        }

        try {
          const sizes: Record<string, number> = {}
          SIZES.forEach(s => { sizes[s] = parseInt(String(row[s] ?? "")) || 0 })

          let colors: { name: string; sizes: Record<string, number> }[]
          const colorsField = String(row["Colores"] ?? row["colors"] ?? "")
          try {
            colors = JSON.parse(colorsField)
          } catch {
            colors = colorsField
              .split(",")
              .map(c => c.trim())
              .filter(Boolean)
              .map(name => ({ name, sizes: { ...sizes } }))
          }

          const rawGender = String(row["Género"] ?? row["gender"] ?? "unisex").toLowerCase().trim()
          const gender = rawGender.includes("hom") ? "hombre" :
                         rawGender.includes("muj") ? "mujer" :
                         rawGender.includes("niñ") || rawGender.includes("nin") ? "niños" :
                         rawGender.includes("beb") ? "bebes" : "unisex"

          const rawStatus = String(row["Estado"] ?? row["status"] ?? "active").toLowerCase().trim()
          const status = rawStatus === "activo" || rawStatus === "active" ? "active" :
                         rawStatus === "borrador" || rawStatus === "draft" ? "draft" :
                         rawStatus === "archivado" || rawStatus === "archived" ? "archived" : "active"

          const rawSeccion = String(row["Sección"] ?? row["seccion"] ?? "general").toLowerCase().trim()
          const seccion = rawSeccion.includes("oferta") ? "ofertas" :
                          rawSeccion.includes("nueva") ? "nueva-coleccion" : "general"

          const tagsField = String(row["Tags"] ?? row["Etiquetas"] ?? row["tags"] ?? "")
          const tags = tagsField ? tagsField.split(",").map((t: string) => t.trim()).filter(Boolean) : []

          const product: Product = {
            id: crypto.randomUUID(),
            name,
            brand,
            category,
            gender,
            price: parseFloat(priceStr),
            previousPrice: parseFloat(String(row["Precio Anterior"] ?? row["Precio anterior"] ?? row["previousPrice"] ?? "")) || 0,
            description: String(row["Descripción"] ?? row["description"] ?? ""),
            imageUrl: getImageUrl(String(row["Imagen URL"] ?? row["imageUrl"] ?? "")),
            colors,
            material: String(row["Material"] ?? row["material"] ?? ""),
            tags,
            status,
            seccion,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await saveProduct.mutateAsync(product)
          imported++
        } catch (err) {
          errors.push(`Fila ${i + 1}: error al guardar (${err})`)
        }
      }
      setResult({ success: errors.length === 0, imported, errors })
    } catch (err) {
      setResult({ success: false, imported: 0, errors: [`Error: ${err}`] })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <CardTitle>Importar Datos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">Solo administradores pueden importar datos.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Formatos: CSV, XLSX. Campos requeridos: <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">name</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">brand</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">category</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">price</code>. Opcionales: <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">imageUrl</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">previousPrice</code>, talles (XS, S, M, L, XL, XXL) y colores.
            </p>
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-primary/10">
              <span className="text-xs text-muted-foreground">¿No tenés la plantilla de ejemplo?</span>
              <a
                href="/planilla_ejemplo.xlsx"
                download="planilla_ejemplo_carga.xlsx"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Descargar Plantilla
              </a>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-1">
              Si en la columna <code className="text-primary bg-muted px-1 py-0.5 rounded">Imagen URL</code> ponés una ruta local (ej: <code className="text-primary bg-muted px-1 py-0.5 rounded">C:\ropa\img.jpg</code>), seleccioná acá las imágenes para que se suban automáticamente:
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border border-dashed border-primary/20">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer cursor-pointer"
                />
              </div>
              {localImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.dataUrl} alt={img.name} className="w-12 h-12 object-cover rounded-lg border border-primary/10" />
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{img.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFile}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:gradient-primary file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer"
              />
            </div>
            {result && (
              <div className={`p-4 rounded-xl ${result.success ? "bg-emerald-900/30 border border-emerald-800" : "bg-rose-900/30 border border-rose-800"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <Badge variant={result.success ? "success" : "destructive"}>
                    {result.success ? "Importado" : "Errores"}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-emerald-300">{result.imported} registros importados</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 text-sm text-rose-300 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
