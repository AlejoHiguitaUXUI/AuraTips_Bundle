"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import {
  ThemeConfig,
  ThemeMode,
  DEFAULT_DARK_CONFIG,
  DEFAULT_LIGHT_CONFIG,
  DARK_THEME_PRESETS,
  LIGHT_THEME_PRESETS,
  STORAGE_KEY_DARK,
  STORAGE_KEY_LIGHT,
  applyThemeConfig,
  resetThemeConfig,
} from "@/lib/theme-dev-store";

export function DarkBackgroundDevTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<"aurora" | "base" | "glass" | "presets">("aurora");
  const [darkConfig, setDarkConfig] = useState<ThemeConfig>(DEFAULT_DARK_CONFIG);
  const [lightConfig, setLightConfig] = useState<ThemeConfig>(DEFAULT_LIGHT_CONFIG);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form IDs for accessibility
  const stop1Id = useId();
  const stop2Id = useId();
  const stop3Id = useId();
  const opacityId = useId();
  const amplitudeId = useId();
  const blendId = useId();
  const speedId = useId();
  const colorBaseId = useId();
  const colorBase2Id = useId();
  const colorSurfaceId = useId();
  const colorSurface2Id = useId();
  const glassColorId = useId();
  const glassAlphaId = useId();
  const glassBlurId = useId();
  const glassSatId = useId();
  const glassBorderColorId = useId();
  const glassBorderAlphaId = useId();

  // Active configuration based on mode
  const activeConfig = currentMode === "dark" ? darkConfig : lightConfig;

  // Refs so the MutationObserver always sees the latest values (avoids stale closures)
  const darkConfigRef = useRef(darkConfig);
  const lightConfigRef = useRef(lightConfig);
  const currentModeRef = useRef(currentMode);
  darkConfigRef.current = darkConfig;
  lightConfigRef.current = lightConfig;
  currentModeRef.current = currentMode;

  // Debounced persistence: slider drags fire dozens of events per second
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistConfig = (mode: ThemeMode, config: ThemeConfig) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(mode === "dark" ? STORAGE_KEY_DARK : STORAGE_KEY_LIGHT, JSON.stringify(config));
      } catch {}
    }, 250);
  };

  useEffect(() => {
    setMounted(true);

    // Initial theme detection
    const getInitialTheme = (): ThemeMode => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "dark" || current === "light") return current;
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const initialTheme = getInitialTheme();
    setCurrentMode(initialTheme);
    currentModeRef.current = initialTheme;

    // Load saved configurations
    let initialDark = DEFAULT_DARK_CONFIG;
    let initialLight = DEFAULT_LIGHT_CONFIG;

    try {
      const savedDark = localStorage.getItem(STORAGE_KEY_DARK);
      if (savedDark) {
        initialDark = JSON.parse(savedDark);
        setDarkConfig(initialDark);
      }
      const savedLight = localStorage.getItem(STORAGE_KEY_LIGHT);
      if (savedLight) {
        initialLight = JSON.parse(savedLight);
        setLightConfig(initialLight);
      }
    } catch {
      // Ignore
    }
    darkConfigRef.current = initialDark;
    lightConfigRef.current = initialLight;

    // Apply active theme config cleanly
    applyThemeConfig(initialTheme, initialTheme === "dark" ? initialDark : initialLight);

    // Watch for theme changes from external controls (like ThemeToggle in header).
    // Only react to a *real* mode change, otherwise applyThemeConfig -> mutation -> applyThemeConfig loops.
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme") as ThemeMode;
      if ((current === "dark" || current === "light") && current !== currentModeRef.current) {
        currentModeRef.current = current;
        setCurrentMode(current);
        applyThemeConfig(current, current === "dark" ? darkConfigRef.current : lightConfigRef.current);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, []);

  const handleModeSwitch = (newMode: ThemeMode) => {
    currentModeRef.current = newMode;
    setCurrentMode(newMode);
    const configToApply = newMode === "dark" ? darkConfig : lightConfig;
    applyThemeConfig(newMode, configToApply);
  };

  const updateActiveConfig = (updater: Partial<ThemeConfig>) => {
    const nextConfig = { ...activeConfig, ...updater };
    if (currentMode === "dark") {
      setDarkConfig(nextConfig);
    } else {
      setLightConfig(nextConfig);
    }
    persistConfig(currentMode, nextConfig);
    applyThemeConfig(currentMode, nextConfig);
  };

  const handlePresetSelect = (presetConfig: ThemeConfig) => {
    if (currentMode === "dark") {
      setDarkConfig(presetConfig);
      try {
        localStorage.setItem(STORAGE_KEY_DARK, JSON.stringify(presetConfig));
      } catch {}
    } else {
      setLightConfig(presetConfig);
      try {
        localStorage.setItem(STORAGE_KEY_LIGHT, JSON.stringify(presetConfig));
      } catch {}
    }
    applyThemeConfig(currentMode, presetConfig);
  };

  const handleReset = () => {
    if (currentMode === "dark") {
      setDarkConfig(DEFAULT_DARK_CONFIG);
      resetThemeConfig("dark");
      applyThemeConfig("dark", DEFAULT_DARK_CONFIG);
    } else {
      setLightConfig(DEFAULT_LIGHT_CONFIG);
      resetThemeConfig("light");
      applyThemeConfig("light", DEFAULT_LIGHT_CONFIG);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const getCssSnippet = () => {
    const selector = currentMode === "dark" ? '[data-theme="dark"]' : ':root, [data-theme="light"]';
    const opacityVar = currentMode === "dark" ? "--aurora-opacity-dark" : "--aurora-opacity-light";
    return `/* Background Custom Tokens (${currentMode.toUpperCase()} MODE) */
${selector} {
  --color-base:          ${activeConfig.colorBase};
  --color-base-2:        ${activeConfig.colorBase2};
  --color-surface:       ${activeConfig.colorSurface};
  --color-surface-2:     ${activeConfig.colorSurface2};
  ${opacityVar}: ${activeConfig.auroraOpacity};

  /* Glassmorphism Tarjetas */
  --card-glass-bg:       ${getCardBgRgba()};
  --card-glass-blur:     ${activeConfig.cardGlassBlur}px;
  --card-glass-saturate: ${activeConfig.cardGlassSaturate}%;
  --card-glass-border:   ${getCardBorderRgba()};
}`;
  };

  const getAuroraTsSnippet = () => {
    return `// Aurora WebGL Color Stops (${currentMode.toUpperCase()} MODE)
const ${currentMode}ColorStops = ["${activeConfig.auroraStop1}", "${activeConfig.auroraStop2}", "${activeConfig.auroraStop3}"];
const ${currentMode}Blend = ${activeConfig.auroraBlend};
const ${currentMode}Amplitude = ${activeConfig.auroraAmplitude};
const ${currentMode}Speed = ${activeConfig.auroraSpeed};`;
  };

  const getCardBgRgba = () => {
    const hex = activeConfig.cardGlassBgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${activeConfig.cardGlassBgAlpha.toFixed(2)})`;
  };

  const getCardBorderRgba = () => {
    const hex = activeConfig.cardGlassBorderColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${activeConfig.cardGlassBorderAlpha.toFixed(2)})`;
  };

  if (!mounted) return null;

  const presets = currentMode === "dark" ? DARK_THEME_PRESETS : LIGHT_THEME_PRESETS;

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir DevTool de Fondos"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9995,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            borderRadius: "9999px",
            background: currentMode === "dark" ? "rgba(18, 27, 23, 0.92)" : "rgba(255, 255, 255, 0.92)",
            color: currentMode === "dark" ? "#FAF8F5" : "#161B18",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: currentMode === "dark" ? "1px solid rgba(226, 194, 110, 0.45)" : "1px solid rgba(194, 155, 56, 0.45)",
            boxShadow:
              currentMode === "dark"
                ? "0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 0 16px rgba(226, 194, 110, 0.2)"
                : "0 12px 30px -4px rgba(32, 80, 59, 0.15), 0 0 16px rgba(194, 155, 56, 0.2)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${activeConfig.auroraStop1} 0%, ${activeConfig.auroraStop2} 50%, ${activeConfig.auroraStop3} 100%)`,
              boxShadow: `0 0 8px ${activeConfig.auroraStop2}`,
            }}
          />
          <span>🎨 DevTool Fondos ({currentMode === "dark" ? "Dark 🌙" : "Light ☀️"})</span>
        </button>
      )}

      {/* DevTool Floating Panel */}
      {isOpen && (
        <aside
          role="region"
          aria-label="Panel DevTool de Fondos"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "410px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "88vh",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            background: currentMode === "dark" ? "rgba(14, 21, 18, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: currentMode === "dark" ? "1px solid rgba(226, 194, 110, 0.35)" : "1px solid rgba(194, 155, 56, 0.35)",
            boxShadow:
              currentMode === "dark"
                ? "0 24px 50px -10px rgba(0, 0, 0, 0.75), 0 0 30px rgba(68, 182, 133, 0.15)"
                : "0 24px 50px -10px rgba(32, 80, 59, 0.18), 0 0 30px rgba(194, 155, 56, 0.2)",
            color: currentMode === "dark" ? "#FAF8F5" : "#161B18",
            fontFamily: "var(--font-sans)",
            overflow: "hidden",
            animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: currentMode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, ${activeConfig.auroraStop1} 0%, ${activeConfig.auroraStop2} 50%, ${activeConfig.auroraStop3} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  boxShadow: "0 0 10px rgba(226, 194, 110, 0.3)",
                }}
              >
                🎨
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.01em",
                    color: currentMode === "dark" ? "#FFFFFF" : "#161B18",
                  }}
                >
                  Background DevTool
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    color: currentMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  WebGL Aurora + Glass Tokens
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Theme Mode Segmented Toggle */}
              <div
                style={{
                  display: "flex",
                  background: currentMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                  borderRadius: "8px",
                  padding: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleModeSwitch("light")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: currentMode === "light" ? "#FAF8F5" : "transparent",
                    color: currentMode === "light" ? "#161B18" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: currentMode === "light" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                  title="Cambiar a Modo Claro"
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("dark")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: currentMode === "dark" ? "#20503B" : "transparent",
                    color: currentMode === "dark" ? "#FFFFFF" : "rgba(0, 0, 0, 0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: currentMode === "dark" ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
                  }}
                  title="Cambiar a Modo Oscuro"
                >
                  🌙 Dark
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar DevTool"
                style={{
                  background: currentMode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                  border: "none",
                  borderRadius: "8px",
                  color: currentMode === "dark" ? "#FAF8F5" : "#161B18",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "4px",
              padding: "10px 16px",
              borderBottom: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            {[
              { id: "aurora", label: "✨ Aurora", title: "Shader WebGL" },
              { id: "base", label: "🎨 Base", title: "Fondo Body" },
              { id: "glass", label: "🪟 Glass", title: "Tarjetas" },
              { id: "presets", label: "⚡ Presets", title: "Temas" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  title={tab.title}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "8px",
                    background: active
                      ? currentMode === "dark" ? "rgba(68, 182, 133, 0.22)" : "rgba(32, 80, 59, 0.12)"
                      : "transparent",
                    border: active
                      ? currentMode === "dark" ? "1px solid rgba(68, 182, 133, 0.5)" : "1px solid rgba(32, 80, 59, 0.3)"
                      : "1px solid transparent",
                    color: active
                      ? currentMode === "dark" ? "#6EE7B7" : "#20503B"
                      : currentMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Body Panels */}
          <div
            style={{
              padding: "16px 20px",
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* TAB 1: AURORA WEBGL GRADIENT */}
            {activeTab === "aurora" && (
              <>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#E2C26E" : "#997316" }}>
                      Color Stops ({currentMode === "dark" ? "Modo Oscuro" : "Modo Claro"})
                    </span>
                    <span style={{ fontSize: "11px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}>
                      Izquierda → Centro → Derecha
                    </span>
                  </div>

                  {/* Gradient Ribbon Preview */}
                  <div
                    style={{
                      height: "22px",
                      borderRadius: "8px",
                      background: `linear-gradient(90deg, ${activeConfig.auroraStop1} 0%, ${activeConfig.auroraStop2} 50%, ${activeConfig.auroraStop3} 100%)`,
                      border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.15)",
                      marginBottom: "14px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  />

                  {/* 3 Color Pickers */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Stop 1 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <label htmlFor={stop1Id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: activeConfig.auroraStop1,
                            border: "1px solid #fff",
                          }}
                        />
                        <span style={{ fontSize: "12px" }}>Stop 1 (Izquierda / Base)</span>
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={stop1Id}
                          type="color"
                          value={activeConfig.auroraStop1}
                          onChange={(e) => updateActiveConfig({ auroraStop1: e.target.value })}
                          style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.auroraStop1}
                          onChange={(e) => updateActiveConfig({ auroraStop1: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* Stop 2 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <label htmlFor={stop2Id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: activeConfig.auroraStop2,
                            border: "1px solid #fff",
                          }}
                        />
                        <span style={{ fontSize: "12px" }}>Stop 2 (Centro / Corona)</span>
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={stop2Id}
                          type="color"
                          value={activeConfig.auroraStop2}
                          onChange={(e) => updateActiveConfig({ auroraStop2: e.target.value })}
                          style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.auroraStop2}
                          onChange={(e) => updateActiveConfig({ auroraStop2: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* Stop 3 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <label htmlFor={stop3Id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: activeConfig.auroraStop3,
                            border: "1px solid #fff",
                          }}
                        />
                        <span style={{ fontSize: "12px" }}>Stop 3 (Derecha / Acento)</span>
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={stop3Id}
                          type="color"
                          value={activeConfig.auroraStop3}
                          onChange={(e) => updateActiveConfig({ auroraStop3: e.target.value })}
                          style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.auroraStop3}
                          onChange={(e) => updateActiveConfig({ auroraStop3: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shader Sliders */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#E2C26E" : "#997316" }}>
                    Dinámica del Shader WebGL
                  </span>

                  {/* Opacity */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label htmlFor={opacityId} style={{ fontSize: "12px", cursor: "pointer" }}>
                        Opacidad Canvas ({currentMode === "dark" ? "--aurora-opacity-dark" : "--aurora-opacity-light"})
                      </label>
                      <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                        {Math.round(activeConfig.auroraOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      id={opacityId}
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.02"
                      value={activeConfig.auroraOpacity}
                      onChange={(e) => updateActiveConfig({ auroraOpacity: parseFloat(e.target.value) })}
                      style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                    />
                  </div>

                  {/* Amplitude */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label htmlFor={amplitudeId} style={{ fontSize: "12px", cursor: "pointer" }}>Amplitud de Olas (Altura)</label>
                      <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                        {activeConfig.auroraAmplitude.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      id={amplitudeId}
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.05"
                      value={activeConfig.auroraAmplitude}
                      onChange={(e) => updateActiveConfig({ auroraAmplitude: parseFloat(e.target.value) })}
                      style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                    />
                  </div>

                  {/* Blend */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label htmlFor={blendId} style={{ fontSize: "12px", cursor: "pointer" }}>Difuminado / Blend</label>
                      <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                        {activeConfig.auroraBlend.toFixed(2)}
                      </span>
                    </div>
                    <input
                      id={blendId}
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={activeConfig.auroraBlend}
                      onChange={(e) => updateActiveConfig({ auroraBlend: parseFloat(e.target.value) })}
                      style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label htmlFor={speedId} style={{ fontSize: "12px", cursor: "pointer" }}>Velocidad de Flujo</label>
                      <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                        {activeConfig.auroraSpeed.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      id={speedId}
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={activeConfig.auroraSpeed}
                      onChange={(e) => updateActiveConfig({ auroraSpeed: parseFloat(e.target.value) })}
                      style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: BASE CSS TOKENS */}
            {activeTab === "base" && (
              <>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#E2C26E" : "#997316", display: "block", marginBottom: "6px" }}>
                    Fondo Base & Superficies ({currentMode.toUpperCase()})
                  </span>
                  <p style={{ fontSize: "11px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", marginBottom: "14px", lineHeight: 1.4 }}>
                    Define la base del body/html que se visualiza detrás del aurora y en los contenedores.
                  </p>

                  {/* Visual Surface Swatches */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "14px" }}>
                    {[
                      { name: "Base", color: activeConfig.colorBase },
                      { name: "Base-2", color: activeConfig.colorBase2 },
                      { name: "Surface", color: activeConfig.colorSurface },
                      { name: "Surface-2", color: activeConfig.colorSurface2 },
                    ].map((s) => (
                      <div
                        key={s.name}
                        style={{
                          background: s.color,
                          borderRadius: "8px",
                          padding: "10px 4px",
                          textAlign: "center",
                          border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                          color: currentMode === "dark" ? "#fff" : "#161B18",
                        }}
                      >
                        <span style={{ fontSize: "10px", fontWeight: 700, display: "block" }}>{s.name}</span>
                        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", opacity: 0.8 }}>
                          {s.color}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* --color-base */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div>
                        <label htmlFor={colorBaseId} style={{ fontSize: "12px", fontWeight: 600, display: "block", cursor: "pointer" }}>
                          --color-base
                        </label>
                        <span style={{ fontSize: "10px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}>
                          Fondo general del Body / HTML
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={colorBaseId}
                          type="color"
                          value={activeConfig.colorBase}
                          onChange={(e) => updateActiveConfig({ colorBase: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.colorBase}
                          onChange={(e) => updateActiveConfig({ colorBase: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* --color-base-2 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div>
                        <label htmlFor={colorBase2Id} style={{ fontSize: "12px", fontWeight: 600, display: "block", cursor: "pointer" }}>
                          --color-base-2
                        </label>
                        <span style={{ fontSize: "10px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}>
                          Fondo secundario sutil
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={colorBase2Id}
                          type="color"
                          value={activeConfig.colorBase2}
                          onChange={(e) => updateActiveConfig({ colorBase2: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.colorBase2}
                          onChange={(e) => updateActiveConfig({ colorBase2: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* --color-surface */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div>
                        <label htmlFor={colorSurfaceId} style={{ fontSize: "12px", fontWeight: 600, display: "block", cursor: "pointer" }}>
                          --color-surface
                        </label>
                        <span style={{ fontSize: "10px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}>
                          Superficie de píldoras y tarjetas sólidas
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={colorSurfaceId}
                          type="color"
                          value={activeConfig.colorSurface}
                          onChange={(e) => updateActiveConfig({ colorSurface: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.colorSurface}
                          onChange={(e) => updateActiveConfig({ colorSurface: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* --color-surface-2 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div>
                        <label htmlFor={colorSurface2Id} style={{ fontSize: "12px", fontWeight: 600, display: "block", cursor: "pointer" }}>
                          --color-surface-2
                        </label>
                        <span style={{ fontSize: "10px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}>
                          Superficie elevada / hover
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={colorSurface2Id}
                          type="color"
                          value={activeConfig.colorSurface2}
                          onChange={(e) => updateActiveConfig({ colorSurface2: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.colorSurface2}
                          onChange={(e) => updateActiveConfig({ colorSurface2: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: CARD GLASSMORPHISM */}
            {activeTab === "glass" && (
              <>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#E2C26E" : "#997316", display: "block", marginBottom: "6px" }}>
                    Efecto Cristal de Tarjetas (--card-glass-*)
                  </span>
                  <p style={{ fontSize: "11px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", marginBottom: "14px", lineHeight: 1.4 }}>
                    Controla el vidrio translúcido de las tarjetas clínicas flotantes.
                  </p>

                  {/* Glass Card Miniature Preview */}
                  <div
                    style={{
                      background: getCardBgRgba(),
                      backdropFilter: `blur(${activeConfig.cardGlassBlur}px) saturate(${activeConfig.cardGlassSaturate}%)`,
                      WebkitBackdropFilter: `blur(${activeConfig.cardGlassBlur}px) saturate(${activeConfig.cardGlassSaturate}%)`,
                      border: `1px solid ${getCardBorderRgba()}`,
                      borderRadius: "14px",
                      padding: "12px 16px",
                      marginBottom: "16px",
                      boxShadow: currentMode === "dark" ? "0 10px 20px -2px rgba(0, 0, 0, 0.4)" : "0 8px 16px -2px rgba(32, 80, 59, 0.08)",
                      color: currentMode === "dark" ? "#fff" : "#161B18",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700 }}>
                        Vista Previa Clínico-Glass
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          background: currentMode === "dark" ? "rgba(68, 182, 133, 0.2)" : "rgba(32, 80, 59, 0.12)",
                          color: currentMode === "dark" ? "#6EE7B7" : "#20503B",
                          fontWeight: 700,
                        }}
                      >
                        Activo
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px", display: "block" }}>
                      Toxina Botulínica · Dra. Mariana Gómez
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Glass Tint Color */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <label htmlFor={glassColorId} style={{ fontSize: "12px", cursor: "pointer" }}>Tinte Base del Cristal</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={glassColorId}
                          type="color"
                          value={activeConfig.cardGlassBgColor}
                          onChange={(e) => updateActiveConfig({ cardGlassBgColor: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.cardGlassBgColor}
                          onChange={(e) => updateActiveConfig({ cardGlassBgColor: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* Glass Opacity */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <label htmlFor={glassAlphaId} style={{ fontSize: "12px", cursor: "pointer" }}>Opacidad del Fondo de Tarjeta</label>
                        <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                          {Math.round(activeConfig.cardGlassBgAlpha * 100)}%
                        </span>
                      </div>
                      <input
                        id={glassAlphaId}
                        type="range"
                        min="0.05"
                        max="0.85"
                        step="0.02"
                        value={activeConfig.cardGlassBgAlpha}
                        onChange={(e) => updateActiveConfig({ cardGlassBgAlpha: parseFloat(e.target.value) })}
                        style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                      />
                    </div>

                    {/* Glass Blur */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <label htmlFor={glassBlurId} style={{ fontSize: "12px", cursor: "pointer" }}>Desenfoque (Blur px)</label>
                        <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                          {activeConfig.cardGlassBlur}px
                        </span>
                      </div>
                      <input
                        id={glassBlurId}
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={activeConfig.cardGlassBlur}
                        onChange={(e) => updateActiveConfig({ cardGlassBlur: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                      />
                    </div>

                    {/* Glass Saturate */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <label htmlFor={glassSatId} style={{ fontSize: "12px", cursor: "pointer" }}>Saturación de Fondo</label>
                        <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                          {activeConfig.cardGlassSaturate}%
                        </span>
                      </div>
                      <input
                        id={glassSatId}
                        type="range"
                        min="100"
                        max="280"
                        step="5"
                        value={activeConfig.cardGlassSaturate}
                        onChange={(e) => updateActiveConfig({ cardGlassSaturate: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                      />
                    </div>

                    {/* Glass Border */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <label htmlFor={glassBorderColorId} style={{ fontSize: "12px", cursor: "pointer" }}>Color del Borde Fino</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          id={glassBorderColorId}
                          type="color"
                          value={activeConfig.cardGlassBorderColor}
                          onChange={(e) => updateActiveConfig({ cardGlassBorderColor: e.target.value })}
                          style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          type="text"
                          value={activeConfig.cardGlassBorderColor}
                          onChange={(e) => updateActiveConfig({ cardGlassBorderColor: e.target.value })}
                          style={{
                            width: "74px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            background: currentMode === "dark" ? "rgba(0, 0, 0, 0.4)" : "#fff",
                            border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.15)",
                            borderRadius: "4px",
                            color: currentMode === "dark" ? "#fff" : "#161B18",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>

                    {/* Border Opacity */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <label htmlFor={glassBorderAlphaId} style={{ fontSize: "12px", cursor: "pointer" }}>Opacidad del Borde</label>
                        <span style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#20503B", fontFamily: "var(--font-mono)" }}>
                          {Math.round(activeConfig.cardGlassBorderAlpha * 100)}%
                        </span>
                      </div>
                      <input
                        id={glassBorderAlphaId}
                        type="range"
                        min="0.0"
                        max="0.5"
                        step="0.02"
                        value={activeConfig.cardGlassBorderAlpha}
                        onChange={(e) => updateActiveConfig({ cardGlassBorderAlpha: parseFloat(e.target.value) })}
                        style={{ width: "100%", accentColor: "#20503B", cursor: "pointer" }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: PRESETS */}
            {activeTab === "presets" && (
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#E2C26E" : "#997316", display: "block", marginBottom: "6px" }}>
                  Paletas Seleccionadas ({currentMode.toUpperCase()})
                </span>
                <p style={{ fontSize: "11px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", marginBottom: "14px", lineHeight: 1.4 }}>
                  Aplica presets completos de 1-clic diseñados para este modo.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.config)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: currentMode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
                        border: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(194, 155, 56, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = currentMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: currentMode === "dark" ? "#fff" : "#161B18" }}>
                          {preset.name}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "rgba(194, 155, 56, 0.18)",
                            color: currentMode === "dark" ? "#E2C26E" : "#997316",
                            fontWeight: 700,
                          }}
                        >
                          {preset.badge}
                        </span>
                      </div>

                      <p style={{ fontSize: "11px", color: currentMode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", margin: "0 0 10px 0" }}>
                        {preset.description}
                      </p>

                      {/* Swatches Bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                          style={{
                            height: "14px",
                            flex: 1,
                            borderRadius: "4px",
                            background: `linear-gradient(90deg, ${preset.config.auroraStop1} 0%, ${preset.config.auroraStop2} 50%, ${preset.config.auroraStop3} 100%)`,
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <div
                          style={{
                            width: "18px",
                            height: "14px",
                            borderRadius: "4px",
                            background: preset.config.colorBase,
                            border: "1px solid rgba(0, 0, 0, 0.15)",
                          }}
                          title={`Base: ${preset.config.colorBase}`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div
            style={{
              padding: "14px 18px",
              borderTop: currentMode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              background: currentMode === "dark" ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {copiedStatus && (
              <div style={{ fontSize: "11px", color: currentMode === "dark" ? "#6EE7B7" : "#1B7F53", textAlign: "center", fontWeight: 700 }}>
                ✓ {copiedStatus}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={() => copyToClipboard(getCssSnippet(), "Variables CSS copiadas al portapapeles")}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: currentMode === "dark" ? "rgba(226, 194, 110, 0.18)" : "rgba(194, 155, 56, 0.15)",
                  border: "1px solid rgba(194, 155, 56, 0.4)",
                  color: currentMode === "dark" ? "#E2C26E" : "#997316",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📋 Copiar CSS
              </button>

              <button
                onClick={() => copyToClipboard(getAuroraTsSnippet(), "Configuración TS copiada al portapapeles")}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: currentMode === "dark" ? "rgba(68, 182, 133, 0.18)" : "rgba(32, 80, 59, 0.15)",
                  border: "1px solid rgba(32, 80, 59, 0.4)",
                  color: currentMode === "dark" ? "#6EE7B7" : "#20503B",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📋 Copiar TS
              </button>
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                background: "transparent",
                border: "none",
                color: currentMode === "dark" ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",
                fontSize: "11px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              ↺ Restablecer valores de fábrica ({currentMode})
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
