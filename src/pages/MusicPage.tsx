import { useNavigate } from "react-router-dom"
import { PageHero } from "@/components/dashboard/Decorative3D"
import { MusicSection } from "@/components/music/MusicSection"
import { ArrowLeft, Music } from "lucide-react"

export function MusicPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </button>
      <PageHero title="Glamour's MUSIC" subtitle="· Music" icon={Music} />
      <MusicSection />
    </div>
  )
}
