"use client";

import { useState, useEffect } from "react";

interface DailyCareChecklistProps {
  procedureSlug: string;
  currentDay: number;
  initialItems?: string[];
  dos?: string[];
  donts?: string[];
}

const DEFAULT_TASKS_BY_DAY: Record<number, string[]> = {
  1: [
    "🧊 Aplicar frío local indirecto por 10 minutos (con gasa protectora)",
    "🛏️ Dormir en posición boca arriba (decúbito supino)",
    "💧 Beber mínimo 2 litros de agua para hidratación celular",
    "🚫 Cero frotamiento o masaje en las zonas tratadas",
    "☀️ Evitar exposición solar directa o fuentes de calor intenso",
  ],
  2: [
    "🧴 Aplicar protector solar mineral SPF 50+ con toques suaves",
    "💧 Mantener hidratación labial/facial con bálsamo reparador estéril",
    "🏃 Prohibido ejercicio físico vigoroso o levantamiento de pesas",
    "🪞 Observar simetría y coloración normal frente al espejo",
  ],
  3: [
    "🧴 Reaplicar protector solar cada 3 a 4 horas",
    "🧘 Mantener descanso adecuado y evitar estrés térmico (saunas/baños)",
    "🍇 Consumir alimentos frescos ricos en antioxidantes y vitamina C",
  ],
};

export function DailyCareChecklist({
  procedureSlug,
  currentDay,
  initialItems,
  dos = [],
  donts = [],
}: DailyCareChecklistProps) {
  // Determine tasks: use passed items if available, or day-specific defaults
  const dayKey = currentDay in DEFAULT_TASKS_BY_DAY ? currentDay : 3;
  const items = initialItems && initialItems.length > 0 ? initialItems : DEFAULT_TASKS_BY_DAY[dayKey] || DEFAULT_TASKS_BY_DAY[1];

  const storageKey = `aesthetica_daily_checklist_${procedureSlug}_day_${currentDay}`;
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      } else {
        setCheckedItems({});
      }
    } catch {
      // ignore storage access errors
    }
  }, [storageKey]);

  const toggleItem = (index: number) => {
    const updated = { ...checkedItems, [index]: !checkedItems[index] };
    setCheckedItems(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const completedCount = items.filter((_, idx) => checkedItems[idx]).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div
      className="bento-card bento-checklist"
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
            flexWrap: "wrap",
            gap: "var(--space-2)",
            marginBottom: "var(--space-2)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
              }}
            >
              Checklist Diario
            </span>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--color-text)",
                lineHeight: 1.2,
                marginTop: "2px",
              }}
            >
              Cuidados Clave de Hoy (Día {currentDay})
            </h3>
          </div>

          <span
            className="badge badge-brand"
            style={{
              fontWeight: 700,
              fontSize: "11px",
              padding: "4px 10px",
            }}
          >
            {completedCount} de {items.length} completados
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--color-border)",
            overflow: "hidden",
            marginBlock: "var(--space-2)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: progressPercent === 100 ? "#22c55e" : "var(--color-brand)",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {items.map((task, idx) => {
          const isDone = !!checkedItems[idx];
          return (
            <label
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: isDone ? "rgba(32, 80, 59, 0.06)" : "var(--color-surface-2)",
                border: isDone ? "1px solid rgba(32, 80, 59, 0.25)" : "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all var(--dur-fast) ease",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isDone}
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
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: isDone ? "var(--color-muted)" : "var(--color-text)",
                  textDecoration: isDone ? "line-through" : "none",
                  lineHeight: 1.4,
                  fontWeight: isDone ? 400 : 500,
                }}
              >
                {task}
              </span>
            </label>
          );
        })}
      </div>

      {/* Toggle Guidelines Drawer */}
      {(dos.length > 0 || donts.length > 0) && (
        <div style={{ marginTop: "var(--space-2)" }}>
          <button
            type="button"
            className="btn-ghost btn btn-sm"
            onClick={() => setShowGuidelines(!showGuidelines)}
            style={{
              width: "100%",
              justifyContent: "space-between",
              fontSize: "12px",
              padding: "6px 12px",
            }}
          >
            <span>{showGuidelines ? "Ocultar pautas médicas" : "Ver pautas y restricciones recomendadas"}</span>
            <span>{showGuidelines ? "▲" : "▼"}</span>
          </button>

          {showGuidelines && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)",
                marginTop: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
            >
              <div>
                <strong style={{ color: "#22c55e", display: "block", marginBottom: "4px" }}>
                  ✓ Pautas recomendadas (Qué hacer)
                </strong>
                <ul style={{ paddingLeft: "16px", margin: 0, color: "var(--color-text)", lineHeight: 1.4 }}>
                  {dos.slice(0, 3).map((d, i) => (
                    <li key={i} style={{ marginBottom: "2px" }}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong style={{ color: "#ef4444", display: "block", marginBottom: "4px" }}>
                  ✕ Acciones a evitar (Qué evitar)
                </strong>
                <ul style={{ paddingLeft: "16px", margin: 0, color: "var(--color-text)", lineHeight: 1.4 }}>
                  {donts.slice(0, 3).map((d, i) => (
                    <li key={i} style={{ marginBottom: "2px" }}>
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
