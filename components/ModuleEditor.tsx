"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { LessonEditor } from "@/components/LessonEditor";
import type { EditableModule } from "@/components/CourseEditor";

export function ModuleEditor({
  module: mod,
  canMoveUp,
  canMoveDown,
  onMove,
  onModuleChange,
  onModuleDeleted,
}: {
  courseId: string;
  module: EditableModule;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onModuleChange: (updated: EditableModule) => void;
  onModuleDeleted: (id: string) => void;
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
    if (!confirm(`¿Eliminar la etapa de recuperación "${mod.title}" y todos sus protocolos?`)) return;
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

  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
        backgroundColor: "var(--color-surface, #ffffff)",
        borderRadius: "var(--radius-lg, 12px)",
        border: "1px solid var(--color-border, #e5e7eb)",
        padding: "var(--space-4, 16px)",
      }}
    >
      {error && <div className="error">{error}</div>}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
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
        </div>

        {/* A3: label asociado al input con htmlFor + id único por módulo */}
        <label
          htmlFor={`module-title-${mod.id}`}
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-brand, #20503b)",
          }}
        >
          Etapa:
        </label>

        <input
          id={`module-title-${mod.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          placeholder="ej. Fase Inmediata: Primeras 4 Horas"
          style={{
            flex: 1,
            marginBottom: 0,
            fontWeight: 700,
            fontSize: "15px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
          }}
        />

        <button
          type="button"
          className="btn secondary btn-sm"
          onClick={deleteModule}
          style={{ color: "#ef4444", fontSize: "12px" }}
        >
          Eliminar Etapa
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {mod.lessons.map((lesson, i) => (
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
        ))}
      </div>

      <button
        type="button"
        className="btn secondary btn-sm"
        style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
        onClick={addLesson}
      >
        + Añadir Pauta de Cuidado a esta Etapa
      </button>
    </div>
  );
}
