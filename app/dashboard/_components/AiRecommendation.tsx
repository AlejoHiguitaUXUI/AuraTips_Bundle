import Link from "next/link";

interface AiRecommendationProps {
  /** Last completed course/module title for context */
  lastCompletedTitle?: string;
  /** Suggested course */
  suggestion?: {
    title: string;
    slug: string;
    reason: string;
    cover_url?: string | null;
  };
}

export function AiRecommendation({
  lastCompletedTitle,
  suggestion,
}: AiRecommendationProps) {
  // Default suggestion when no real AI data is available
  const rec = suggestion ?? {
    title: "Advanced JavaScript Patterns",
    slug: "#",
    reason: "Based on your recent activity",
    cover_url: null,
  };

  return (
    <div
      className="bento-card bento-ai"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-soft) 0%, var(--color-surface) 60%)",
        border: "1.5px solid var(--color-brand-border)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--gradient-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "white",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--color-brand)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Recommended for you
        </p>
      </div>

      {/* Suggested course */}
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        {/* Thumb or icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-md)",
            background: rec.cover_url ? `url(${rec.cover_url}) center/cover` : "var(--gradient-brand)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "white",
          }}
          aria-hidden="true"
        >
          {!rec.cover_url && "📖"}
        </div>

        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--fw-semibold)",
              color: "var(--color-text)",
              marginBottom: "var(--space-1)",
              lineHeight: 1.3,
            }}
          >
            {rec.title}
          </h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            {rec.reason}
            {lastCompletedTitle && ` · After "${lastCompletedTitle}"`}
          </p>
        </div>
      </div>

      <Link href={`/courses/${rec.slug}`} className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
        View course →
      </Link>
    </div>
  );
}
