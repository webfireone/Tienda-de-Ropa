import { useCanciones } from "@/hooks/useMusic"
import { MusicPlayer } from "./MusicPlayer"
import { SongCard } from "./SongCard"
import { MonthlyRanking } from "./MonthlyRanking"
import { Music, Disc3 } from "lucide-react"

export function MusicSection() {
  const { data: canciones = [], isLoading, isError, error } = useCanciones()
  console.log("[MusicSection] canciones:", canciones?.length, "isLoading:", isLoading, "isError:", isError, error)
  const activeSongs = canciones.filter(c => c.activo)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando música...</p>
        </div>
      </div>
    )
  }

  if (activeSongs.length === 0) {
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
      {/* Left: Player + Ranking */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-6">
          <MusicPlayer />
          <div className="hidden lg:block">
            <MonthlyRanking canciones={activeSongs} />
          </div>
        </div>
      </div>

      {/* Right: Song list */}
      <div className="lg:col-span-2">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-4">
          <Music className="w-4 h-4 text-primary" />
          Canciones
          <span className="text-sm text-muted-foreground font-normal">({activeSongs.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {activeSongs.map((cancion) => (
            <SongCard key={cancion.id} cancion={cancion} />
          ))}
        </div>
        <div className="mt-6 lg:hidden">
          <MonthlyRanking canciones={activeSongs} />
        </div>
      </div>
    </div>
  )
}
