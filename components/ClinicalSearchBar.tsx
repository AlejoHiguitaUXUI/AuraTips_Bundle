"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { SearchIcon, XIcon, ClockIcon } from "@/components/icons";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category?: string;
  recovery_time?: string;
  pain_level?: number;
  description?: string;
}

export function ClinicalSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/courses/search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        // Ignored
      }
    });
  };

  const handleQuickTag = (tag: string) => {
    handleSearch(tag);
  };

  return (
    <div className="clinical-search-wrapper" ref={wrapperRef}>
      <div className="clinical-search-bar">
        <span style={{ display: "inline-flex", alignItems: "center", marginRight: "10px", color: "var(--color-brand)" }} aria-hidden="true">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          className="clinical-search-input"
          placeholder="Busca tu procedimiento, síntoma o duda (ej. botox, labios, hematomas, ejercicio)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          aria-label="Buscar procedimientos y pautas de cuidado"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="Limpiar búsqueda"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted)",
              marginRight: "8px",
              display: "inline-flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <XIcon size={14} />
          </button>
        )}
        <button type="button" className="clinical-search-btn">
          {isPending ? "Consultando..." : "Asistente Clínico"}
        </button>
      </div>

      {/* Sugerencias Rápidas */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "10px",
          fontSize: "12px",
          color: "var(--color-muted)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span>Consultas frecuentes:</span>
        {["Botox", "Labios hinchados", "Gafas tras rinomodelación", "Piel descamada", "Hematomas"].map(
          (tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTag(tag)}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: "pointer",
                color: "var(--color-text)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all var(--dur-fast) ease",
              }}
            >
              {tag}
            </button>
          )
        )}
      </div>

      {/* Panel Flotante de Resultados RAG */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-xl)",
            zIndex: 50,
            padding: "16px",
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brand)",
              }}
            >
              Resultados Clínicos Sugeridos ({results.length})
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "var(--color-muted)",
              }}
            >
              Cerrar
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "var(--color-muted)" }}>
              No encontramos protocolos directos para tu búsqueda. Prueba con términos como <em>botox, labios, peeling</em>.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/courses/${r.slug}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface-2)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background-color 150ms ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "var(--color-text)" }}>{r.title}</strong>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        backgroundColor: "var(--color-brand-soft)",
                        color: "var(--color-brand)",
                        fontWeight: 600,
                      }}
                    >
                      {r.category || "Inyectables"}
                    </span>
                  </div>
                  {r.description && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-muted)",
                        marginTop: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {r.description.slice(0, 120)}...
                    </p>
                  )}
                  {r.recovery_time && (
                    <span style={{ fontSize: "11px", color: "var(--color-brand)", marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <ClockIcon size={12} />
                      <span>Recuperación estimada: <strong>{r.recovery_time}</strong></span>
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
