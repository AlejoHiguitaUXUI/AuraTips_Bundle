export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  // Aurora WebGL Gradient
  auroraStop1: string;
  auroraStop2: string;
  auroraStop3: string;
  auroraOpacity: number; // 0.0 - 1.0
  auroraAmplitude: number; // 0.2 - 3.0
  auroraBlend: number; // 0.1 - 1.0
  auroraSpeed: number; // 0.0 - 2.0

  // CSS Base Background Tokens
  colorBase: string;
  colorBase2: string;
  colorSurface: string;
  colorSurface2: string;

  // Card Glassmorphism
  cardGlassBgColor: string;
  cardGlassBgAlpha: number; // 0.0 - 1.0
  cardGlassBlur: number; // px
  cardGlassSaturate: number; // %
  cardGlassBorderColor: string;
  cardGlassBorderAlpha: number; // 0.0 - 1.0
}

// User-chosen Dark Mode Configuration
export const DEFAULT_DARK_CONFIG: ThemeConfig = {
  auroraStop1: "#2b7857",
  auroraStop2: "#6e72e2",
  auroraStop3: "#5924eb",
  auroraOpacity: 0.95,
  auroraAmplitude: 0.8,
  auroraBlend: 0.6,
  auroraSpeed: 0.8,

  colorBase: "#0C120F",
  colorBase2: "#121B17",
  colorSurface: "#15201B",
  colorSurface2: "#1B2923",

  cardGlassBgColor: "#577063",
  cardGlassBgAlpha: 0.32,
  cardGlassBlur: 23,
  cardGlassSaturate: 190,
  cardGlassBorderColor: "#E2C26E",
  cardGlassBorderAlpha: 0.08,
};

// Luxury Clinical & Wellness Light Mode Configuration
export const DEFAULT_LIGHT_CONFIG: ThemeConfig = {
  // Soft Periwinkle Violet, Rose Petal Pink, Warm Golden Peach
  auroraStop1: "#B8A1FF",
  auroraStop2: "#F45B95",
  auroraStop3: "#FBBF24",
  auroraOpacity: 0.77,
  auroraAmplitude: 1.45,
  auroraBlend: 0.7,
  auroraSpeed: 0.45,

  colorBase: "#FAF8F5",
  colorBase2: "#F2EEE8",
  colorSurface: "#FFFFFF",
  colorSurface2: "#FAFAFA",

  cardGlassBgColor: "#FAF8F5",
  cardGlassBgAlpha: 0.42,
  cardGlassBlur: 17,
  cardGlassSaturate: 180,
  cardGlassBorderColor: "#C29B38",
  cardGlassBorderAlpha: 0.15,
};

export interface ThemePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  config: ThemeConfig;
}

export const DARK_THEME_PRESETS: ThemePreset[] = [
  {
    id: "dark-custom",
    name: "Aura Luxury (Personalizado)",
    badge: "Actual",
    description: "Esmeralda clínico, lavanda índigo y violeta vibrante",
    config: { ...DEFAULT_DARK_CONFIG },
  },
  {
    id: "pure-emerald",
    name: "Esmeralda Clínico Profundo",
    badge: "Wellness",
    description: "Tonos botánicos intensos y menta para calma médica",
    config: {
      ...DEFAULT_DARK_CONFIG,
      auroraStop1: "#0B3A26",
      auroraStop2: "#10B981",
      auroraStop3: "#059669",
      colorBase: "#07130D",
      colorBase2: "#0D1F16",
      colorSurface: "#10261C",
      colorSurface2: "#173627",
      cardGlassBgColor: "#1B4332",
      cardGlassBgAlpha: 0.36,
      cardGlassBorderColor: "#34D399",
      cardGlassBorderAlpha: 0.15,
    },
  },
  {
    id: "imperial-gold",
    name: "Obsidiana & Oro Imperial",
    badge: "Alta Gama",
    description: "Atmósfera cálida premium con destellos ambarinos",
    config: {
      ...DEFAULT_DARK_CONFIG,
      auroraStop1: "#2D1F03",
      auroraStop2: "#D4AF37",
      auroraStop3: "#F59E0B",
      colorBase: "#0E0C06",
      colorBase2: "#17140B",
      colorSurface: "#1F1A0E",
      colorSurface2: "#2C2515",
      cardGlassBgColor: "#382D16",
      cardGlassBgAlpha: 0.38,
      cardGlassBorderColor: "#FBBF24",
      cardGlassBorderAlpha: 0.20,
    },
  },
  {
    id: "midnight-cyber",
    name: "Midnight Zafiro & Cian",
    badge: "Tech Medical",
    description: "Profundidad oceánica con destellos cian de alta definición",
    config: {
      ...DEFAULT_DARK_CONFIG,
      auroraStop1: "#1E1B4B",
      auroraStop2: "#2563EB",
      auroraStop3: "#06B6D4",
      colorBase: "#080C16",
      colorBase2: "#0E1526",
      colorSurface: "#131C33",
      colorSurface2: "#1B284A",
      cardGlassBgColor: "#1B2A4A",
      cardGlassBgAlpha: 0.36,
      cardGlassBorderColor: "#38BDF8",
      cardGlassBorderAlpha: 0.16,
    },
  },
  {
    id: "orchid-spa",
    name: "Orquídea & Amatista Spa",
    badge: "Dermatología",
    description: "Magenta radiante y ciruela para rejuvenecimiento estético",
    config: {
      ...DEFAULT_DARK_CONFIG,
      auroraStop1: "#3B0764",
      auroraStop2: "#C084FC",
      auroraStop3: "#F43F5E",
      colorBase: "#110818",
      colorBase2: "#1B0E27",
      colorSurface: "#251436",
      colorSurface2: "#321C4A",
      cardGlassBgColor: "#3E1C54",
      cardGlassBgAlpha: 0.36,
      cardGlassBorderColor: "#E879F9",
      cardGlassBorderAlpha: 0.15,
    },
  },
  {
    id: "monochrome-minimal",
    name: "Obsidian Minimal",
    badge: "Editorial",
    description: "Negro absoluto y titanio sin tinte de color cromático",
    config: {
      ...DEFAULT_DARK_CONFIG,
      auroraStop1: "#18181B",
      auroraStop2: "#3F3F46",
      auroraStop3: "#71717A",
      colorBase: "#09090B",
      colorBase2: "#121215",
      colorSurface: "#18181B",
      colorSurface2: "#27272A",
      cardGlassBgColor: "#27272A",
      cardGlassBgAlpha: 0.40,
      cardGlassBorderColor: "#52525B",
      cardGlassBorderAlpha: 0.20,
    },
  },
];

export const LIGHT_THEME_PRESETS: ThemePreset[] = [
  {
    id: "light-original",
    name: "Aura Pastel Luxury (Original)",
    badge: "Actual",
    description: "Lavanda suave, rosa pétalo y ámbar dorado cálido",
    config: { ...DEFAULT_LIGHT_CONFIG },
  },
  {
    id: "light-mint",
    name: "Botánico Menta & Sage",
    badge: "Wellness",
    description: "Frescura botánica y calma regenerativa para estética clínica",
    config: {
      ...DEFAULT_LIGHT_CONFIG,
      auroraStop1: "#A7F3D0",
      auroraStop2: "#6EE7B7",
      auroraStop3: "#FDE68A",
      colorBase: "#F5F9F6",
      colorBase2: "#EAF2ED",
      colorSurface: "#FFFFFF",
      colorSurface2: "#F2F7F4",
      cardGlassBgColor: "#F5F9F6",
      cardGlassBgAlpha: 0.45,
      cardGlassBorderColor: "#20503B",
      cardGlassBorderAlpha: 0.12,
    },
  },
  {
    id: "light-gold",
    name: "Champán Dorado & Marfil",
    badge: "Alta Gama",
    description: "Cálido resplandor de alta costura con marfil suave",
    config: {
      ...DEFAULT_LIGHT_CONFIG,
      auroraStop1: "#FEF3C7",
      auroraStop2: "#FDE68A",
      auroraStop3: "#FBBF24",
      colorBase: "#FAF7F0",
      colorBase2: "#F5EFE3",
      colorSurface: "#FFFFFF",
      colorSurface2: "#F9F5EC",
      cardGlassBgColor: "#FAF7F0",
      cardGlassBgAlpha: 0.45,
      cardGlassBorderColor: "#C29B38",
      cardGlassBorderAlpha: 0.20,
    },
  },
  {
    id: "light-sky",
    name: "Brisa Marina & Cielo Clínico",
    badge: "Dermatología",
    description: "Azul cielo luminoso y lavanda para una atmósfera relajante",
    config: {
      ...DEFAULT_LIGHT_CONFIG,
      auroraStop1: "#BAE6FD",
      auroraStop2: "#7DD3FC",
      auroraStop3: "#DDD6FE",
      colorBase: "#F4F8FA",
      colorBase2: "#E8F1F5",
      colorSurface: "#FFFFFF",
      colorSurface2: "#EDF4F8",
      cardGlassBgColor: "#F4F8FA",
      cardGlassBgAlpha: 0.45,
      cardGlassBorderColor: "#0284C7",
      cardGlassBorderAlpha: 0.12,
    },
  },
  {
    id: "light-minimal",
    name: "Blanco Clínico Minimal",
    badge: "Editorial",
    description: "Tonos neutros sutiles sin saturación cromática",
    config: {
      ...DEFAULT_LIGHT_CONFIG,
      auroraStop1: "#E2E8F0",
      auroraStop2: "#CBD5E1",
      auroraStop3: "#E5E7EB",
      colorBase: "#F8FAFC",
      colorBase2: "#F1F5F9",
      colorSurface: "#FFFFFF",
      colorSurface2: "#F8FAFC",
      cardGlassBgColor: "#FFFFFF",
      cardGlassBgAlpha: 0.50,
      cardGlassBorderColor: "#94A3B8",
      cardGlassBorderAlpha: 0.15,
    },
  },
];

export const STORAGE_KEY_DARK = "aurora_dark_devtool_config";
export const STORAGE_KEY_LIGHT = "aurora_light_devtool_config";
export const STORAGE_KEY = STORAGE_KEY_DARK; // Backward-compatibility

export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

export function applyThemeConfig(mode: ThemeMode, config: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Ensure HTML data-theme attribute matches.
  // Only write when it actually changes: setAttribute always fires MutationObservers,
  // even with an identical value, which previously caused an infinite feedback loop.
  if (root.getAttribute("data-theme") !== mode) {
    root.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("theme", mode);
    } catch {
      // Ignore storage errors
    }
  }

  // CSS Base Background Tokens
  root.style.setProperty("--color-base", config.colorBase);
  root.style.setProperty("--color-base-2", config.colorBase2);
  root.style.setProperty("--color-surface", config.colorSurface);
  root.style.setProperty("--color-surface-2", config.colorSurface2);

  // Aurora Opacity Token according to active mode
  if (mode === "dark") {
    root.style.setProperty("--aurora-opacity-dark", config.auroraOpacity.toString());
    root.style.removeProperty("--aurora-opacity-light");
  } else {
    root.style.setProperty("--aurora-opacity-light", config.auroraOpacity.toString());
    root.style.removeProperty("--aurora-opacity-dark");
  }

  // Card Glassmorphism Tokens
  const cardBg = hexToRgba(config.cardGlassBgColor, config.cardGlassBgAlpha);
  const cardBorder = hexToRgba(config.cardGlassBorderColor, config.cardGlassBorderAlpha);
  root.style.setProperty("--card-glass-bg", cardBg);
  root.style.setProperty("--card-glass-blur", `${config.cardGlassBlur}px`);
  root.style.setProperty("--card-glass-saturate", `${config.cardGlassSaturate}%`);
  root.style.setProperty("--card-glass-border", cardBorder);

  // Notify WebGL Aurora with active mode and config
  window.dispatchEvent(
    new CustomEvent("aurora-config-update", {
      detail: { mode, config },
    })
  );
}

// Backward compatible alias
export function applyDarkThemeConfig(config: ThemeConfig) {
  applyThemeConfig("dark", config);
}

export function resetThemeConfig(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.removeProperty("--color-base");
  root.style.removeProperty("--color-base-2");
  root.style.removeProperty("--color-surface");
  root.style.removeProperty("--color-surface-2");
  root.style.removeProperty("--aurora-opacity-dark");
  root.style.removeProperty("--aurora-opacity-light");
  root.style.removeProperty("--card-glass-bg");
  root.style.removeProperty("--card-glass-blur");
  root.style.removeProperty("--card-glass-saturate");
  root.style.removeProperty("--card-glass-border");

  try {
    localStorage.removeItem(mode === "dark" ? STORAGE_KEY_DARK : STORAGE_KEY_LIGHT);
  } catch {
    // Ignore storage errors
  }

  const defaultConfig = mode === "dark" ? DEFAULT_DARK_CONFIG : DEFAULT_LIGHT_CONFIG;
  window.dispatchEvent(
    new CustomEvent("aurora-config-update", {
      detail: { mode, config: defaultConfig },
    })
  );
}

// Backward compatible alias
export function resetDarkThemeConfig() {
  resetThemeConfig("dark");
}
