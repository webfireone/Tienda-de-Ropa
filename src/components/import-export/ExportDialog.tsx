import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts, useSales } from "@/hooks/useFirestore"
import { useParams } from "@/context/ParamsContext"
import { calculateKpis } from "@/lib/calculations"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { Download, FileText, FileSpreadsheet, FileDown } from "lucide-react"

export function ExportDialog() {
  const { data: products = [] } = useProducts()
  const { data: sales = [] } = useSales()
  const { params, scenarioConfig } = useParams()

  const kpis = calculateKpis(sales, products, params, scenarioConfig)

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Reporte Tienda de Ropa", 14, 22)
    doc.setFontSize(11)
    doc.text(`Ventas Mensuales: $${kpis.monthlySales.toLocaleString("es-AR")}`, 14, 40)
    doc.text(`Margen Bruto: $${kpis.grossMargin.toLocaleString("es-AR")}`, 14, 48)
    doc.text(`Margen Neto: $${kpis.netMargin.toLocaleString("es-AR")}`, 14, 56)
    doc.text(`Rotación: ${kpis.inventoryTurnover.toFixed(2)}`, 14, 64)

    const topProducts = kpis.topProducts.map((p, i) => [`${i + 1}. ${p.name}`, `$${p.margin.toLocaleString("es-AR")}`])
    ;(doc as any).autoTable({
      startY: 76,
      head: [["Top 3 Prendas", "Margen"]],
      body: topProducts,
    })
    doc.save("reporte-tienda-ropa.pdf")
  }

  const exportCSV = () => {
    const csv = Papa.unparse(sales.map(s => ({
      Producto: s.productName,
      Cantidad: s.quantity,
      "Precio Unitario": s.unitPrice,
      Costo: s.cost,
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
      "Precio Unitario": s.unitPrice, Costo: s.cost, Fecha: s.date,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ventas")
    XLSX.writeFile(wb, "ventas-export.xlsx")
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
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Exportá reportes y datos en diferentes formatos.</p>
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
      </CardContent>
    </Card>
  )
}
