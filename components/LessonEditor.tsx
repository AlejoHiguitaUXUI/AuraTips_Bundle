"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { isValidYouTubeUrl } from "@/lib/youtube";
import type { EditableLesson } from "@/components/CourseEditor";

export function LessonEditor({
  lesson,
  canMoveUp,
  canMoveDown,
  onMove,
  onLessonChange,
  onLessonDeleted,
}: {
  lesson: EditableLesson;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onLessonChange: (updated: EditableLesson) => void;
  onLessonDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [timelineTag, setTimelineTag] = useState(lesson.timeline_tag || "Día 0");
  const [isAlarm, setIsAlarm] = useState(Boolean(lesson.is_alarm));
  const [careType, setCareType] = useState(lesson.care_type || "general");
  const [bodyMd, setBodyMd] = useState(lesson.body_md || "");
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url || "");
  const [dosText, setDosText] = useState(
    Array.isArray(lesson.dos) ? lesson.dos.join("\n") : ""
  );
  const [dontsText, setDontsText] = useState(
    Array.isArray(lesson.donts) ? lesson.donts.join("\n") : ""
  );

  const initialChecklist = Array.isArray(lesson.checklist_items)
    ? lesson.checklist_items
        .map((it) => (typeof it === "string" ? it : it.label || ""))
        .filter(Boolean)
        .join("\n")
    : "";
  const [checklistText, setChecklistText] = useState(initialChecklist);
  const [emergencyContacts, setEmergencyContacts] = useState(lesson.emergency_contacts || "");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  async function save() {
    setError(null);
    setSaved(false);

    const trimmedUrl = youtubeUrl.trim();
    if (trimmedUrl && !isValidYouTubeUrl(trimmedUrl)) {
      setError(
        "El enlace no corresponde a un video válido de YouTube (watch, youtu.be, embed o shorts)."
      );
      return;
    }

    setPending(true);
    const supabase = createClient();

    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        title,
        timeline_tag: timelineTag,
        is_alarm: isAlarm,
        care_type: careType,
      })
      .eq("id", lesson.id);

    if (lessonError) {
      setPending(false);
      setError(lessonError.message);
      return;
    }

    const parsedDos = dosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedDonts = dontsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedChecklist = checklistText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label, idx) => ({
        id: `chk-${lesson.id}-${idx + 1}`,
        label,
        required: true,
      }));

    const { error: contentError } = await supabase
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: lesson.id,
          body_md: bodyMd || null,
          youtube_url: trimmedUrl || null,
          dos: parsedDos,
          donts: parsedDonts,
          checklist_items: parsedChecklist,
          emergency_contacts: emergencyContacts || "",
        },
        { onConflict: "lesson_id" }
      );

    setPending(false);

    if (contentError) {
      setError(contentError.message);
      return;
    }

    setSaved(true);
    onLessonChange({
      ...lesson,
      title,
      timeline_tag: timelineTag,
      is_alarm: isAlarm,
      care_type: careType,
      body_md: bodyMd,
      youtube_url: trimmedUrl,
      dos: parsedDos,
      donts: parsedDonts,
      checklist_items: parsedChecklist,
      emergency_contacts: emergencyContacts,
    });
  }

  async function deleteLesson() {
    if (!confirm(`¿Eliminar la pauta de cuidado "${lesson.title}"?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onLessonDeleted(lesson.id);
  }

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #e5e7eb)",
        borderRadius: "var(--radius-lg, 12px)",
        background: "var(--color-surface, #ffffff)",
        padding: "var(--space-4, 16px)",
        marginBottom: "var(--space-3, 12px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        borderLeft: isAlarm ? "4px solid #ef4444" : "4px solid var(--color-brand, #20503b)",
      }}
    >
      {/* Header colapsable */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: isExpanded ? "16px" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-ghost btn btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: "4px 8px", fontSize: "12px" }}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
          <strong style={{ fontSize: "15px", color: "var(--color-text)" }}>
            {title || "Pauta de cuidado sin título"}
          </strong>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(32, 80, 59, 0.08)",
              color: "var(--color-brand, #20503b)",
              fontWeight: 600,
            }}
          >
            {timelineTag || "Día 0"}
          </span>
          {isAlarm && (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                fontWeight: 700,
              }}
            >
              🚨 Alerta Crítica
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label="Mover pauta arriba"
            style={{ padding: "4px 8px" }}
          >
            ↑
          </button>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label="Mover pauta abajo"
            style={{ padding: "4px 8px" }}
          >
            ↓
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#b91c1c",
            borderRadius: "6px",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}
      {saved && !error && (
        <div
          style={{
            padding: "6px 12px",
            background: "rgba(34, 197, 94, 0.1)",
            color: "#15803d",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          ✓ Protocolo guardado y sincronizado con Supabase.
        </div>
      )}

      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Fila 1: Título y Fase Temporal */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Título de la Pauta / Protocolo
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Postura erguida y gesticulación guiada"
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Fase Temporal (Timeline)
              </label>
              <input
                value={timelineTag}
                onChange={(e) => setTimelineTag(e.target.value)}
                placeholder="Día 0 / Días 1-3 / Días 4-14"
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Tipo de Cuidado
              </label>
              <select
                value={careType}
                onChange={(e) => setCareType(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              >
                <option value="general">General</option>
                <option value="higiene">Higiene</option>
                <option value="medicacion">Medicación / Analgesia</option>
                <option value="alarma">Signo de Alarma</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Semáforo Clínico en Español */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(34, 197, 94, 0.05)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#15803d",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                🟢 Pautas recomendadas (Qué hacer) — Una por línea
              </label>
              <textarea
                rows={3}
                value={dosText}
                onChange={(e) => setDosText(e.target.value)}
                placeholder="Dormir con la cabeza ligeramente elevada&#10;Aplicar frío local seco durante 10 min&#10;Beber abundante agua"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(34, 197, 94, 0.3)", fontSize: "12px" }}
              />
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#b91c1c",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                🔴 Acciones a evitar (Qué evitar) — Una por línea
              </label>
              <textarea
                rows={3}
                value={dontsText}
                onChange={(e) => setDontsText(e.target.value)}
                placeholder="No frotar ni masajear la zona tratada&#10;No realizar ejercicio físico de alta intensidad&#10;Evitar saunas, calor o sol directo"
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: "12px" }}
              />
            </div>
          </div>

          {/* Fila 3: Checklist Diario del Paciente */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              📋 Lista de Verificación del Paciente (Checklist diario) — Una tarea por línea
            </label>
            <textarea
              rows={2}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              placeholder="Aplicar compresa fría en labios por 10 min&#10;Tomar analgésico recetado con el almuerzo&#10;Aplicar bálsamo estéril hidratante"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "12px" }}
            />
          </div>

          {/* Fila 4: Alerta Médica y Contacto SOS */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "var(--color-surface-2, #f9fafb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={isAlarm}
                onChange={(e) => setIsAlarm(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#ef4444" }}
              />
              <span style={{ fontWeight: 600, color: isAlarm ? "#b91c1c" : "inherit" }}>
                🚨 Criterio de Alarma Médica (Si el paciente cumple al menos 3 criterios simultáneos, se activa atención prioritaria)
              </span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
              <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>Contacto SOS:</span>
              <input
                value={emergencyContacts}
                onChange={(e) => setEmergencyContacts(e.target.value)}
                placeholder="+57 300 912 3456 (Dra. Mariana Gómez)"
                style={{ flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>

          {/* Fila 5: Indicaciones Detalladas (Markdown) y Video */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Instrucciones Clínicas Detalladas (Markdown)
              </label>
              <textarea
                rows={3}
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                placeholder="Explicación fisiológica para el paciente..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "12px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                Video de Guía (YouTube URL opcional)
              </label>
              <input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "12px" }}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={save}
              disabled={pending}
              style={{
                backgroundColor: "var(--color-brand, #20503b)",
                color: "#ffffff",
                padding: "8px 18px",
                fontWeight: 600,
              }}
            >
              {pending ? "Guardando..." : "Guardar Pauta Clínica"}
            </button>

            <button
              type="button"
              className="btn secondary btn-sm"
              onClick={deleteLesson}
              style={{ color: "#ef4444", fontSize: "12px" }}
            >
              Eliminar Pauta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
