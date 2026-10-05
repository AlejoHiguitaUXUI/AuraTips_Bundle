"use client";

import React, { useEffect, useState } from "react";

export function ScrollEnhancements() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 380);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Botón Cápsula Flotante 'Volver Arriba' (Luxury Glass) */}
      <button
        onClick={scrollToTop}
        aria-label="Volver al inicio de la página"
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9990,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "9999px",
          background: "rgba(15, 25, 20, 0.85)",
          color: "#FAF8F5",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          border: "1.5px solid rgba(194, 155, 56, 0.65)",
          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.35), 0 0 14px rgba(194, 155, 56, 0.25)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          cursor: "pointer",
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.92)",
          pointerEvents: showBackToTop ? "auto" : "none",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.04)";
          e.currentTarget.style.borderColor = "#E2C26E";
          e.currentTarget.style.boxShadow =
            "0 12px 28px rgba(0, 0, 0, 0.45), 0 0 20px rgba(226, 194, 110, 0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(194, 155, 56, 0.65)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0, 0, 0, 0.35), 0 0 14px rgba(194, 155, 56, 0.25)";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "rgba(194, 155, 56, 0.25)",
            color: "#E2C26E",
            fontSize: "13px",
            lineHeight: 1,
          }}
        >
          ↑
        </span>
        <span>Arriba</span>
      </button>
    </>
  );
}
