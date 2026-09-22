"use client";

import { useState } from "react";

interface SymptomSafetyWidgetProps {
  alarmSigns?: string[];
  currentDay?: number;
  procedureTitle?: string;
}

const DEFAULT_ALARMS = [
  "Palidez súbita, blanqueamiento o coloración azul-violácea en la piel",
  "Dolor desproporcionado, agudo y pulsátil que no calma",
  "Asimetría facial marcada e involuntaria de inicio brusco",
  "Fiebre persistente o calor extremo con enrojecimiento progresivo",
];

const NORMAL_SYMPTOMS_BY_STAGE: Record<string, string[]> = {
  initial: [
    "Edema (hinchazón) leve o moderado en los puntos de inyección",
    "Sensación de tirantez o relleno en el área tratada",
    "Pequeños hematomas o puntos rojizos superficiales",
    "Sensibilidad al tacto suave durante las primeras 48h",
  ],
  settling: [
    "Disminución gradual del edema matutino",
    "Reabsorción progresiva de hematomas (tono amarillento)",
    "Integración natural del producto a la mímica facial",
  ],
};

export function SymptomSafetyWidget({
  alarmSigns = [],
  currentDay = 1,
  procedureTitle = "tu procedimiento",
}: SymptomSafetyWidgetProps) {
  const [activeTab, setActiveTab] = useState<"normal" | "alarm">("normal");

  const displayAlarms = alarmSigns.length > 0 ? alarmSigns : DEFAULT_ALARMS;
  const normalSymptoms =
    currentDay <= 3 ? NORMAL_SYMPTOMS_BY_STAGE.initial : NORMAL_SYMPTOMS_BY_STAGE.settling;

  return (
    <div
      className="bento-card bento-symptoms"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-2)",
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
            Monitor Clínico
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: activeTab === "normal" ? "#22c55e" : "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {activeTab === "normal" ? "🟢 Evolución Esperada" : "🚨 Filtro de Urgencias"}
          </span>
        </div>

        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: "var(--space-3)",
          }}
        >
          Síntomas & Seguridad
        </h3>

        {/* Tab switch */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-1)",
            padding: "3px",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-3)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("normal")}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "normal" ? "var(--color-surface)" : "transparent",
              color: activeTab === "normal" ? "#22c55e" : "var(--color-muted)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "normal" ? "var(--shadow-sm)" : "none",
              transition: "all var(--dur-fast) ease",
            }}
          >
            ✓ Lo que es Normal
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("alarm")}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "alarm" ? "rgba(239, 68, 68, 0.12)" : "transparent",
              color: activeTab === "alarm" ? "#ef4444" : "var(--color-muted)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "alarm" ? "var(--shadow-sm)" : "none",
              transition: "all var(--dur-fast) ease",
            }}
          >
            🚨 Signos de Alerta ({displayAlarms.length})
          </button>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === "normal" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <p style={{ fontSize: "11px", color: "var(--color-muted)", marginBottom: "2px" }}>
            Evolución habitual para el Día {currentDay} en {procedureTitle}:
          </p>
          {normalSymptoms.map((symptom, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-2)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text)",
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{symptom}</span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "#dc2626",
              fontWeight: 700,
              marginBottom: "2px",
            }}
          >
            Si detectas alguno de estos signos, avisa a tu médico:
          </p>
          {displayAlarms.map((alarm, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-2)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text)",
                lineHeight: 1.35,
              }}
            >
              <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>!</span>
              <span>{alarm}</span>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Contact CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--color-muted)" }}>
          Urgencias clínicas 24/7
        </span>
        <a
          href="tel:+18005551234"
          className="btn btn-sm"
          style={{
            background: "transparent",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "11px",
            padding: "4px 10px",
          }}
        >
          📞 Línea Médica de Urgencia
        </a>
      </div>
    </div>
  );
}
