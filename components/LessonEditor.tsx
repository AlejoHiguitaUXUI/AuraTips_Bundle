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
  const [bodyMd, setBodyMd] = useState(lesson.body_md);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);

    const trimmedUrl = youtubeUrl.trim();
    if (trimmedUrl && !isValidYouTubeUrl(trimmedUrl)) {
      setError(
        "That doesn't look like a YouTube video link (watch, youtu.be, embed, or shorts URL).",
      );
      return;
    }

    setPending(true);
    const supabase = createClient();

    const { error: lessonError } = await supabase
      .from("lessons")
      .update({ title })
      .eq("id", lesson.id);

    if (lessonError) {
      setPending(false);
      setError(lessonError.message);
      return;
    }

    // 1:1 content row — insert or update depending on whether it exists yet.
    const { error: contentError } = await supabase
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: lesson.id,
          body_md: bodyMd || null,
          youtube_url: trimmedUrl || null,
        },
        { onConflict: "lesson_id" },
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
      body_md: bodyMd,
      youtube_url: trimmedUrl,
    });
  }

  async function deleteLesson() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
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
    <div style={{ borderLeft: "3px solid var(--border)", paddingLeft: 12 }}>
      {error && <div className="error">{error}</div>}
      {saved && !error && <p className="muted">Saved.</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          className="btn secondary"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          aria-label="Move lesson up"
        >
          ↑
        </button>
        <button
          className="btn secondary"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          aria-label="Move lesson down"
        >
          ↓
        </button>
      </div>

      <label>Lesson title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Body (Markdown, optional)</label>
      <textarea value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} />

      <label>YouTube URL (optional)</label>
      <input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save lesson"}
        </button>
        <button className="btn secondary" onClick={deleteLesson}>
          Delete lesson
        </button>
      </div>
    </div>
  );
}
