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
}

export type BackgroundType =
  | "gradient-dark"
  | "gradient-mesh"
  | "gradient-sunset"
  | "gradient-ocean"
  | "gradient-forest"
  | "gradient-purple"
  | "particles"
  | "grid"
  | "solid-dark"
  | "solid-card"
  | "stars"
  | "abstract"

export interface ThemeConfig {
  colors: ColorPalette
  background: BackgroundType
  effects: {
    particles: boolean
    orbs: boolean
    grid: boolean
    glass: boolean
  }
  typography: {
    fontDisplay: string
    fontBody: string
  }
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
}

const PRESET_BACKGROUNDS: { id: BackgroundType; name: string; preview: string }[] = [
  { id: "gradient-dark", name: "Violeta Oscuro", preview: "linear-gradient(135deg, #0d0d1a, #1a0a2e, #161627)" },
  { id: "gradient-sunset", name: "Atardecer", preview: "linear-gradient(135deg, #1a0a2e, #2d1b4e, #4a1942)" },
  { id: "gradient-ocean", name: "Océano", preview: "linear-gradient(135deg, #0a1628, #0d1f3c, #162447)" },
  { id: "gradient-forest", name: "Bosque", preview: "linear-gradient(135deg, #0d1a0d, #1a2e1a, #162816)" },
  { id: "gradient-purple", name: "Púrpura", preview: "linear-gradient(135deg, #1a0a2e, #2d1b69, #3d2080)" },
  { id: "gradient-mesh", name: "Mesh Gradiente", preview: "linear-gradient(135deg, #0d0d1a 25%, transparent 25%), linear-gradient(225deg, #0d0d1a 25%, transparent 25%), linear-gradient(45deg, #0d0d1a 25%, transparent 25%), linear-gradient(315deg, #0d0d1a 25%, #1a0a2e 25%)" },
  { id: "particles", name: "Partículas", preview: "radial-gradient(circle at 20% 30%, rgba(124,92,252,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.3) 0%, transparent 50%)" },
  { id: "grid", name: "Grid Lines", preview: "linear-gradient(rgba(124,92,252,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.05) 1px, transparent 1px)" },
  { id: "stars", name: "Estrellas", preview: "#0d0d1a" },
  { id: "solid-dark", name: "Negro Puro", preview: "#000000" },
  { id: "solid-card", name: "Card Sólido", preview: "#161627" },
  { id: "abstract", name: "Abstracto", preview: "conic-gradient(from 180deg at 50% 50%, #0d0d1a, #1a0a2e, #0d0d1a)" },
]

const PRESET_THEMES: { name: string; colors: Partial<ColorPalette> }[] = [
  {
    name: "GLAMOURS Violeta",
    colors: {
      primary: "#7c5cfc",
      highlight: "#ec4899",
      background: "#0d0d1a",
    },
  },
  {
    name: "Cyberpunk",
    colors: {
      primary: "#00f5ff",
      highlight: "#ff00ff",
      background: "#0a0a0f",
    },
  },
  {
    name: "Oro Negro",
    colors: {
      primary: "#d4af37",
      highlight: "#ffd700",
      background: "#0a0a0a",
    },
  },
  {
    name: "Verde Matrix",
    colors: {
      primary: "#00ff41",
      highlight: "#39ff14",
      background: "#0a0a0a",
    },
  },
  {
    name: "Rosa Pastel",
    colors: {
      primary: "#f472b6",
      highlight: "#fb7185",
      background: "#1a1a2e",
    },
  },
  {
    name: "Azul Océano",
    colors: {
      primary: "#0ea5e9",
      highlight: "#06b6d4",
      background: "#0a1628",
    },
  },
]

interface ThemeStore {
  config: ThemeConfig
  isPreview: boolean
  tempConfig: ThemeConfig | null
  setConfig: (config: Partial<ThemeConfig>) => void
  setColors: (colors: Partial<ColorPalette>) => void
  setBackground: (background: BackgroundType) => void
  setEffects: (effects: Partial<ThemeConfig["effects"]>) => void
  applyPreset: (presetIndex: number) => void
  startPreview: () => void
  confirmPreview: () => void
  cancelPreview: () => void
  resetTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  config: {
    colors: DEFAULT_COLORS,
    background: "gradient-dark",
    effects: {
      particles: true,
      orbs: true,
      grid: true,
      glass: true,
    },
    typography: {
      fontDisplay: "Playfair Display",
      fontBody: "Inter",
    },
  },
  isPreview: false,
  tempConfig: null,

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  setColors: (colors) =>
    set((state) => ({
      config: {
        ...state.config,
        colors: { ...state.config.colors, ...colors },
      },
    })),

  setBackground: (background) =>
    set((state) => ({
      config: { ...state.config, background },
    })),

  setEffects: (effects) =>
    set((state) => ({
      config: {
        ...state.config,
        effects: { ...state.config.effects, ...effects },
      },
    })),

  applyPreset: (presetIndex) => {
    const preset = PRESET_THEMES[presetIndex]
    if (preset) {
      set((state) => ({
        config: {
          ...state.config,
          colors: { ...state.config.colors, ...preset.colors },
        },
      }))
    }
  },

  startPreview: () =>
    set((state) => ({
      isPreview: true,
      tempConfig: { ...state.config },
    })),

  confirmPreview: () =>
    set(() => ({
      isPreview: false,
      tempConfig: null,
    })),

  cancelPreview: () =>
    set((state) => ({
      isPreview: false,
      config: state.tempConfig || state.config,
      tempConfig: null,
    })),

  resetTheme: () =>
    set({
      config: {
        colors: DEFAULT_COLORS,
        background: "gradient-dark",
        effects: {
          particles: true,
          orbs: true,
          grid: true,
          glass: true,
        },
        typography: {
          fontDisplay: "Playfair Display",
          fontBody: "Inter",
        },
      },
    }),
}))

export { PRESET_BACKGROUNDS, PRESET_THEMES, DEFAULT_COLORS }