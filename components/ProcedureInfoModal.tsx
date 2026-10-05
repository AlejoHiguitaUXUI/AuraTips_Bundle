"use client";

import React, { useEffect } from "react";
import {
  XIcon,
  ClockIcon,
  ActivityIcon,
  SparklesIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { getProcedureHighlight } from "@/lib/procedure-details";

export interface ProcedureModalData {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  cover_url: string;
  recovery_time: string;
  pain_level: number;
  results_duration: string;
  duration_minutes?: number;
  anesthesia_type?: string;
}

interface ProcedureInfoModalProps {
  procedure: ProcedureModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProcedureInfoModal({
  procedure,
  isOpen,
  onClose,
}: ProcedureInfoModalProps) {
  // Manejo de tecla ESC y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !procedure) return null;

  const highlight = getProcedureHighlight(procedure.slug, procedure.title);
  const painMeter = "●".repeat(procedure.pain_level) + "○".repeat(5 - procedure.pain_level);

  const painLabel =
    procedure.pain_level <= 1
      ? "Mínima / Casi imperceptible"
      : procedure.pain_level === 2
      ? "Leve / Confortable"
      : procedure.pain_level === 3
      ? "Moderada y tolerable"
      : "Sensación de presión";

  const waMessage = encodeURIComponent(
    `Hola AuraMed, quisiera recibir información y agendar una valoración médica sobre el procedimiento: ${procedure.title}.`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-proc-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 18, 14, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "clamp(48px, 7vh, 72px) 16px 48px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-slide-up procedure-modal-dialog"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "calc(100vh - clamp(96px, 14vh, 140px))",
          margin: "auto 0",
          backgroundColor: "var(--color-surface, #ffffff)",
          borderRadius: "var(--radius-2xl, 20px)",
          border: "1px solid rgba(194, 155, 56, 0.35)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55)",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cabecera Visual con Portada */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            minHeight: "220px",
            flexShrink: 0,
            backgroundColor: "#161b18",
            overflow: "hidden",
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={procedure.cover_url}
            alt={procedure.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Categoría médica */}
          <span
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(24, 60, 44, 0.85)",
              color: "#FAF8F5",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "var(--radius-full, 9999px)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(194, 155, 56, 0.4)",
            }}
          >
            {procedure.category}
          </span>

          {/* Botón de Cierre */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana informativa"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              color: "#FAF8F5",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.55)")}
          >
            <XIcon size={18} />
          </button>

          {/* Badge informativo en la base de la imagen */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#F3E3B6",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <SparklesIcon size={14} color="#C29B38" />
            <span>Ficha Informativa del Procedimiento Médico</span>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Título y Subtítulo */}
          <div>
            <h2
              id="modal-proc-title"
              style={{
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--color-text, #111827)",
                lineHeight: 1.25,
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              {procedure.title}
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-muted, #64748b)",
                margin: 0,
              }}
            >
              Medicina Estética de Vanguardia · Dra. Mariana Gómez · AuraMed Grupo Estético
            </p>
          </div>

          {/* Resumen explicativo de qué es el procedimiento */}
          <div
            style={{
              background: "var(--color-surface-2, rgba(24, 60, 44, 0.04))",
              padding: "16px",
              borderRadius: "var(--radius-xl, 14px)",
              border: "1px solid var(--color-border, rgba(0,0,0,0.08))",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brand, #183C2C)",
                margin: "0 0 8px",
              }}
            >
              ¿En qué consiste este tratamiento?
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "var(--color-text, #1f2937)",
                margin: 0,
              }}
            >
              {highlight.summary || procedure.description}
            </p>
          </div>

          {/* Ficha de Parámetros de Consulta (Métricas Clínicas) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {/* Recuperación estimada */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--color-surface, #ffffff)",
                border: "1px solid var(--color-border, #e5e7eb)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted, #64748b)",
                  marginBottom: "4px",
                }}
              >
                <ClockIcon size={13} color="var(--color-brand, #183C2C)" />
                <span>Recuperación</span>
              </div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--color-text, #111827)",
                  display: "block",
                }}
              >
                {procedure.recovery_time}
              </strong>
            </div>

            {/* Molestia esperada */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--color-surface, #ffffff)",
                border: "1px solid var(--color-border, #e5e7eb)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted, #64748b)",
                  marginBottom: "4px",
                }}
              >
                <ActivityIcon size={13} color="var(--color-brand, #183C2C)" />
                <span>Molestia estimada</span>
              </div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--color-brand, #183C2C)",
                  display: "block",
                }}
              >
                {painMeter}{" "}
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--color-muted, #64748b)",
                  }}
                >
                  ({painLabel})
                </span>
              </strong>
            </div>

            {/* Duración de resultados */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--color-surface, #ffffff)",
                border: "1px solid var(--color-border, #e5e7eb)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted, #64748b)",
                  marginBottom: "4px",
                }}
              >
                <SparklesIcon size={13} color="#C29B38" />
                <span>Resultados</span>
              </div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--color-text, #111827)",
                  display: "block",
                }}
              >
                {procedure.results_duration || "4 a 6 meses"}
              </strong>
            </div>

            {/* Confort y Anestesia */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--color-surface, #ffffff)",
                border: "1px solid var(--color-border, #e5e7eb)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted, #64748b)",
                  marginBottom: "4px",
                }}
              >
                <ShieldCheckIcon size={13} color="var(--color-brand, #183C2C)" />
                <span>Confort / Anestesia</span>
              </div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--color-text, #111827)",
                  display: "block",
                }}
              >
                {procedure.anesthesia_type || "Crioterapia / Frío local"}
              </strong>
            </div>
          </div>

          {/* Beneficios Destacados */}
          <div>
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brand, #183C2C)",
                margin: "0 0 10px",
              }}
            >
              Beneficios médicos y estéticos
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {highlight.benefits.map((b, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "13px",
                    color: "var(--color-text, #374151)",
                    lineHeight: 1.5,
                  }}
                >
                  <CheckCircle2Icon
                    size={16}
                    style={{
                      color: "var(--color-brand, #183C2C)",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Aclaración sobre el protocolo de recuperación */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-xl, 14px)",
              background: "rgba(194, 155, 56, 0.08)",
              border: "1px solid rgba(194, 155, 56, 0.25)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <ShieldCheckIcon
              size={20}
              style={{ color: "#997316", flexShrink: 0, marginTop: "2px" }}
            />
            <div style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--color-text, #374151)" }}>
              <strong style={{ display: "block", color: "var(--color-gold-text, #997316)", marginBottom: "2px" }}>
                Acompañamiento post-tratamiento en AuraTips
              </strong>
              Este procedimiento cuenta con protocolo clínico post-tratamiento exclusivo.
              Una vez realizada tu valoración y sesión médica con la Dra. Mariana Gómez,
              tu cuenta tendrá acceso a tu panel de <strong>&quot;Mi Recuperación&quot;</strong> con
              tu cronograma diario de cuidados, qué hacer y qué evitar, lista de verificación y seguimiento personalizado.
            </div>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--color-border, #e5e7eb)",
            background: "var(--color-surface, #ffffff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm secondary"
            style={{ cursor: "pointer" }}
          >
            Cerrar
          </button>

          <a
            href={`https://wa.me/573001234567?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              background: "var(--color-brand, #183C2C)",
              color: "#FAF8F5",
            }}
          >
            <MessageCircleIcon size={14} />
            <span>Consultar valoración médica</span>
          </a>
        </div>
      </div>
    </div>
  );
}
