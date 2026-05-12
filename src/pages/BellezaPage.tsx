import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useViewTransitionNavigate } from "@/hooks/useViewTransitionNavigate"
import { useBellezaStore, PREDEFINED_PALETTES, PRESET_BACKGROUNDS, checkContrast, applyThemeConfig, type PredefinedPalette, type SavedLook, type FullThemeConfig } from "@/store/bellezaStore"
import { Sparkles, RotateCcw, Save, Wand2, ChevronDown, ChevronUp, AlertTriangle, Check, Trash2, Palette, Type, Layers, MousePointer, Layout, Upload, Moon, Sun, Clock } from "lucide-react"
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

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
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

function ColorInput({ label, value, onChange, description }: { label: string; value: string; onChange: (v: string) => void; description?: string }) {
  const [inputVal, setInputVal] = useState(value)
  useEffect(() => { setInputVal(value) }, [value])
  const result = checkContrast(inputVal, "#0d0d1a")

  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <input
          type="color"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value) }}
          className="w-10 h-10 rounded-lg cursor-pointer border border-border appearance-none"
          style={{ background: inputVal }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {result.status !== "fail" ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-destructive" />
          )}
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value) }}
          className="w-full text-xs font-mono text-muted-foreground bg-muted border border-border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {description && <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function ContrastBadge({ bg, fg }: { bg: string; fg: string }) {
  const result = checkContrast(fg, bg)
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
      result.status === "pass" ? "bg-success/20 text-success" : result.status === "warn" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
    )}>
      {result.status === "pass" ? <Check className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
      {result.ratio.toFixed(1)}:1
    </span>
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
    if (!isAdmin) navigate("/")
  }, [isAdmin, navigate])

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

  const handleSave = () => {
    if (!savedName.trim()) return
    saveLook(savedName.trim())
    setSavedName("")
  }

  const handleApplyPalette = (palette: PredefinedPalette) => {
    if (palette.config.colors) setColors(palette.config.colors as any)
    if (palette.config.background) setBackground(palette.config.background as any)
    if (palette.config.backgroundGradient) setBackgroundGradient(palette.config.backgroundGradient)
    if (palette.config.hover) setHover(palette.config.hover)
  }

  const handleRandomize = () => {
    randomize()
  }

  const handleReset = () => {
    resetToDefault()
    applyThemeConfig(useBellezaStore.getState().config)
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
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
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-destructive/30 hover:text-destructive transition-all">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="mb-6 p-3 rounded-2xl glass-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-xs">Cada cambio se aplica INSTANTÁNEAMENTE en toda la web.</span>
        </div>
        <button
          onClick={() => {
            localStorage.setItem("belleza-active-config", JSON.stringify(config))
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium gradient-brand text-white shadow-sm btn-micro"
        >
          <Save className="h-3 w-3" />
          Guardar como favorito
        </button>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 w-fit">
        {[
          { key: "palettes", label: "Paletas", icon: Palette },
          { key: "colors", label: "Colores", icon: Palette },
          { key: "bg", label: "Fondos", icon: Layers },
          { key: "fonts", label: "Tipografía", icon: Type },
          { key: "layout", label: "Layout", icon: Layout },
          { key: "saved", label: `Guardados (${savedLooks.length})`, icon: Save },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "palettes" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREDEFINED_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => handleApplyPalette(palette)}
                    className="glass-card p-4 text-left hover-lift group transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{palette.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{palette.name}</h3>
                        <p className="text-xs text-muted-foreground">{palette.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      {palette.config.colors && Object.entries(palette.config.colors).slice(0, 6).map(([k, v]) => (
                        <div
                          key={k}
                          className="w-8 h-8 rounded-lg shadow-sm border border-border"
                          style={{ background: v as string }}
                          title={k}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-success">✓ </span>
                      {palette.recommended.slice(0, 2).join(", ")}
                    </div>
                  </button>
                ))}
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Generador Aleatorio Seguro</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Genera combinaciones visuales atractivas con contraste WCAG válido automáticamente.</p>
                <button onClick={handleRandomize} className="w-full py-3 rounded-xl gradient-brand text-white font-medium text-sm hover:opacity-90 transition-opacity btn-micro">
                  🎲 Generar combinación aleatoria
                </button>
              </div>
            </div>
          )}

          {activeTab === "colors" && (
            <Section title="Paleta de Colores" icon={Palette}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_KEYS.map(({ key, label, desc }) => (
                  <ColorInput
                    key={key}
                    label={label}
                    description={desc}
                    value={config.colors[key as keyof typeof config.colors]}
                    onChange={(v) => setColors({ [key]: v })}
                  />
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted/50">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  Contraste automático
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Fondo → Texto:</span>
                    <ContrastBadge bg={config.colors.background} fg={config.colors.foreground} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Primario → Fore:</span>
                    <ContrastBadge bg={config.colors.primary} fg={config.colors.primaryForeground} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tarjeta → Texto:</span>
                    <ContrastBadge bg={config.colors.card} fg={config.colors.cardForeground} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Secundario:</span>
                    <ContrastBadge bg={config.colors.secondary} fg={config.colors.secondaryForeground} />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {activeTab === "bg" && (
            <Section title="Fondos y Efectos" icon={Layers}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBackground(bg.id)}
                    className={cn(
                      "relative h-16 rounded-xl overflow-hidden border-2 transition-all",
                      config.background === bg.id ? "border-primary shadow-sm" : "border-border hover:border-primary/30"
                    )}
                    title={bg.name}
                  >
                    <div className="absolute inset-0" style={{ background: bg.preview }} />
                    {config.background === bg.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 px-1">
                      <span className="text-[9px] text-white">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold block mb-2">Gradient personalizado</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGradient}
                    onChange={(e) => setCustomGradient(e.target.value)}
                    placeholder="linear-gradient(135deg, #0d0d1a, #7c5cfc)"
                    className="flex-1 text-xs font-mono bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => setBackgroundGradient(customGradient)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:border-primary/30 transition-all"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {["particles", "orbs", "grid", "glass", "grain"].map((effect) => (
                  <label key={effect} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.effects[effect as keyof typeof config.effects]}
                      onChange={(e) => setEffects({ [effect]: e.target.checked })}
                      className="rounded border-border"
                    />
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
                  <select
                    value={config.typography.fontDisplay}
                    onChange={(e) => setTypography({ fontDisplay: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label} ({f.category})</option>)}
                  </select>
                  <p className="text-xs mt-1 opacity-60" style={{ fontFamily: config.typography.fontDisplay }}>Aa Gq Text</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Fuente Body</label>
                  <select
                    value={config.typography.fontBody}
                    onChange={(e) => setTypography({ fontBody: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label} ({f.category})</option>)}
                  </select>
                  <p className="text-xs mt-1 opacity-60" style={{ fontFamily: config.typography.fontBody }}>Aa Gq Text</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Peso Títulos: {config.typography.headingWeight}</label>
                  <input
                    type="range"
                    min="400"
                    max="900"
                    step="100"
                    value={parseInt(config.typography.headingWeight)}
                    onChange={(e) => setTypography({ headingWeight: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Base: {config.typography.baseSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={config.typography.baseSize}
                    onChange={(e) => setTypography({ baseSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Scale Ratio: {config.typography.scaleRatio}</label>
                  <select
                    value={config.typography.scaleRatio}
                    onChange={(e) => setTypography({ scaleRatio: parseFloat(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {SCALE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Line Height: {config.typography.lineHeight}</label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={parseFloat(config.typography.lineHeight)}
                    onChange={(e) => setTypography({ lineHeight: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            </Section>
          )}

          {activeTab === "layout" && (
            <Section title="Layout y Espaciado" icon={Layout}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-2">Border Radius</label>
                  <select
                    value={config.layout.borderRadius}
                    onChange={(e) => setLayout({ borderRadius: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Spacing Unit: {config.layout.spacingUnit}px</label>
                  <select
                    value={config.layout.spacingUnit}
                    onChange={(e) => setLayout({ spacingUnit: parseInt(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {SPACING_OPTIONS.map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Shadow: {config.layout.shadowIntensity}x</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.layout.shadowIntensity}
                    onChange={(e) => setLayout({ shadowIntensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Blur: {config.layout.blurIntensity}x</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.layout.blurIntensity}
                    onChange={(e) => setLayout({ blurIntensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </Section>
          )}

          {activeTab === "layout" && (
            <Section title="Hover y Microinteracciones" icon={MousePointer}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-2">Lift Distance</label>
                  <select
                    value={config.hover.liftDistance}
                    onChange={(e) => setHover({ liftDistance: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {["2px", "3px", "4px", "6px", "8px", "12px"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Glow Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={config.hover.glowColor}
                      onChange={(e) => setHover({ glowColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border appearance-none"
                    />
                    <input
                      type="text"
                      value={config.hover.glowColor}
                      onChange={(e) => setHover({ glowColor: e.target.value })}
                      className="flex-1 text-xs font-mono bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Glow Intensity: {config.hover.glowIntensity.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={config.hover.glowIntensity}
                    onChange={(e) => setHover({ glowIntensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2">Transición</label>
                  <select
                    value={config.hover.transitionDuration}
                    onChange={(e) => setHover({ transitionDuration: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TRANSITION_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold block mb-2">Modo</label>
                <div className="flex gap-2">
                  {(["dark", "light", "auto"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMode(mode)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize",
                        config.mode === mode ? "gradient-brand text-white" : "border-border hover:border-primary/30"
                      )}
                    >
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
                <input
                  type="text"
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  placeholder="Nombre del look..."
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button
                  onClick={handleSave}
                  disabled={!savedName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium gradient-brand text-white disabled:opacity-50 btn-micro"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
              {savedLooks.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No tenés looks guardados.</p>
                  <p className="text-xs text-muted-foreground mt-1">Guardá tu look actual para poder recuperarlo después.</p>
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
                        <button
                          onClick={() => loadLook(look.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Cargar"
                        >
                          <Upload className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteLook(look.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
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

        <div className="space-y-4">
          <div className="glass-card p-4 sticky top-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">Preview Rápido</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-border" style={{ background: config.colors.background, color: config.colors.foreground }}>
                <p className="text-lg font-bold" style={{ fontFamily: config.typography.fontDisplay }}>Título</p>
                <p className="text-sm" style={{ fontFamily: config.typography.fontBody }}>Texto de prueba. Cómo se ve?</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: config.colors.card, color: config.colors.cardForeground }}>
                <p className="text-sm font-semibold">Tarjeta</p>
                <p className="text-xs opacity-70">Fondo de tarjeta</p>
              </div>
              <div className="p-4 rounded-xl border border-border" style={{ background: config.colors.primary, color: config.colors.primaryForeground }}>
                <p className="text-sm font-semibold">Botón Primario</p>
              </div>
              <div className="p-4 rounded-xl border border-border" style={{ background: config.colors.secondary, color: config.colors.secondaryForeground }}>
                <p className="text-sm font-semibold">Color Secundario</p>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.primary }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.secondary }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.accent }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.success }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.warning }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.destructive }} />
                <div className="flex-1 h-8 rounded-md border border-border" style={{ background: config.colors.highlight }} />
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Contraste</h3>
            <div className="space-y-2">
              {[
                { label: "Texto princ.", fg: config.colors.foreground, bg: config.colors.background },
                { label: "Texto card", fg: config.colors.cardForeground, bg: config.colors.card },
                { label: "Prim/Fore", fg: config.colors.primaryForeground, bg: config.colors.primary },
              ].map(({ label, fg, bg }) => {
                const result = checkContrast(fg, bg)
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-border" style={{ background: bg }} />
                      <div className="w-5 h-5 rounded border border-border" style={{ background: fg }} />
                      <span className={cn("text-[10px] font-bold", result.status === "pass" ? "text-success" : result.status === "warn" ? "text-warning" : "text-destructive")}>
                        {result.ratio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Fondo actual</h3>
            <div
              className="w-full h-20 rounded-xl border border-border"
              style={{ background: config.backgroundGradient }}
            />
            <p className="text-[10px] font-mono text-muted-foreground mt-2 truncate">{config.backgroundGradient.slice(0, 60)}...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
