"use client";

import { useState } from "react";
import Link from "next/link";

interface StreakWidgetProps {
  streakDays?: number;
  freezeAvailable?: boolean;
}

export function StreakWidget({
  streakDays = 0,
  freezeAvailable = true,
}: StreakWidgetProps) {
  const [freezeUsed, setFreezeUsed] = useState(false);

  const streakLevel =
    streakDays >= 30 ? "legendary" :
    streakDays >= 14 ? "hot" :
    streakDays >= 7  ? "warm" : "fresh";

  const fireColors: Record<string, string> = {
    fresh:     "hsl(200 80% 55%)",
    warm:      "hsl(35 95% 55%)",
    hot:       "hsl(20 90% 52%)",
    legendary: "hsl(270 85% 60%)",
  };

  return (
    <div
      className="bento-card bento-streak"
      style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}
    >
      {/* Fire icon */}
      <div>
        <span
          role="img"
          aria-label={`${streakDays}-day streak`}
          style={{
            fontSize: 52,
            lineHeight: 1,
            display: "block",
            marginBottom: "var(--space-2)",
            filter: `drop-shadow(0 2px 8px ${fireColors[streakLevel]}80)`,
            animation: streakDays > 0 ? "pulse 2s ease-in-out infinite" : "none",
          }}
        >
          🔥
        </span>
        <p
          style={{
            fontSize: "var(--text-4xl)",
            fontWeight: "var(--fw-extrabold)",
            color: fireColors[streakLevel],
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {streakDays}
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", marginTop: "var(--space-1)", fontWeight: "var(--fw-medium)" }}>
          day streak
        </p>
      </div>

      {/* Freeze badge */}
      {freezeAvailable && !freezeUsed && (
        <button
          onClick={() => setFreezeUsed(true)}
          className="badge badge-brand"
          style={{
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
            gap: "var(--space-1)",
            padding: "6px var(--space-3)",
          }}
          aria-label="Use streak freeze to protect your streak today"
          title="Streak freeze — protect your streak for 1 day"
        >
          🧊 Freeze available
        </button>
      )}

      {freezeUsed && (
        <span className="badge badge-success">🧊 Freeze active</span>
      )}

      {/* Mini lesson CTA */}
      <div style={{ width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", marginTop: "var(--space-2)" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", marginBottom: "var(--space-3)" }}>
          Keep your streak with a quick lesson
        </p>
        <Link
          href="/"
          className="btn btn-amber btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          ⚡ 2-min lesson
        </Link>
      </div>
    </div>
  );
}
