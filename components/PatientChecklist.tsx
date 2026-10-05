"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2Icon,
  BanIcon,
  MoonIcon,
  SnowflakeIcon,
  SunIcon,
  DropletIcon,
  ChevronRightIcon,
} from "@/components/icons";

function cleanTaskText(text: string): string {
  return text.replace(/^[\p{Emoji}\uFE0F\u200D\s]+/u, "").trim();
}

interface PatientChecklistProps {
  lessonId: string;
  items: string[];
  dos?: string[];
  donts?: string[];
}

export function PatientChecklist({ lessonId, items, dos = [], donts = [] }: PatientChecklistProps) {
  const storageKey = `auratips_checklist_${lessonId}`;
  const legacyStorageKey = `aesthetica_checklist_${lessonId}`;
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
      if (saved) {
        setCheckedState(JSON.parse(saved));
      }
    } catch {
      // Ignored
    }
  }, [storageKey, legacyStorageKey]);

  const toggleItem = (idx: number) => {
    const next = { ...checkedState, [idx]: !checkedState[idx] };
    setCheckedState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignored
    }
  };

  const completedCount = Object.values(checkedState).filter(Boolean).length;
  const totalCount = items.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const cleanItems = items.map(cleanTaskText);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="checklist-card animate-fade-in" aria-label="Lista de verificación de cuidados">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 className="checklist-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2Icon size={18} color="var(--color-brand)" />
            <span>Tu Lista de Verificación Diaria</span>
          </h3>
          <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: "4px 0 0" }}>
            Pautas prácticas de la vida real para asegurar una recuperación óptima y prevenir complicaciones.
          </p>
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            backgroundColor: isAllCompleted ? "var(--color-success-soft)" : "var(--color-surface-2)",
            color: isAllCompleted ? "var(--color-success)" : "var(--color-muted)",
            border: isAllCompleted ? "1px solid #B7EBCE" : "1px solid var(--color-border)",
          }}
        >
          {completedCount} de {totalCount} completados
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--color-border)",
          overflow: "hidden",
          marginBlock: "8px 12px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: isAllCompleted ? "#22c55e" : "var(--color-brand)",
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      </div>

      {/* Mini Tips Summary Pills */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "14px",
          fontSize: "12px",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          <MoonIcon size={12} color="var(--color-muted)" />
          <span>Postura: Boca arriba + 2 almohadas</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          <SnowflakeIcon size={12} color="var(--color-muted)" />
          <span>Frío local: Con gasa, pulsos 10 min</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          <SunIcon size={12} color="var(--color-muted)" />
          <span>Skincare: Reparador y SPF mineral</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          <DropletIcon size={12} color="var(--color-muted)" />
          <span>Dieta: &gt;2L agua, sin picantes/calientes</span>
        </span>
      </div>

      {/* Checklist Tasks */}
      <div className="checklist-items">
        {cleanItems.map((item, idx) => {
          const isChecked = !!checkedState[idx];
          return (
            <label
              key={idx}
              className="checklist-label"
              style={{
                backgroundColor: isChecked ? "rgba(32, 80, 59, 0.06)" : "var(--color-surface-2)",
                textDecoration: isChecked ? "line-through" : "none",
                opacity: isChecked ? 0.8 : 1,
                border: isChecked ? "1px solid rgba(32, 80, 59, 0.25)" : "1px solid var(--color-border)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "8px",
                cursor: "pointer",
                transition: "all var(--dur-fast) ease",
              }}
            >
              <input
                type="checkbox"
                className="checklist-checkbox"
                checked={isChecked}
                onChange={() => toggleItem(idx)}
                style={{
                  marginTop: "3px",
                  accentColor: "#20503B",
                  width: 17,
                  height: 17,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "13px", lineHeight: 1.4, color: isChecked ? "var(--color-muted)" : "var(--color-text)" }}>
                {item}
              </span>
            </label>
          );
        })}
      </div>

      {isAllCompleted && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            backgroundColor: "var(--color-success-soft)",
            border: "1px solid #B7EBCE",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--color-success)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2Icon size={16} />
          <span>¡Excelente! Has completado todas las pautas de esta fase para el día de hoy.</span>
        </div>
      )}

      {/* Optional In-Card Guidelines Drawer if passed */}
      {(dos.length > 0 || donts.length > 0) && (
        <div style={{ marginTop: "14px" }}>
          <button
            type="button"
            className="btn-ghost btn btn-sm"
            onClick={() => setShowGuidelines(!showGuidelines)}
            style={{
              width: "100%",
              justifyContent: "space-between",
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span>{showGuidelines ? "Ocultar pautas médicas resumidas" : "Ver pautas recomendadas y restricciones"}</span>
            <ChevronRightIcon
              size={14}
              style={{
                transform: showGuidelines ? "rotate(-90deg)" : "rotate(90deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {showGuidelines && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "10px",
                padding: "12px",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
              }}
            >
              <div>
                <strong style={{ color: "var(--color-clinical-do-text)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <CheckCircle2Icon size={14} color="var(--color-clinical-do-text)" />
                  <span>Pautas recomendadas (Qué hacer)</span>
                </strong>
                <ul style={{ paddingLeft: "16px", margin: 0, color: "var(--color-text)", lineHeight: 1.4 }}>
                  {dos.map((d, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong style={{ color: "var(--color-clinical-dont-text)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <BanIcon size={14} color="var(--color-clinical-dont-text)" />
                  <span>Acciones a evitar (Qué evitar)</span>
                </strong>
                <ul style={{ paddingLeft: "16px", margin: 0, color: "var(--color-text)", lineHeight: 1.4 }}>
                  {donts.map((d, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
