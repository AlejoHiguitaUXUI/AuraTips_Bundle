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
    if (!confirm(`Delete module "${mod.title}" and all its lessons?`)) return;
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
      .insert({ module_id: mod.id, title: "New lesson", position: nextPosition })
      .select("id, title, position")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Could not add lesson.");
      return;
    }
    // Content row starts empty; created on first save.
    onModuleChange({
      ...mod,
      lessons: [...mod.lessons, { ...data, body_md: "", youtube_url: "" }],
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
      setError((err1 ?? err2)?.message ?? "Could not reorder lessons.");
      return;
    }

    const reordered = lessons.slice();
    reordered[index] = { ...b, position: a.position };
    reordered[targetIndex] = { ...a, position: b.position };
    reordered.sort((x, y) => x.position - y.position);
    onModuleChange({ ...mod, lessons: reordered });
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {error && <div className="error">{error}</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn secondary"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          aria-label="Move module up"
        >
          ↑
        </button>
        <button
          className="btn secondary"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          aria-label="Move module down"
        >
          ↓
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          style={{ marginBottom: 0, fontWeight: 600 }}
        />
        <button className="btn secondary" onClick={deleteModule}>
          Delete module
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
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

      <button className="btn secondary" style={{ marginTop: 12 }} onClick={addLesson}>
        + Add lesson
      </button>
    </div>
  );
}
