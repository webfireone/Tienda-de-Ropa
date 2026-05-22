import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Upload, AlertCircle, CheckCircle2, ImageIcon } from "lucide-react"
import type { ImportResult, Product } from "@/types"
import { useSaveProduct } from "@/hooks/useFirestore"
import { SIZES } from "@/types"

type ParsedRow = Record<string, string>

function isLocalPath(path: string): boolean {
  return /^[a-zA-Z]:\\/.test(path) || path.startsWith("/") || path.startsWith("..") || path.startsWith("./")
}

function extractFilename(path: string): string {
  return path.split(/[/\\]/).pop() || ""
}

export function ImportDialog() {
  const { isAdmin } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedRow[] | null>(null)
  const [localImages, setLocalImages] = useState<{ name: string; dataUrl: string }[]>([])
  const [selectedFileName, setSelectedFileName] = useState("")
  const saveProduct = useSaveProduct()

  const neededFilenames = parsedData
    ? parsedData
        .map(row => String(row["Imagen URL"] ?? row["imageUrl"] ?? ""))
        .filter(isLocalPath)
        .map(extractFilename)
        .filter(Boolean)
    : []

  const matchedCount = localImages.filter(img =>
    neededFilenames.some(name => name.toLowerCase() === img.name.toLowerCase())
  ).length

  const handleDataFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setSelectedFileName(file.name)
    setParsedData(null)

    try {
      let data: ParsedRow[] = []
      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        const parsed = Papa.parse<ParsedRow>(text, { header: true })
        data = parsed.data
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buf = await file.arrayBuffer()
        const workbook = XLSX.read(buf, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json<ParsedRow>(sheet)
      } else {
        setResult({ success: false, imported: 0, errors: ["Formato no soportado. Usá CSV o XLSX."] })
        return
      }
      setParsedData(data.filter(row => String(row["Nombre"] ?? row["name"] ?? "").trim()))
    } catch (err) {
      setResult({ success: false, imported: 0, errors: [`Error al leer el archivo: ${err}`] })
    }
  }

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const getImageUrl = (path: string): string => {
    if (!path) return ""
    if (!isLocalPath(path)) return path
    const filename = extractFilename(path).toLowerCase()
    if (!filename) return path
    const match = localImages.find(img => img.name.toLowerCase() === filename)
    return match ? match.dataUrl : path
  }

  const handleImport = async () => {
    if (!parsedData) return
    setImporting(true)
    setResult(null)

    const errors: string[] = []
    let imported = 0
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
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
    setImporting(false)
  }

  const resetAll = () => {
    setParsedData(null)
    setSelectedFileName("")
    setLocalImages([])
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (imageInputRef.current) imageInputRef.current.value = ""
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
              Formatos: CSV, XLSX. Campos requeridos: <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">Nombre</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">Marca</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">Categoría</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">Precio</code>.
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

            {!parsedData ? (
              <div className="bg-muted/20 rounded-xl p-4 space-y-3 border border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</span>
                  <span className="text-sm font-medium">Seleccioná el archivo con los datos (CSV o XLSX)</span>
                </div>
                <div className="relative pl-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleDataFile}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:gradient-primary file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            ) : null}

            {parsedData ? (
              <>
                <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-emerald-300">
                    Archivo <strong className="text-emerald-200">{selectedFileName}</strong> cargado — <strong>{parsedData.length}</strong> producto{parsedData.length !== 1 ? "s" : ""} detectado{parsedData.length !== 1 ? "s" : ""}
                  </span>
                  <button onClick={resetAll} className="ml-auto text-xs text-muted-foreground hover:text-primary underline">Cambiar archivo</button>
                </div>

                {neededFilenames.length > 0 && (
                  <div className="bg-muted/20 rounded-xl p-4 space-y-3 border border-dashed border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</span>
                      <span className="text-sm font-medium">
                        Imágenes locales detectadas
                        <span className="text-xs text-muted-foreground font-normal ml-2">
                          ({matchedCount} de {neededFilenames.length} seleccionadas)
                        </span>
                      </span>
                    </div>
                    <div className="pl-8 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        El archivo tiene <strong>{neededFilenames.length} producto{neededFilenames.length !== 1 ? "s" : ""}</strong> con rutas locales de imagen. Seleccioná TODOS los archivos de imagen de una vez y el sistema va a emparejar automáticamente por nombre:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {neededFilenames.map((fname, i) => {
                          const matched = localImages.some(img => img.name.toLowerCase() === fname.toLowerCase())
                          return (
                            <span key={i} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${matched ? "bg-emerald-900/30 border-emerald-700 text-emerald-300" : "bg-amber-900/30 border-amber-700 text-amber-300"}`}>
                              {matched ? <CheckCircle2 className="h-2.5 w-2.5" /> : <ImageIcon className="h-2.5 w-2.5" />}
                              {fname}
                            </span>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-dashed border-primary/10 mt-3">
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
                        <div className="flex flex-wrap gap-2 mt-2">
                          {localImages.map((img, i) => {
                            const isNeeded = neededFilenames.some(n => n.toLowerCase() === img.name.toLowerCase())
                            return (
                              <div key={i} className={`relative group ${!isNeeded ? "opacity-40" : ""}`}>
                                <img src={img.dataUrl} alt={img.name} className="w-12 h-12 object-cover rounded-lg border border-primary/10" />
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{img.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {neededFilenames.length > 0 && matchedCount < neededFilenames.length ? (
                  <div className="bg-amber-900/30 border border-amber-800 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200">
                      Faltan seleccionar {neededFilenames.length - matchedCount} imagen{neededFilenames.length - matchedCount !== 1 ? "es" : ""}. Las imágenes sin seleccionar se guardarán con la ruta local como texto (no se verán en la web).
                    </p>
                  </div>
                ) : null}

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {importing ? (
                    <>Importando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Importar {parsedData.length} producto{parsedData.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </>
            ) : null}

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
