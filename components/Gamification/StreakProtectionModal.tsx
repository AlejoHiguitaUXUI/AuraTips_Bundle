"use client";

interface StreakProtectionModalProps {
  onDismiss: () => void;
  onQuickLesson: () => void;
  streakDays: number;
}

/**
 * Non-invasive streak protection modal.
 * Appears when user hasn't completed a lesson in >20h.
 * Bottom-sheet on mobile, centered modal on desktop.
 */
export function StreakProtectionModal({
  onDismiss,
  onQuickLesson,
  streakDays,
}: StreakProtectionModalProps) {
  return (
    <div
      className="streak-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
      onClick={(e) => {
        // Dismiss on backdrop click
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="streak-modal animate-slide-up">
        <span className="streak-fire-icon" role="img" aria-label="Fire">🔥</span>

        <h2
          id="streak-modal-title"
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: "var(--fw-bold)",
            color: "var(--color-text)",
            marginBottom: "var(--space-2)",
          }}
        >
          Don&apos;t break your {streakDays}-day streak!
        </h2>

        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", marginBottom: "var(--space-6)", lineHeight: 1.5 }}>
          Complete a quick 2-minute lesson today to keep your streak alive.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <button
            onClick={onQuickLesson}
            className="btn btn-amber"
            style={{ width: "100%", justifyContent: "center" }}
          >
            ⚡ Quick lesson — 2 min
          </button>
          <button
            onClick={onDismiss}
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
