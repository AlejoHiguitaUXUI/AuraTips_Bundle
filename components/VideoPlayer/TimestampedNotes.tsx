"use client";

import { useState } from "react";
import type { TimestampNote } from "./useVideoPlayer";

interface TimestampedNotesProps {
  notes: TimestampNote[];
  currentTime: number;
  onAddNote: (text: string, time: number) => void;
  onDeleteNote: (id: string) => void;
  onSeekTo: (time: number) => void;
  formatTime: (s: number) => string;
}

export function TimestampedNotes({
  notes,
  currentTime,
  onAddNote,
  onDeleteNote,
  onSeekTo,
  formatTime,
}: TimestampedNotesProps) {
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAddNote(text, currentTime);
    setDraft("");
  }

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <span aria-hidden="true">📝</span>
        Notes
        {notes.length > 0 && (
          <span className="badge badge-brand" style={{ marginLeft: "auto" }}>
            {notes.length}
          </span>
        )}
      </div>

      {/* Existing notes */}
      {notes.length > 0 ? (
        <ul className="notes-list" role="list" aria-label="Your timestamped notes">
          {notes.map((n) => (
            <li key={n.id} className="note-item">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)" }}>
                <button
                  className="note-timestamp"
                  onClick={() => onSeekTo(n.timeSeconds)}
                  aria-label={`Jump to ${formatTime(n.timeSeconds)}`}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", padding: 0 }}
                >
                  {formatTime(n.timeSeconds)}
                </button>
                <button
                  onClick={() => onDeleteNote(n.id)}
                  aria-label={`Delete note at ${formatTime(n.timeSeconds)}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-muted)",
                    fontSize: 12,
                    padding: 0,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              <p className="note-text">{n.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ padding: "var(--space-4) var(--space-5)", fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
          No notes yet. Add one below!
        </p>
      )}

      {/* Add note input */}
      <form onSubmit={submit} className="notes-input-row">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-brand)",
            fontWeight: 500,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {formatTime(currentTime)}
        </span>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          aria-label={`Add note at ${formatTime(currentTime)}`}
          maxLength={280}
          style={{ margin: 0 }}
        />
        <button
          type="submit"
          className="btn btn-sm"
          disabled={!draft.trim()}
          aria-label="Save note"
          style={{ flexShrink: 0 }}
        >
          Save
        </button>
      </form>
    </div>
  );
}
