interface Review {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {reviews.map((r) => {
        const author = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return (
          <div key={r.id} className="card">
            <strong>{author?.display_name ?? "Unknown"}</strong>{" "}
            <span className="muted">
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)} ·{" "}
              {new Date(r.created_at).toLocaleDateString()}
            </span>
            {r.body && <p style={{ margin: "8px 0 0" }}>{r.body}</p>}
          </div>
        );
      })}
    </div>
  );
}
