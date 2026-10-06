"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { LessonEditor } from "@/components/LessonEditor";
import type { EditableModule } from "@/components/CourseEditor";
import {
  CalendarIcon,
  PlusIcon,
  ShieldAlertIcon,
  ChevronRightIcon,
} from "@/components/icons";

export function ModuleEditor({
  courseId: _courseId,
  module: mod,
  canMoveUp,
  canMoveDown,
  onMove,
  onModuleChange,
  onModuleDeleted,
  onSelectForEdit,
  viewMode = "full",
  stageIndex = 1,
}: {
  courseId: string;
  module: EditableModule;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onModuleChange: (updated: EditableModule) => void;
  onModuleDeleted: (id: string) => void;
  onSelectForEdit?: () => void;
  viewMode?: "full" | "summary";
  stageIndex?: number;
}) {
  const [title, setTitle] = useState(mod.title);
  const [error, setError] = useState<string | null>(null);

  async function saveTitle() {
    if (title === mod.title) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("modules")
      .update({ title })
      .eq("id", mod.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onModuleChange({ ...mod, title });
  }

  async function deleteModule() {
    if (!confirm(`¿Eliminar la etapa de recuperación "${mod.title}" y todas sus pautas clínicas?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("modules")
      .delete()
      .eq("id", mod.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onModuleDeleted(mod.id);
  }

  async function addLesson() {
    const supabase = createClient();
    const nextPosition = mod.lessons.length;
    const { data, error: insertError } = await supabase
      .from("lessons")
      .insert({
        module_id: mod.id,
        title: "Nueva pauta de cuidado",
        position: nextPosition,
        timeline_tag: "Día 0",
        care_type: "general",
        is_alarm: false,
      })
      .select("id, title, position, timeline_tag, is_alarm, care_type")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "No se pudo agregar la pauta.");
      return;
    }
    onModuleChange({
      ...mod,
      lessons: [
        ...mod.lessons,
        {
          ...data,
          timeline_tag: data.timeline_tag || "Día 0",
          is_alarm: Boolean(data.is_alarm),
          care_type: data.care_type || "general",
          body_md: "",
          youtube_url: "",
          dos: [],
          donts: [],
          checklist_items: [],
          emergency_contacts: "",
        },
      ],
    });
  }

  async function moveLesson(id: string, direction: -1 | 1) {
    const lessons = mod.lessons;
    const index = lessons.findIndex((l) => l.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= lessons.length) {
      return;
    }
    const a = lessons[index];
    const b = lessons[targetIndex];

    const supabase = createClient();
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("lessons").update({ position: b.position }).eq("id", a.id),
      supabase.from("lessons").update({ position: a.position }).eq("id", b.id),
    ]);
    if (err1 || err2) {
      setError((err1 ?? err2)?.message ?? "No se pudieron reordenar las pautas.");
      return;
    }

    const reordered = lessons.slice();
    reordered[index] = { ...b, position: a.position };
    reordered[targetIndex] = { ...a, position: b.position };
    reordered.sort((x, y) => x.position - y.position);
    onModuleChange({ ...mod, lessons: reordered });
  }

  // -------------------------------------------------------------
  // VISTA RESUMEN (Modo Cronograma - Paso 2)
  // -------------------------------------------------------------
  if (viewMode === "summary") {
    return (
      <div
        className="card"
        style={{
          marginBottom: "var(--space-4)",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "20px 24px",
          boxShadow: "var(--shadow-xs)",
          position: "relative",
        }}
      >
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                fontWeight: 800,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--color-brand-border)",
                flexShrink: 0,
              }}
            >
              {String(stageIndex).padStart(2, "0")}
            </span>

            <div style={{ flex: 1 }}>
              <label
                htmlFor={`stage-title-${mod.id}`}
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", display: "block" }}
              >
                Fase Temporal Clínica (Línea de Tiempo)
              </label>
              <input
                id={`stage-title-${mod.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                placeholder="ej. Inmediato: Día 0 (Primeras 24 Horas)"
                style={{
                  width: "100%",
                  fontWeight: 700,
                  fontSize: "16px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  marginTop: "2px",
                }}
              />
            </div>
          </div>

          {/* Acciones de reordenación y eliminación */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "999px",
                background: "var(--color-surface-2)",
                color: "var(--color-muted)",
              }}
            >
              {mod.lessons.length} {mod.lessons.length === 1 ? "pauta" : "pautas"}
            </span>

            <button
              type="button"
              className="btn secondary btn-sm"
              onClick={() => onMove(-1)}
              disabled={!canMoveUp}
              aria-label="Mover etapa arriba"
              style={{ padding: "4px 8px" }}
            >
              ↑
            </button>
            <button
              type="button"
              className="btn secondary btn-sm"
              onClick={() => onMove(1)}
              disabled={!canMoveDown}
              aria-label="Mover etapa abajo"
              style={{ padding: "4px 8px" }}
            >
              ↓
            </button>
            <button
              type="button"
              className="btn secondary btn-sm clinical-danger-btn"
              onClick={deleteModule}
              style={{ fontSize: "11px" }}
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Resumen de pautas que pertenecen a esta etapa */}
        <div
          style={{
            padding: "12px 16px",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            marginBottom: "14px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", marginBottom: "8px" }}>
            Pautas de cuidado configuradas para esta etapa:
          </div>

          {mod.lessons.length === 0 ? (
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-muted)", fontStyle: "italic" }}>
              Esta etapa aún no tiene pautas clínicas asignadas.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {mod.lessons.map((lesson) => (
                <span
                  key={lesson.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "var(--color-brand)" }}>•</span>
                  <span>{lesson.title}</span>
                  <span style={{ fontSize: "10px", color: "var(--color-muted)" }}>({lesson.timeline_tag || "Día 0"})</span>
                  {lesson.is_alarm && <ShieldAlertIcon size={12} color="var(--color-clinical-alarm-icon)" />}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Acciones de la etapa en el cronograma */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={addLesson}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
          >
            <PlusIcon size={14} />
            <span>Añadir Pauta a esta Etapa</span>
          </button>

          {onSelectForEdit && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={onSelectForEdit}
              style={{
                backgroundColor: "var(--color-brand)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <span>Editar Pautas en Detalle (Paso 3)</span>
              <ChevronRightIcon size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA COMPLETA (Modo Edición de Pautas - Paso 3)
  // -------------------------------------------------------------
  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-5)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {error && <div className="error">{error}</div>}

      {/* Header de la etapa */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "var(--color-brand-soft)",
            color: "var(--color-brand)",
            fontWeight: 800,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--color-brand-border)",
          }}
        >
          {String(stageIndex).padStart(2, "0")}
        </span>

        <label
          htmlFor={`module-title-${mod.id}`}
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-brand)",
          }}
        >
          Fase Temporal:
        </label>

        <input
          id={`module-title-${mod.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          placeholder="ej. Inmediato: Día 0 (Primeras 24 Horas)"
          style={{
            flex: 1,
            minWidth: "220px",
            marginBottom: 0,
            fontWeight: 700,
            fontSize: "15px",
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
          }}
        />

        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label="Mover etapa arriba"
            style={{ padding: "4px 8px" }}
          >
            ↑
          </button>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label="Mover etapa abajo"
            style={{ padding: "4px 8px" }}
          >
            ↓
          </button>
          <button
            type="button"
            className="btn secondary btn-sm clinical-danger-btn"
            onClick={deleteModule}
            style={{ fontSize: "11px" }}
          >
            Eliminar Etapa
          </button>
        </div>
      </div>

      {/* Lista de pautas de cuidado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mod.lessons.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-border)",
              color: "var(--color-muted)",
              fontSize: "13px",
            }}
          >
            Aún no hay pautas configuradas en esta etapa. Haz clic abajo para agregar la primera.
          </div>
        ) : (
          mod.lessons.map((lesson, i) => (
            <LessonEditor
              key={lesson.id}
              lesson={lesson}
              canMoveUp={i > 0}
              canMoveDown={i < mod.lessons.length - 1}
              onMove={(direction) => moveLesson(lesson.id, direction)}
              onLessonChange={(updated) =>
                onModuleChange({
                  ...mod,
                  lessons: mod.lessons.map((l) =>
                    l.id === updated.id ? updated : l,
                  ),
                })
              }
              onLessonDeleted={(id) =>
                onModuleChange({
                  ...mod,
                  lessons: mod.lessons.filter((l) => l.id !== id),
                })
              }
            />
          ))
        )}
      </div>

      <button
        type="button"
        className="btn secondary btn-sm"
        style={{
          marginTop: 16,
          width: "100%",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px",
          fontWeight: 600,
        }}
        onClick={addLesson}
      >
        <PlusIcon size={16} />
        <span>Añadir Pauta de Cuidado a esta Etapa</span>
      </button>
    </div>
  );
}
