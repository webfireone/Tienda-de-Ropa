import { DashboardGrid } from "@/components/dashboard/DashboardGrid"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { LayoutDashboard } from "lucide-react"

export function DashboardPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHero title="Dashboard" subtitle="Panel de administración" icon={LayoutDashboard} />
      <DashboardGrid />
    </div>
  )
}
