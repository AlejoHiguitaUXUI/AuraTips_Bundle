import { StarIcon } from "@/components/icons";

interface Review {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="muted">Aún no hay testimonios de recuperación registrados para este protocolo.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {reviews.map((r) => {
        const author = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return (
          <div key={r.id} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ color: "var(--color-text)", fontSize: "14px" }}>
                {author?.display_name ?? "Paciente de AuraTips"}
              </strong>
              <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--color-gold-text, #997316)" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    size={12}
                    fill={i < r.rating ? "currentColor" : "none"}
                    color={i < r.rating ? "currentColor" : "var(--color-border)"}
                  />
                ))}
                <span style={{ fontSize: "12px", color: "var(--color-muted)", marginLeft: "6px" }}>
                  {new Date(r.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            {r.body && <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: 1.5, color: "var(--color-text-2)" }}>{r.body}</p>}
          </div>
        );
      })}
    </div>
  );
}
