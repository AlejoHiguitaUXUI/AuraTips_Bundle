import { StarIcon } from "@/components/icons";

export function RatingBadge({
  avgRating,
  reviewCount,
}: {
  avgRating: number | null;
  reviewCount: number;
}) {
  if (!reviewCount || avgRating === null) {
    return (
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
        Sin valoraciones aún
      </span>
    );
  }

  return (
    /* A8: aria-label único para AT; contenido visual queda aria-hidden */
    <span
      className="rating-badge"
      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      aria-label={`Calificación promedio: ${avgRating.toFixed(1)} de 5 (${reviewCount} reseñas)`}
    >
      <StarIcon size={12} fill="currentColor" aria-hidden="true" />
      <span aria-hidden="true">{avgRating.toFixed(1)}</span>
      <span className="count" aria-hidden="true">({reviewCount})</span>
    </span>
  );
}
