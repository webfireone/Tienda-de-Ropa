import { SongCard } from "./SongCard"
import { MonthlyRanking } from "./MonthlyRanking"
import { Music, Disc3 } from "lucide-react"
import type { Cancion } from "@/types/music"

interface MusicSectionProps {
  canciones: Cancion[]
}

export function MusicSection({ canciones }: MusicSectionProps) {
  if (canciones.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-primary/10">
          <Disc3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-display font-semibold mb-2">Próximamente</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Estamos preparando la playlist Glamour's MUSIC. Vuelve pronto.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Monthly Ranking */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <MonthlyRanking canciones={canciones} />
        </div>
      </div>

      {/* Right: Song list */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Canciones
            <span className="text-sm text-muted-foreground font-normal">({canciones.length})</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {canciones.map((cancion, i) => (
            <SongCard key={cancion.id} cancion={cancion} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
