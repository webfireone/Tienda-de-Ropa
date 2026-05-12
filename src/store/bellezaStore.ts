export interface ColorPalette {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  border: string
  success: string
  warning: string
  destructive: string
  highlight: string
  input: string
  ring: string
}

export type BackgroundType =
  | "gradient-dark"
  | "gradient-mesh"
  | "gradient-sunset"
  | "gradient-ocean"
  | "gradient-forest"
  | "gradient-purple"
  | "gradient-rose"
  | "gradient-gold"
  | "particles"
  | "grid"
  | "solid-dark"
  | "solid-card"
  | "stars"
  | "abstract"
  | "solid-white-min"
  | "gradient-sky"
  | "gradient-snow"
  | "gradient-peach"
  | "gradient-lavender"
  | "gradient-sky-light"
  | "gradient-cream"

export interface PresetBackground {
  id: BackgroundType
  name: string
  css: string
  preview: string
}

export interface FullThemeConfig {
  colors: ColorPalette
  background: BackgroundType
  backgroundColor: string
  backgroundGradient: string
  backgroundPattern: string
  backgroundImage: string
  effects: {
    particles: boolean
    orbs: boolean
    grid: boolean
    glass: boolean
    grain: boolean
    noise: boolean
  }
  typography: {
    fontDisplay: string
    fontBody: string
    fontMono: string
    headingWeight: string
    bodyWeight: string
    baseSize: number
    scaleRatio: number
    letterSpacing: string
    lineHeight: string
  }
  layout: {
    borderRadius: string
    containerWidth: string
    spacingUnit: number
    shadowIntensity: number
    blurIntensity: number
  }
  hover: {
    liftDistance: string
    glowColor: string
    glowIntensity: number
    transitionDuration: string
  }
  mode: "dark" | "light" | "auto"
}

export interface SavedLook {
  id: string
  name: string
  createdAt: string
  config: FullThemeConfig
  thumbnail?: string
}

export interface PredefinedPalette {
  id: string
  name: string
  emoji: string
  description: string
  config: Partial<FullThemeConfig>
  recommended: string[]
  avoid: string[]
}

export interface ContrastResult {
  ratio: number
  AA: boolean
  AAA: boolean
  AALarge: boolean
  AAALarge: boolean
  status: "pass" | "warn" | "fail"
  suggestion?: string
}

const DEFAULT_COLORS: ColorPalette = {
  primary: "#7c5cfc",
  primaryForeground: "#ffffff",
  secondary: "#1f1f3a",
  secondaryForeground: "#c4b5fd",
  accent: "#2d1b69",
  accentForeground: "#e17055",
  background: "#0d0d1a",
  foreground: "#e8e8f0",
  card: "#161627",
  cardForeground: "#e8e8f0",
  muted: "#1a1a30",
  mutedForeground: "#8888a8",
  border: "#1e1e3a",
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#ef4444",
  highlight: "#ec4899",
  input: "#1e1e3a",
  ring: "#7c5cfc",
}

const DEFAULT_CONFIG: FullThemeConfig = {
  colors: { ...DEFAULT_COLORS },
  background: "gradient-dark",
  backgroundColor: "#0d0d1a",
  backgroundGradient: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)",
  backgroundPattern: "",
  backgroundImage: "",
  effects: {
    particles: true,
    orbs: true,
    grid: true,
    glass: true,
    grain: false,
    noise: false,
  },
  typography: {
    fontDisplay: "Playfair Display",
    fontBody: "Inter",
    fontMono: "JetBrains Mono",
    headingWeight: "700",
    bodyWeight: "400",
    baseSize: 16,
    scaleRatio: 1.25,
    letterSpacing: "0em",
    lineHeight: "1.6",
  },
  layout: {
    borderRadius: "1rem",
    containerWidth: "80rem",
    spacingUnit: 4,
    shadowIntensity: 1,
    blurIntensity: 1,
  },
  hover: {
    liftDistance: "4px",
    glowColor: "#7c5cfc",
    glowIntensity: 0.15,
    transitionDuration: "0.3s",
  },
  mode: "dark",
}

const PRESET_BACKGROUNDS: PresetBackground[] = [
  { id: "gradient-dark", name: "Violeta Oscuro", preview: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)", css: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)" },
  { id: "gradient-sunset", name: "Atardecer", preview: "linear-gradient(135deg, #1a0a2e, #2d1b4e, #4a1942)", css: "linear-gradient(135deg, #1a0a2e, #2d1b4e, #4a1942)" },
  { id: "gradient-ocean", name: "Océano", preview: "linear-gradient(135deg, #0a1628, #0d1f3c, #162447)", css: "linear-gradient(135deg, #0a1628, #0d1f3c, #162447)" },
  { id: "gradient-forest", name: "Bosque", preview: "linear-gradient(135deg, #0d1a0d, #1a2e1a, #162816)", css: "linear-gradient(135deg, #0d1a0d, #1a2e1a, #162816)" },
  { id: "gradient-purple", name: "Púrpura", preview: "linear-gradient(135deg, #1a0a2e, #2d1b69, #3d2080)", css: "linear-gradient(135deg, #1a0a2e, #2d1b69, #3d2080)" },
  { id: "gradient-rose", name: "Rosa", preview: "linear-gradient(135deg, #1a0a1f, #2d1b2e, #3d1a35)", css: "linear-gradient(135deg, #1a0a1f, #2d1b2e, #3d1a35)" },
  { id: "gradient-gold", name: "Dorado", preview: "linear-gradient(135deg, #1a1400, #2d2200, #3d3000)", css: "linear-gradient(135deg, #1a1400, #2d2200, #3d3000)" },
  { id: "gradient-sky", name: "Cielo", preview: "linear-gradient(135deg, #0a1a2e, #0d2d4e, #161647)", css: "linear-gradient(135deg, #0a1a2e, #0d2d4e, #161647)" },
  { id: "gradient-mesh", name: "Mesh", preview: "linear-gradient(135deg, #0d0d1a 25%, transparent 25%), linear-gradient(225deg, #0d0d1a 25%, transparent 25%)", css: "linear-gradient(135deg, #0d0d1a 25%, transparent 25%), linear-gradient(225deg, #0d0d1a 25%, transparent 25%), linear-gradient(45deg, #0d0d1a 25%, transparent 25%), linear-gradient(315deg, #0d0d1a 25%, #1a0a2e 25%)" },
  { id: "gradient-snow", name: "Nieve", preview: "linear-gradient(135deg, #f8f9fc, #eef1f8, #ffffff)", css: "linear-gradient(135deg, #f8f9fc, #eef1f8, #ffffff)" },
  { id: "gradient-peach", name: "Durazno", preview: "linear-gradient(135deg, #fff9f0, #fef3e2, #fff9f0)", css: "linear-gradient(135deg, #fff9f0, #fef3e2, #fff9f0)" },
  { id: "gradient-lavender", name: "Lavanda", preview: "linear-gradient(135deg, #fefaff, #f5f0ff, #fefaff)", css: "linear-gradient(135deg, #fefaff, #f5f0ff, #fefaff)" },
  { id: "gradient-sky-light", name: "Cielo Claro", preview: "linear-gradient(135deg, #f0f6ff, #dbeafe, #eff6ff)", css: "linear-gradient(135deg, #f0f6ff, #dbeafe, #eff6ff)" },
  { id: "gradient-cream", name: "Crema", preview: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)", css: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)" },
  { id: "particles", name: "Partículas", preview: "radial-gradient(circle at 20% 30%, rgba(124,92,252,0.3) 0%, transparent 50%)", css: "radial-gradient(circle at 20% 30%, rgba(124,92,252,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.3) 0%, transparent 50%)" },
  { id: "grid", name: "Grid Lines", preview: "linear-gradient(rgba(124,92,252,0.05) 1px, transparent 1px)", css: "linear-gradient(rgba(124,92,252,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.05) 1px, transparent 1px)" },
  { id: "stars", name: "Estrellas", preview: "#0d0d1a", css: "#0d0d1a" },
  { id: "solid-dark", name: "Negro Puro", preview: "#000000", css: "#000000" },
  { id: "solid-card", name: "Card Sólido", preview: "#161627", css: "#161627" },
  { id: "solid-white-min", name: "Blanco Puro", preview: "#ffffff", css: "#ffffff" },
  { id: "abstract", name: "Abstracto", preview: "conic-gradient(from 180deg at 50% 50%, #0d0d1a, #1a0a2e, #0d0d1a)", css: "conic-gradient(from 180deg at 50% 50%, #0d0d1a, #1a0a2e, #0d0d1a)" },
]

const PREDEFINED_PALETTES: PredefinedPalette[] = [
  {
    id: "glamours-violet",
    name: "GLAMOURS Violeta",
    emoji: "💜",
    description: "El estilo signature de la marca. Elegante, oscuro, sofisticado.",
    config: {
      colors: { primary: "#7c5cfc", highlight: "#ec4899", background: "#0d0d1a", foreground: "#e8e8f0", card: "#161627", muted: "#1a1a30", border: "#1e1e3a", secondary: "#1f1f3a", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#c4b5fd", accent: "#2d1b69", accentForeground: "#e17055", mutedForeground: "#8888a8", cardForeground: "#e8e8f0", input: "#1e1e3a", ring: "#7c5cfc" },
      background: "gradient-dark",
      backgroundGradient: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)",
      hover: { liftDistance: "4px", glowColor: "#7c5cfc", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#7c5cfc", "#ec4899", "#0d0d1a"],
    avoid: ["#ffffff", "#ffff00"],
  },
  {
    id: "nordic-light",
    name: "Nórdico Claro",
    emoji: "❄️",
    description: "Escandinavo, limpio, aireado. Blanco con acentos fríos.",
    config: {
      colors: { primary: "#6366f1", highlight: "#0ea5e9", background: "#f8f9fc", foreground: "#1a1a2e", card: "#ffffff", muted: "#f0f2f8", border: "#e2e4ec", secondary: "#f0f2f8", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#6366f1", accent: "#0ea5e9", accentForeground: "#ffffff", mutedForeground: "#6b7080", cardForeground: "#1a1a2e", input: "#f0f2f8", ring: "#6366f1" },
      background: "gradient-snow",
      backgroundGradient: "linear-gradient(135deg, #f8f9fc, #eef1f8, #ffffff)",
      hover: { liftDistance: "3px", glowColor: "#6366f1", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#6366f1", "#0ea5e9", "#f8f9fc"],
    avoid: ["#000000", "#ffff00"],
  },
  {
    id: "minimal-white",
    name: "Minimalista Blanco",
    emoji: "🤍",
    description: "Ultra minimalista, puro, elegante. Todo en blancos y negros.",
    config: {
      colors: { primary: "#000000", highlight: "#666666", background: "#ffffff", foreground: "#0a0a0a", card: "#fafafa", muted: "#f5f5f5", border: "#e5e5e5", secondary: "#f5f5f5", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#000000", accent: "#888888", accentForeground: "#ffffff", mutedForeground: "#999999", cardForeground: "#0a0a0a", input: "#f5f5f5", ring: "#000000" },
      background: "solid-white-min",
      backgroundGradient: "#ffffff",
      hover: { liftDistance: "2px", glowColor: "#000000", glowIntensity: 0.05, transitionDuration: "0.3s" },
    },
    recommended: ["#000000", "#ffffff", "#666666"],
    avoid: ["#ff0000", "#0000ff"],
  },
  {
    id: "sunrise-warm",
    name: "Amanecer Cálido",
    emoji: "🌅",
    description: "Dorado, cálido, acogedor. Como luz de sol filtrada.",
    config: {
      colors: { primary: "#ea580c", highlight: "#fbbf24", background: "#fff9f0", foreground: "#1a0a00", card: "#ffffff", muted: "#fef3e2", border: "#fde8c8", secondary: "#fef3e2", success: "#10b981", warning: "#d97706", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#ea580c", accent: "#d97706", accentForeground: "#ffffff", mutedForeground: "#92715a", cardForeground: "#1a0a00", input: "#fef3e2", ring: "#ea580c" },
      background: "gradient-peach",
      backgroundGradient: "linear-gradient(135deg, #fff9f0, #fef3e2, #fff9f0)",
      hover: { liftDistance: "3px", glowColor: "#ea580c", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#ea580c", "#fbbf24", "#fff9f0"],
    avoid: ["#000000", "#ff00ff"],
  },
  {
    id: "pastel-soft",
    name: "Pastel Suave",
    emoji: "🩷",
    description: "Delicado, dulce, juvenil. Tonos pastel con blanco.",
    config: {
      colors: { primary: "#f472b6", highlight: "#a78bfa", background: "#fefaff", foreground: "#2d1f4e", card: "#ffffff", muted: "#f5f0ff", border: "#e9d5ff", secondary: "#f5f0ff", success: "#10b981", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f472b6", accent: "#a78bfa", accentForeground: "#ffffff", mutedForeground: "#7c6a9e", cardForeground: "#2d1f4e", input: "#f5f0ff", ring: "#f472b6" },
      background: "gradient-lavender",
      backgroundGradient: "linear-gradient(135deg, #fefaff, #f5f0ff, #fefaff)",
      hover: { liftDistance: "3px", glowColor: "#f472b6", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#f472b6", "#a78bfa", "#fefaff"],
    avoid: ["#000000", "#ff6600"],
  },
  {
    id: "marina-blue",
    name: "Marina Blanca",
    emoji: "🌊",
    description: "Azul marino claro, profesional, frescura oceánica.",
    config: {
      colors: { primary: "#1e40af", highlight: "#0ea5e9", background: "#f0f6ff", foreground: "#1e293b", card: "#ffffff", muted: "#e8f0fa", border: "#c3d9f0", secondary: "#e8f0fa", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#1e40af", accent: "#0369a1", accentForeground: "#ffffff", mutedForeground: "#4a6080", cardForeground: "#1e293b", input: "#e8f0fa", ring: "#1e40af" },
      background: "gradient-sky-light",
      backgroundGradient: "linear-gradient(135deg, #f0f6ff, #dbeafe, #eff6ff)",
      hover: { liftDistance: "3px", glowColor: "#1e40af", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#1e40af", "#0ea5e9", "#f0f6ff"],
    avoid: ["#ff0000", "#ff00ff"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "🌃",
    description: "Futurista, neón, agresivo. Para marcas que rompen límites.",
    config: {
      colors: { primary: "#00f5ff", highlight: "#ff00ff", background: "#05050a", foreground: "#f0f0f0", card: "#0a0a1a", muted: "#0f0f1f", border: "#00f5ff22", secondary: "#0a0a1a", success: "#00ff41", warning: "#ff00ff", destructive: "#ff0040", primaryForeground: "#05050a", secondaryForeground: "#00f5ff", accent: "#ff00ff", accentForeground: "#05050a", mutedForeground: "#666688", cardForeground: "#f0f0f0", input: "#0a0a1a", ring: "#00f5ff" },
      background: "solid-dark",
      backgroundGradient: "#05050a",
      hover: { liftDistance: "4px", glowColor: "#00f5ff", glowIntensity: 0.3, transitionDuration: "0.2s" },
    },
    recommended: ["#00f5ff", "#ff00ff", "#05050a"],
    avoid: ["#888888", "#aaaaaa"],
  },
  {
    id: "luxury-gold",
    name: "Lujo Dorado",
    emoji: "👑",
    description: "Premium, elegante, exclusivo. Ideal para moda de alto valor.",
    config: {
      colors: { primary: "#d4af37", highlight: "#ffd700", background: "#0a0a0a", foreground: "#f5f0e8", card: "#141414", muted: "#1a1a1a", border: "#2a2a2a", secondary: "#141414", success: "#10b981", warning: "#d4af37", destructive: "#ef4444", primaryForeground: "#0a0a0a", secondaryForeground: "#d4af37", accent: "#b8860b", accentForeground: "#f5f0e8", mutedForeground: "#666666", cardForeground: "#f5f0e8", input: "#1a1a1a", ring: "#d4af37" },
      background: "solid-dark",
      backgroundGradient: "#0a0a0a",
      hover: { liftDistance: "4px", glowColor: "#d4af37", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#d4af37", "#ffd700", "#0a0a0a"],
    avoid: ["#ff0000", "#00ff00"],
  },
  {
    id: "nature-green",
    name: "Naturaleza",
    emoji: "🌿",
    description: "Fresco, orgánico, tranquilo. Para marcas eco-friendly.",
    config: {
      colors: { primary: "#22c55e", highlight: "#84cc16", background: "#0a1a0a", foreground: "#e8f0e8", card: "#0f1f0f", muted: "#141f14", border: "#1a2e1a", secondary: "#0f1f0f", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#22c55e", accent: "#166534", accentForeground: "#e8f0e8", mutedForeground: "#6b7b6b", cardForeground: "#e8f0e8", input: "#141f14", ring: "#22c55e" },
      background: "gradient-forest",
      backgroundGradient: "linear-gradient(135deg, #0a1a0a, #0f1f0f, #141f14)",
      hover: { liftDistance: "4px", glowColor: "#22c55e", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#22c55e", "#84cc16", "#0a1a0a"],
    avoid: ["#ff0000", "#ff00ff"],
  },
  {
    id: "rose-romantic",
    name: "Rosa Romántico",
    emoji: "🌹",
    description: "Delicado, femenino, moderno. Perfecto para moda femenina.",
    config: {
      colors: { primary: "#f472b6", highlight: "#fb7185", background: "#1a0a14", foreground: "#f8e8f0", card: "#1f0f1a", muted: "#231420", border: "#2d1a24", secondary: "#1f0f1a", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f472b6", accent: "#be185d", accentForeground: "#f8e8f0", mutedForeground: "#8877888", cardForeground: "#f8e8f0", input: "#231420", ring: "#f472b6" },
      background: "gradient-rose",
      backgroundGradient: "linear-gradient(135deg, #1a0a14, #1f0f1a, #231420)",
      hover: { liftDistance: "4px", glowColor: "#f472b6", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#f472b6", "#fb7185", "#1a0a14"],
    avoid: ["#ffff00", "#00ffff"],
  },
  {
    id: "ocean-calm",
    name: "Océano Sereno",
    emoji: "🌊",
    description: "Calmado, profesional, marinero. Para moda sport o casual.",
    config: {
      colors: { primary: "#0ea5e9", highlight: "#06b6d4", background: "#060f18", foreground: "#e0f0f8", card: "#0a1520", muted: "#0c1820", border: "#1a3040", secondary: "#0a1520", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#0ea5e9", accent: "#0369a1", accentForeground: "#e0f0f8", mutedForeground: "#608090", cardForeground: "#e0f0f8", input: "#0c1820", ring: "#0ea5e9" },
      background: "gradient-ocean",
      backgroundGradient: "linear-gradient(135deg, #060f18, #0a1520, #0c1820)",
      hover: { liftDistance: "4px", glowColor: "#0ea5e9", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#0ea5e9", "#06b6d4", "#060f18"],
    avoid: ["#ff0000", "#ff6600"],
  },
  {
    id: "cappuccino-warm",
    name: "Cappuccino",
    emoji: "☕",
    description: "Marrón cálido, café, acogedor. Tonos tierra profesionales.",
    config: {
      colors: { primary: "#a16207", highlight: "#ca8a04", background: "#fefce8", foreground: "#1c1400", card: "#fef9e7", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#ca8a04", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#a16207", accent: "#92400e", accentForeground: "#ffffff", mutedForeground: "#92704a", cardForeground: "#1c1400", input: "#fef3c7", ring: "#a16207" },
      background: "gradient-cream",
      backgroundGradient: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)",
      hover: { liftDistance: "3px", glowColor: "#a16207", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#a16207", "#ca8a04", "#fefce8"],
    avoid: ["#0000ff", "#ff00ff"],
  },
]

function generateRandomSafeConfig(): FullThemeConfig {
  const baseColors = [
    { primary: "#6366f1", highlight: "#ec4899" },
    { primary: "#8b5cf6", highlight: "#14b8a6" },
    { primary: "#f43f5e", highlight: "#fbbf24" },
    { primary: "#10b981", highlight: "#06b6d4" },
    { primary: "#f97316", highlight: "#eab308" },
    { primary: "#0ea5e9", highlight: "#a855f7" },
    { primary: "#d946ef", highlight: "#34d399" },
    { primary: "#e11d48", highlight: "#fb923c" },
    { primary: "#7c3aed", highlight: "#f43f5e" },
    { primary: "#059669", highlight: "#f59e0b" },
  ]
  const bgOptions = [
    { background: "gradient-dark", gradient: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)" },
    { background: "gradient-sunset", gradient: "linear-gradient(135deg, #1a0a2e, #2d1b4e, #4a1942)" },
    { background: "gradient-ocean", gradient: "linear-gradient(135deg, #0a1628, #0d1f3c, #162447)" },
    { background: "gradient-purple", gradient: "linear-gradient(135deg, #1a0a2e, #2d1b69, #3d2080)" },
    { background: "solid-dark", gradient: "#0a0a0a" },
    { background: "gradient-forest", gradient: "linear-gradient(135deg, #0d1a0d, #1a2e1a, #162816)" },
    { background: "gradient-sky", gradient: "linear-gradient(135deg, #0a1a2e, #0d2d4e, #161647)" },
  ]
  const { primary, highlight } = baseColors[Math.floor(Math.random() * baseColors.length)]
  const bg = bgOptions[Math.floor(Math.random() * bgOptions.length)]

  const fg = isLightColor(bg.gradient) ? "#1a1a2e" : "#f0f0f8"
  const card = isLightColor(bg.gradient) ? "#ffffff" : "#161627"
  const muted = isLightColor(bg.gradient) ? "#f0f0f0" : "#1a1a30"

  return {
    colors: {
      primary,
      primaryForeground: isLightColor(primary) ? "#1a1a2e" : "#ffffff",
      secondary: isLightColor(bg.gradient) ? "#e0e0e0" : "#1f1f3a",
      secondaryForeground: highlight,
      accent: adjustBrightness(primary, -0.3),
      accentForeground: isLightColor(primary) ? "#ffffff" : "#f0f0f0",
      background: isLightColor(bg.gradient) ? bg.gradient : (bg.gradient.includes("#") ? bg.gradient : "#0d0d1a"),
      foreground: fg,
      card: card,
      cardForeground: fg,
      muted: muted,
      mutedForeground: isLightColor(muted) ? "#666666" : "#8888a8",
      border: adjustBrightness(card, bg.gradient.includes("1a0a2e") ? 0.1 : 0.05),
      success: "#10b981",
      warning: "#f59e0b",
      destructive: "#ef4444",
      highlight: highlight,
      input: muted,
      ring: primary,
    },
    background: bg.background as BackgroundType,
    backgroundColor: bg.gradient,
    backgroundGradient: bg.gradient,
    backgroundPattern: "",
    backgroundImage: "",
    effects: { particles: Math.random() > 0.5, orbs: Math.random() > 0.5, grid: Math.random() > 0.3, glass: true, grain: Math.random() > 0.7, noise: false },
    typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6" },
    layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 },
    hover: { liftDistance: "4px", glowColor: primary, glowIntensity: 0.15, transitionDuration: "0.3s" },
    mode: "dark",
  }
}

function isLightColor(color: string): boolean {
  const hex = color.replace("#", "")
  if (hex.length < 6) return false
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

function adjustBrightness(hex: string, factor: number): string {
  const clean = hex.replace("#", "")
  if (clean.length < 6) return hex
  const r = Math.max(0, Math.min(255, parseInt(clean.substring(0, 2), 16) + Math.round(255 * factor)))
  const g = Math.max(0, Math.min(255, parseInt(clean.substring(2, 4), 16) + Math.round(255 * factor)))
  const b = Math.max(0, Math.min(255, parseInt(clean.substring(4, 6), 16) + Math.round(255 * factor)))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function checkContrast(foreground: string, background: string): ContrastResult {
  const hexToRGB = (hex: string) => {
    const clean = hex.replace("#", "")
    if (clean.length < 6) return { r: 0, g: 0, b: 0 }
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    }
  }

  const sRGBtoLinear = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }

  const getLuminance = (hex: string) => {
    const { r, g, b } = hexToRGB(hex)
    return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b)
  }

  const L1 = getLuminance(foreground)
  const L2 = getLuminance(background)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  const ratio = (lighter + 0.05) / (darker + 0.05)

  const AA = ratio >= 4.5
  const AAA = ratio >= 7
  const AALarge = ratio >= 3
  const AAALarge = ratio >= 4.5

  let status: "pass" | "warn" | "fail" = "pass"
  let suggestion: string | undefined

  if (!AA) {
    status = "fail"
    suggestion = `El contraste de ${ratio.toFixed(1)}:1 es insuficiente. Necesitás al menos 4.5:1 para texto normal.`
  } else if (!AAA && ratio < 6) {
    status = "warn"
    suggestion = `El contraste de ${ratio.toFixed(1)}:1 cumple AA pero no AAA. Podrías oscurecer el fondo o aclarar el texto.`
  }

  return { ratio, AA, AAA, AALarge, AAALarge, status, suggestion }
}

export function applyThemeConfig(config: FullThemeConfig) {
  const root = document.documentElement
  const c = config.colors

  root.style.setProperty("--color-primary", c.primary)
  root.style.setProperty("--color-primary-foreground", c.primaryForeground)
  root.style.setProperty("--color-secondary", c.secondary)
  root.style.setProperty("--color-secondary-foreground", c.secondaryForeground)
  root.style.setProperty("--color-accent", c.accent)
  root.style.setProperty("--color-accent-foreground", c.accentForeground)
  root.style.setProperty("--color-background", c.background)
  root.style.setProperty("--color-foreground", c.foreground)
  root.style.setProperty("--color-card", c.card)
  root.style.setProperty("--color-card-foreground", c.cardForeground)
  root.style.setProperty("--color-muted", c.muted)
  root.style.setProperty("--color-muted-foreground", c.mutedForeground)
  root.style.setProperty("--color-border", c.border)
  root.style.setProperty("--color-success", c.success)
  root.style.setProperty("--color-warning", c.warning)
  root.style.setProperty("--color-destructive", c.destructive)
  root.style.setProperty("--color-highlight", c.highlight)
  root.style.setProperty("--color-input", c.input)
  root.style.setProperty("--color-ring", c.ring)

  root.style.setProperty("--font-sans", `'${config.typography.fontBody}', ui-sans-serif, system-ui, sans-serif`)
  root.style.setProperty("--font-display", `'${config.typography.fontDisplay}', ui-serif, Georgia, serif`)
  root.style.setProperty("--font-mono", `'${config.typography.fontMono}', ui-monospace, monospace`)
  root.style.setProperty("--radius", config.layout.borderRadius)

  document.body.style.background = config.backgroundGradient
  document.body.classList.toggle("dark-mode", config.mode === "dark")
  document.body.classList.toggle("light-mode", config.mode === "light")

  const glowColor = config.hover.glowColor
  const intensity = config.hover.glowIntensity
  const rootStyles = `
    .hover-glow:hover { border-color: ${glowColor}66; box-shadow: 0 0 30px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, "0")}, inset 0 0 20px ${glowColor}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, "0")}; }
    .hover-lift:hover { transform: translateY(-${config.hover.liftDistance}); box-shadow: 0 12px 40px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, "0")}; }
    .btn-micro:active { transform: scale(0.94); }
    .glass-card { backdrop-filter: blur(${Math.round(24 * config.layout.blurIntensity)}px) saturate(1.1); }
    .glass-deep { backdrop-filter: blur(${Math.round(40 * config.layout.blurIntensity)}px) saturate(1.2); box-shadow: 0 8px 32px rgba(0,0,0,${0.3 * config.layout.shadowIntensity}), inset 0 1px 0 rgba(255,255,255,0.05); }
    .glass-card:hover { box-shadow: 0 8px 40px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, "0")}, inset 0 1px 0 rgba(255,255,255,0.06); }
  `
  let styleEl = document.getElementById("belleza-dynamic-styles")
  if (!styleEl) {
    styleEl = document.createElement("style")
    styleEl.id = "belleza-dynamic-styles"
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = rootStyles
}

import { create } from "zustand"

export interface BellezaStore {
  config: FullThemeConfig
  savedLooks: SavedLook[]
  isDirty: boolean
  hasChanges: boolean

  setColors: (colors: Partial<ColorPalette>) => void
  setBackground: (bg: BackgroundType) => void
  setBackgroundGradient: (gradient: string) => void
  setEffects: (effects: Partial<FullThemeConfig["effects"]>) => void
  setTypography: (typo: Partial<FullThemeConfig["typography"]>) => void
  setLayout: (layout: Partial<FullThemeConfig["layout"]>) => void
  setHover: (hover: Partial<FullThemeConfig["hover"]>) => void
  setMode: (mode: "dark" | "light" | "auto") => void
  applyFullConfig: (config: FullThemeConfig) => void

  saveLook: (name: string) => void
  loadLook: (id: string) => void
  deleteLook: (id: string) => void
  resetToDefault: () => void
  randomize: () => void
}

export const useBellezaStore = create<BellezaStore>((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  savedLooks: [],
  isDirty: false,
  hasChanges: false,

  setColors: (colors) =>
    set((state) => ({
      config: { ...state.config, colors: { ...state.config.colors, ...colors } },
      isDirty: true,
      hasChanges: true,
    })),

  setBackground: (background) => {
    const preset = PRESET_BACKGROUNDS.find(b => b.id === background)
    set((state) => ({
      config: {
        ...state.config,
        background,
        backgroundGradient: preset?.css || "",
        backgroundColor: preset?.css?.includes("gradient") ? preset.css.split(",")[0] : preset?.css || "",
      },
      isDirty: true,
      hasChanges: true,
    }))
  },

  setBackgroundGradient: (gradient) =>
    set((state) => ({
      config: { ...state.config, backgroundGradient: gradient },
      isDirty: true,
      hasChanges: true,
    })),

  setEffects: (effects) =>
    set((state) => ({
      config: { ...state.config, effects: { ...state.config.effects, ...effects } },
      isDirty: true,
      hasChanges: true,
    })),

  setTypography: (typo) =>
    set((state) => ({
      config: { ...state.config, typography: { ...state.config.typography, ...typo } },
      isDirty: true,
      hasChanges: true,
    })),

  setLayout: (layout) =>
    set((state) => ({
      config: { ...state.config, layout: { ...state.config.layout, ...layout } },
      isDirty: true,
      hasChanges: true,
    })),

  setHover: (hover) =>
    set((state) => ({
      config: { ...state.config, hover: { ...state.config.hover, ...hover } },
      isDirty: true,
      hasChanges: true,
    })),

  setMode: (mode) =>
    set((state) => ({
      config: { ...state.config, mode },
      isDirty: true,
      hasChanges: true,
    })),

  applyFullConfig: (config) =>
    set({ config, isDirty: false }),

  saveLook: (name) => {
    const state = get()
    const look: SavedLook = {
      id: Date.now().toString(36),
      name,
      createdAt: new Date().toISOString(),
      config: { ...state.config },
    }
    set((s) => ({
      savedLooks: [...s.savedLooks, look],
      isDirty: false,
    }))
  },

  loadLook: (id) => {
    const state = get()
    const look = state.savedLooks.find(l => l.id === id)
    if (look) {
      set({ config: { ...look.config }, isDirty: false, hasChanges: true })
    }
  },

  deleteLook: (id) =>
    set((state) => ({
      savedLooks: state.savedLooks.filter(l => l.id !== id),
    })),

  resetToDefault: () =>
    set({ config: { ...DEFAULT_CONFIG }, isDirty: false, hasChanges: false }),

  randomize: () =>
    set({ config: generateRandomSafeConfig(), isDirty: true, hasChanges: true }),
}))

export { DEFAULT_CONFIG, DEFAULT_COLORS, PRESET_BACKGROUNDS, PREDEFINED_PALETTES, isLightColor, adjustBrightness }
