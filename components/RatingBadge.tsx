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
    <span className="rating-badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <StarIcon size={12} fill="currentColor" />
      <span>{avgRating.toFixed(1)}</span>
      <span className="count">({reviewCount})</span>
    </span>
  );
}
