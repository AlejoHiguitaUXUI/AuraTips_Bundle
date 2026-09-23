"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ShieldAlertIcon,
  MessageCircleIcon,
} from "@/components/icons";

interface SymptomSafetyWidgetProps {
  alarmSigns?: string[];
  currentDay?: number;
  procedureTitle?: string;
}

const DEFAULT_ALARMS = [
  "Palidez súbita, blanqueamiento o coloración azul-violácea en la piel",
  "Dolor desproporcionado, agudo y pulsátil que no cede",
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
    "Estabilización progresiva del volumen y la simetría",
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
        gap: "var(--space-4)",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-5)",
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
              fontSize: "12px",
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
              fontSize: "12px",
              fontWeight: 600,
              color: activeTab === "normal" ? "#16a34a" : "#dc2626",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {activeTab === "normal" ? (
              <>
                <CheckCircle2Icon size={14} color="#16a34a" />
                <span>Evolución Esperada</span>
              </>
            ) : (
              <>
                <ShieldAlertIcon size={14} color="#dc2626" />
                <span>Criterios de Observación</span>
              </>
            )}
          </span>
        </div>

        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.2,
            margin: "0 0 var(--space-3)",
          }}
        >
          Síntomas & Seguridad
        </h3>

        {/* Selector de pestañas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-1)",
            padding: "4px",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("normal")}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "normal" ? "var(--color-surface)" : "transparent",
              color: activeTab === "normal" ? "#16a34a" : "var(--color-muted)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: activeTab === "normal" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              transition: "all var(--dur-fast) ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2Icon size={14} color={activeTab === "normal" ? "#16a34a" : "currentColor"} />
            <span>Lo que es Normal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("alarm")}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "alarm" ? "rgba(239, 68, 68, 0.12)" : "transparent",
              color: activeTab === "alarm" ? "#dc2626" : "var(--color-muted)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: activeTab === "alarm" ? "0 1px 3px rgba(220,38,38,0.12)" : "none",
              transition: "all var(--dur-fast) ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <ShieldAlertIcon size={14} color={activeTab === "alarm" ? "#dc2626" : "currentColor"} />
            <span>Criterios de Alerta ({displayAlarms.length})</span>
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "normal" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: 0, lineHeight: 1.4 }}>
            Evolución médica prevista para el <strong>Día {currentDay}</strong> en {procedureTitle}:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {normalSymptoms.map((symptom, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px",
                  color: "var(--color-text)",
                  lineHeight: 1.45,
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                }}
              >
                <CheckCircle2Icon size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{symptom}</span>
              </div>
            ))}
          </div>

          {/* Tarjeta de tranquilidad clínica para evitar el espacio en blanco vacío */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(32, 80, 59, 0.05)",
              border: "1px solid rgba(32, 80, 59, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-brand)" }}>
                Pauta Médica de Tranquilidad
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-2)", margin: 0, lineHeight: 1.45 }}>
              La inflamación y los micromatomas alcanzan su pico entre las 24h y 48h posteriores al procedimiento. Si tus sensaciones son moderadas y tolerables, tu organismo progresa de acuerdo con el protocolo médico.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p style={{ fontSize: "13px", color: "#dc2626", fontWeight: 700, margin: 0 }}>
            Si experimentas alguno de estos signos de alarma, comunícate de inmediato:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {displayAlarms.map((alarm, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px",
                  color: "var(--color-text)",
                  lineHeight: 1.4,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.18)",
                }}
              >
                <ShieldAlertIcon size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{alarm}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: 0 }}>
            La coincidencia de dolor severo continuo, cambio de coloración violácea o asimetría súbita activa prioridad clínica inmediata.
          </p>
        </div>
      )}

      {/* Botón de Pánico / Contacto Clínico Destacado */}
      <div
        style={{
          marginTop: "var(--space-2)",
          padding: "16px",
          borderRadius: "var(--radius-lg)",
          background: "rgba(220, 38, 38, 0.04)",
          border: "1px solid rgba(220, 38, 38, 0.22)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlertIcon size={16} color="#dc2626" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>
              Canal de Urgencia & Triaje Médico
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
            Atención clínica directa
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "var(--color-text-2)", margin: 0, lineHeight: 1.4 }}>
          ¿Sientes dolor agudo persistente, palidez cutánea o alguna reacción inesperada? Conéctate de inmediato con la <strong>Dra. Mariana Gómez</strong>.
        </p>

        <a
          href="https://wa.me/573001234567?text=URGENCIA%20MEDICA%20-%20Hola%20Dra.%20Mariana%20G%C3%B3mez,%20tengo%20una%20consulta%20urgente%20sobre%20mi%20recuperaci%C3%B3n%20en%20AuraTips"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-danger btn-sm"
          style={{
            width: "100%",
            justifyContent: "center",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <MessageCircleIcon size={16} />
          <span>Contactar a la Dra. Mariana Gómez (Urgencias)</span>
        </a>
      </div>
    </div>
  );
}
