import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useBellezaStore, CURATED_LOOKS, CURATED_CATEGORIES, applyThemeConfig, getDisplayGeneric, type FullThemeConfig, type CuratedLook, type SavedLook } from "@/store/bellezaStore"
import { useSiteTheme } from "@/hooks/useSiteTheme"
import { Sparkles, RotateCcw, Save, Wand2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const FONT_OPTIONS = [
  { name: "Playfair Display", family: "Playfair Display", type: "d" },
  { name: "Cormorant Garamond", family: "Cormorant Garamond", type: "d" },
  { name: "Dancing Script", family: "Dancing Script", type: "d" },
  { name: "Montserrat", family: "Montserrat", type: "d" },
  { name: "Space Grotesk", family: "Space Grotesk", type: "d" },
  { name: "Bebas Neue", family: "Bebas Neue", type: "d" },
  { name: "Oswald", family: "Oswald", type: "d" },
  { name: "Inter", family: "Inter", type: "b" },
  { name: "Poppins", family: "Poppins", type: "b" },
  { name: "Lato", family: "Lato", type: "b" },
  { name: "Nunito", family: "Nunito", type: "b" },
  { name: "Outfit", family: "Outfit", type: "b" },
  { name: "DM Sans", family: "DM Sans", type: "b" },
  { name: "Manrope", family: "Manrope", type: "b" },
  { name: "Armata", family: "Armata", type: "m" },
  { name: "Inter", family: "Inter", type: "m" },
  { name: "Montserrat", family: "Montserrat", type: "m" },
  { name: "Poppins", family: "Poppins", type: "m" },
  { name: "Space Grotesk", family: "Space Grotesk", type: "m" },
  { name: "Outfit", family: "Outfit", type: "m" },
  { name: "Raleway", family: "Raleway", type: "m" },
  { name: "DM Sans", family: "DM Sans", type: "m" },
]

const WEIGHT_OPTIONS = [
  { label: "Normal", value: "400" },
  { label: "Semibold", value: "500" },
  { label: "Bold", value: "600" },
  { label: "Extra Bold", value: "700" },
  { label: "Black", value: "800" },
  { label: "Extra Black", value: "900" },
]

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg gradient-brand text-white">
        <Check className="h-4 w-4" />{message}
      </div>
    </div>
  )
}

function LookCard({ look, isActive, onClick }: { look: CuratedLook; isActive: boolean; onClick: () => void }) {
  const c = look.config.colors
  return (
    <button onClick={onClick} className={cn("relative rounded-xl overflow-hidden border-2 transition-all text-left", isActive ? "border-primary ring-2 ring-primary/30" : "border-border/50 hover:border-primary/50")}>
      <div className="h-16 relative" style={{ background: look.config.backgroundGradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {isActive && <span className="absolute top-1.5 right-1.5 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /></span>}
      </div>
      <div className="p-2 bg-card">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">{CURATED_CATEGORIES.find(x => x.id === look.category)?.emoji || "🎨"}</span>
          <span className="text-[11px] font-semibold truncate">{look.name}</span>
        </div>
        <div className="flex gap-1">{Object.entries(c).filter(([k]) => ["primary", "highlight", "accent", "secondary"].includes(k)).map(([k, v]) => <div key={k} className="w-3.5 h-3.5 rounded-sm border border-border/50" style={{ background: v }} />)}</div>
      </div>
    </button>
  )
}

export function BellezaPage() {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const { config, savedLooks, saveLook, deleteLook, resetToDefault, randomize, applyFullConfig, setTypography } = useBellezaStore()
  const { saveSiteTheme, isFirestoreAvailable } = useSiteTheme()
  const saveSiteThemeRef = useRef(saveSiteTheme)
  saveSiteThemeRef.current = saveSiteTheme

  const [category, setCategory] = useState("minimalista")
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showSave, setShowSave] = useState(false)
  const [saveName, setSaveName] = useState("")

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500) }

  const applyTheme = (newConfig: FullThemeConfig, label: string) => {
    applyFullConfig(newConfig); applyThemeConfig(newConfig)
    localStorage.setItem("belleza-active-config", JSON.stringify(newConfig))
    if (isAdmin && isFirestoreAvailable) saveSiteThemeRef.current(newConfig, user?.email)
    showToast(label)
  }

  const handleFont = (k: "fontDisplay" | "fontBody" | "fontMenu", v: string) => {
    const label = k === "fontDisplay" ? "Títulos" : k === "fontBody" ? "Texto" : "Menú"
    setTypography({ [k]: v }); applyTheme({ ...config, typography: { ...config.typography, [k]: v } }, `${label}: ${v}`)
  }

  const handleWeight = (k: "headingWeight" | "bodyWeight", v: string) => {
    const label = k === "headingWeight" ? "Negrita Títulos" : "Negrita Texto"
    setTypography({ [k]: v }); applyTheme({ ...config, typography: { ...config.typography, [k]: v } }, `${label}: ${v}`)
  }

  const handleApply = (look: CuratedLook) => applyTheme(look.config, `"${look.name}" aplicado`)
  const handleRandomize = () => { randomize(); applyTheme(useBellezaStore.getState().config, "Aleatorio") }
  const handleReset = () => { resetToDefault(); const c = useBellezaStore.getState().config; applyThemeConfig(c); localStorage.removeItem("belleza-active-config"); if (isAdmin && isFirestoreAvailable) saveSiteThemeRef.current(c, user?.email); showToast("Default") }
  const handleSave = () => { if (!saveName.trim()) return; saveLook(saveName.trim()); setSaveName(""); setShowSave(false); showToast("Guardado") }
  const handleLoad = (look: SavedLook) => applyTheme(look.config, `"${look.name}" cargado`)

  useEffect(() => { if (!isAdmin) navigate("/") }, [isAdmin, navigate])

  const currentLooks = CURATED_LOOKS.filter(l => l.category === category)
  const c = config.colors
  const bodyFont = `'${config.typography.fontBody}', sans-serif`
  const displayFont = `'${config.typography.fontDisplay}', ${getDisplayGeneric(config.typography.fontDisplay)}`
  const menuFont = `'${config.typography.fontMenu}', sans-serif`
  const gradStyle = { background: `linear-gradient(135deg, ${c.primary}, ${c.highlight || c.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } as const
  const hw = config.typography.headingWeight
  const bw = config.typography.bodyWeight

  if (!isAdmin) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0" style={{ color: c.primary }} />
            <h1 className="font-display text-2xl font-bold" style={gradStyle}>BELLEZA</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Elegí un look o ajustá fuentes y negritas. Todo se ve en la preview abajo.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSave(!showSave)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border hover:border-primary/50 transition-all"><Save className="h-3.5 w-3.5" /> Guardar</button>
          <button onClick={handleRandomize} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.highlight || c.accent})` }}><Wand2 className="h-3.5 w-3.5" /> Aleatorio</button>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border hover:border-destructive/30 hover:text-destructive transition-all"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
        </div>
      </div>

      {/* Save dialog */}
      {showSave && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50">
          <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Nombre del look..." className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          <button onClick={handleSave} disabled={!saveName.trim()} className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-all" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.highlight || c.accent})` }}>Guardar</button>
          <button onClick={() => setShowSave(false)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Saved looks */}
      {savedLooks.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tus looks guardados</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {savedLooks.map(look => (
              <button key={look.id} onClick={() => handleLoad(look)} className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl border border-border/50 hover:border-primary/30 bg-card transition-all">
                <div className="flex gap-0.5">{Object.entries(look.config.colors).slice(0, 3).map(([k, v]) => <div key={k} className="w-3 h-3 rounded-sm" style={{ background: v as string }} />)}</div>
                <span className="text-xs font-medium">{look.name}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteLook(look.id) }} className="text-muted-foreground hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Looks + Fonts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Looks */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Elegí un look</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CURATED_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all shrink-0", category === cat.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40")}
                style={category === cat.id ? { borderColor: c.primary, color: c.primary } : {}}>
                <span>{cat.emoji}</span><span>{cat.name}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {currentLooks.map(look => (
              <LookCard key={look.id} look={look} isActive={c.primary?.toLowerCase() === look.config.colors.primary?.toLowerCase()} onClick={() => handleApply(look)} />
            ))}
          </div>
        </div>

        {/* Fonts + Weights */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipografía</p>
          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
            {[
              { label: "Títulos", key: "fontDisplay" as const, filter: "d", wKey: "headingWeight" as const },
              { label: "Texto", key: "fontBody" as const, filter: "b", wKey: "bodyWeight" as const },
              { label: "Menú", key: "fontMenu" as const, filter: "m", wKey: null },
            ].map(({ label, key, filter, wKey }) => (
              <div key={key}>
                <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                <div className="flex gap-1.5">
                  <select value={config.typography[key]} onChange={(e) => handleFont(key, e.target.value)}
                    className="flex-1 appearance-none bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 cursor-pointer"
                    style={{ outlineColor: c.primary }}>
                    {FONT_OPTIONS.filter(f => f.type === filter).map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                  </select>
                  {wKey && (
                    <select value={config.typography[wKey]} onChange={(e) => handleWeight(wKey, e.target.value)}
                      className="w-20 appearance-none bg-muted border border-border rounded-lg px-2 py-1.5 text-[11px] font-medium text-center focus:outline-none focus:ring-1 cursor-pointer"
                      style={{ outlineColor: c.primary }}>
                      {WEIGHT_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Color info */}
          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Colores del tema</p>
            <div className="flex gap-1.5">{[c.primary, c.highlight, c.accent, c.secondary, c.success, c.warning, c.destructive].filter(Boolean).map((clr, i) => <div key={i} className="flex-1 h-5 rounded-md border border-border/30" style={{ background: clr }} title={Object.keys(c).filter(k => ["primary", "highlight", "accent", "secondary", "success", "warning", "destructive"].includes(k))[i]} />)}</div>
            <div className="w-full h-8 rounded-lg border border-border/30" style={{ background: config.backgroundGradient }} />
          </div>
        </div>
      </div>

      {/* Full site preview */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vista previa del sitio</p>
        <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl" style={{ background: c.background, color: c.foreground, fontFamily: bodyFont, fontWeight: bw }}>
          {/* Header bar */}
          <div style={{ background: c.card, borderBottom: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-bold text-sm" style={{ fontFamily: displayFont, color: c.primary, fontWeight: hw }}>GLAMOURS</span>
              <div className="flex items-center gap-4 text-[11px]" style={{ fontFamily: menuFont, color: c.mutedForeground }}>
                {["Inicio", "Catálogo", "Ofertas", "Nueva Colección"].map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="px-5 py-12 text-center" style={{ background: config.backgroundGradient }}>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: displayFont, fontWeight: hw, textShadow: c.background === "#0a0a0f" ? "0 2px 12px rgba(0,0,0,0.4)" : "none" }}>
              <span style={gradStyle}>Descubrí tu estilo</span>
            </h1>
            <p className="text-sm max-w-md mx-auto mb-4" style={{ color: c.mutedForeground }}>Moda unisex con la mejor calidad y los mejores precios.</p>
            <button className="px-6 py-2 rounded-xl text-sm font-bold shadow-md" style={{ background: c.primary, color: c.primaryForeground }}>Ver colección</button>
          </div>

          {/* Products */}
          <div className="px-5 py-6">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: displayFont, color: c.foreground, fontWeight: hw }}>Novedades</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Campera urbana", "Remera básica", "Jean slim"].map((name, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                  <div className="h-24 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.highlight}22)` }}><span className="text-3xl opacity-60">👕</span></div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold" style={{ fontFamily: displayFont, color: c.cardForeground, fontWeight: hw }}>{name}</p>
                    <p className="text-xs font-bold" style={{ color: c.primary }}>${[45000, 12500, 28000][i].toLocaleString("es-AR")}</p>
                    <button className="w-full py-1.5 rounded-lg text-xs font-bold" style={{ background: c.primary, color: c.primaryForeground }}>Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography showcase */}
          <div className="px-5 py-6 border-t" style={{ borderColor: c.border }}>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: displayFont, color: c.foreground, fontWeight: hw }}>Tipografía en acción</h2>
            <div className="space-y-2">
              <p className="text-2xl font-black" style={{ fontFamily: displayFont, color: c.foreground, fontWeight: hw }}>Título principal <span style={gradStyle}>(Display)</span></p>
              <p className="text-sm" style={{ fontFamily: bodyFont, color: c.foreground }}>Este es el texto de cuerpo que usan los párrafos y descripciones de la tienda. Se ve cómo queda la fuente seleccionada.</p>
              <p className="text-xs tracking-wide" style={{ fontFamily: menuFont, color: c.mutedForeground }}>Menú · Inicio · Catálogo · Ofertas · Nueva Colección</p>
            </div>
          </div>

          {/* Color bar */}
          <div className="flex h-2">{[c.primary, c.highlight, c.accent, c.secondary, c.success, c.warning, c.destructive].filter(Boolean).map((clr, i) => <div key={i} className="flex-1" style={{ background: clr }} />)}</div>

          {/* Footer */}
          <div className="px-5 py-4 text-center" style={{ background: c.card, borderTop: `1px solid ${c.border}` }}>
            <p className="text-[10px]" style={{ color: c.mutedForeground }}>GLAMOURS — Todos los derechos reservados</p>
          </div>
        </div>
      </div>

      <Toast message={toastMsg || ""} visible={!!toastMsg} />
    </div>
  )
}
