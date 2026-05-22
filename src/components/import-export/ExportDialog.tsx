import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts, useSales } from "@/hooks/useFirestore"
import { useParamsStore } from "@/store/paramsStore"
import { calculateKpis } from "@/lib/calculations"
import { jsPDF } from "jspdf"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { Download, FileText, FileSpreadsheet, FileDown } from "lucide-react"
import { SIZES } from "@/types"

export function ExportDialog() {
  const { data: products = [] } = useProducts()
  const { data: sales = [] } = useSales()
  const { params, scenarioConfig } = useParamsStore()

  const kpis = calculateKpis(sales, products, params, scenarioConfig)

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Reporte Tienda de Ropa", 14, 22)
    doc.setFontSize(11)
    doc.text(`Ventas Mensuales: $${kpis.monthlySales.toLocaleString("es-AR")}`, 14, 40)
    doc.text(`Rotación: ${kpis.inventoryTurnover.toFixed(2)}`, 14, 48)
    doc.save("reporte-tienda-ropa.pdf")
  }

  const exportCSV = () => {
    const csv = Papa.unparse(sales.map(s => ({
      Producto: s.productName,
      Cantidad: s.quantity,
      "Precio Unitario": s.unitPrice,
      Fecha: s.date,
    })))
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "ventas-export.csv"
    a.click()
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales.map(s => ({
      Producto: s.productName, Cantidad: s.quantity,
      "Precio Unitario": s.unitPrice, Fecha: s.date,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ventas")
    XLSX.writeFile(wb, "ventas-export.xlsx")
  }

  const exportCatalogExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(products.map(p => {
        const colorsStr = p.colors ? p.colors.map(c => c.name).join(", ") : ""
        
        const sizesObj: Record<string, number> = {}
        SIZES.forEach(s => {
          sizesObj[s] = p.colors ? p.colors.reduce((sum, c) => sum + (c.sizes[s] || 0), 0) : 0
        })

        const statusMap: Record<string, string> = {
          active: "activo",
          draft: "borrador",
          archived: "archivado",
        }

        return {
          Nombre: p.name,
          Marca: p.brand,
          Categoría: p.category,
          Género: p.gender || "unisex",
          Precio: p.price,
          "Precio Anterior": p.previousPrice || 0,
          Descripción: p.description || "",
          "Imagen URL": p.imageUrl || "",
          Material: p.material || "",
          Tags: p.tags ? p.tags.join(", ") : "",
          Sección: p.seccion || "general",
          Estado: statusMap[p.status] || "activo",
          Colores: colorsStr,
          ...sizesObj
        }
      }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Catálogo")
      XLSX.writeFile(wb, "catalogo-glamours.xlsx")
    } catch (e) {
      console.error("Error exportando catálogo Excel:", e)
      alert("Error al exportar: " + (e instanceof Error ? e.message : String(e)))
    }
  }

  const exportCatalogCSV = () => {
    const csv = Papa.unparse(products.map(p => {
      const colorsStr = p.colors ? p.colors.map(c => c.name).join(", ") : ""
      
      const sizesObj: Record<string, number> = {}
      SIZES.forEach(s => {
        sizesObj[s] = p.colors ? p.colors.reduce((sum, c) => sum + (c.sizes[s] || 0), 0) : 0
      })

      const statusMap: Record<string, string> = {
        active: "activo",
        draft: "borrador",
        archived: "archivado",
      }

      return {
        Nombre: p.name,
        Marca: p.brand,
        Categoría: p.category,
        Género: p.gender || "unisex",
        Precio: p.price,
        "Precio Anterior": p.previousPrice || 0,
        Descripción: p.description || "",
        "Imagen URL": p.imageUrl || "",
        Material: p.material || "",
        Tags: p.tags ? p.tags.join(", ") : "",
        Sección: p.seccion || "general",
        Estado: statusMap[p.status] || "activo",
        Colores: colorsStr,
        ...sizesObj
      }
    }))
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "catalogo-glamours.csv"
    a.click()
  }

  const exportButtons = [
    { label: "PDF", icon: FileText, onClick: exportPDF, color: "text-rose-500" },
    { label: "CSV", icon: FileSpreadsheet, onClick: exportCSV, color: "text-emerald-500" },
    { label: "Excel", icon: FileDown, onClick: exportExcel, color: "text-blue-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <CardTitle>Exportar Datos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Ventas y Reportes</h4>
          <div className="grid grid-cols-3 gap-3">
            {exportButtons.map(({ label, icon: Icon, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/5 hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300 group"
              >
                <Icon className={`h-6 w-6 ${color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-primary/10 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Catálogo de Productos</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportCatalogCSV}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/5 hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300 group"
            >
              <FileSpreadsheet className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Descargar CSV</span>
            </button>
            <button
              onClick={exportCatalogExcel}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/5 hover:border-primary/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300 group"
            >
              <FileDown className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Descargar Excel</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

