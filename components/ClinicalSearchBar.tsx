"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon, ClockIcon, SparklesIcon, ArrowRightIcon, PhoneIcon } from "@/components/icons";
import { EdyVoiceWidget } from "@/components/voice/EdyVoiceWidget";
import FocusTrap from "focus-trap-react";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category?: string;
  recovery_time?: string;
  pain_level?: number;
  description?: string;
}

const QUICK_TAGS = [
  { label: "Botox", query: "Botox" },
  { label: "Labios hinchados", query: "Labios hinchados" },
  { label: "Rinomodelación", query: "Rinomodelación" },
  { label: "Hematomas", query: "Hematomas" },
  { label: "Piel descamada", query: "Piel descamada" },
];

export function ClinicalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showAuraTooltip, setShowAuraTooltip] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K / '/' to focus search
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSelectedIndex(-1);
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
    setSelectedIndex(-1);
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
          const items = Array.isArray(data) ? data : data.courses || [];
          setResults(items);
          setIsOpen(true);
        }
      } catch {
        // Ignored
      }
    });
  };

  const handleQuickTag = (tagQuery: string) => {
    inputRef.current?.focus();
    handleSearch(tagQuery);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      setIsOpen(false);
      router.push(`/courses/${results[selectedIndex].slug}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      setIsOpen(false);
      router.push(`/courses/${results[selectedIndex].slug}`);
    } else if (query.trim()) {
      handleSearch(query);
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="clinical-search-wrapper" ref={wrapperRef}>
      <div className="clinical-search-outer-row">
        <form onSubmit={handleSubmit} className="clinical-search-bar" role="search">
          <span className="clinical-search-icon" aria-hidden="true">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="clinical-search-input"
            placeholder="Buscar procedimiento, síntoma o duda post..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            aria-label="Buscar procedimientos y pautas de cuidado"
            aria-autocomplete="list"
            aria-controls="clinical-search-listbox"
            aria-expanded={isOpen}
            aria-activedescendant={
              isOpen && selectedIndex >= 0 && results[selectedIndex]
                ? `clinical-result-${results[selectedIndex].id}`
                : undefined
            }
            autoComplete="off"
            spellCheck="false"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              className="clinical-search-clear-btn"
            >
              <XIcon size={14} />
            </button>
          ) : (
            <kbd className="clinical-search-kbd" title="Presiona ⌘K para buscar">⌘K</kbd>
          )}

          <button
            type="submit"
            className="clinical-search-btn"
            aria-label="Consultar pautas clínicas"
          >
            <SparklesIcon size={14} />
            <span>{isPending ? "Buscando..." : "Consultar"}</span>
          </button>
        </form>

        {/* Botón AURA: Consúltalo con AURA */}
        <div
          className="aura-call-cta-container"
          onMouseEnter={() => setShowAuraTooltip(true)}
          onMouseLeave={() => setShowAuraTooltip(false)}
        >
          <button
            type="button"
            className="aura-call-cta-btn"
            onClick={() => setIsVoiceOpen(true)}
            aria-label="Hablar en vivo con la asistente clínica AURA"
          >
            <span className="aura-call-pulse-dot" aria-hidden="true" />
            <PhoneIcon size={16} />
            <span>Consúltalo con AURA</span>
          </button>

          {/* Popover informativo sobre las capacidades de AURA */}
          {showAuraTooltip && (
            <div className="aura-call-popover" role="tooltip">
              <div className="aura-call-popover-badge">Asesora Clínica con IA y Voz en Vivo</div>
              <h4 className="aura-call-popover-title">¿Prefieres hablar en lugar de escribir?</h4>
              <p className="aura-call-popover-desc">
                AURA es nuestra asistente virtual médica con voz humana en tiempo real. Puede asesorarte sobre los 20 procedimientos estéticos faciales, corporales y capilares, responder dudas post-tratamiento o ayudarte a coordinar tu cita de valoración médica presencial en Medellín.
              </p>
              <div className="aura-call-popover-footer">
                <span className="aura-call-popover-action">
                  <span>Haz clic para iniciar llamada</span>
                  <ArrowRightIcon size={12} />
                </span>
                <span className="aura-call-popover-meta">Micrófono seguro • Sin costo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sugerencias Rápidas Reorganizadas */}
      <div className="clinical-quick-tags-wrapper">
        <span className="clinical-quick-tags-label">
          <SparklesIcon size={12} />
          <span>Consultas frecuentes:</span>
        </span>
        <div className="clinical-quick-tags-list">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleQuickTag(tag.query)}
              className="clinical-quick-tag-chip"
              aria-label={`Buscar: ${tag.label}`}
            >
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Flotante de Resultados RAG (Spotlight) */}
      {isOpen && (
        <div
          id="clinical-search-listbox"
          className="clinical-search-dropdown"
          role="listbox"
        >
          <div className="clinical-search-dropdown-header">
            <span className="clinical-search-dropdown-title">
              <SparklesIcon size={13} />
              <span>Resultados Clínicos Sugeridos ({results.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="clinical-search-dropdown-close"
              aria-label="Cerrar resultados"
            >
              Esc para cerrar
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "20px 8px", textAlign: "center", color: "var(--color-muted)" }}>
              <p style={{ margin: 0, fontSize: "13.5px" }}>
                No encontramos protocolos directos para <strong>&ldquo;{query}&rdquo;</strong>.
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--color-muted-2)" }}>
                Prueba con términos como <em>Botox, Labios, Rinomodelación o Peeling</em>.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {results.map((r, index) => {
                const isSelected = index === selectedIndex;
                return (
                <Link
                    key={r.id}
                    id={`clinical-result-${r.id}`}
                    href={`/courses/${r.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`clinical-search-item ${isSelected ? "is-selected" : ""}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="clinical-search-item-header">
                      <div className="clinical-search-item-title">
                        <span>{r.title}</span>
                      </div>
                      <span className="clinical-search-item-category">
                        {r.category || "Inyectables"}
                      </span>
                    </div>

                    {r.description && (
                      <p className="clinical-search-item-desc">
                        {r.description.slice(0, 130)}...
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      {r.recovery_time ? (
                        <span className="clinical-search-item-meta">
                          <ClockIcon size={12} />
                          <span>Recuperación: <strong>{r.recovery_time}</strong></span>
                        </span>
                      ) : <span />}

                      <span style={{ fontSize: "11.5px", color: "var(--color-brand)", display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 600 }}>
                        <span>Ver pautas</span>
                        <ArrowRightIcon size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BLOCKING A10: FocusTrap en el modal de voz — WCAG 2.1.2 */}
      {isVoiceOpen && (
        <FocusTrap
          focusTrapOptions={{
            onDeactivate: () => setIsVoiceOpen(false),
            clickOutsideDeactivates: true,
            returnFocusOnDeactivate: true,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Llamada de voz con AURA"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10, 25, 18, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsVoiceOpen(false);
            }}
          >
            <div style={{ maxWidth: "520px", width: "100%", position: "relative" }}>
              <EdyVoiceWidget onClose={() => setIsVoiceOpen(false)} />
            </div>
          </div>
        </FocusTrap>
      )}
    </div>
  );
}
