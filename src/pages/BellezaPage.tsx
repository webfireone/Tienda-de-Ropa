import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useViewTransitionNavigate } from "@/hooks/useViewTransitionNavigate"
import { useBellezaStore, PREDEFINED_PALETTES, PRESET_BACKGROUNDS, checkContrast, applyThemeConfig, type PredefinedPalette, type SavedLook, type FullThemeConfig } from "@/store/bellezaStore"
import { Sparkles, RotateCcw, Save, Wand2, ChevronDown, ChevronUp, AlertTriangle, Check, Trash2, Palette, Type, Layers, MousePointer, Layout, Upload, Moon, Sun, Clock, Eye, EyeOff, X } from "lucide-react"
import { cn } from "@/lib/utils"

const COLOR_KEYS = [
  { key: "background", label: "Fondo", desc: "Color de fondo principal" },
  { key: "foreground", label: "Texto", desc: "Color del texto principal" },
  { key: "primary", label: "Primario", desc: "Color de accent principal" },
  { key: "primaryForeground", label: "Texto Prim.", desc: "Color de texto sobre primario" },
  { key: "secondary", label: "Secundario", desc: "Color de elementos secundarios" },
  { key: "secondaryForeground", label: "Texto Sec.", desc: "Color de texto secundario" },
  { key: "accent", label: "Accent", desc: "Color de highlight especial" },
  { key: "accentForeground", label: "Texto Accent", desc: "Color de texto accent" },
  { key: "card", label: "Tarjeta", desc: "Color de fondo de tarjetas" },
  { key: "cardForeground", label: "Texto Tarjeta", desc: "Color de texto en tarjetas" },
  { key: "muted", label: "Muted", desc: "Color para elementos deshabilitados" },
  { key: "mutedForeground", label: "Texto Muted", desc: "Color de texto muted" },
  { key: "border", label: "Bordes", desc: "Color de bordes" },
  { key: "success", label: "Éxito", desc: "Color para estados de éxito" },
  { key: "warning", label: "Advertencia", desc: "Color para advertencias" },
  { key: "destructive", label: "Error", desc: "Color para estados de error" },
  { key: "highlight", label: "Highlight", desc: "Color para destacado" },
  { key: "input", label: "Input", desc: "Color de campos de entrada" },
  { key: "ring", label: "Ring", desc: "Color de focus ring" },
] as const

const FONT_OPTIONS = [
  { label: "Playfair Display", value: "Playfair Display", category: "Serif" },
  { label: "Inter", value: "Inter", category: "Sans-serif" },
  { label: "Dancing Script", value: "Dancing Script", category: "Script" },
  { label: "Crimson Text", value: "Crimson Text", category: "Serif" },
  { label: "Oswald", value: "Oswald", category: "Sans-serif" },
  { label: "Abril Fatface", value: "Abril Fatface", category: "Display" },
  { label: "Space Grotesk", value: "Space Grotesk", category: "Sans-serif" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", category: "Serif" },
  { label: "Bebas Neue", value: "Bebas Neue", category: "Display" },
  { label: "Poppins", value: "Poppins", category: "Sans-serif" },
  { label: "Montserrat", value: "Montserrat", category: "Sans-serif" },
  { label: "Raleway", value: "Raleway", category: "Sans-serif" },
]

const RADIUS_OPTIONS = ["0px", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "9999px"]
const SPACING_OPTIONS = [2, 4, 6, 8, 10, 12, 16]
const TRANSITION_OPTIONS = ["0.1s", "0.2s", "0.3s", "0.4s", "0.5s"]
const SCALE_OPTIONS = [1, 1.1, 1.2, 1.25, 1.333, 1.5]

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

function ContrastPanel({ config }: { config: FullThemeConfig }) {
  const c = config.colors
  const pairs = [
    { label: "Texto princ.", fg: c.foreground, bg: c.background },
    { label: "Texto card", fg: c.cardForeground, bg: c.card },
    { label: "Prim/Fore", fg: c.primaryForeground, bg: c.primary },
    { label: "Sec/Fore", fg: c.secondaryForeground, bg: c.secondary },
    { label: "Accent/Fore", fg: c.accentForeground, bg: c.accent },
    { label: "Muted/Fore", fg: c.mutedForeground, bg: c.muted },
  ] as const

  return (
    <div className="space-y-2">
      {pairs.map(({ label, fg, bg }) => {
        const result = checkContrast(fg, bg)
        return (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border border-border" style={{ background: bg }} />
              <div className="w-5 h-5 rounded border border-border" style={{ background: fg }} />
              <span className="text-[9px]" style={{ color: c.mutedForeground }}>{label}</span>
            </div>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", result.status === "pass" ? "text-success" : result.status === "warn" ? "text-warning" : "text-destructive")}>
              {result.ratio.toFixed(1)}:1 {result.status === "pass" ? "✓" : result.status === "warn" ? "~" : "✗"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

function ColorInput({ label, value, onChange, c }: { label: string; value: string; onChange: (v: string) => void; c: FullThemeConfig["colors"] }) {
  const [inputVal, setInputVal] = useState(value)
  useEffect(() => { setInputVal(value) }, [value])
  const result = checkContrast(inputVal, c.background)

  return (
    <div className="flex items-start gap-2">
      <input
        type="color"
        value={inputVal}
        onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value) }}
        className="w-9 h-9 rounded-lg cursor-pointer border border-border shrink-0 appearance-none"
        style={{ background: inputVal }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium">{label}</span>
          <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded-full", result.status === "pass" ? "bg-success/20 text-success" : result.status === "warn" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive")}>
            {result.ratio.toFixed(1)}:1
          </span>
        </div>
        <input type="text" value={inputVal} onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value) }}
          className="w-full text-[9px] font-mono bg-muted border border-border rounded px-1.5 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
    </div>
  )
}

export function BellezaPage() {
  const { isAdmin } = useAuth()
  const navigate = useViewTransitionNavigate()
  const {
    config, savedLooks,
    setColors, setBackground, setBackgroundGradient, setEffects,
    setTypography, setLayout, setHover, setMode,
    saveLook, loadLook, deleteLook, resetToDefault, randomize, applyFullConfig,
  } = useBellezaStore()

  const [savedName, setSavedName] = useState("")
  const [customGradient, setCustomGradient] = useState("")
  const [activeTab, setActiveTab] = useState<"palettes" | "colors" | "bg" | "fonts" | "layout" | "saved">("palettes")
  const [showPreview, setShowPreview] = useState(false)
  const [draftConfig, setDraftConfig] = useState<FullThemeConfig | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const activeConfig = showPreview && draftConfig ? draftConfig : config

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
    applyThemeConfig(activeConfig)
  }, [activeConfig])

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

  const handleAnyChange = () => {
    if (!isDirty) {
      setDraftConfig(JSON.parse(JSON.stringify(config)))
      setIsDirty(true)
    }
  }

  const setColorsWithChange = (colors: Partial<FullThemeConfig["colors"]>) => {
    handleAnyChange()
    const updated = { ...config, colors: { ...config.colors, ...colors } }
    useBellezaStore.setState({ config: updated })
    if (isDirty && draftConfig) {
      setDraftConfig({ ...draftConfig, colors: { ...draftConfig.colors, ...colors } })
    }
  }

  const setBackgroundWithChange = (background: any) => {
    setBackground(background)
  }

  const handleApplyPalette = (palette: PredefinedPalette) => {
    handleAnyChange()
    if (palette.config.colors) setColors(palette.config.colors as any)
    if (palette.config.background) setBackground(palette.config.background as any)
    if (palette.config.backgroundGradient) setBackgroundGradient(palette.config.backgroundGradient)
    if (palette.config.hover) setHover(palette.config.hover)
  }

  const handleRandomize = () => {
    handleAnyChange()
    randomize()
  }

  const handleReset = () => {
    setIsDirty(false)
    setDraftConfig(null)
    setShowPreview(false)
    resetToDefault()
    applyThemeConfig(useBellezaStore.getState().config)
  }

  const handleApplyDraft = () => {
    if (draftConfig) {
      applyFullConfig(draftConfig)
      localStorage.setItem("belleza-active-config", JSON.stringify(draftConfig))
    }
    setIsDirty(false)
    setDraftConfig(null)
    setShowPreview(false)
  }

  const handleDiscardDraft = () => {
    setIsDirty(false)
    setDraftConfig(null)
    setShowPreview(false)
    applyThemeConfig(config)
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
          <button onClick={() => setShowPreview(!showPreview)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all", showPreview ? "gradient-brand text-white" : "border border-border hover:border-primary/30 hover:text-primary")}>
            {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showPreview ? "Ocultar preview" : "Vista previa"}
          </button>
          <button onClick={handleRandomize} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-primary/30 hover:text-primary transition-all">
            <Wand2 className="h-4 w-4" />
            Random
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-destructive/30 hover:text-destructive transition-all">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-6 p-4 rounded-2xl glass-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm">Tenés cambios sin aplicar. Usá "Aplicar" para verlos o "Descartar" para volver atrás.</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDiscardDraft} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-primary/30 transition-all">
              <X className="h-3 w-3" />
              Descartar
            </button>
            <button onClick={handleApplyDraft} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium gradient-brand text-white shadow-sm btn-micro">
              <Check className="h-3 w-3" />
              Aplicar cambios
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 w-fit">
        {[
          { key: "palettes", label: "Paletas", icon: Palette },
          { key: "colors", label: "Colores", icon: Palette },
          { key: "bg", label: "Fondos", icon: Layers },
          { key: "fonts", label: "Tipografía", icon: Type },
          { key: "layout", label: "Layout", icon: Layout },
          { key: "saved", label: `Guardados (${savedLooks.length})`, icon: Save },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap", activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {activeTab === "palettes" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREDEFINED_PALETTES.map((palette) => (
                  <button key={palette.id} onClick={() => handleApplyPalette(palette)}
                    className="glass-card p-3 text-left hover-lift group transition-all">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">{palette.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-xs">{palette.name}</h3>
                        <p className="text-[9px] text-muted-foreground">{palette.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {palette.config.colors && Object.entries(palette.config.colors).slice(0, 6).map(([k, v]) => (
                        <div key={k} className="w-6 h-6 rounded-md border border-border" style={{ background: v as string }} title={k} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Generador Aleatorio Seguro</h3>
                </div>
                <button onClick={handleRandomize} className="w-full py-2.5 rounded-xl gradient-brand text-white font-medium text-sm hover:opacity-90 transition-opacity btn-micro">
                  🎲 Generar combinación aleatoria
                </button>
              </div>
            </div>
          )}

          {activeTab === "colors" && (
            <Section title="Paleta de Colores" icon={Palette}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_KEYS.map(({ key, label }) => (
                  <ColorInput key={key} label={label}
                    value={config.colors[key as keyof typeof config.colors]}
                    onChange={(v) => setColorsWithChange({ [key]: v })} c={config.colors} />
                ))}
              </div>
            </Section>
          )}

          {activeTab === "bg" && (
            <Section title="Fondos y Efectos" icon={Layers}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button key={bg.id} onClick={() => setBackgroundWithChange(bg.id)}
                    className={cn("relative h-14 rounded-xl overflow-hidden border-2 transition-all", config.background === bg.id ? "border-primary" : "border-border hover:border-primary/30")}>
                    <div className="absolute inset-0" style={{ background: bg.preview }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 px-1">
                      <span className="text-[8px] text-white">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold block mb-2">Gradient personalizado (CSS completo)</label>
                <div className="flex gap-2">
                  <input type="text" value={customGradient} onChange={(e) => setCustomGradient(e.target.value)}
                    placeholder="linear-gradient(135deg, #0d0d1a, #7c5cfc)"
                    className="flex-1 text-xs font-mono bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={() => { setBackgroundGradient(customGradient); setCustomGradient("") }} className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:border-primary/30 transition-all">
                    Aplicar
                  </button>
                </div>
                {customGradient && (
                  <div className="mt-2 w-full h-10 rounded-xl border border-border" style={{ background: customGradient }} />
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["particles", "orbs", "grid", "glass", "grain"].map((effect) => (
                  <label key={effect} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={config.effects[effect as keyof typeof config.effects]}
                      onChange={(e) => setEffects({ [effect]: e.target.checked })} className="rounded border-border" />
                    <span className="text-xs capitalize">{effect}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          {activeTab === "fonts" && (
            <Section title="Tipografía" icon={Type}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-2">Fuente Display</label>
                  <select value={config.typography.fontDisplay} onChange={(e) => setTypography({ fontDisplay: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label} ({f.category})</option>)}
                  </select>
                  <p className="text-xs mt-1 opacity-60" style={{ fontFamily: config.typography.fontDisplay }}>Aa Gq Text</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Fuente Body</label>
                  <select value={config.typography.fontBody} onChange={(e) => setTypography({ fontBody: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label} ({f.category})</option>)}
                  </select>
                  <p className="text-xs mt-1 opacity-60" style={{ fontFamily: config.typography.fontBody }}>Aa Gq Text</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Peso Títulos: {config.typography.headingWeight}</label>
                  <input type="range" min="400" max="900" step="100" value={parseInt(config.typography.headingWeight)}
                    onChange={(e) => setTypography({ headingWeight: e.target.value })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Base: {config.typography.baseSize}px</label>
                  <input type="range" min="12" max="20" value={config.typography.baseSize}
                    onChange={(e) => setTypography({ baseSize: parseInt(e.target.value) })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Scale Ratio: {config.typography.scaleRatio}</label>
                  <select value={config.typography.scaleRatio} onChange={(e) => setTypography({ scaleRatio: parseFloat(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {SCALE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Line Height: {config.typography.lineHeight}</label>
                  <input type="range" min="1" max="2" step="0.1" value={parseFloat(config.typography.lineHeight)}
                    onChange={(e) => setTypography({ lineHeight: e.target.value })} className="w-full" />
                </div>
              </div>
            </Section>
          )}

          {activeTab === "layout" && (
            <Section title="Layout y Espaciado" icon={Layout}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-2">Border Radius</label>
                  <select value={config.layout.borderRadius} onChange={(e) => setLayout({ borderRadius: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Spacing Unit: {config.layout.spacingUnit}px</label>
                  <select value={config.layout.spacingUnit} onChange={(e) => setLayout({ spacingUnit: parseInt(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {SPACING_OPTIONS.map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Shadow: {config.layout.shadowIntensity}x</label>
                  <input type="range" min="0" max="2" step="0.1" value={config.layout.shadowIntensity}
                    onChange={(e) => setLayout({ shadowIntensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Blur: {config.layout.blurIntensity}x</label>
                  <input type="range" min="0" max="2" step="0.1" value={config.layout.blurIntensity}
                    onChange={(e) => setLayout({ blurIntensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
              </div>
            </Section>
          )}

          {activeTab === "layout" && (
            <Section title="Hover y Microinteracciones" icon={MousePointer}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-2">Lift Distance</label>
                  <select value={config.hover.liftDistance} onChange={(e) => setHover({ liftDistance: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {["2px", "3px", "4px", "6px", "8px", "12px"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Glow Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={config.hover.glowColor} onChange={(e) => setHover({ glowColor: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-border appearance-none" style={{ background: config.hover.glowColor }} />
                    <input type="text" value={config.hover.glowColor} onChange={(e) => setHover({ glowColor: e.target.value })}
                      className="flex-1 text-xs font-mono bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Glow: {config.hover.glowIntensity.toFixed(2)}</label>
                  <input type="range" min="0" max="0.5" step="0.01" value={config.hover.glowIntensity}
                    onChange={(e) => setHover({ glowIntensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Transición</label>
                  <select value={config.hover.transitionDuration} onChange={(e) => setHover({ transitionDuration: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    {TRANSITION_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold block mb-2">Modo</label>
                <div className="flex gap-2">
                  {(["dark", "light", "auto"] as const).map((mode) => (
                    <button key={mode} onClick={() => setMode(mode)}
                      className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize", config.mode === mode ? "gradient-brand text-white" : "border-border hover:border-primary/30")}>
                      {mode === "dark" && <Moon className="h-3 w-3" />}
                      {mode === "light" && <Sun className="h-3 w-3" />}
                      {mode === "auto" && <Clock className="h-3 w-3" />}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {activeTab === "saved" && (
            <Section title="Looks Guardados" icon={Save} defaultOpen={true}>
              <div className="mb-4 flex gap-2">
                <input type="text" value={savedName} onChange={(e) => setSavedName(e.target.value)}
                  placeholder="Nombre del look..." className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()} />
                <button onClick={handleSave} disabled={!savedName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium gradient-brand text-white disabled:opacity-50 btn-micro">
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
              {savedLooks.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No tenés looks guardados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedLooks.map((look) => (
                    <div key={look.id} className="glass-card p-3 flex items-center gap-3">
                      <div className="flex gap-1 shrink-0">
                        {Object.entries(look.config.colors).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="w-6 h-6 rounded-md border border-border" style={{ background: v }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{look.name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(look.createdAt).toLocaleDateString("es-AR")}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { handleAnyChange(); loadLook(look.id) }}
                          className="p-2 rounded-lg hover:bg-muted transition-colors" title="Cargar">
                          <Upload className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteLook(look.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Preview</h3>
              <span className="text-[9px] text-muted-foreground">colores aplicados</span>
            </div>
            <MiniPreview config={config} />
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Verificación de Contraste</h3>
            <ContrastPanel config={config} />
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Fondo actual</h3>
            <div className="w-full h-16 rounded-xl border border-border" style={{ background: config.backgroundGradient }} />
            <p className="text-[9px] font-mono text-muted-foreground mt-2 break-all">{config.backgroundGradient.slice(0, 80)}...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
