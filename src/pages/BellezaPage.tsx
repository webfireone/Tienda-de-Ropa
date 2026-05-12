import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useViewTransitionNavigate } from "@/hooks/useViewTransitionNavigate"
import { useBellezaStore, PREDEFINED_PALETTES, PRESET_BACKGROUNDS, applyThemeConfig, type SavedLook, type FullThemeConfig } from "@/store/bellezaStore"
import { Sparkles, RotateCcw, Save, Wand2, Palette, Layers, Upload, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

function MiniPreview({ config }: { config: FullThemeConfig }) {
  const c = config.colors

  return (
    <div className="space-y-3">
      <div
        className="p-4 rounded-xl overflow-hidden relative"
        style={{ background: config.backgroundGradient, color: c.foreground, fontFamily: `'${config.typography.fontBody}', sans-serif` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.primary, color: c.primaryForeground }}>
            <span className="text-xs">G</span>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: c.foreground }}>GLAMOURS</p>
            <p className="text-[9px]" style={{ color: c.mutedForeground }}>Tienda de Ropa</p>
          </div>
        </div>
        <div className="flex gap-1 mb-3">
          {["Inicio", "Catálogo", "Outlet"].map((l, i) => (
            <span key={l} className={cn("text-[9px] px-2 py-1 rounded-md", i === 0 ? "" : "opacity-60")} style={i === 0 ? { background: c.primary, color: c.primaryForeground } : { color: c.mutedForeground }}>{l}</span>
          ))}
        </div>
        <div className="h-16 rounded-lg mb-3 flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.highlight}22)`, color: c.foreground, fontFamily: `'${config.typography.fontDisplay}', serif` }}>
          Descubrí tu estilo
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[c.primary, c.highlight, c.accent].map((color, i) => (
            <div key={i} className="h-12 rounded-lg" style={{ background: color }} />
          ))}
        </div>
        <div className="space-y-2 mb-3">
          <div className="p-3 rounded-xl" style={{ background: c.card, color: c.cardForeground }}>
            <p className="text-[10px] font-semibold mb-1" style={{ fontFamily: `'${config.typography.fontDisplay}', serif` }}>Título de Card</p>
            <p className="text-[9px]" style={{ color: c.mutedForeground }}>Texto descriptivo de ejemplo.</p>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button className="flex-1 py-2 rounded-xl text-[10px] font-semibold" style={{ background: c.primary, color: c.primaryForeground }}>
            Botón Primario
          </button>
          <button className="flex-1 py-2 rounded-xl text-[10px] font-semibold border" style={{ borderColor: c.border, color: c.foreground, background: c.card }}>
            Secundario
          </button>
        </div>
        <div className="flex gap-1 mb-3">
          <div className="flex-1 h-6 rounded-md" style={{ background: c.success }} />
          <div className="flex-1 h-6 rounded-md" style={{ background: c.warning }} />
          <div className="flex-1 h-6 rounded-md" style={{ background: c.destructive }} />
        </div>
        <div className="space-y-1">
          <div className="h-2 rounded-full" style={{ background: c.muted }} />
          <div className="h-2 rounded-full" style={{ background: c.border }} />
        </div>
      </div>
      <div className="p-3 rounded-xl" style={{ background: c.card, color: c.cardForeground }}>
        <p className="text-[10px] font-semibold mb-2">Paleta de colores</p>
        <div className="flex gap-1 flex-wrap">
          {Object.entries(c).filter(([k]) => ["primary", "secondary", "accent", "success", "warning", "destructive", "highlight"].includes(k)).map(([k, v]) => (
            <div key={k} className="w-7 h-7 rounded-md border border-border" style={{ background: v as string }} title={k} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BellezaPage() {
  const { isAdmin } = useAuth()
  const navigate = useViewTransitionNavigate()
  const {
    config, savedLooks,
    setColors, setBackground, setBackgroundGradient,
    saveLook, loadLook, deleteLook, resetToDefault, randomize, applyFullConfig,
  } = useBellezaStore()

  const [savedName, setSavedName] = useState("")
  const [customGradient, setCustomGradient] = useState("")
  const [activeTab, setActiveTab] = useState<"paletas" | "fondos" | "guardados">("paletas")

  useEffect(() => {
    if (!isAdmin) navigate("/")
  }, [isAdmin, navigate])

  useEffect(() => {
    const activeRaw = localStorage.getItem("belleza-active-config")
    if (activeRaw) {
      try {
        const loaded = JSON.parse(activeRaw) as FullThemeConfig
        applyFullConfig(loaded)
        applyThemeConfig(loaded)
      } catch {}
    }
  }, [])

  useEffect(() => {
    applyThemeConfig(config)
  }, [config])

  useEffect(() => {
    const savedRaw = localStorage.getItem("belleza-saved-looks")
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw) as SavedLook[]
        parsed.forEach(look => {
          if (!savedLooks.find(l => l.id === look.id)) {
            useBellezaStore.setState(s => ({ savedLooks: [...s.savedLooks, look] }))
          }
        })
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("belleza-saved-looks", JSON.stringify(savedLooks))
  }, [savedLooks])

  const handleRandomize = () => {
    randomize()
  }

  const handleApplyPalette = (palette: any) => {
    if (palette.config.colors) setColors(palette.config.colors as any)
    if (palette.config.background) setBackground(palette.config.background as any)
    if (palette.config.backgroundGradient) setBackgroundGradient(palette.config.backgroundGradient)
    if (palette.config.hover) useBellezaStore.getState().config.hover = palette.config.hover
  }

  const handleApplyBackground = (bg: any) => {
    setBackground(bg.id)
    setBackgroundGradient(bg.css)
  }

  const handleApplyCustomGradient = () => {
    if (customGradient.trim()) {
      setBackgroundGradient(customGradient.trim())
      setCustomGradient("")
    }
  }

  const handleSave = () => {
    if (!savedName.trim()) return
    saveLook(savedName.trim())
    setSavedName("")
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-display text-2xl font-bold gradient-text">BELLEZA</h1>
          </div>
          <p className="text-sm text-muted-foreground">Rediseñá tu web al instante, sin escribir código.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRandomize} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-primary/30 hover:text-primary transition-all">
            <Wand2 className="h-4 w-4" />
            Random
          </button>
          <button onClick={resetToDefault} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-destructive/30 hover:text-destructive transition-all">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 w-fit">
        {[
          { key: "paletas", label: "Paletas", icon: Palette },
          { key: "fondos", label: "Fondos", icon: Layers },
          { key: "guardados", label: `Guardados (${savedLooks.length})`, icon: Save },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {activeTab === "paletas" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREDEFINED_PALETTES.map((palette) => (
                  <button key={palette.id} onClick={() => handleApplyPalette(palette)}
                    className="glass-card p-4 text-left hover-lift group transition-all">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl">{palette.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{palette.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{palette.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {palette.config.colors && Object.entries(palette.config.colors).slice(0, 6).map(([k, v]) => (
                        <div key={k} className="w-7 h-7 rounded-md border border-border" style={{ background: v as string }} title={k} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="glass-card p-4">
                <button onClick={handleRandomize} className="w-full py-3 rounded-xl gradient-brand text-white font-medium text-sm hover:opacity-90 transition-opacity btn-micro">
                  Generar combinación aleatoria
                </button>
              </div>
            </div>
          )}

          {activeTab === "fondos" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button key={bg.id} onClick={() => handleApplyBackground(bg)}
                    className={cn("relative h-16 rounded-xl overflow-hidden border-2 transition-all", config.background === bg.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50")}>
                    <div className="absolute inset-0" style={{ background: bg.preview }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-1">
                      <span className="text-[9px] text-white font-medium">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="glass-card p-4">
                <label className="text-xs font-semibold block mb-2">Gradient personalizado</label>
                <div className="flex gap-2">
                  <input type="text" value={customGradient} onChange={(e) => setCustomGradient(e.target.value)}
                    placeholder="linear-gradient(135deg, #0d0d1a, #7c5cfc)"
                    className="flex-1 text-xs font-mono bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={handleApplyCustomGradient} className="px-4 py-2 rounded-xl text-xs font-medium gradient-brand text-white transition-all">
                    Aplicar
                  </button>
                </div>
                {customGradient && (
                  <div className="mt-2 w-full h-12 rounded-xl border border-border" style={{ background: customGradient }} />
                )}
              </div>
            </div>
          )}

          {activeTab === "guardados" && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex gap-2">
                  <input type="text" value={savedName} onChange={(e) => setSavedName(e.target.value)}
                    placeholder="Nombre del look..." className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleSave()} />
                  <button onClick={handleSave} disabled={!savedName.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium gradient-brand text-white disabled:opacity-50 btn-micro">
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                </div>
              </div>
              {savedLooks.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No tenés looks guardados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedLooks.map((look) => (
                    <div key={look.id} className="glass-card p-4 flex items-center gap-3">
                      <div className="flex gap-1 shrink-0">
                        {Object.entries(look.config.colors).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="w-7 h-7 rounded-md border border-border" style={{ background: v }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{look.name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(look.createdAt).toLocaleDateString("es-AR")}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => loadLook(look.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors" title="Cargar">
                          <Upload className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteLook(look.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Preview</h3>
            </div>
            <MiniPreview config={config} />
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Fondo actual</h3>
            <div className="w-full h-20 rounded-xl border border-border" style={{ background: config.backgroundGradient }} />
            <p className="text-[10px] font-mono text-muted-foreground mt-2 break-all">{config.backgroundGradient}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
