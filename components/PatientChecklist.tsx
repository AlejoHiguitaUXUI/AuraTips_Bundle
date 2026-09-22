"use client";

import { useState, useEffect } from "react";

interface PatientChecklistProps {
  lessonId: string;
  items: string[];
}

export function PatientChecklist({ lessonId, items }: PatientChecklistProps) {
  const storageKey = `aesthetica_checklist_${lessonId}`;
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedState(JSON.parse(saved));
      }
    } catch {
      // Ignored
    }
  }, [storageKey]);

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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="checklist-card animate-fade-in" aria-label="Lista de verificación de cuidados">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 className="checklist-title" style={{ margin: 0 }}>
          <span>✅</span> Tu Lista de Verificación Diaria
        </h3>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "999px",
            backgroundColor: isAllCompleted ? "var(--color-success-soft)" : "var(--color-surface-2)",
            color: isAllCompleted ? "var(--color-success)" : "var(--color-muted)",
          }}
        >
          {completedCount} de {totalCount} completados
        </span>
      </div>

      <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "16px" }}>
        Marca cada paso una vez lo hayas realizado para asegurar una recuperación óptima y sin complicaciones.
      </p>

      <div className="checklist-items">
        {items.map((item, idx) => {
          const isChecked = !!checkedState[idx];
          return (
            <label
              key={idx}
              className="checklist-label"
              style={{
                backgroundColor: isChecked ? "var(--color-surface-2)" : "transparent",
                textDecoration: isChecked ? "line-through" : "none",
                opacity: isChecked ? 0.75 : 1,
              }}
            >
              <input
                type="checkbox"
                className="checklist-checkbox"
                checked={isChecked}
                onChange={() => toggleItem(idx)}
              />
              <span>{item}</span>
            </label>
          );
        })}
      </div>

      {isAllCompleted && (
        <div
          style={{
            marginTop: "16px",
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
    </div>
  );
}
