"use client";

import { useEffect, useState } from "react";
import Aurora from "./Aurora";

export function GlobalAurora() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const getTheme = (): "light" | "dark" => {
      if (typeof document === "undefined") return "light";
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "dark" || current === "light") return current;
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const isLight = theme === "light";

  // Light mode: Vibrant Luxury Pastel Gradient (Rich Violet-Periwinkle #B8A1FF, Vibrant Rose Pink #F45B95, Warm Golden Peach #FBBF24)
  // Dark mode: Deep Glowing Emerald, Gold & Sapphire (#20503B, #E2C26E, #2563EB)
  const colorStops = isLight
    ? ["#B8A1FF", "#F45B95", "#FBBF24"]
    : ["#20503B", "#E2C26E", "#2563EB"];

  return (
    <div className={`global-aurora-bg ${isLight ? "light-mode" : "dark-mode"}`} aria-hidden="true">
      <Aurora
        colorStops={colorStops}
        blend={isLight ? 0.7 : 0.6}
        amplitude={isLight ? 1.45 : 1.3}
        speed={0.45}
        lightMode={isLight}
      />
    </div>
  );
}
