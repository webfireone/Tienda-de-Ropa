import { useState, useRef } from "react"
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
  const [result, setResult] = useState<ImportResult | null>(null)
  const saveProduct = useSaveProduct()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)

    try {
      let data: any[] = []

      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        const parsed = Papa.parse(text, { header: true })
        data = parsed.data as any[]
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buf = await file.arrayBuffer()
        const workbook = XLSX.read(buf, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json(sheet)
      } else {
        setResult({ success: false, imported: 0, errors: ["Formato no soportado. Usá CSV o XLSX."] })
        return
      }

      const errors: string[] = []
      let imported = 0
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const missing: string[] = []
        if (!row.name) missing.push("name")
        if (!row.brand) missing.push("brand")
        if (!row.category) missing.push("category")
        if (!row.price && row.price !== 0) missing.push("price")
        if (!row.cost && row.cost !== 0) missing.push("cost")
        if (!row.imageUrl) missing.push("imageUrl")

        if (missing.length > 0) {
          errors.push(`Fila ${i + 1}: faltan campos requeridos (${missing.join(", ")})`)
          continue
        }

        try {
          const sizes: Record<string, number> = {}
          SIZES.forEach(s => { sizes[s] = parseInt(row[s]) || 0 })

          const product: Product = {
            id: crypto.randomUUID(),
            name: row.name,
            brand: row.brand,
            category: row.category,
            price: parseFloat(row.price),
            cost: parseFloat(row.cost),
            description: row.description || "",
            imageUrl: row.imageUrl,
            sizes,
            colors: row.colors ? row.colors.split(",").map((c: string) => c.trim()) : [],
            material: row.material || "",
            tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
            status: row.status || "active",
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
              Formatos: CSV, XLSX. Campos requeridos: <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">name</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">brand</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">category</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">price</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">cost</code>, <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">imageUrl</code>
            </p>
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
