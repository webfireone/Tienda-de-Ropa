import { useState, useRef } from "react"
import { useCanciones, useSaveCancion, useDeleteCancion } from "@/hooks/useMusic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus, X, Check, Music, Image as ImageIcon, FolderOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cancion } from "@/types/music"
import { saveAudioFile } from "@/lib/mockStorage"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

const COVER_COLORS = [
  "7c5cfc", "ec4899", "f59e0b", "10b981", "3b82f6",
  "ef4444", "a855f7", "06b6d4", "f97316", "84cc16",
  "6366f1", "d946ef", "14b8a6", "e11d48", "0ea5e9",
]

export function AdminMusicPanel() {
  const { data: canciones = [], isLoading } = useCanciones()
  const saveCancion = useSaveCancion()
  const deleteCancion = useDeleteCancion()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState("")
  const [artista, setArtista] = useState("")
  const [archivoUrl, setArchivoUrl] = useState("")
  const [portadaUrl, setPortadaUrl] = useState("")
  const [activo, setActivo] = useState(true)
  const [error, setError] = useState("")

  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkFiles, setBulkFiles] = useState<{ file: File; titulo: string; artista: string; id: string }[]>([])
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const singleFileRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)

  const resetForm = () => {
    setTitulo("")
    setArtista("")
    setArchivoUrl("")
    setPortadaUrl("")
    setActivo(true)
    setEditingId(null)
    setIsFormOpen(false)
    setError("")
    selectedFileRef.current = null
  }

  const handleEdit = (cancion: Cancion) => {
    setEditingId(cancion.id)
    setTitulo(cancion.titulo)
    setArtista(cancion.artista)
    setArchivoUrl(cancion.archivoUrl)
    setPortadaUrl(cancion.portadaUrl)
    setActivo(cancion.activo)
    setIsFormOpen(true)
    setError("")
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta canción?")) return
    setError("")
    try {
      await deleteCancion.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la canción")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!titulo.trim() || !artista.trim()) {
      setError("Título y artista son obligatorios")
      return
    }

    const cancion: Cancion = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      titulo: titulo.trim(),
      artista: artista.trim(),
      archivoUrl: archivoUrl || `https://placehold.co/200x200/7c5cfc/ffffff?text=${encodeURIComponent(titulo.trim())}`,
      portadaUrl: portadaUrl || `https://placehold.co/400x400/7c5cfc/ffffff?text=${encodeURIComponent(titulo.trim())}`,
      fechaSubida: editingId ? (canciones.find(c => c.id === editingId)?.fechaSubida ?? new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
      activo,
    }

    try {
      if (USE_MOCK && selectedFileRef.current && !editingId) {
        await saveAudioFile(cancion.id, selectedFileRef.current)
      }
      await saveCancion.mutateAsync(cancion)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la canción")
    }
  }

  const handleArchivoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo MP3 no puede superar los 10MB")
        return
      }
      selectedFileRef.current = file
      const url = URL.createObjectURL(file)
      setArchivoUrl(url)
      if (!titulo) {
        setTitulo(file.name.replace(/\.mp3$/i, "").trim())
      }
      setError("")
    }
  }

  const handlePortadaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPortadaUrl(url)
    }
  }

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f =>
      /\.mp3$/i.test(f.name)
    )
    if (files.length === 0) {
      setError("No se encontraron archivos MP3 en la carpeta seleccionada")
      return
    }
    const entries = files.map(f => ({
      file: f,
      titulo: (f.webkitRelativePath.split("/").pop() || f.name).replace(/\.mp3$/i, "").trim(),
      artista: "Glamour's",
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${Math.random().toString(36).slice(2, 5)}`,
    }))
    setBulkFiles(entries)
    setIsBulkOpen(true)
    setError("")
  }

  const handleBulkImport = async () => {
    const selected = bulkFiles.filter(f => bulkSelected.has(f.id))
    if (selected.length === 0) {
      setError("Seleccioná al menos una canción para importar")
      return
    }
    setIsImporting(true)
    setError("")
    setImportProgress(0)
    setImportTotal(selected.length)
    let imported = 0
    let failed: string[] = []

    for (let i = 0; i < selected.length; i++) {
      const entry = selected[i]
      if (!entry.titulo.trim()) continue
      const color = COVER_COLORS[i % COVER_COLORS.length]
      try {
        const cancion: Cancion = {
          id: entry.id,
          titulo: entry.titulo.trim(),
          artista: entry.artista.trim() || "Glamour's",
          archivoUrl: URL.createObjectURL(entry.file),
          portadaUrl: `https://placehold.co/400x400/${color}/ffffff?text=${encodeURIComponent(entry.titulo.trim())}`,
          fechaSubida: new Date().toISOString().slice(0, 10),
          activo: true,
        }
        if (USE_MOCK) {
          await saveAudioFile(cancion.id, entry.file)
        }
        await saveCancion.mutateAsync(cancion)
        imported++
      } catch {
        failed.push(entry.titulo)
      }
      setImportProgress(i + 1)
    }

    setIsImporting(false)
    setIsBulkOpen(false)
    setBulkFiles([])
    if (failed.length > 0) {
      setError(`${imported} importadas, ${failed.length} fallaron: ${failed.join(", ")}`)
    } else if (imported > 0) {
      setError(`${imported} canciones importadas exitosamente`)
    } else {
      setError("No se pudo importar ninguna canción")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">Gestión de Música</h2>
          <p className="text-sm text-muted-foreground">Administra las canciones de Glamours Music</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { resetForm(); setIsFormOpen(true) }} size="sm">
            <Plus className="w-4 h-4" />
            Nueva Canción
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => folderInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4" />
            Importar Múltiples
          </Button>
          <input
            ref={folderInputRef}
            type="file"
            multiple
            accept=".mp3,audio/mpeg"
            onChange={handleFolderSelect}
            className="hidden"
            {...{ webkitdirectory: "", directory: "" }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-destructive/60 hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Editar Canción" : "Nueva Canción"}</CardTitle>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Título</label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nombre de la canción" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Artista / Intérprete</label>
                  <Input value={artista} onChange={e => setArtista(e.target.value)} placeholder="Nombre del artista" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    <Music className="w-3 h-3 inline mr-1" />
                    Archivo MP3
                  </label>
                  <div className="flex gap-2">
                    <Input type="file" accept=".mp3,audio/mpeg" onChange={handleArchivoFile} className="flex-1 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:gradient-primary file:text-white hover:file:opacity-90" />
                    <Button type="button" size="sm" variant="outline" onClick={() => singleFileRef.current?.click()} title="Seleccionar archivo MP3">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </Button>
                    <input
                      ref={singleFileRef}
                      type="file"
                      accept=".mp3,audio/mpeg"
                      onChange={handleArchivoFile}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Máx 10MB</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    Portada (opcional)
                  </label>
                  <Input type="file" accept="image/*" onChange={handlePortadaFile} className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:gradient-primary file:text-white hover:file:opacity-90" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivo(!activo)}
                  className={cn(
                    "w-9 h-5 rounded-full relative transition-colors duration-300",
                    activo ? "bg-success" : "bg-secondary"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                    activo ? "left-[18px]" : "left-0.5"
                  )} />
                </button>
                <span className="text-xs text-muted-foreground">{activo ? "Activa" : "Inactiva"}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="sm" disabled={saveCancion.isPending}>
                  <Check className="w-4 h-4" />
                  {editingId ? "Guardar Cambios" : "Subir Canción"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Import Dialog */}
      {isBulkOpen && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Music className="w-4 h-4" />
                Importar {bulkFiles.length} canción{bulkFiles.length !== 1 ? "es" : ""}
              </CardTitle>
              <button onClick={() => { setIsBulkOpen(false); setBulkFiles([]); setBulkSelected(new Set()) }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Revisa los datos antes de importar. Los títulos se toman del nombre del archivo.</p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            <div className="flex items-center gap-3 px-2 py-1.5 border-b border-primary/5">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkSelected.size === bulkFiles.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkSelected(new Set(bulkFiles.map(f => f.id)))
                    } else {
                      setBulkSelected(new Set())
                    }
                  }}
                  className="accent-primary w-3.5 h-3.5"
                />
                Seleccionar todos
              </label>
              <span className="text-[10px] text-muted-foreground">{bulkSelected.size} de {bulkFiles.length}</span>
            </div>
            {bulkFiles.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg border border-primary/5 bg-card/30">
                <input
                  type="checkbox"
                  checked={bulkSelected.has(entry.id)}
                  onChange={(e) => {
                    const next = new Set(bulkSelected)
                    if (e.target.checked) {
                      next.add(entry.id)
                    } else {
                      next.delete(entry.id)
                    }
                    setBulkSelected(next)
                  }}
                  className="accent-primary w-3.5 h-3.5 shrink-0"
                />
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={entry.titulo}
                    onChange={e => {
                      const copy = [...bulkFiles]
                      copy[i] = { ...copy[i], titulo: e.target.value }
                      setBulkFiles(copy)
                    }}
                    placeholder="Título"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={entry.artista}
                    onChange={e => {
                      const copy = [...bulkFiles]
                      copy[i] = { ...copy[i], artista: e.target.value }
                      setBulkFiles(copy)
                    }}
                    placeholder="Artista"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <div className="flex items-center justify-end gap-2 px-6 pb-4">
            <Button variant="ghost" size="sm" onClick={() => { setIsBulkOpen(false); setBulkFiles([]); setBulkSelected(new Set()) }} disabled={isImporting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleBulkImport} disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isImporting
                ? `Importando ${importProgress}/${importTotal}...`
                : `Importar ${bulkSelected.size} canción${bulkSelected.size !== 1 ? "es" : ""}`
              }
            </Button>
          </div>
          {isImporting && (
            <div className="px-6 pb-4">
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-highlight rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress / importTotal) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Lista de canciones */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando canciones...</div>
        ) : canciones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No hay canciones todavía</p>
            <p className="text-xs">Sube tu primera canción</p>
          </div>
        ) : (
          canciones.map(cancion => (
            <div
              key={cancion.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all",
                "border border-primary/5 hover:border-primary/15",
                cancion.activo ? "bg-card/50" : "bg-card/30 opacity-60"
              )}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/10 shrink-0">
                <img src={cancion.portadaUrl} alt={cancion.titulo} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{cancion.titulo}</p>
                <p className="text-xs text-muted-foreground">{cancion.artista}</p>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full",
                cancion.activo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              )}>
                {cancion.activo ? "Activa" : "Inactiva"}
              </span>
              <button
                onClick={() => handleEdit(cancion)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cancion.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
