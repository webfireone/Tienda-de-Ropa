import { useEffect } from "react"
import { useCanciones } from "@/hooks/useMusic"
import { useMusicStore } from "@/store/musicStore"
import { MusicPlayer } from "./MusicPlayer"
import { SongCard } from "./SongCard"
import { MonthlyRanking } from "./MonthlyRanking"
import { Music, Disc3 } from "lucide-react"

export function MusicSection() {
  const { data: canciones = [], isLoading } = useCanciones()
  const setPlaylist = useMusicStore(s => s.setPlaylist)
  const activeSongs = canciones.filter(c => c.activo)

  // Keep playlist in sync with active songs
  useEffect(() => {
    if (activeSongs.length > 0) {
      setPlaylist(activeSongs)
    }
  }, [activeSongs.length]) // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                Canciones
              </h2>
              <p className="text-[10px] text-muted-foreground/60 -mt-0.5">Playlist Glamour's</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-gradient-to-b from-primary/30 to-highlight/30" />
            <span className="text-xs font-mono tabular-nums text-muted-foreground/60">{String(activeSongs.length).padStart(2, "0")} temas</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {activeSongs.map((cancion, i) => (
            <SongCard key={cancion.id} cancion={cancion} index={i} />
          ))}
        </div>
        <div className="mt-6 lg:hidden">
          <MonthlyRanking canciones={activeSongs} />
        </div>
      </div>
    </div>
  )
}
