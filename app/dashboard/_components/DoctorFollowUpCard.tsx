"use client";

import { useState } from "react";

interface DoctorFollowUpCardProps {
  doctorName?: string;
  doctorSpecialty?: string;
  enrolledAt?: string;
}

export function DoctorFollowUpCard({
  doctorName = "Dra. Mariana Gómez",
  doctorSpecialty = "Médica Especialista en Estética Facial",
  enrolledAt,
}: DoctorFollowUpCardProps) {
  const [hasRequested, setHasRequested] = useState(false);

  // Compute follow-up date (14 days from enrolledAt)
  const baseDate = enrolledAt ? new Date(enrolledAt) : new Date();
  const followUpDate = new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.ceil((followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = followUpDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="bento-card bento-doctor-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        background: "var(--color-surface)",
      }}
    >
      {/* Header with Doctor Bio */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-brand)",
            }}
          >
            Especialista Responsable
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "var(--color-brand)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            En Línea
          </span>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #20503B, #3B6E57)",
              color: "#FAF8F5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              border: "2px solid rgba(194, 155, 56, 0.4)",
              flexShrink: 0,
            }}
          >
            {doctorName.split(" ").slice(-1)[0]?.slice(0, 2).toUpperCase() || "DR"}
          </div>

          <div>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-text)",
                lineHeight: 1.2,
                marginBottom: "2px",
              }}
            >
              {doctorName}
            </h3>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted)",
                lineHeight: 1.3,
              }}
            >
              {doctorSpecialty}
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "var(--color-muted)",
                marginTop: "2px",
              }}
            >
              AuraTips · Centro Clínico
            </p>
          </div>
        </div>
      </div>

      {/* Follow-up appointment box */}
      <div
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            Cita de Control & Simetría
          </span>
        </div>

        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text)",
            fontWeight: 600,
            textTransform: "capitalize",
            marginBottom: "2px",
          }}
        >
          {formattedDate}
        </p>

        <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>
          {diffDays > 0
            ? `Faltan ${diffDays} días para tu valoración de consolidación.`
            : diffDays === 0
            ? "¡Hoy corresponde tu revisión médica!"
            : "Revisión de control en curso."}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {hasRequested ? (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(32, 80, 59, 0.12)",
              border: "1px solid var(--color-brand)",
              color: "var(--color-brand)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            ✓ Solicitud de cita enviada a recepción
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setHasRequested(true)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Solicitar Cita de Control
          </button>
        )}

        <a
          href="https://wa.me/?text=Hola%2C+tengo+una+consulta+sobre+mi+protocolo+en+AuraTips"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost btn btn-sm"
          style={{ width: "100%", justifyContent: "center", fontSize: "12px", textDecoration: "none" }}
        >
          💬 Asistencia por WhatsApp
        </a>
      </div>
    </div>
  );
}
