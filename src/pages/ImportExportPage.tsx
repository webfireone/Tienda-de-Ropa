import { ImportDialog } from "@/components/import-export/ImportDialog"
import { WebImportDialog } from "@/components/import-export/WebImportDialog"
import { ExportDialog } from "@/components/import-export/ExportDialog"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FileUp, Globe } from "lucide-react"

export function ImportExportPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<"file" | "web">("file")

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Importar / Exportar" subtitle="Gestión de datos" icon={FileUp} />
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("file")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "file" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          <FileUp className="h-4 w-4 inline mr-1.5" />
          Archivo (CSV / XLSX)
        </button>
        <button
          onClick={() => setTab("web")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "web" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Globe className="h-4 w-4 inline mr-1.5" />
          Desde Pagina WEB
        </button>
      </div>
      {tab === "file" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ImportDialog />
          <ExportDialog />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <WebImportDialog />
        </div>
      )}
    </div>
  )
}
