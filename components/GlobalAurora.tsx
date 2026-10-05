"use client";

import { useEffect, useState } from "react";
import Aurora from "./Aurora";
import {
  DEFAULT_DARK_CONFIG,
  DEFAULT_LIGHT_CONFIG,
  STORAGE_KEY_DARK,
  STORAGE_KEY_LIGHT,
  ThemeConfig,
  ThemeMode,
} from "@/lib/theme-dev-store";

export function GlobalAurora() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [darkConfig, setDarkConfig] = useState<ThemeConfig>(DEFAULT_DARK_CONFIG);
  const [lightConfig, setLightConfig] = useState<ThemeConfig>(DEFAULT_LIGHT_CONFIG);

  useEffect(() => {
    const getTheme = (): ThemeMode => {
      if (typeof document === "undefined") return "light";
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "dark" || current === "light") return current;
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    setTheme(getTheme());

    // Load initial custom configs if stored
    try {
      const savedDark = localStorage.getItem(STORAGE_KEY_DARK);
      if (savedDark) {
        setDarkConfig(JSON.parse(savedDark));
      }
      const savedLight = localStorage.getItem(STORAGE_KEY_LIGHT);
      if (savedLight) {
        setLightConfig(JSON.parse(savedLight));
      }
    } catch {
      // Ignore parsing errors
    }

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Listen for live config updates from DevTool
    const handleConfigUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ mode: ThemeMode; config: ThemeConfig } | ThemeConfig>).detail;
      if (!detail) return;
      if ("mode" in detail && "config" in detail) {
        if (detail.mode === "light") {
          setLightConfig(detail.config);
        } else {
          setDarkConfig(detail.config);
        }
      } else {
        // Fallback for direct ThemeConfig
        setDarkConfig(detail as ThemeConfig);
      }
    };

    window.addEventListener("aurora-config-update", handleConfigUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("aurora-config-update", handleConfigUpdate);
    };
  }, []);

  const isLight = theme === "light";
  const activeConfig = isLight ? lightConfig : darkConfig;

  const colorStops = [
    activeConfig.auroraStop1,
    activeConfig.auroraStop2,
    activeConfig.auroraStop3,
  ];

  return (
    <div className={`global-aurora-bg ${isLight ? "light-mode" : "dark-mode"}`} aria-hidden="true">
      <Aurora
        colorStops={colorStops}
        blend={activeConfig.auroraBlend}
        amplitude={activeConfig.auroraAmplitude}
        speed={activeConfig.auroraSpeed}
        lightMode={isLight}
      />
    </div>
  );
}
