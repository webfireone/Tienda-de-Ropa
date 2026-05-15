import { create } from "zustand"

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
  | "custom"
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
    textShadow: string
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
    textShadow: "none",
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
  {
    id: "bold-red-black",
    name: "Rojo Pasión",
    emoji: "❤️‍🔥",
    description: "Rojo intenso con negro. Audaz, eléctrico, imposible de ignorar.",
    config: {
      colors: { primary: "#dc2626", highlight: "#f87171", background: "#0a0000", foreground: "#f8f0f0", card: "#120808", muted: "#1a0a0a", border: "#2a1010", secondary: "#120808", success: "#22c55e", warning: "#f59e0b", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#dc2626", accent: "#991b1b", accentForeground: "#ffffff", mutedForeground: "#6b5555", cardForeground: "#f8f0f0", input: "#1a0a0a", ring: "#dc2626" },
      background: "gradient-dark",
      backgroundGradient: "linear-gradient(135deg, #0a0000, #1a0505, #0a0000)",
      hover: { liftDistance: "4px", glowColor: "#dc2626", glowIntensity: 0.2, transitionDuration: "0.2s" },
    },
    recommended: ["#dc2626", "#ffffff", "#0a0000"],
    avoid: ["#0000ff", "#888888"],
  },
  {
    id: "electric-blue",
    name: "Azul Eléctrico",
    emoji: "⚡",
    description: "Azul neón vibrante, tecnológico, moderno y urbano.",
    config: {
      colors: { primary: "#2563eb", highlight: "#06b6d4", background: "#030712", foreground: "#f0f8ff", card: "#0a1628", muted: "#0f1f35", border: "#1a3a5c", secondary: "#0a1628", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#2563eb", accent: "#0284c7", accentForeground: "#ffffff", mutedForeground: "#6080a0", cardForeground: "#f0f8ff", input: "#0f1f35", ring: "#2563eb" },
      background: "gradient-ocean",
      backgroundGradient: "linear-gradient(135deg, #030712, #0a1628, #030712)",
      hover: { liftDistance: "4px", glowColor: "#2563eb", glowIntensity: 0.2, transitionDuration: "0.2s" },
    },
    recommended: ["#2563eb", "#06b6d4", "#030712"],
    avoid: ["#ff0000", "#888888"],
  },
  {
    id: "evening-gold",
    name: "Noche Dorada",
    emoji: "🌙",
    description: "Azul medianoche con oro. Sofisticado, elegante, premium.",
    config: {
      colors: { primary: "#d4af37", highlight: "#fbbf24", background: "#050a14", foreground: "#f0ead6", card: "#0a1018", muted: "#0f1520", border: "#1a2030", secondary: "#0a1018", success: "#10b981", warning: "#d4af37", destructive: "#ef4444", primaryForeground: "#050a14", secondaryForeground: "#d4af37", accent: "#b8860b", accentForeground: "#f0ead6", mutedForeground: "#6070a0", cardForeground: "#f0ead6", input: "#0f1520", ring: "#d4af37" },
      background: "solid-dark",
      backgroundGradient: "#050a14",
      hover: { liftDistance: "4px", glowColor: "#d4af37", glowIntensity: 0.25, transitionDuration: "0.3s" },
    },
    recommended: ["#d4af37", "#fbbf24", "#050a14"],
    avoid: ["#ff0000", "#00ff00"],
  },
  {
    id: "gothic-dark",
    name: "Gótico Oscuro",
    emoji: "🖤",
    description: "Púrpura profundo con rosa oscuro. Misterioso y dramático.",
    config: {
      colors: { primary: "#7c3aed", highlight: "#ec4899", background: "#0a0010", foreground: "#f0e0f8", card: "#120018", muted: "#180020", border: "#280030", secondary: "#120018", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#7c3aed", accent: "#5b21b6", accentForeground: "#f0e0f8", mutedForeground: "#887088", cardForeground: "#f0e0f8", input: "#180020", ring: "#7c3aed" },
      background: "gradient-purple",
      backgroundGradient: "linear-gradient(135deg, #0a0010, #1a0a30, #0a0010)",
      hover: { liftDistance: "4px", glowColor: "#7c3aed", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#7c3aed", "#ec4899", "#0a0010"],
    avoid: ["#ffff00", "#00ff00"],
  },
  {
    id: "urban-concrete",
    name: "Urbano Concreto",
    emoji: "🏙️",
    description: "Gris urbano con naranja. Industrial, streetwear, moderno.",
    config: {
      colors: { primary: "#64748b", highlight: "#f97316", background: "#18181b", foreground: "#f4f4f5", card: "#27272a", muted: "#3f3f46", border: "#52525b", secondary: "#27272a", success: "#10b981", warning: "#f97316", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#64748b", accent: "#78716c", accentForeground: "#ffffff", mutedForeground: "#71717a", cardForeground: "#f4f4f5", input: "#3f3f46", ring: "#64748b" },
      background: "solid-dark",
      backgroundGradient: "#18181b",
      hover: { liftDistance: "4px", glowColor: "#f97316", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#64748b", "#f97316", "#18181b"],
    avoid: ["#0000ff", "#ff00ff"],
  },
  {
    id: "editorial-black",
    name: "Editorial Blanca",
    emoji: "📖",
    description: "Blanco puro con negro. Minimalismo editorial, tipográfico.",
    config: {
      colors: { primary: "#000000", highlight: "#404040", background: "#ffffff", foreground: "#000000", card: "#fafafa", muted: "#f5f5f5", border: "#e0e0e0", secondary: "#f5f5f5", success: "#22c55e", warning: "#d97706", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#000000", accent: "#737373", accentForeground: "#ffffff", mutedForeground: "#a3a3a3", cardForeground: "#000000", input: "#f5f5f5", ring: "#000000" },
      background: "solid-white-min",
      backgroundGradient: "#ffffff",
      hover: { liftDistance: "2px", glowColor: "#000000", glowIntensity: 0.05, transitionDuration: "0.3s" },
    },
    recommended: ["#000000", "#ffffff", "#404040"],
    avoid: ["#ff0000", "#0000ff"],
  },
  {
    id: "tropical-teal",
    name: "Tropical Aqua",
    emoji: "🌴",
    description: "Verde azulado con coral. Vacaciones, frescura, verano.",
    config: {
      colors: { primary: "#0d9488", highlight: "#fb7185", background: "#f0fdfa", foreground: "#134e4a", card: "#ffffff", muted: "#ccfbf1", border: "#99f6e4", secondary: "#ccfbf1", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#0d9488", accent: "#14b8a6", accentForeground: "#ffffff", mutedForeground: "#5eead4", cardForeground: "#134e4a", input: "#ccfbf1", ring: "#0d9488" },
      background: "gradient-sky-light",
      backgroundGradient: "linear-gradient(135deg, #f0fdfa, #ccfbf1, #f0fdfa)",
      hover: { liftDistance: "3px", glowColor: "#0d9488", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#0d9488", "#fb7185", "#f0fdfa"],
    avoid: ["#000000", "#888888"],
  },
  {
    id: "berry-purple",
    name: "Baya Púrpura",
    emoji: "🫐",
    description: "Morado berry con rosa. Frutal, joven, moderno.",
    config: {
      colors: { primary: "#7c3aed", highlight: "#f472b6", background: "#faf5ff", foreground: "#3b0764", card: "#ffffff", muted: "#f3e8ff", border: "#e9d5ff", secondary: "#f3e8ff", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#7c3aed", accent: "#c026d3", accentForeground: "#ffffff", mutedForeground: "#a855f7", cardForeground: "#3b0764", input: "#f3e8ff", ring: "#7c3aed" },
      background: "gradient-lavender",
      backgroundGradient: "linear-gradient(135deg, #faf5ff, #f3e8ff, #faf5ff)",
      hover: { liftDistance: "3px", glowColor: "#7c3aed", glowIntensity: 0.1, transitionDuration: "0.3s" },
    },
    recommended: ["#7c3aed", "#f472b6", "#faf5ff"],
    avoid: ["#000000", "#ff6600"],
  },
  {
    id: "desert-sand",
    name: "Desierto Arena",
    emoji: "🏜️",
    description: "Terracota y arena. Natural, bohemio, artesanales.",
    config: {
      colors: { primary: "#c2410c", highlight: "#d97706", background: "#fef7ed", foreground: "#431407", card: "#ffffff", muted: "#ffedd5", border: "#fed7aa", secondary: "#ffedd5", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#c2410c", accent: "#9a3412", accentForeground: "#ffffff", mutedForeground: "#c2410c", cardForeground: "#431407", input: "#ffedd5", ring: "#c2410c" },
      background: "gradient-peach",
      backgroundGradient: "linear-gradient(135deg, #fef7ed, #ffedd5, #fef7ed)",
      hover: { liftDistance: "3px", glowColor: "#c2410c", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#c2410c", "#d97706", "#fef7ed"],
    avoid: ["#0000ff", "#ff00ff"],
  },
  {
    id: "sage-earth",
    name: "Salvia Natural",
    emoji: "🌱",
    description: "Verde salvia y crema. Eco-friendly, sostenible, orgánico.",
    config: {
      colors: { primary: "#4d7c0f", highlight: "#a3e635", background: "#f7faf5", foreground: "#1a2e05", card: "#ffffff", muted: "#e9f5e1", border: "#bbf7d0", secondary: "#e9f5e1", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#4d7c0f", accent: "#65a30d", accentForeground: "#ffffff", mutedForeground: "#4d7c0f", cardForeground: "#1a2e05", input: "#e9f5e1", ring: "#4d7c0f" },
      background: "gradient-snow",
      backgroundGradient: "linear-gradient(135deg, #f7faf5, #e9f5e1, #f7faf5)",
      hover: { liftDistance: "3px", glowColor: "#4d7c0f", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#4d7c0f", "#a3e635", "#f7faf5"],
    avoid: ["#ff0000", "#0000ff"],
  },
  {
    id: "midnight-blue",
    name: "Medianoche",
    emoji: "🌌",
    description: "Azul profundo con blanco. Nocturno, elegante, misterioso.",
    config: {
      colors: { primary: "#1e3a8a", highlight: "#93c5fd", background: "#030411", foreground: "#f0f4ff", card: "#0a1525", muted: "#0f1f35", border: "#1a2f50", secondary: "#0a1525", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#1e3a8a", accent: "#1d4ed8", accentForeground: "#ffffff", mutedForeground: "#6080c0", cardForeground: "#f0f4ff", input: "#0f1f35", ring: "#1e3a8a" },
      background: "gradient-sky",
      backgroundGradient: "linear-gradient(135deg, #030411, #0a1525, #030411)",
      hover: { liftDistance: "4px", glowColor: "#1e3a8a", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#1e3a8a", "#93c5fd", "#030411"],
    avoid: ["#ff0000", "#ffff00"],
  },
  {
    id: "neon-pink",
    name: "Neón Rosa",
    emoji: "💗",
    description: "Rosa neón vibrante, juvenil, festivo. Para marcas bold.",
    config: {
      colors: { primary: "#f0abfc", highlight: "#c084fc", background: "#1a001a", foreground: "#fdf4ff", card: "#200020", muted: "#2a002a", border: "#3a0a3a", secondary: "#200020", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#1a001a", secondaryForeground: "#f0abfc", accent: "#e879f9", accentForeground: "#1a001a", mutedForeground: "#b879b8", cardForeground: "#fdf4ff", input: "#2a002a", ring: "#f0abfc" },
      background: "gradient-purple",
      backgroundGradient: "linear-gradient(135deg, #1a001a, #2a0a30, #1a001a)",
      hover: { liftDistance: "4px", glowColor: "#f0abfc", glowIntensity: 0.25, transitionDuration: "0.2s" },
    },
    recommended: ["#f0abfc", "#c084fc", "#1a001a"],
    avoid: ["#000000", "#888888"],
  },
  {
    id: "ocean-deep",
    name: "Océano Profundo",
    emoji: "🌊",
    description: "Azul marino profundo, elegante, profesional. Moda náutica.",
    config: {
      colors: { primary: "#1e40af", highlight: "#67e8f9", background: "#030810", foreground: "#e0f2fe", card: "#060f1a", muted: "#081420", border: "#0a1f30", secondary: "#060f1a", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#1e40af", accent: "#0369a1", accentForeground: "#ffffff", mutedForeground: "#60a0c0", cardForeground: "#e0f2fe", input: "#081420", ring: "#1e40af" },
      background: "gradient-ocean",
      backgroundGradient: "linear-gradient(135deg, #030810, #060f1a, #030810)",
      hover: { liftDistance: "4px", glowColor: "#1e40af", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#1e40af", "#67e8f9", "#030810"],
    avoid: ["#ff0000", "#ffff00"],
  },
  {
    id: "sunset-orange",
    name: "Atardecer Naranja",
    emoji: "🌅",
    description: "Naranja cálido con amarillo. Cálido, energético, vibrante.",
    config: {
      colors: { primary: "#ea580c", highlight: "#fde047", background: "#1a0500", foreground: "#fff7ed", card: "#200a00", muted: "#2a0f00", border: "#3a1800", secondary: "#200a00", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#ea580c", accent: "#c2410c", accentForeground: "#ffffff", mutedForeground: "#c08060", cardForeground: "#fff7ed", input: "#2a0f00", ring: "#ea580c" },
      background: "gradient-sunset",
      backgroundGradient: "linear-gradient(135deg, #1a0500, #2a1000, #1a0500)",
      hover: { liftDistance: "4px", glowColor: "#ea580c", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#ea580c", "#fde047", "#1a0500"],
    avoid: ["#0000ff", "#888888"],
  },
  {
    id: "lavender-dream",
    name: "Lavanda Soñada",
    emoji: "💜",
    description: "Lavanda suave con lila. Delicado, romántico, moderno.",
    config: {
      colors: { primary: "#8b5cf6", highlight: "#f0abfc", background: "#faf5ff", foreground: "#2e1065", card: "#ffffff", muted: "#f3e8ff", border: "#e9d5ff", secondary: "#f3e8ff", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#8b5cf6", accent: "#a855f7", accentForeground: "#ffffff", mutedForeground: "#7c3aed", cardForeground: "#2e1065", input: "#f3e8ff", ring: "#8b5cf6" },
      background: "gradient-lavender",
      backgroundGradient: "linear-gradient(135deg, #faf5ff, #f3e8ff, #faf5ff)",
      hover: { liftDistance: "3px", glowColor: "#8b5cf6", glowIntensity: 0.1, transitionDuration: "0.3s" },
    },
    recommended: ["#8b5cf6", "#f0abfc", "#faf5ff"],
    avoid: ["#000000", "#ff0000"],
  },
  {
    id: "forest-deep",
    name: "Bosque Profundo",
    emoji: "🌲",
    description: "Verde bosque oscuro, misterioso, natural. Orgánico y premium.",
    config: {
      colors: { primary: "#15803d", highlight: "#86efac", background: "#030a03", foreground: "#dcfce7", card: "#050f05", muted: "#081408", border: "#0a1a0a", secondary: "#050f05", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#15803d", accent: "#166534", accentForeground: "#ffffff", mutedForeground: "#50a050", cardForeground: "#dcfce7", input: "#081408", ring: "#15803d" },
      background: "gradient-forest",
      backgroundGradient: "linear-gradient(135deg, #030a03, #050f05, #030a03)",
      hover: { liftDistance: "4px", glowColor: "#15803d", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#15803d", "#86efac", "#030a03"],
    avoid: ["#ff0000", "#0000ff"],
  },
  {
    id: "copper-elegant",
    name: "Cobre Elegante",
    emoji: "🟤",
    description: "Marrón cobrizo con crema. Rústico, artesanal, sofisticado.",
    config: {
      colors: { primary: "#92400e", highlight: "#f59e0b", background: "#fefce8", foreground: "#451a03", card: "#fef9e7", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#92400e", accent: "#b45309", accentForeground: "#ffffff", mutedForeground: "#92400e", cardForeground: "#451a03", input: "#fef3c7", ring: "#92400e" },
      background: "gradient-cream",
      backgroundGradient: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)",
      hover: { liftDistance: "3px", glowColor: "#92400e", glowIntensity: 0.1, transitionDuration: "0.3s" },
    },
    recommended: ["#92400e", "#f59e0b", "#fefce8"],
    avoid: ["#0000ff", "#ff00ff"],
  },
  {
    id: "slate-modern",
    name: "Gris Pizarra",
    emoji: "🎨",
    description: "Gris azulado moderno, profesional, tecnológico.",
    config: {
      colors: { primary: "#475569", highlight: "#38bdf8", background: "#f8fafc", foreground: "#0f172a", card: "#ffffff", muted: "#f1f5f9", border: "#e2e8f0", secondary: "#f1f5f9", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#475569", accent: "#64748b", accentForeground: "#ffffff", mutedForeground: "#475569", cardForeground: "#0f172a", input: "#f1f5f9", ring: "#475569" },
      background: "gradient-sky-light",
      backgroundGradient: "linear-gradient(135deg, #f8fafc, #e2e8f0, #f8fafc)",
      hover: { liftDistance: "3px", glowColor: "#475569", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#475569", "#38bdf8", "#f8fafc"],
    avoid: ["#ff0000", "#ff00ff"],
  },
  {
    id: "rose-gold",
    name: "Rosa Gold",
    emoji: "✨",
    description: "Rosa con dorado, lujo, femenino y sofisticado.",
    config: {
      colors: { primary: "#e11d48", highlight: "#fcd34d", background: "#0a0010", foreground: "#fdf2f8", card: "#100010", muted: "#180018", border: "#240024", secondary: "#100010", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#e11d48", accent: "#be185d", accentForeground: "#ffffff", mutedForeground: "#b06080", cardForeground: "#fdf2f8", input: "#180018", ring: "#e11d48" },
      background: "gradient-rose",
      backgroundGradient: "linear-gradient(135deg, #0a0010, #1a0a18, #0a0010)",
      hover: { liftDistance: "4px", glowColor: "#e11d48", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#e11d48", "#fcd34d", "#0a0010"],
    avoid: ["#00ff00", "#0000ff"],
  },
  {
    id: "emerald-luxury",
    name: "Esmeralda Lujo",
    emoji: "💎",
    description: "Verde esmeralda brillante, premium, exclusivo.",
    config: {
      colors: { primary: "#059669", highlight: "#34d399", background: "#022c22", foreground: "#ecfdf5", card: "#052e16", muted: "#064e3b", border: "#065f46", secondary: "#052e16", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#059669", accent: "#047857", accentForeground: "#ffffff", mutedForeground: "#34d399", cardForeground: "#ecfdf5", input: "#064e3b", ring: "#059669" },
      background: "gradient-forest",
      backgroundGradient: "linear-gradient(135deg, #022c22, #052e16, #022c22)",
      hover: { liftDistance: "4px", glowColor: "#059669", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#059669", "#34d399", "#022c22"],
    avoid: ["#ff0000", "#ffff00"],
  },
  {
    id: "indigo-night",
    name: "Índigo Nocturno",
    emoji: "🌃",
    description: "Índigo profundo, misterioso, sofisticado. Moda nocturna.",
    config: {
      colors: { primary: "#4338ca", highlight: "#a5b4fc", background: "#030510", foreground: "#e0e7ff", card: "#060a18", muted: "#0a0f20", border: "#101530", secondary: "#060a18", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#4338ca", accent: "#3730a3", accentForeground: "#ffffff", mutedForeground: "#6080c0", cardForeground: "#e0e7ff", input: "#0a0f20", ring: "#4338ca" },
      background: "gradient-purple",
      backgroundGradient: "linear-gradient(135deg, #030510, #060a18, #030510)",
      hover: { liftDistance: "4px", glowColor: "#4338ca", glowIntensity: 0.15, transitionDuration: "0.3s" },
    },
    recommended: ["#4338ca", "#a5b4fc", "#030510"],
    avoid: ["#ff0000", "#ff6600"],
  },
  {
    id: "peach-glow",
    name: "Durazno Brillante",
    emoji: "🍑",
    description: "Durazno cálido con rosa. Suave, juvenil,veraniego.",
    config: {
      colors: { primary: "#fb7185", highlight: "#fdba74", background: "#fff7f0", foreground: "#4a1010", card: "#ffffff", muted: "#ffe4d6", border: "#ffd6c4", secondary: "#ffe4d6", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#fb7185", accent: "#f43f5e", accentForeground: "#ffffff", mutedForeground: "#c06070", cardForeground: "#4a1010", input: "#ffe4d6", ring: "#fb7185" },
      background: "gradient-peach",
      backgroundGradient: "linear-gradient(135deg, #fff7f0, #ffe4d6, #fff7f0)",
      hover: { liftDistance: "3px", glowColor: "#fb7185", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#fb7185", "#fdba74", "#fff7f0"],
    avoid: ["#000000", "#0000ff"],
  },
  {
    id: "teal-fresh",
    name: "Verde Azulado Fresco",
    emoji: "🌊",
    description: "Teal vibrante con blanco. Deportivo, fresco, moderno.",
    config: {
      colors: { primary: "#0891b2", highlight: "#5eead4", background: "#f0fdfa", foreground: "#042f2e", card: "#ffffff", muted: "#ccfbf1", border: "#99f6e4", secondary: "#ccfbf1", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#0891b2", accent: "#06b6d4", accentForeground: "#ffffff", mutedForeground: "#0891b2", cardForeground: "#042f2e", input: "#ccfbf1", ring: "#0891b2" },
      background: "gradient-sky-light",
      backgroundGradient: "linear-gradient(135deg, #f0fdfa, #ccfbf1, #f0fdfa)",
      hover: { liftDistance: "3px", glowColor: "#0891b2", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#0891b2", "#5eead4", "#f0fdfa"],
    avoid: ["#000000", "#ff0000"],
  },
  {
    id: "violet-electric",
    name: "Violeta Eléctrico",
    emoji: "⚡",
    description: "Violeta neón brillante, futurista, tecnológico.",
    config: {
      colors: { primary: "#7c3aed", highlight: "#22d3ee", background: "#0a0014", foreground: "#f5f3ff", card: "#0f001a", muted: "#150020", border: "#200030", secondary: "#0f001a", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#7c3aed", accent: "#6d28d9", accentForeground: "#ffffff", mutedForeground: "#9060c0", cardForeground: "#f5f3ff", input: "#150020", ring: "#7c3aed" },
      background: "gradient-purple",
      backgroundGradient: "linear-gradient(135deg, #0a0014, #150020, #0a0014)",
      hover: { liftDistance: "4px", glowColor: "#7c3aed", glowIntensity: 0.25, transitionDuration: "0.2s" },
    },
    recommended: ["#7c3aed", "#22d3ee", "#0a0014"],
    avoid: ["#888888", "#aaaaaa"],
  },
  {
    id: "warm-sand",
    name: "Arena Cálida",
    emoji: "🏖️",
    description: "Beige arena con terracota. Natural,playero,veraniego.",
    config: {
      colors: { primary: "#d97706", highlight: "#fde68a", background: "#fefce8", foreground: "#451a03", card: "#fef9e7", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#d97706", accent: "#b45309", accentForeground: "#ffffff", mutedForeground: "#92704a", cardForeground: "#451a03", input: "#fef3c7", ring: "#d97706" },
      background: "gradient-cream",
      backgroundGradient: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)",
      hover: { liftDistance: "3px", glowColor: "#d97706", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#d97706", "#fde68a", "#fefce8"],
    avoid: ["#0000ff", "#ff00ff"],
  },
  {
    id: "cool-gray",
    name: "Gris Frío",
    emoji: "❄️",
    description: "Gris azulado claro, minimalista, escandinavo.",
    config: {
      colors: { primary: "#6b7280", highlight: "#93c5fd", background: "#f9fafb", foreground: "#111827", card: "#ffffff", muted: "#f3f4f6", border: "#e5e7eb", secondary: "#f3f4f6", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#6b7280", accent: "#4b5563", accentForeground: "#ffffff", mutedForeground: "#6b7280", cardForeground: "#111827", input: "#f3f4f6", ring: "#6b7280" },
      background: "gradient-snow",
      backgroundGradient: "linear-gradient(135deg, #f9fafb, #f3f4f6, #f9fafb)",
      hover: { liftDistance: "2px", glowColor: "#6b7280", glowIntensity: 0.05, transitionDuration: "0.3s" },
    },
    recommended: ["#6b7280", "#93c5fd", "#f9fafb"],
    avoid: ["#ff0000", "#ff00ff"],
  },
  {
    id: "mint-fresh",
    name: "Menta Fresca",
    emoji: "🍃",
    description: "Verde menta brillante con blanco. Fresco,自然的, limpio.",
    config: {
      colors: { primary: "#10b981", highlight: "#6ee7b7", background: "#ecfdf5", foreground: "#064e3b", card: "#ffffff", muted: "#d1fae5", border: "#a7f3d0", secondary: "#d1fae5", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#10b981", accent: "#059669", accentForeground: "#ffffff", mutedForeground: "#10b981", cardForeground: "#064e3b", input: "#d1fae5", ring: "#10b981" },
      background: "gradient-snow",
      backgroundGradient: "linear-gradient(135deg, #ecfdf5, #d1fae5, #ecfdf5)",
      hover: { liftDistance: "3px", glowColor: "#10b981", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#10b981", "#6ee7b7", "#ecfdf5"],
    avoid: ["#000000", "#ff0000"],
  },
  {
    id: "cherry-vivid",
    name: "Cereza Vívido",
    emoji: "🍒",
    description: "Rojo cereza profundo con rosa. Dulce, juvenil, festivo.",
    config: {
      colors: { primary: "#be123c", highlight: "#f9a8d4", background: "#fff1f2", foreground: "#4c0519", card: "#ffffff", muted: "#ffe4e6", border: "#fecdd3", secondary: "#ffe4e6", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#be123c", accent: "#9f1239", accentForeground: "#ffffff", mutedForeground: "#be123c", cardForeground: "#4c0519", input: "#ffe4e6", ring: "#be123c" },
      background: "gradient-lavender",
      backgroundGradient: "linear-gradient(135deg, #fff1f2, #ffe4e6, #fff1f2)",
      hover: { liftDistance: "3px", glowColor: "#be123c", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#be123c", "#f9a8d4", "#fff1f2"],
    avoid: ["#000000", "#0000ff"],
  },
  {
    id: "purple-mystic",
    name: "Púrpura Místico",
    emoji: "🔮",
    description: "Púrpura oscuro con lila. Místico, esotérico, único.",
    config: {
      colors: { primary: "#6d28d9", highlight: "#c4b5fd", background: "#0c0a1a", foreground: "#f5f3ff", card: "#100f20", muted: "#150f25", border: "#1a1530", secondary: "#100f20", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#6d28d9", accent: "#5b21b6", accentForeground: "#ffffff", mutedForeground: "#9080b0", cardForeground: "#f5f3ff", input: "#150f25", ring: "#6d28d9" },
      background: "gradient-purple",
      backgroundGradient: "linear-gradient(135deg, #0c0a1a, #150f25, #0c0a1a)",
      hover: { liftDistance: "4px", glowColor: "#6d28d9", glowIntensity: 0.2, transitionDuration: "0.3s" },
    },
    recommended: ["#6d28d9", "#c4b5fd", "#0c0a1a"],
    avoid: ["#ff0000", "#00ff00"],
  },
  {
    id: "coral-vibrant",
    name: "Coral Vibrante",
    emoji: "🪸",
    description: "Coral cálido con melón. Tropical,veraniego,energético.",
    config: {
      colors: { primary: "#f43f5e", highlight: "#fdba74", background: "#fff1f2", foreground: "#4c0519", card: "#ffffff", muted: "#ffe4e6", border: "#fecdd3", secondary: "#ffe4e6", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f43f5e", accent: "#e11d48", accentForeground: "#ffffff", mutedForeground: "#c06070", cardForeground: "#4c0519", input: "#ffe4e6", ring: "#f43f5e" },
      background: "gradient-lavender",
      backgroundGradient: "linear-gradient(135deg, #fff1f2, #ffe4e6, #fff1f2)",
      hover: { liftDistance: "3px", glowColor: "#f43f5e", glowIntensity: 0.1, transitionDuration: "0.3s" },
    },
    recommended: ["#f43f5e", "#fdba74", "#fff1f2"],
    avoid: ["#000000", "#0000ff"],
  },
  {
    id: "sky-bright",
    name: "Cielo Brillante",
    emoji: "☁️",
    description: "Azul cielo suave con blanco. Limpio, aireado, sereno.",
    config: {
      colors: { primary: "#0ea5e9", highlight: "#7dd3fc", background: "#f0f9ff", foreground: "#0c4a6e", card: "#ffffff", muted: "#e0f2fe", border: "#bae6fd", secondary: "#e0f2fe", success: "#10b981", warning: "#fb923c", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#0ea5e9", accent: "#0284c7", accentForeground: "#ffffff", mutedForeground: "#0ea5e9", cardForeground: "#0c4a6e", input: "#e0f2fe", ring: "#0ea5e9" },
      background: "gradient-sky-light",
      backgroundGradient: "linear-gradient(135deg, #f0f9ff, #e0f2fe, #f0f9ff)",
      hover: { liftDistance: "3px", glowColor: "#0ea5e9", glowIntensity: 0.08, transitionDuration: "0.3s" },
    },
    recommended: ["#0ea5e9", "#7dd3fc", "#f0f9ff"],
    avoid: ["#000000", "#ff0000"],
  },
]

export interface CuratedLook {
  id: string
  name: string
  category: string
  config: FullThemeConfig
}

const CURATED_LOOKS: CuratedLook[] = [
  // MINIMALISTA
  { id: "min-01", name: "Blanco Puro", category: "minimalista", config: { colors: { primary: "#000000", highlight: "#666666", background: "#ffffff", foreground: "#0a0a0a", card: "#fafafa", muted: "#f5f5f5", border: "#e5e5e5", secondary: "#f5f5f5", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#000000", accent: "#888888", accentForeground: "#ffffff", mutedForeground: "#999999", cardForeground: "#0a0a0a", input: "#f5f5f5", ring: "#000000" }, background: "solid-white-min", backgroundGradient: "#ffffff", backgroundColor: "#ffffff", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.5, blurIntensity: 0.5 }, hover: { liftDistance: "2px", glowColor: "#000000", glowIntensity: 0.05, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "min-02", name: "Negro Profundo", category: "minimalista", config: { colors: { primary: "#ffffff", highlight: "#a0a0a0", background: "#000000", foreground: "#f5f5f5", card: "#0a0a0a", muted: "#141414", border: "#1f1f1f", secondary: "#0a0a0a", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#000000", secondaryForeground: "#ffffff", accent: "#666666", accentForeground: "#ffffff", mutedForeground: "#888888", cardForeground: "#f5f5f5", input: "#141414", ring: "#ffffff" }, background: "solid-dark", backgroundGradient: "#000000", backgroundColor: "#000000", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.5, blurIntensity: 0.5 }, hover: { liftDistance: "2px", glowColor: "#ffffff", glowIntensity: 0.05, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "min-03", name: "Gris Lunar", category: "minimalista", config: { colors: { primary: "#374151", highlight: "#6b7280", background: "#f9fafb", foreground: "#111827", card: "#ffffff", muted: "#f3f4f6", border: "#e5e7eb", secondary: "#f3f4f6", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#374151", accent: "#4b5563", accentForeground: "#ffffff", mutedForeground: "#6b7280", cardForeground: "#111827", input: "#f3f4f6", ring: "#374151" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #f9fafb, #f3f4f6, #f9fafb)", backgroundColor: "#f9fafb", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Cormorant Garamond", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.2, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.25rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.3, blurIntensity: 0.3 }, hover: { liftDistance: "1px", glowColor: "#374151", glowIntensity: 0.03, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "min-04", name: "Beige Arena", category: "minimalista", config: { colors: { primary: "#78716c", highlight: "#a8a29e", background: "#fafaf9", foreground: "#292524", card: "#ffffff", muted: "#f5f5f4", border: "#e7e5e4", secondary: "#f5f5f4", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#78716c", accent: "#57534e", accentForeground: "#ffffff", mutedForeground: "#78716c", cardForeground: "#292524", input: "#f5f5f4", ring: "#78716c" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fafaf9, #f5f5f4, #fafaf9)", backgroundColor: "#fafaf9", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Cormorant Garamond", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.2, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "0.25rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.3, blurIntensity: 0.3 }, hover: { liftDistance: "1px", glowColor: "#78716c", glowIntensity: 0.03, transitionDuration: "0.2s" }, mode: "light" } },

  // PASTEL
  { id: "pas-01", name: "Rosa Cotton", category: "pastel", config: { colors: { primary: "#f472b6", highlight: "#f9a8d4", background: "#fdf2f8", foreground: "#831843", card: "#ffffff", muted: "#fce7f3", border: "#fbcfe8", secondary: "#fce7f3", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f472b6", accent: "#ec4899", accentForeground: "#ffffff", mutedForeground: "#f472b6", cardForeground: "#831843", input: "#fce7f3", ring: "#f472b6" }, background: "gradient-lavender", backgroundGradient: "linear-gradient(135deg, #fdf2f8, #fce7f3, #fdf2f8)", backgroundColor: "#fdf2f8", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#f472b6", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-02", name: "Lavanda Suave", category: "pastel", config: { colors: { primary: "#8b5cf6", highlight: "#c4b5fd", background: "#faf5ff", foreground: "#3b0764", card: "#ffffff", muted: "#f3e8ff", border: "#e9d5ff", secondary: "#f3e8ff", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#8b5cf6", accent: "#a78bfa", accentForeground: "#ffffff", mutedForeground: "#8b5cf6", cardForeground: "#3b0764", input: "#f3e8ff", ring: "#8b5cf6" }, background: "gradient-lavender", backgroundGradient: "linear-gradient(135deg, #faf5ff, #f3e8ff, #faf5ff)", backgroundColor: "#faf5ff", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#8b5cf6", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-03", name: "Menta Natural", category: "pastel", config: { colors: { primary: "#10b981", highlight: "#6ee7b7", background: "#ecfdf5", foreground: "#064e3b", card: "#ffffff", muted: "#d1fae5", border: "#a7f3d0", secondary: "#d1fae5", success: "#10b981", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#10b981", accent: "#059669", accentForeground: "#ffffff", mutedForeground: "#10b981", cardForeground: "#064e3b", input: "#d1fae5", ring: "#10b981" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #ecfdf5, #d1fae5, #ecfdf5)", backgroundColor: "#ecfdf5", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#10b981", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-04", name: "Melocotón", category: "pastel", config: { colors: { primary: "#fb923c", highlight: "#fdba74", background: "#fff7ed", foreground: "#431407", card: "#ffffff", muted: "#ffedd5", border: "#fed7aa", secondary: "#ffedd5", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#fb923c", accent: "#f97316", accentForeground: "#ffffff", mutedForeground: "#fb923c", cardForeground: "#431407", input: "#ffedd5", ring: "#fb923c" }, background: "gradient-peach", backgroundGradient: "linear-gradient(135deg, #fff7ed, #ffedd5, #fff7ed)", backgroundColor: "#fff7ed", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#fb923c", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-05", name: "Cielo Claro", category: "pastel", config: { colors: { primary: "#0ea5e9", highlight: "#7dd3fc", background: "#f0f9ff", foreground: "#0c4a6e", card: "#ffffff", muted: "#e0f2fe", border: "#bae6fd", secondary: "#e0f2fe", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#0ea5e9", accent: "#0284c7", accentForeground: "#ffffff", mutedForeground: "#0ea5e9", cardForeground: "#0c4a6e", input: "#e0f2fe", ring: "#0ea5e9" }, background: "gradient-sky-light", backgroundGradient: "linear-gradient(135deg, #f0f9ff, #e0f2fe, #f0f9ff)", backgroundColor: "#f0f9ff", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#0ea5e9", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-06", name: "Amarillo Sol", category: "pastel", config: { colors: { primary: "#ca8a04", highlight: "#fde047", background: "#fefce8", foreground: "#422006", card: "#ffffff", muted: "#fef9c3", border: "#fef08a", secondary: "#fef9c3", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#ca8a04", accent: "#a16207", accentForeground: "#ffffff", mutedForeground: "#ca8a04", cardForeground: "#422006", input: "#fef9c3", ring: "#ca8a04" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fefce8, #fef9c3, #fefce8)", backgroundColor: "#fefce8", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#ca8a04", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "light" } },

  // MODERNO
  { id: "mod-01", name: "Violeta Neón", category: "moderno", config: { colors: { primary: "#7c3aed", highlight: "#ec4899", background: "#0a0014", foreground: "#f5f3ff", card: "#0f001a", muted: "#150020", border: "#200030", secondary: "#0f001a", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#7c3aed", accent: "#6d28d9", accentForeground: "#ffffff", mutedForeground: "#9060c0", cardForeground: "#f5f3ff", input: "#150020", ring: "#7c3aed" }, background: "gradient-purple", backgroundGradient: "linear-gradient(135deg, #0a0014, #150020, #0a0014)", backgroundColor: "#0a0014", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#7c3aed", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-02", name: "Cyan Eléctrico", category: "moderno", config: { colors: { primary: "#06b6d4", highlight: "#22d3ee", background: "#030712", foreground: "#f0f9ff", card: "#0a1525", muted: "#0f1f35", border: "#1a3050", secondary: "#0a1525", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#030712", secondaryForeground: "#06b6d4", accent: "#0891b2", accentForeground: "#ffffff", mutedForeground: "#60c0e0", cardForeground: "#f0f9ff", input: "#0f1f35", ring: "#06b6d4" }, background: "gradient-ocean", backgroundGradient: "linear-gradient(135deg, #030712, #0a1525, #030712)", backgroundColor: "#030712", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#06b6d4", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-03", name: "Rosa Fuchsia", category: "moderno", config: { colors: { primary: "#d946ef", highlight: "#f472b6", background: "#0a0010", foreground: "#fdf2f8", card: "#0f0015", muted: "#15001a", border: "#1a0020", secondary: "#0f0015", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#d946ef", accent: "#c026d3", accentForeground: "#ffffff", mutedForeground: "#b060c0", cardForeground: "#fdf2f8", input: "#15001a", ring: "#d946ef" }, background: "gradient-purple", backgroundGradient: "linear-gradient(135deg, #0a0010, #15001a, #0a0010)", backgroundColor: "#0a0010", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#d946ef", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-04", name: "Verde Matrix", category: "moderno", config: { colors: { primary: "#22c55e", highlight: "#86efac", background: "#030a03", foreground: "#dcfce7", card: "#050f05", muted: "#081408", border: "#0a1a0a", secondary: "#050f05", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#22c55e", accent: "#166534", accentForeground: "#ffffff", mutedForeground: "#50a050", cardForeground: "#dcfce7", input: "#081408", ring: "#22c55e" }, background: "gradient-forest", backgroundGradient: "linear-gradient(135deg, #030a03, #050f05, #030a03)", backgroundColor: "#030a03", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#22c55e", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-05", name: "Naranja Atardecer", category: "moderno", config: { colors: { primary: "#f97316", highlight: "#fbbf24", background: "#1a0500", foreground: "#fff7ed", card: "#200a00", muted: "#2a0f00", border: "#3a1800", secondary: "#200a00", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f97316", accent: "#ea580c", accentForeground: "#ffffff", mutedForeground: "#c08050", cardForeground: "#fff7ed", input: "#2a0f00", ring: "#f97316" }, background: "gradient-sunset", backgroundGradient: "linear-gradient(135deg, #1a0500, #2a1000, #1a0500)", backgroundColor: "#1a0500", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#f97316", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-06", name: "Azul Cobalto", category: "moderno", config: { colors: { primary: "#2563eb", highlight: "#60a5fa", background: "#030510", foreground: "#eff6ff", card: "#060a18", muted: "#0a0f20", border: "#101530", secondary: "#060a18", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#2563eb", accent: "#1d4ed8", accentForeground: "#ffffff", mutedForeground: "#6080c0", cardForeground: "#eff6ff", input: "#0a0f20", ring: "#2563eb" }, background: "gradient-sky", backgroundGradient: "linear-gradient(135deg, #030510, #060a18, #030510)", backgroundColor: "#030510", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#2563eb", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },

  // EJECUTIVO
  { id: "eje-01", name: "Azul Marina", category: "ejecutivo", config: { colors: { primary: "#1e40af", highlight: "#60a5fa", background: "#f8fafc", foreground: "#0f172a", card: "#ffffff", muted: "#f1f5f9", border: "#e2e8f0", secondary: "#f1f5f9", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#1e40af", accent: "#3b82f6", accentForeground: "#ffffff", mutedForeground: "#475569", cardForeground: "#0f172a", input: "#f1f5f9", ring: "#1e40af" }, background: "gradient-sky-light", backgroundGradient: "linear-gradient(135deg, #f8fafc, #e2e8f0, #f8fafc)", backgroundColor: "#f8fafc", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Montserrat", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#1e40af", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "eje-02", name: "Gris Corporativo", category: "ejecutivo", config: { colors: { primary: "#374151", highlight: "#6b7280", background: "#f9fafb", foreground: "#111827", card: "#ffffff", muted: "#f3f4f6", border: "#e5e7eb", secondary: "#f3f4f6", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#374151", accent: "#4b5563", accentForeground: "#ffffff", mutedForeground: "#6b7280", cardForeground: "#111827", input: "#f3f4f6", ring: "#374151" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #f9fafb, #f3f4f6, #f9fafb)", backgroundColor: "#f9fafb", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Montserrat", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#374151", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "eje-03", name: "Azul Noche", category: "ejecutivo", config: { colors: { primary: "#3b82f6", highlight: "#93c5fd", background: "#030411", foreground: "#f0f4ff", card: "#0a1525", muted: "#0f1f35", border: "#1a2f50", secondary: "#0a1525", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#3b82f6", accent: "#2563eb", accentForeground: "#ffffff", mutedForeground: "#6080c0", cardForeground: "#f0f4ff", input: "#0f1f35", ring: "#3b82f6" }, background: "gradient-sky", backgroundGradient: "linear-gradient(135deg, #030411, #0a1525, #030411)", backgroundColor: "#030411", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Montserrat", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#3b82f6", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "eje-04", name: "Oro Negro", category: "ejecutivo", config: { colors: { primary: "#d4af37", highlight: "#fbbf24", background: "#050a14", foreground: "#f0ead6", card: "#0a1018", muted: "#0f1520", border: "#1a2030", secondary: "#0a1018", success: "#10b981", warning: "#d4af37", destructive: "#ef4444", primaryForeground: "#050a14", secondaryForeground: "#d4af37", accent: "#b8860b", accentForeground: "#f0ead6", mutedForeground: "#6070a0", cardForeground: "#f0ead6", input: "#0f1520", ring: "#d4af37" }, background: "solid-dark", backgroundGradient: "#050a14", backgroundColor: "#050a14", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#d4af37", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "eje-05", name: "Burdeos Clásico", category: "ejecutivo", config: { colors: { primary: "#881337", highlight: "#fb7185", background: "#fafaf9", foreground: "#1c1917", card: "#ffffff", muted: "#f5f5f4", border: "#e7e5e4", secondary: "#f5f5f4", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#881337", accent: "#9f1239", accentForeground: "#ffffff", mutedForeground: "#881337", cardForeground: "#1c1917", input: "#f5f5f4", ring: "#881337" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #fafaf9, #f5f5f4, #fafaf9)", backgroundColor: "#fafaf9", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#881337", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "eje-06", name: "Verde Inglés", category: "ejecutivo", config: { colors: { primary: "#166534", highlight: "#4ade80", background: "#f0fdf4", foreground: "#14532d", card: "#ffffff", muted: "#dcfce7", border: "#bbf7d0", secondary: "#dcfce7", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#166534", accent: "#15803d", accentForeground: "#ffffff", mutedForeground: "#166534", cardForeground: "#14532d", input: "#dcfce7", ring: "#166534" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #f0fdf4, #dcfce7, #f0fdf4)", backgroundColor: "#f0fdf4", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#166534", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "light" } },

  // NOCTURNO
  { id: "noc-01", name: "Medianoche", category: "nocturno", config: { colors: { primary: "#1e3a8a", highlight: "#93c5fd", background: "#030411", foreground: "#f0f4ff", card: "#0a1525", muted: "#0f1f35", border: "#1a2f50", secondary: "#0a1525", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#1e3a8a", accent: "#1d4ed8", accentForeground: "#ffffff", mutedForeground: "#6080c0", cardForeground: "#f0f4ff", input: "#0f1f35", ring: "#1e3a8a" }, background: "gradient-sky", backgroundGradient: "linear-gradient(135deg, #030411, #0a1525, #030411)", backgroundColor: "#030411", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#1e3a8a", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "noc-02", name: "Púrpura Oscuro", category: "nocturno", config: { colors: { primary: "#6d28d9", highlight: "#c4b5fd", background: "#0a0010", foreground: "#f5f3ff", card: "#0f0018", muted: "#150020", border: "#1a0030", secondary: "#0f0018", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#6d28d9", accent: "#5b21b6", accentForeground: "#ffffff", mutedForeground: "#9080b0", cardForeground: "#f5f3ff", input: "#150020", ring: "#6d28d9" }, background: "gradient-purple", backgroundGradient: "linear-gradient(135deg, #0a0010, #0f0018, #0a0010)", backgroundColor: "#0a0010", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#6d28d9", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "noc-03", name: "Rosa Nocturno", category: "nocturno", config: { colors: { primary: "#be185d", highlight: "#f9a8d4", background: "#0a0010", foreground: "#fdf2f8", card: "#0f0018", muted: "#15001a", border: "#1a0020", secondary: "#0f0018", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#be185d", accent: "#9d174d", accentForeground: "#ffffff", mutedForeground: "#b06080", cardForeground: "#fdf2f8", input: "#15001a", ring: "#be185d" }, background: "gradient-rose", backgroundGradient: "linear-gradient(135deg, #0a0010, #1a0a18, #0a0010)", backgroundColor: "#0a0010", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#be185d", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "noc-04", name: "Rojo Pasión", category: "nocturno", config: { colors: { primary: "#dc2626", highlight: "#f87171", background: "#0a0000", foreground: "#f8f0f0", card: "#120808", muted: "#1a0a0a", border: "#2a1010", secondary: "#120808", success: "#22c55e", warning: "#f59e0b", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#dc2626", accent: "#991b1b", accentForeground: "#ffffff", mutedForeground: "#6b5555", cardForeground: "#f8f0f0", input: "#1a0a0a", ring: "#dc2626" }, background: "gradient-dark", backgroundGradient: "linear-gradient(135deg, #0a0000, #1a0505, #0a0000)", backgroundColor: "#0a0000", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#dc2626", glowIntensity: 0.25, transitionDuration: "0.3s" }, mode: "dark" } },

  // BOHEMIO
  { id: "boh-01", name: "Terracota", category: "bohemio", config: { colors: { primary: "#c2410c", highlight: "#fde68a", background: "#fef7ed", foreground: "#431407", card: "#ffffff", muted: "#ffedd5", border: "#fed7aa", secondary: "#ffedd5", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#c2410c", accent: "#9a3412", accentForeground: "#ffffff", mutedForeground: "#c2410c", cardForeground: "#431407", input: "#ffedd5", ring: "#c2410c" }, background: "gradient-peach", backgroundGradient: "linear-gradient(135deg, #fef7ed, #ffedd5, #fef7ed)", backgroundColor: "#fef7ed", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#c2410c", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "boh-02", name: "Marrón Café", category: "bohemio", config: { colors: { primary: "#92400e", highlight: "#f59e0b", background: "#fefce8", foreground: "#451a03", card: "#ffffff", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#92400e", accent: "#b45309", accentForeground: "#ffffff", mutedForeground: "#92400e", cardForeground: "#451a03", input: "#fef3c7", ring: "#92400e" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)", backgroundColor: "#fefce8", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#92400e", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "boh-03", name: "Ocre Tierra", category: "bohemio", config: { colors: { primary: "#a16207", highlight: "#ca8a04", background: "#fefce8", foreground: "#1c1400", card: "#fef9e7", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#ca8a04", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#a16207", accent: "#92400e", accentForeground: "#ffffff", mutedForeground: "#92704a", cardForeground: "#1c1400", input: "#fef3c7", ring: "#a16207" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fefce8, #fef3c7, #fefce8)", backgroundColor: "#fefce8", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#a16207", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "boh-04", name: "Verde Oliva", category: "bohemio", config: { colors: { primary: "#4d7c0f", highlight: "#a3e635", background: "#f7faf5", foreground: "#1a2e05", card: "#ffffff", muted: "#e9f5e1", border: "#bbf7d0", secondary: "#e9f5e1", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#4d7c0f", accent: "#65a30d", accentForeground: "#ffffff", mutedForeground: "#4d7c0f", cardForeground: "#1a2e05", input: "#e9f5e1", ring: "#4d7c0f" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #f7faf5, #e9f5e1, #f7faf5)", backgroundColor: "#f7faf5", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#4d7c0f", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },

  // GLAMOUR (marca)
  { id: "gla-01", name: "GLAMOURS Violeta", category: "glamour", config: { colors: { primary: "#7c5cfc", highlight: "#ec4899", background: "#0d0d1a", foreground: "#e8e8f0", card: "#161627", muted: "#1a1a30", border: "#1e1e3a", secondary: "#1f1f3a", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#c4b5fd", accent: "#2d1b69", accentForeground: "#e17055", mutedForeground: "#8888a8", cardForeground: "#e8e8f0", input: "#1e1e3a", ring: "#7c5cfc" }, background: "gradient-dark", backgroundGradient: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)", backgroundColor: "#0d0d1a", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#7c5cfc", glowIntensity: 0.15, transitionDuration: "0.3s" }, mode: "dark" } },

  // MINIMALISTA (nuevos)
  { id: "min-05", name: "Cemento", category: "minimalista", config: { colors: { primary: "#52525b", highlight: "#a1a1aa", background: "#f4f4f5", foreground: "#18181b", card: "#ffffff", muted: "#e4e4e7", border: "#d4d4d8", secondary: "#e4e4e7", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#52525b", accent: "#71717a", accentForeground: "#ffffff", mutedForeground: "#71717a", cardForeground: "#18181b", input: "#e4e4e7", ring: "#52525b" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #f4f4f5, #e4e4e7, #f4f4f5)", backgroundColor: "#f4f4f5", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: false, grain: false, noise: false }, typography: { fontDisplay: "Cormorant Garamond", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.2, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.125rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.2, blurIntensity: 0.2 }, hover: { liftDistance: "1px", glowColor: "#52525b", glowIntensity: 0.02, transitionDuration: "0.2s" }, mode: "light" } },
  { id: "min-06", name: "Onix", category: "minimalista", config: { colors: { primary: "#e4e4e7", highlight: "#a1a1aa", background: "#09090b", foreground: "#f4f4f5", card: "#18181b", muted: "#27272a", border: "#3f3f46", secondary: "#18181b", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#09090b", secondaryForeground: "#e4e4e7", accent: "#71717a", accentForeground: "#ffffff", mutedForeground: "#71717a", cardForeground: "#f4f4f5", input: "#27272a", ring: "#e4e4e7" }, background: "solid-dark", backgroundGradient: "#09090b", backgroundColor: "#09090b", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: false, grain: false, noise: false }, typography: { fontDisplay: "Cormorant Garamond", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.2, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.125rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.2, blurIntensity: 0.2 }, hover: { liftDistance: "1px", glowColor: "#e4e4e7", glowIntensity: 0.02, transitionDuration: "0.2s" }, mode: "dark" } },

  // PASTEL (nuevos)
  { id: "pas-07", name: "Lila Profundo", category: "pastel", config: { colors: { primary: "#a78bfa", highlight: "#ddd6fe", background: "#f5f3ff", foreground: "#2e1065", card: "#ffffff", muted: "#ede9fe", border: "#ddd6fe", secondary: "#ede9fe", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#a78bfa", accent: "#8b5cf6", accentForeground: "#ffffff", mutedForeground: "#a78bfa", cardForeground: "#2e1065", input: "#ede9fe", ring: "#a78bfa" }, background: "gradient-lavender", backgroundGradient: "linear-gradient(135deg, #f5f3ff, #ede9fe, #f5f3ff)", backgroundColor: "#f5f3ff", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#a78bfa", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "pas-08", name: "Azul Bambino", category: "pastel", config: { colors: { primary: "#60a5fa", highlight: "#bfdbfe", background: "#eff6ff", foreground: "#1e3a5f", card: "#ffffff", muted: "#dbeafe", border: "#bfdbfe", secondary: "#dbeafe", success: "#22c55e", warning: "#fbbf24", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#60a5fa", accent: "#3b82f6", accentForeground: "#ffffff", mutedForeground: "#60a5fa", cardForeground: "#1e3a5f", input: "#dbeafe", ring: "#60a5fa" }, background: "gradient-sky-light", backgroundGradient: "linear-gradient(135deg, #eff6ff, #dbeafe, #eff6ff)", backgroundColor: "#eff6ff", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#60a5fa", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },

  // MODERNO (nuevos)
  { id: "mod-07", name: "Lima Eléctrico", category: "moderno", config: { colors: { primary: "#a3e635", highlight: "#d9f99d", background: "#0a1a00", foreground: "#dcfce7", card: "#0f1f05", muted: "#141f08", border: "#1a2a0a", secondary: "#0f1f05", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#0a1a00", secondaryForeground: "#a3e635", accent: "#84cc16", accentForeground: "#ffffff", mutedForeground: "#80a050", cardForeground: "#dcfce7", input: "#141f08", ring: "#a3e635" }, background: "gradient-forest", backgroundGradient: "linear-gradient(135deg, #0a1a00, #0f1f05, #0a1a00)", backgroundColor: "#0a1a00", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#a3e635", glowIntensity: 0.25, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "mod-08", name: "Magenta Pulse", category: "moderno", config: { colors: { primary: "#e11d48", highlight: "#fb7185", background: "#0a0010", foreground: "#fdf2f8", card: "#0f0015", muted: "#15001a", border: "#1a0020", secondary: "#0f0015", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#e11d48", accent: "#be123c", accentForeground: "#ffffff", mutedForeground: "#b06070", cardForeground: "#fdf2f8", input: "#15001a", ring: "#e11d48" }, background: "gradient-purple", backgroundGradient: "linear-gradient(135deg, #0a0010, #1a0018, #0a0010)", backgroundColor: "#0a0010", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Space Grotesk", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#e11d48", glowIntensity: 0.3, transitionDuration: "0.2s" }, mode: "dark" } },

  // EJECUTIVO (nuevos)
  { id: "eje-07", name: "Carbón Lujo", category: "ejecutivo", config: { colors: { primary: "#374151", highlight: "#9ca3af", background: "#111827", foreground: "#f9fafb", card: "#1f2937", muted: "#374151", border: "#4b5563", secondary: "#1f2937", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#374151", accent: "#6b7280", accentForeground: "#ffffff", mutedForeground: "#9ca3af", cardForeground: "#f9fafb", input: "#374151", ring: "#374151" }, background: "solid-dark", backgroundGradient: "#111827", backgroundColor: "#111827", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: true, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Montserrat", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#374151", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "dark" } },
  { id: "eje-08", name: "Granate Noble", category: "ejecutivo", config: { colors: { primary: "#7f1d1d", highlight: "#fca5a5", background: "#fafaf9", foreground: "#1c1917", card: "#ffffff", muted: "#f5f5f4", border: "#e7e5e4", secondary: "#f5f5f4", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#7f1d1d", accent: "#991b1b", accentForeground: "#ffffff", mutedForeground: "#7f1d1d", cardForeground: "#1c1917", input: "#f5f5f4", ring: "#7f1d1d" }, background: "gradient-snow", backgroundGradient: "linear-gradient(135deg, #fafaf9, #f5f5f4, #fafaf9)", backgroundColor: "#fafaf9", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: true, glass: true, grain: false, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "600", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" }, layout: { borderRadius: "0.5rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "3px", glowColor: "#7f1d1d", glowIntensity: 0.1, transitionDuration: "0.2s" }, mode: "light" } },

  // NOCTURNO (nuevos)
  { id: "noc-05", name: "Esmeralda Nocturna", category: "nocturno", config: { colors: { primary: "#059669", highlight: "#34d399", background: "#030a05", foreground: "#dcfce7", card: "#050f05", muted: "#081408", border: "#0a1a0a", secondary: "#050f05", success: "#22c55e", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#059669", accent: "#047857", accentForeground: "#ffffff", mutedForeground: "#50a050", cardForeground: "#dcfce7", input: "#081408", ring: "#059669" }, background: "gradient-forest", backgroundGradient: "linear-gradient(135deg, #030a05, #050f05, #030a05)", backgroundColor: "#030a05", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#059669", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "noc-06", name: "Coral profundo", category: "nocturno", config: { colors: { primary: "#f43f5e", highlight: "#fda4af", background: "#0a0005", foreground: "#fff1f2", card: "#0f0008", muted: "#140008", border: "#1a0010", secondary: "#0f0008", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#f43f5e", accent: "#e11d48", accentForeground: "#ffffff", mutedForeground: "#c06070", cardForeground: "#fff1f2", input: "#140008", ring: "#f43f5e" }, background: "gradient-rose", backgroundGradient: "linear-gradient(135deg, #0a0005, #1a0008, #0a0005)", backgroundColor: "#0a0005", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#f43f5e", glowIntensity: 0.25, transitionDuration: "0.3s" }, mode: "dark" } },

  // BOHEMIO (nuevos)
  { id: "boh-05", name: "Canela", category: "bohemio", config: { colors: { primary: "#b45309", highlight: "#fcd34d", background: "#fffbeb", foreground: "#451a03", card: "#ffffff", muted: "#fef3c7", border: "#fde68a", secondary: "#fef3c7", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#b45309", accent: "#92400e", accentForeground: "#ffffff", mutedForeground: "#b45309", cardForeground: "#451a03", input: "#fef3c7", ring: "#b45309" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fffbeb, #fef3c7, #fffbeb)", backgroundColor: "#fffbeb", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#b45309", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },
  { id: "boh-06", name: "Arcilla", category: "bohemio", config: { colors: { primary: "#78716c", highlight: "#fde68a", background: "#fafaf9", foreground: "#292524", card: "#ffffff", muted: "#f5f5f4", border: "#e7e5e4", secondary: "#f5f5f4", success: "#16a34a", warning: "#d97706", destructive: "#dc2626", primaryForeground: "#ffffff", secondaryForeground: "#78716c", accent: "#57534e", accentForeground: "#ffffff", mutedForeground: "#78716c", cardForeground: "#292524", input: "#f5f5f4", ring: "#78716c" }, background: "gradient-cream", backgroundGradient: "linear-gradient(135deg, #fafaf9, #f5f5f4, #fafaf9)", backgroundColor: "#fafaf9", backgroundPattern: "", backgroundImage: "", effects: { particles: false, orbs: false, grid: false, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Dancing Script", fontBody: "Poppins", fontMono: "JetBrains Mono", headingWeight: "500", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.7", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 0.8, blurIntensity: 0.8 }, hover: { liftDistance: "4px", glowColor: "#78716c", glowIntensity: 0.12, transitionDuration: "0.3s" }, mode: "light" } },

  // GLAMOUR (nuevos)
  { id: "gla-02", name: "Rosa Diamante", category: "glamour", config: { colors: { primary: "#ec4899", highlight: "#f9a8d4", background: "#0a0014", foreground: "#fdf2f8", card: "#0f0018", muted: "#150020", border: "#200028", secondary: "#0f0018", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#ffffff", secondaryForeground: "#ec4899", accent: "#db2777", accentForeground: "#ffffff", mutedForeground: "#b06080", cardForeground: "#fdf2f8", input: "#150020", ring: "#ec4899" }, background: "gradient-purple", backgroundGradient: "linear-gradient(135deg, #0a0014, #1a0020, #0a0014)", backgroundColor: "#0a0014", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#ec4899", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "gla-03", name: "Oro Rosa", category: "glamour", config: { colors: { primary: "#d4af37", highlight: "#f0abfc", background: "#0a0010", foreground: "#fdf2f8", card: "#0f0018", muted: "#150020", border: "#200028", secondary: "#0f0018", success: "#10b981", warning: "#d4af37", destructive: "#ef4444", primaryForeground: "#0a0010", secondaryForeground: "#d4af37", accent: "#b8860b", accentForeground: "#ffffff", mutedForeground: "#b06080", cardForeground: "#fdf2f8", input: "#150020", ring: "#d4af37" }, background: "gradient-rose", backgroundGradient: "linear-gradient(135deg, #0a0010, #1a0a18, #0a0010)", backgroundColor: "#0a0010", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#d4af37", glowIntensity: 0.25, transitionDuration: "0.3s" }, mode: "dark" } },
  { id: "gla-04", name: "Cristal Violeta", category: "glamour", config: { colors: { primary: "#a78bfa", highlight: "#fbbf24", background: "#0d0d1a", foreground: "#e8e8f0", card: "#161627", muted: "#1a1a30", border: "#1e1e3a", secondary: "#1f1f3a", success: "#10b981", warning: "#f59e0b", destructive: "#ef4444", primaryForeground: "#0d0d1a", secondaryForeground: "#a78bfa", accent: "#8b5cf6", accentForeground: "#ffffff", mutedForeground: "#8888a8", cardForeground: "#e8e8f0", input: "#1e1e3a", ring: "#a78bfa" }, background: "gradient-dark", backgroundGradient: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)", backgroundColor: "#0d0d1a", backgroundPattern: "", backgroundImage: "", effects: { particles: true, orbs: true, grid: true, glass: true, grain: true, noise: false }, typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.5", textShadow: "none" }, layout: { borderRadius: "1rem", containerWidth: "80rem", spacingUnit: 4, shadowIntensity: 1, blurIntensity: 1 }, hover: { liftDistance: "4px", glowColor: "#a78bfa", glowIntensity: 0.2, transitionDuration: "0.3s" }, mode: "dark" } },
]

const CURATED_CATEGORIES = [
  { id: "minimalista", name: "Minimalista", emoji: "⬜", desc: "Blanco, negro, gris. Lo esencial." },
  { id: "pastel", name: "Pastel", emoji: "🌸", desc: "Colores suaves y delicados." },
  { id: "moderno", name: "Moderno", emoji: "⚡", desc: "Bold, vibrante, neón." },
  { id: "ejecutivo", name: "Ejecutivo", emoji: "💼", desc: "Profesional, corporativo, elegante." },
  { id: "nocturno", name: "Nocturno", emoji: "🌙", desc: "Oscuro, misterioso, dramático." },
  { id: "bohemio", name: "Bohemio", emoji: "🌿", desc: "Tierra, natural, artesanal." },
  { id: "glamour", name: "Glamour", emoji: "✨", desc: "El estilo de la marca." },
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
    { primary: "#2563eb", highlight: "#06b6d4" },
    { primary: "#dc2626", highlight: "#f87171" },
    { primary: "#d4af37", highlight: "#fbbf24" },
    { primary: "#4d7c0f", highlight: "#a3e635" },
    { primary: "#0891b2", highlight: "#5eead4" },
    { primary: "#be123c", highlight: "#f9a8d4" },
    { primary: "#6d28d9", highlight: "#c4b5fd" },
    { primary: "#f43f5e", highlight: "#fdba74" },
    { primary: "#475569", highlight: "#38bdf8" },
    { primary: "#6b7280", highlight: "#93c5fd" },
  ]
  const gradientPalette = [
    { c1: "#7c3aed", c2: "#ec4899" },
    { c1: "#0ea5e9", c2: "#06b6d4" },
    { c1: "#d4af37", c2: "#fbbf24" },
    { c1: "#f472b6", c2: "#fb7185" },
    { c1: "#22c55e", c2: "#84cc16" },
    { c1: "#f97316", c2: "#f59e0b" },
    { c1: "#ef4444", c2: "#f97316" },
    { c1: "#3b82f6", c2: "#8b5cf6" },
    { c1: "#38bdf8", c2: "#a78bfa" },
    { c1: "#d946ef", c2: "#f43f5e" },
    { c1: "#14b8a6", c2: "#22d3ee" },
    { c1: "#eab308", c2: "#facc15" },
    { c1: "#f472b6", c2: "#a78bfa" },
    { c1: "#2563eb", c2: "#22d3ee" },
    { c1: "#e11d48", c2: "#fcd34d" },
    { c1: "#dc2626", c2: "#fbbf24" },
    { c1: "#059669", c2: "#34d399" },
    { c1: "#4338ca", c2: "#a5b4fc" },
    { c1: "#0891b2", c2: "#5eead4" },
    { c1: "#be123c", c2: "#f9a8d4" },
    { c1: "#10b981", c2: "#6ee7b7" },
    { c1: "#8b5cf6", c2: "#f0abfc" },
    { c1: "#15803d", c2: "#86efac" },
    { c1: "#ea580c", c2: "#fde047" },
  ]
  const angles = ["135deg", "180deg", "45deg", "90deg", "225deg"]
  const { primary, highlight } = baseColors[Math.floor(Math.random() * baseColors.length)]
  const grad = gradientPalette[Math.floor(Math.random() * gradientPalette.length)]
  const angle = angles[Math.floor(Math.random() * angles.length)]
  const gradient = `linear-gradient(${angle}, ${grad.c1}, ${grad.c2})`
  const bgId = "custom"

  const fg = isLightColor(grad.c1) ? "#1a1a2e" : "#f0f0f8"
  const card = isLightColor(grad.c1) ? "#ffffff" : "#161627"
  const muted = isLightColor(grad.c1) ? "#f0f0f0" : "#1a1a30"

  return {
    colors: {
      primary,
      primaryForeground: isLightColor(primary) ? "#1a1a2e" : "#ffffff",
      secondary: isLightColor(grad.c1) ? "#e0e0e0" : "#1f1f3a",
      secondaryForeground: highlight,
      accent: adjustBrightness(primary, -0.3),
      accentForeground: isLightColor(primary) ? "#ffffff" : "#f0f0f0",
      background: gradient,
      foreground: fg,
      card: card,
      cardForeground: fg,
      muted: muted,
      mutedForeground: isLightColor(muted) ? "#666666" : "#8888a8",
      border: adjustBrightness(card, 0.05),
      success: "#10b981",
      warning: "#f59e0b",
      destructive: "#ef4444",
      highlight: highlight,
      input: muted,
      ring: primary,
    },
    background: bgId as BackgroundType,
    backgroundColor: gradient,
    backgroundGradient: gradient,
    backgroundPattern: "",
    backgroundImage: "",
    effects: { particles: Math.random() > 0.5, orbs: Math.random() > 0.5, grid: Math.random() > 0.3, glass: true, grain: Math.random() > 0.7, noise: false },
    typography: { fontDisplay: "Playfair Display", fontBody: "Inter", fontMono: "JetBrains Mono", headingWeight: "700", bodyWeight: "400", baseSize: 16, scaleRatio: 1.25, letterSpacing: "0em", lineHeight: "1.6", textShadow: "none" },
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

const DISPLAY_FONT_CATEGORIES: Record<string, "serif" | "sans-serif" | "script" | "slab-serif"> = {
  "Playfair Display": "serif",
  "Cormorant Garamond": "serif",
  "Dancing Script": "script",
  "Montserrat": "sans-serif",
  "Space Grotesk": "sans-serif",
  "Bebas Neue": "sans-serif",
  "Oswald": "sans-serif",
  "Abril Fatface": "serif",
  "Alfa Slab One": "slab-serif",
  "Bitter": "slab-serif",
  "Josefin Sans": "sans-serif",
  "DM Serif Display": "serif",
  "Fraunces": "serif",
  "Sora": "sans-serif",
  "Syne": "sans-serif",
  "Unbounded": "sans-serif",
  "Raleway": "sans-serif",
  "Cinzel": "serif",
}

function getDisplayFallback(fontName: string): string {
  const category = DISPLAY_FONT_CATEGORIES[fontName]
  switch (category) {
    case "serif":
    case "slab-serif":
      return "ui-serif, Georgia, serif"
    case "script":
      return "cursive, ui-serif, serif"
    case "sans-serif":
    default:
      return "ui-sans-serif, system-ui, sans-serif"
  }
}

function getDisplayGeneric(fontName: string): string {
  const category = DISPLAY_FONT_CATEGORIES[fontName]
  switch (category) {
    case "serif":
    case "slab-serif":
      return "serif"
    case "script":
      return "cursive"
    case "sans-serif":
    default:
      return "sans-serif"
  }
}

export { getDisplayGeneric, getDisplayFallback }

export function applyThemeConfig(config: FullThemeConfig) {
  const root = document.documentElement
  const c = config.colors

  root.style.setProperty("--color-primary", c.primary)
  root.style.setProperty("--color-primary-foreground", c.primaryForeground)
  root.style.setProperty("--color-secondary", c.secondary)
  root.style.setProperty("--color-secondary-foreground", c.secondaryForeground)
  root.style.setProperty("--color-accent", c.accent)
  root.style.setProperty("--color-accent-foreground", c.accentForeground)
  root.style.setProperty("--color-background", config.backgroundGradient)
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

  document.body.style.background = config.backgroundGradient
  document.body.classList.toggle("dark-mode", config.mode === "dark")
  document.body.classList.toggle("light-mode", config.mode === "light")

  const glowColor = config.hover.glowColor
  const intensity = config.hover.glowIntensity
  const fontSans = `'${config.typography.fontBody}', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`
  const fontDisplay = `'${config.typography.fontDisplay}', ${getDisplayFallback(config.typography.fontDisplay)}`
  const fontMono = `'${config.typography.fontMono}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`
  const headingWeight = config.typography.headingWeight
  const textShadow = config.typography.textShadow

  root.style.setProperty("--font-sans", fontSans)
  root.style.setProperty("--font-display", fontDisplay)
  root.style.setProperty("--font-mono", fontMono)
  root.style.setProperty("--text-shadow-heading", config.typography.textShadow)
  root.style.setProperty("--radius", config.layout.borderRadius)

  document.body.style.fontFamily = fontSans

  const rootStyles = `
    :root:root:root {
      --font-sans: ${fontSans};
      --font-display: ${fontDisplay};
      --font-mono: ${fontMono};
    }
    html html html, body body body, #root#root#root {
      font-family: ${fontSans} !important;
    }
    * * *, *::before, *::after {
      font-family: inherit !important;
    }
    .font-sans.font-sans.font-sans, [class*="font-sans"][class*="font-sans"][class*="font-sans"] {
      font-family: ${fontSans} !important;
    }
    .font-display.font-display.font-display, [class*="font-display"][class*="font-display"][class*="font-display"] {
      font-family: ${fontDisplay} !important;
      font-weight: ${headingWeight} !important;
    }
    h1, h2, h3, h4, h5, h6, .text-display.text-display {
      font-family: ${fontDisplay} !important;
      font-weight: ${headingWeight} !important;
    }
    .font-mono.font-mono.font-mono, [class*="font-mono"][class*="font-mono"][class*="font-mono"], code, pre, kbd, samp {
      font-family: ${fontMono} !important;
    }
    .font-serif.font-serif.font-serif, [class*="font-serif"][class*="font-serif"][class*="font-serif"] {
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
    }
    ${textShadow !== "none" ? `
      h1, h2, h3, h4, h5, h6, .font-display.font-display {
        text-shadow: ${textShadow} !important;
      }
    ` : ""}
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
    styleEl.setAttribute("data-belleza", "true")
  }
  styleEl.textContent = rootStyles

  if (styleEl.parentNode !== document.documentElement) {
    if (styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
    document.documentElement.appendChild(styleEl)
  }

  const forceFontUpdate = () => {
    document.body.style.fontFamily = fontSans
    root.style.setProperty("--font-sans", fontSans)
    root.style.setProperty("--font-display", fontDisplay)
    root.style.setProperty("--font-mono", fontMono)

    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement
      if (htmlEl.classList && (htmlEl.classList.contains('font-menu') || htmlEl.closest('.font-menu'))) return
      const computed = window.getComputedStyle(htmlEl)
      if (computed.fontFamily) {
        htmlEl.style.setProperty("font-family", "inherit", "important")
      }
    })
  }

  if (typeof document !== "undefined" && document.fonts) {
    try {
      const fontWeightsToLoad = ["400", headingWeight, "700"]
      fontWeightsToLoad.forEach(weight => {
        document.fonts.load(`${weight} 16px "${config.typography.fontDisplay}"`).catch(() => {})
        document.fonts.load(`${weight} 16px "${config.typography.fontBody}"`).catch(() => {})
      })
      document.fonts.ready.then(() => {
        forceFontUpdate()
      }).catch(() => {})
    } catch {}
  }

  setTimeout(forceFontUpdate, 50)
  setTimeout(forceFontUpdate, 200)
  setTimeout(forceFontUpdate, 500)
}

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

export { DEFAULT_CONFIG, DEFAULT_COLORS, PRESET_BACKGROUNDS, PREDEFINED_PALETTES, CURATED_LOOKS, CURATED_CATEGORIES, isLightColor, adjustBrightness }
