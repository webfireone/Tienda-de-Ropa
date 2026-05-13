import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useBellezaStore, PREDEFINED_PALETTES, PRESET_BACKGROUNDS, CURATED_LOOKS, CURATED_CATEGORIES, applyThemeConfig, getDisplayGeneric, type SavedLook, type FullThemeConfig, type CuratedLook } from "@/store/bellezaStore"
import { useSiteTheme } from "@/hooks/useSiteTheme"
import { Sparkles, RotateCcw, Save, Wand2, Palette, Layers, Upload, Trash2, Check, ChevronRight, ChevronLeft, Eye, Type } from "lucide-react"
import { cn } from "@/lib/utils"

const GRADIENT_PRESETS = [
  { name: "Violeta", from: "#7c3aed", to: "#ec4899", angle: "135deg" },
  { name: "Cielo", from: "#0ea5e9", to: "#06b6d4", angle: "135deg" },
  { name: "Oro", from: "#d4af37", to: "#fbbf24", angle: "135deg" },
  { name: "Rosa", from: "#f472b6", to: "#fb7185", angle: "135deg" },
  { name: "Verde", from: "#22c55e", to: "#84cc16", angle: "135deg" },
  { name: "Naranja", from: "#f97316", to: "#f59e0b", angle: "135deg" },
  { name: "Rojo", from: "#ef4444", to: "#f97316", angle: "135deg" },
  { name: "Azul", from: "#3b82f6", to: "#8b5cf6", angle: "135deg" },
  { name: "Celeste", from: "#38bdf8", to: "#a78bfa", angle: "135deg" },
  { name: "Magenta", from: "#d946ef", to: "#f43f5e", angle: "135deg" },
  { name: "Verde azulado", from: "#14b8a6", to: "#22d3ee", angle: "135deg" },
  { name: "Amarillo", from: "#eab308", to: "#facc15", angle: "135deg" },
]

const AVAILABLE_DISPLAY_FONTS = [
  { name: "Playfair Display", family: "Playfair Display", style: "Serif elegante" },
  { name: "Cormorant Garamond", family: "Cormorant Garamond", style: "Serif clásico" },
  { name: "Dancing Script", family: "Dancing Script", style: "Script decorativo" },
  { name: "Montserrat", family: "Montserrat", style: "Sans geométrica" },
  { name: "Space Grotesk", family: "Space Grotesk", style: "Sans moderna" },
  { name: "Bebas Neue", family: "Bebas Neue", style: "Display bold" },
  { name: "Oswald", family: "Oswald", style: "Condensada bold" },
  { name: "Abril Fatface", family: "Abril Fatface", style: "Didone" },
  { name: "Alfa Slab One", family: "Alfa Slab One", style: "Slab serif" },
  { name: "Bitter", family: "Bitter", style: "Slab serif" },
  { name: "Josefin Sans", family: "Josefin Sans", style: "Sans geométrica" },
  { name: "DM Serif Display", family: "DM Serif Display", style: "Serif moderno" },
  { name: "Fraunces", family: "Fraunces", style: "Soft serif" },
  { name: "Sora", family: "Sora", style: "Sans tech" },
  { name: "Syne", family: "Syne", style: "Display" },
  { name: "Unbounded", family: "Unbounded", style: "Display" },
  { name: "Raleway", family: "Raleway", style: "Sans elegante" },
  { name: "Cinzel", family: "Cinzel", style: "Roman imperial" },
]

const AVAILABLE_BODY_FONTS = [
  { name: "Inter", family: "Inter", style: "Sans legible" },
  { name: "Poppins", family: "Poppins", style: "Sans geométrica" },
  { name: "Lato", family: "Lato", style: "Sans neutral" },
  { name: "Nunito", family: "Nunito", style: "Sans amigable" },
  { name: "Outfit", family: "Outfit", style: "Sans moderna" },
  { name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", style: "Sans versátil" },
  { name: "Manrope", family: "Manrope", style: "Sans tech" },
  { name: "Sora", family: "Sora", style: "Sans tech" },
  { name: "DM Sans", family: "DM Sans", style: "Sans minimal" },
  { name: "Lexend", family: "Lexend", style: "Sans legible" },
  { name: "Karla", family: "Karla", style: "Sans geométrica" },
  { name: "Jost", family: "Jost", style: "Sans geométrica" },
]

const PASTEL_BACKGROUNDS = [
  { id: "pastel-lavender", name: "Lavanda", preview: "linear-gradient(135deg, #e9d5ff, #ddd6fe, #e9d5ff)", css: "linear-gradient(135deg, #e9d5ff, #ddd6fe, #e9d5ff)" },
  { id: "pastel-peach", name: "Durazno", preview: "linear-gradient(135deg, #fed7aa, #fdba74, #fed7aa)", css: "linear-gradient(135deg, #fed7aa, #fdba74, #fed7aa)" },
  { id: "pastel-mint", name: "Menta", preview: "linear-gradient(135deg, #a7f3d0, #6ee7b7, #a7f3d0)", css: "linear-gradient(135deg, #a7f3d0, #6ee7b7, #a7f3d0)" },
  { id: "pastel-pink", name: "Rosa pastel", preview: "linear-gradient(135deg, #fbcfe8, #f9a8d4, #fbcfe8)", css: "linear-gradient(135deg, #fbcfe8, #f9a8d4, #fbcfe8)" },
  { id: "pastel-blue", name: "Azul pastel", preview: "linear-gradient(135deg, #bfdbfe, #93c5fd, #bfdbfe)", css: "linear-gradient(135deg, #bfdbfe, #93c5fd, #bfdbfe)" },
  { id: "pastel-yellow", name: "Amarillo pastel", preview: "linear-gradient(135deg, #fef08a, #fde047, #fef08a)", css: "linear-gradient(135deg, #fef08a, #fde047, #fef08a)" },
  { id: "pastel-rose", name: "Rosa cálido", preview: "linear-gradient(135deg, #fecdd3, #fda4af, #fecdd3)", css: "linear-gradient(135deg, #fecdd3, #fda4af, #fecdd3)" },
  { id: "pastel-purple", name: "Púrpura pastel", preview: "linear-gradient(135deg, #e9d5ff, #c4b5fd, #e9d5ff)", css: "linear-gradient(135deg, #e9d5ff, #c4b5fd, #e9d5ff)" },
  { id: "pastel-sky", name: "Cielo pastel", preview: "linear-gradient(135deg, #bae6fd, #7dd3fc, #bae6fd)", css: "linear-gradient(135deg, #bae6fd, #7dd3fc, #bae6fd)" },
  { id: "pastel-green", name: "Verde pastel", preview: "linear-gradient(135deg, #bbf7d0, #86efac, #bbf7d0)", css: "linear-gradient(135deg, #bbf7d0, #86efac, #bbf7d0)" },
  { id: "pastel-orange", name: "Naranja pastel", preview: "linear-gradient(135deg, #fed7aa, #fb923c, #fed7aa)", css: "linear-gradient(135deg, #fed7aa, #fb923c, #fed7aa)" },
  { id: "pastel-teal", name: "Verde azulado", preview: "linear-gradient(135deg, #99f6e4, #5eead4, #99f6e4)", css: "linear-gradient(135deg, #99f6e4, #5eead4, #99f6e4)" },
]

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
         <div className="h-16 rounded-lg mb-3 flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.highlight}22)`, color: c.foreground, fontFamily: `'${config.typography.fontDisplay}', ${getDisplayGeneric(config.typography.fontDisplay)}` }}>
           Descubrí tu estilo
         </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[c.primary, c.highlight, c.accent].map((color, i) => (
            <div key={i} className="h-12 rounded-lg" style={{ background: color }} />
          ))}
        </div>
        <div className="space-y-2 mb-3">
           <div className="p-3 rounded-xl" style={{ background: c.card, color: c.cardForeground }}>
             <p className="text-[10px] font-semibold mb-1" style={{ fontFamily: `'${config.typography.fontDisplay}', ${getDisplayGeneric(config.typography.fontDisplay)}` }}>Título de Card</p>
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

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    )}>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-lg">
        <Check className="h-4 w-4" />
        {message}
      </div>
    </div>
  )
}

export function BellezaPage() {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const {
    config, savedLooks,
    saveLook, deleteLook, resetToDefault, randomize, applyFullConfig,
    setTypography,
  } = useBellezaStore()
  const { saveSiteTheme, isFirestoreAvailable } = useSiteTheme()
  const saveSiteThemeRef = useRef(saveSiteTheme)
  saveSiteThemeRef.current = saveSiteTheme

  const applyTheme = (newConfig: FullThemeConfig, label: string) => {
    applyFullConfig(newConfig)
    applyThemeConfig(newConfig)
    localStorage.setItem("belleza-active-config", JSON.stringify(newConfig))
    if (isAdmin && isFirestoreAvailable) {
      saveSiteThemeRef.current(newConfig, user?.email)
    }
    showToast(label)
  }

  const [savedName, setSavedName] = useState("")
  const [activeTab, setActiveTab] = useState<"paletas" | "fondos" | "tipografia" | "guardados">("paletas")
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [customFrom, setCustomFrom] = useState("#7c3aed")
  const [customTo, setCustomTo] = useState("#ec4899")

  const [curatedCategory, setCuratedCategory] = useState<string>("minimalista")
  const [curatedIndex, setCuratedIndex] = useState(0)
  const [seenLooks, setSeenLooks] = useState<Record<string, Set<string>>>({})

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  useEffect(() => {
    if (!isAdmin) navigate("/")
  }, [isAdmin, navigate])

  useEffect(() => {
    const saved = localStorage.getItem("belleza-seen-looks")
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, string[]>
        const converted: Record<string, Set<string>> = {}
        for (const [cat, ids] of Object.entries(parsed)) {
          converted[cat] = new Set(ids)
        }
        setSeenLooks(converted)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const simplified: Record<string, string[]> = {}
    for (const [cat, ids] of Object.entries(seenLooks)) {
      simplified[cat] = Array.from(ids)
    }
    localStorage.setItem("belleza-seen-looks", JSON.stringify(simplified))
  }, [seenLooks])

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

  const currentCategoryLooks = CURATED_LOOKS.filter(l => l.category === curatedCategory)
  const currentLook = currentCategoryLooks[curatedIndex]
  const seenInCategory = seenLooks[curatedCategory] || new Set()
  const allSeenInCategory = currentCategoryLooks.length > 0 && currentCategoryLooks.every(l => seenInCategory.has(l.id))

  const handleApplyPalette = (palette: any) => {
    const newConfig: FullThemeConfig = {
      ...config,
      colors: palette.config.colors ? { ...config.colors, ...palette.config.colors } : config.colors,
      background: palette.config.background || config.background,
      backgroundGradient: palette.config.backgroundGradient || config.backgroundGradient,
      hover: palette.config.hover || config.hover,
    }
    applyTheme(newConfig, `"${palette.name}" aplicada`)
  }

  const handleApplyPresetBg = (bg: any) => {
    const newConfig: FullThemeConfig = {
      ...config,
      background: bg.id,
      backgroundGradient: bg.css,
    }
    applyTheme(newConfig, `"${bg.name}" aplicado`)
  }

  const handleApplyGradientPreset = (g: typeof GRADIENT_PRESETS[0]) => {
    const css = `linear-gradient(${g.angle}, ${g.from}, ${g.to})`
    const newConfig: FullThemeConfig = {
      ...config,
      background: "custom",
      backgroundGradient: css,
    }
    applyTheme(newConfig, `Gradient "${g.name}" aplicado`)
  }

  const handleApplyCustomGradient = () => {
    const css = `linear-gradient(135deg, ${customFrom}, ${customTo})`
    const newConfig: FullThemeConfig = {
      ...config,
      background: "custom",
      backgroundGradient: css,
    }
    applyTheme(newConfig, "Gradient personalizado aplicado")
  }

  const handleRandomize = () => {
    randomize()
    const newConfig = useBellezaStore.getState().config
    applyTheme(newConfig, "Combinación aleatoria aplicada")
  }

  const handleApplyCuratedLook = (look: CuratedLook) => {
    applyTheme(look.config, `"${look.name}" aplicada`)
  }

  const handleNextCurated = () => {
    if (!currentLook) return

    setSeenLooks(prev => {
      const catSeen = prev[curatedCategory] || new Set()
      const newSeen = new Set(catSeen)
      newSeen.add(currentLook.id)
      return { ...prev, [curatedCategory]: newSeen }
    })

    const nextIdx = (curatedIndex + 1) % currentCategoryLooks.length
    setCuratedIndex(nextIdx)
    handleApplyCuratedLook(currentCategoryLooks[nextIdx])
  }

  const handlePrevCurated = () => {
    if (!currentLook) return
    const prevIdx = (curatedIndex - 1 + currentCategoryLooks.length) % currentCategoryLooks.length
    setCuratedIndex(prevIdx)
    handleApplyCuratedLook(currentCategoryLooks[prevIdx])
  }

  const handleSelectCategory = (catId: string) => {
    setCuratedCategory(catId)
    setCuratedIndex(0)
    const looks = CURATED_LOOKS.filter(l => l.category === catId)
    if (looks.length > 0) {
      handleApplyCuratedLook(looks[0])
    }
  }

  const handleSave = () => {
    if (!savedName.trim()) return
    saveLook(savedName.trim())
    setSavedName("")
    showToast("Look guardado")
  }

  const handleLoadLook = (look: SavedLook) => {
    applyTheme(look.config, `"${look.name}" cargado`)
  }

  const handleReset = () => {
    resetToDefault()
    const defaultConfig = useBellezaStore.getState().config
    applyThemeConfig(defaultConfig)
    localStorage.removeItem("belleza-active-config")
    if (isAdmin && isFirestoreAvailable) {
      saveSiteThemeRef.current(defaultConfig, user?.email)
    }
    showToast("Restaurado al default")
  }

  const isPaletteActive = (palette: any) => {
    return config.colors.primary?.toLowerCase() === palette.config.colors?.primary?.toLowerCase()
  }

  const isBgActive = (bg: any) => {
    return config.background === bg.id || config.backgroundGradient === bg.css
  }

  const isGradientActive = (g: typeof GRADIENT_PRESETS[0]) => {
    const css = `linear-gradient(${g.angle}, ${g.from}, ${g.to})`
    return config.backgroundGradient === css
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
          <p className="text-sm text-muted-foreground">Hacé click en una paleta o fondo para aplicarlo al instante.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRandomize} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium gradient-brand text-white shadow-sm btn-micro hover:opacity-90 transition-all">
            <Wand2 className="h-4 w-4" />
            Aleatorio
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-destructive/30 hover:text-destructive transition-all">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {CURATED_CATEGORIES.map((cat) => {
            const catLooks = CURATED_LOOKS.filter(l => l.category === cat.id)
            const seenCount = (seenLooks[cat.id] || new Set()).size
            const total = catLooks.length
            const isActive = curatedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  isActive ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-60">({seenCount}/{total})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 w-fit">
          {[
            { key: "paletas", label: "Paletas", icon: Palette },
            { key: "fondos", label: "Fondos", icon: Layers },
            { key: "tipografia", label: "Tipografía", icon: Type },
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
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">
                    {CURATED_CATEGORIES.find(c => c.id === curatedCategory)?.emoji} {CURATED_CATEGORIES.find(c => c.id === curatedCategory)?.name} ({currentCategoryLooks.length})
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handlePrevCurated} className="p-2 rounded-xl border border-border hover:border-primary/30 transition-all">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={handleNextCurated} className="p-2 rounded-xl gradient-brand text-white hover:opacity-90 transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentCategoryLooks.map((look, idx) => {
                    const isActive = config.colors.primary?.toLowerCase() === look.config.colors.primary?.toLowerCase()
                    const isSeen = (seenLooks[curatedCategory] || new Set()).has(look.id)
                    return (
                      <button key={look.id} onClick={() => { setCuratedIndex(idx); handleApplyCuratedLook(look) }}
                        className={cn("glass-card p-3 text-left hover-lift group transition-all relative", isActive && "ring-2 ring-primary")}>
                        {isActive && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground z-10">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="h-12 rounded-lg mb-2" style={{ background: look.config.backgroundGradient }} />
                        <p className="text-xs font-semibold truncate">{look.name}</p>
                        <div className="flex gap-1 mt-1">
                          {Object.entries(look.config.colors).filter(([k]) => ["primary", "secondary", "accent", "highlight"].includes(k)).map(([k, v]) => (
                            <div key={k} className="w-4 h-4 rounded-sm border border-border" style={{ background: v }} title={k} />
                          ))}
                        </div>
                        {isSeen && !isActive && (
                          <span className="absolute bottom-2 right-2">
                            <Eye className="h-3 w-3 text-muted-foreground/50" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {allSeenInCategory && (
                  <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary">Ya viste los {currentCategoryLooks.length} de {CURATED_CATEGORIES.find(c => c.id === curatedCategory)?.name}</p>
                    <button onClick={() => { setSeenLooks(prev => ({ ...prev, [curatedCategory]: new Set() })); showToast("Lista reiniciada") }}
                      className="text-[10px] text-primary/70 hover:text-primary underline mt-1">
                      Reiniciar vista
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Paletas guardadas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PREDEFINED_PALETTES.map((palette) => (
                    <button key={palette.id} onClick={() => handleApplyPalette(palette)}
                      className={cn("glass-card p-4 text-left hover-lift group transition-all relative", isPaletteActive(palette) && "ring-2 ring-primary")}>
                      {isPaletteActive(palette) && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" /> Activo
                        </span>
                      )}
                      <div className="flex items-start gap-2 mb-3 pt-1">
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
              </div>
            </div>
          )}

          {activeTab === "fondos" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Fondos oscuros</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {PRESET_BACKGROUNDS.filter(b => !b.id.includes("snow") && !b.id.includes("light") && !b.id.includes("peach") && !b.id.includes("lavender") && !b.id.includes("cream") && !b.id.includes("sky-light") && !b.id.includes("pastel")).map((bg) => (
                    <button key={bg.id} onClick={() => handleApplyPresetBg(bg)}
                      className={cn("relative h-16 rounded-xl overflow-hidden border-2 transition-all", isBgActive(bg) ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50")}>
                      {isBgActive(bg) && (
                        <span className="absolute top-1 right-1 z-10">
                          <Check className="h-3 w-3 text-white drop-shadow" />
                        </span>
                      )}
                      <div className="absolute inset-0" style={{ background: bg.preview }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-1">
                        <span className="text-[9px] text-white font-medium">{bg.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Fondos claros</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {PRESET_BACKGROUNDS.filter(b => b.id.includes("snow") || b.id.includes("light") || b.id.includes("peach") || b.id.includes("lavender") || b.id.includes("cream") || b.id.includes("sky-light")).map((bg) => (
                    <button key={bg.id} onClick={() => handleApplyPresetBg(bg)}
                      className={cn("relative h-16 rounded-xl overflow-hidden border-2 transition-all", isBgActive(bg) ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50")}>
                      {isBgActive(bg) && (
                        <span className="absolute top-1 right-1 z-10">
                          <Check className="h-3 w-3 text-black drop-shadow" />
                        </span>
                      )}
                      <div className="absolute inset-0" style={{ background: bg.preview }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 px-1">
                        <span className="text-[9px] text-white font-medium">{bg.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Fondos pastel</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {PASTEL_BACKGROUNDS.map((bg) => (
                    <button key={bg.id} onClick={() => handleApplyPresetBg(bg)}
                      className={cn("relative h-16 rounded-xl overflow-hidden border-2 transition-all", isBgActive(bg) ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50")}>
                      {isBgActive(bg) && (
                        <span className="absolute top-1 right-1 z-10">
                          <Check className="h-3 w-3 text-black drop-shadow" />
                        </span>
                      )}
                      <div className="absolute inset-0" style={{ background: bg.preview }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-1 px-1">
                        <span className="text-[9px] text-white font-medium">{bg.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Gradients de color</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button key={g.name} onClick={() => handleApplyGradientPreset(g)}
                      title={g.name}
                      className={cn("relative h-12 rounded-xl overflow-hidden border-2 transition-all", isGradientActive(g) ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50")}>
                      <div className="absolute inset-0" style={{ background: `linear-gradient(${g.angle}, ${g.from}, ${g.to})` }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold mb-3">Gradient personalizado</h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-1">Color 1</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border appearance-none" style={{ background: customFrom }} />
                      <input type="text" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                        className="flex-1 text-xs font-mono bg-muted border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-1">Color 2</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border appearance-none" style={{ background: customTo }} />
                      <input type="text" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                        className="flex-1 text-xs font-mono bg-muted border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <button onClick={handleApplyCustomGradient} className="px-5 py-2.5 rounded-xl text-sm font-medium gradient-brand text-white transition-all whitespace-nowrap">
                    Aplicar
                  </button>
                </div>
                <div className="mt-3 w-full h-12 rounded-xl border border-border" style={{ background: `linear-gradient(135deg, ${customFrom}, ${customTo})` }} />
              </div>
            </div>
          )}

          {activeTab === "tipografia" && (
            <div className="space-y-6">
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-1">Fuente de Títulos</h3>
                <p className="text-xs text-muted-foreground mb-3">Elegí la fuente que se usa en títulos y headings.</p>
                <div className="grid grid-cols-1 gap-2">
                 {AVAILABLE_DISPLAY_FONTS.map((font) => {
                     const isActive = config.typography.fontDisplay === font.family
                     const fallback = getDisplayGeneric(font.family)
                     return (
                       <button key={font.family} onClick={() => {
                         setTypography({ fontDisplay: font.family })
                         applyTheme({ ...config, typography: { ...config.typography, fontDisplay: font.family } }, `Display: ${font.name}`)
                       }}
                         className={cn("w-full p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden", isActive ? "border-primary" : "border-border hover:border-primary/50")}>
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="text-base font-semibold" style={{ fontFamily: `'${font.family}', ${fallback}` }}>{font.name}</p>
                             <p className="text-[10px] text-muted-foreground">{font.style}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-2xl font-black" style={{ fontFamily: `'${font.family}', ${fallback}` }}>GLAMOURS</p>
                             <p className="text-xs" style={{ fontFamily: `'${font.family}', ${fallback}` }}>La elegancia es atemporal</p>
                           </div>
                         </div>
                         {isActive && <span className="absolute top-2 right-2"><Check className="h-4 w-4 text-primary" /></span>}
                       </button>
                     )
                   })}
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-1">Fuente de Cuerpo</h3>
                <p className="text-xs text-muted-foreground mb-3">Elegí la fuente para texto legible y párrafos.</p>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_BODY_FONTS.map((font) => {
                    const isActive = config.typography.fontBody === font.family
                    return (
                      <button key={font.family} onClick={() => {
                        setTypography({ fontBody: font.family })
                        applyTheme({ ...config, typography: { ...config.typography, fontBody: font.family } }, `Body: ${font.name}`)
                      }}
                        className={cn("w-full p-3 rounded-xl border-2 transition-all text-left relative", isActive ? "border-primary" : "border-border hover:border-primary/50")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-semibold" style={{ fontFamily: `'${font.family}', sans-serif` }}>{font.name}</p>
                            <p className="text-[10px] text-muted-foreground">{font.style}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ fontFamily: `'${font.family}', sans-serif` }}>La moda nunca pasa</p>
                            <p className="text-sm" style={{ fontFamily: `'${font.family}', sans-serif` }}>Descubre las últimas tendencias en ropa y accesorios.</p>
                          </div>
                        </div>
                        {isActive && <span className="absolute top-2 right-2"><Check className="h-4 w-4 text-primary" /></span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3">Estilo de Títulos</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Peso del heading</label>
                    <div className="flex gap-2">
                      {[
                        { label: "Fino", value: "100" },
                        { label: "Light", value: "300" },
                        { label: "Normal", value: "400" },
                        { label: "Medium", value: "500" },
                        { label: "Semi", value: "600" },
                        { label: "Bold", value: "700" },
                        { label: "Black", value: "900" },
                      ].map((w) => (
                        <button key={w.value} onClick={() => {
                          setTypography({ headingWeight: w.value })
                          applyTheme({ ...config, typography: { ...config.typography, headingWeight: w.value } }, `Peso: ${w.label}`)
                        }}
                          className={cn("flex-1 py-2 px-1 rounded-lg text-xs font-medium border transition-all", config.typography.headingWeight === w.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-muted-foreground")}>
                          {w.label}<br /><span className="font-bold">{w.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Sombra del texto</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[
                        { label: "Ninguna", value: "none" },
                        { label: "Sutil", value: "0 1px 2px rgba(0,0,0,0.1)" },
                        { label: "Media", value: "0 2px 4px rgba(0,0,0,0.15)" },
                        { label: "Fuerte", value: "0 4px 8px rgba(0,0,0,0.2)" },
                        { label: "Neón", value: "0 0 10px rgba(124,58,237,0.6)" },
                        { label: "Glow", value: "0 0 20px rgba(236,72,153,0.5)" },
                      ].map((s) => (
                        <button key={s.value} onClick={() => {
                          setTypography({ textShadow: s.value })
                          applyTheme({ ...config, typography: { ...config.typography, textShadow: s.value } }, `Sombra: ${s.label}`)
                        }}
                          className={cn("py-2 px-1 rounded-lg text-[10px] font-medium border transition-all", config.typography.textShadow === s.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-muted-foreground")}>
                          <span style={{ textShadow: s.value === "none" ? undefined : s.value }} className="font-bold">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Preview en vivo</label>
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-3xl font-black" style={{
                        fontFamily: `'${config.typography.fontDisplay}', serif`,
                        fontWeight: parseInt(config.typography.headingWeight) as any,
                        textShadow: config.typography.textShadow === "none" ? undefined : config.typography.textShadow,
                      }}>
                        GLAMOURS
                      </p>
                      <p className="text-sm mt-2" style={{ fontFamily: `'${config.typography.fontBody}', sans-serif` }}>
                        La elegancia es atemporal. Descubrí tu estilo con nuestra colección exclusiva.
                      </p>
                    </div>
                  </div>
                </div>
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
                        <button onClick={() => handleLoadLook(look)}
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

      <Toast message={toastMsg || ""} visible={!!toastMsg} />
    </div>
  )
}
