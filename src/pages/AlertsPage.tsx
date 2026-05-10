import { AlertsPanel } from "@/components/alerts/AlertsPanel"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export function AlertsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Alertas" subtitle="Monitoreo y puntos críticos" icon={AlertTriangle} />
      <AlertsPanel />
    </div>
  )
}
