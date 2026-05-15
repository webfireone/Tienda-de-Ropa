import { useAuth } from "@/context/AuthContext"
import { AdminMusicPanel } from "@/components/music/AdminMusicPanel"
import { Navigate } from "react-router-dom"

export function AdminMusicPage() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminMusicPanel />
      </div>
    </div>
  )
}
