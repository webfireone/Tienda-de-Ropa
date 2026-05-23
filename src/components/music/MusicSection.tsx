import { useEffect } from "react"
import { useCanciones } from "@/hooks/useMusic"
import { useMusicStore, prefetchAllAudio } from "@/store/musicStore"
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
      // Prefetch audio sequentially into cache so play() works synchronously on mobile
      prefetchAllAudio(activeSongs)
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
        <div className="relative flex items-center justify-between mb-5 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 relative z-10">
                <Music className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-xl opacity-60 animate-pulse-glow" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold">
                <span className="bg-gradient-to-r from-[#ff2a6d] via-[#7b2cbf] to-[#00f5d4] bg-clip-text text-transparent">
                  Canciones
                </span>
              </h2>
              <p className="text-[10px] text-muted-foreground/50 -mt-0.5 tracking-wide uppercase">Playlist Oficial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span className="text-[11px] font-mono tabular-nums text-muted-foreground/50">{String(activeSongs.length).padStart(2, "0")}</span>
              <span className="text-[9px] text-muted-foreground/30">temas</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
