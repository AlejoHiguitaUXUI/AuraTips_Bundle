"use client";

import { useState, useEffect } from "react";

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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="checklist-card animate-fade-in" aria-label="Lista de verificación de cuidados">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 className="checklist-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✅</span> Tu Lista de Verificación Diaria
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
          fontSize: "11px",
        }}
      >
        <span style={{ padding: "3px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          🛏️ Postura: Boca arriba + 2 almohadas
        </span>
        <span style={{ padding: "3px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          🧊 Frío local: Con gasa, pulsos 10 min
        </span>
        <span style={{ padding: "3px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          🧴 Skincare: Reparador y SPF mineral
        </span>
        <span style={{ padding: "3px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
          💧 Dieta: &gt;2L agua, sin picantes/calientes
        </span>
      </div>

      {/* Checklist Tasks */}
      <div className="checklist-items">
        {items.map((item, idx) => {
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
            textAlign: "center",
          }}
        >
          🎉 ¡Excelente! Has completado todas las pautas de esta fase para el día de hoy.
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
            <span>{showGuidelines ? "▲" : "▼"}</span>
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
                <strong style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                  <span>🟢</span> Pautas recomendadas (Qué hacer)
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
                <strong style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                  <span>🔴</span> Acciones a evitar (Qué evitar)
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
