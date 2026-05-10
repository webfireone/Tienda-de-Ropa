import { ImportDialog } from "@/components/import-export/ImportDialog"
import { ExportDialog } from "@/components/import-export/ExportDialog"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { FileUp } from "lucide-react"

export function ImportExportPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Importar / Exportar" subtitle="Gestión de datos" icon={FileUp} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImportDialog />
        <ExportDialog />
      </div>
    </div>
  )
}
