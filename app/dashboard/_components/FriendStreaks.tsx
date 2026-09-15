// FriendStreaks: social accountability widget.
// MVP uses static mock data — ready for Supabase Realtime upgrade.

const MOCK_FRIENDS = [
  { id: "1", name: "María G.",  initials: "MG", streak: 12, color: "hsl(210 80% 60%)" },
  { id: "2", name: "Carlos V.", initials: "CV", streak: 7,  color: "hsl(150 70% 45%)" },
  { id: "3", name: "Sofía L.",  initials: "SL", streak: 21, color: "hsl(280 70% 60%)" },
  { id: "4", name: "Diego R.",  initials: "DR", streak: 3,  color: "hsl(30 85% 55%)"  },
];

export function FriendStreaks() {
  return (
    <div className="bento-card bento-social" style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>👥</span>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-semibold)", color: "var(--color-text)" }}>
            Friend streaks
          </h3>
        </div>
        <span className="badge badge-amber">🔥 Active</span>
      </div>

      {/* Friend list */}
      <ul
        style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}
        aria-label="Friend streaks"
      >
        {MOCK_FRIENDS.map((f) => (
          <li
            key={f.id}
            style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-full)",
                background: f.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--fw-bold)",
                color: "white",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {f.initials}
            </div>

            {/* Name + progress bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--fw-medium)", color: "var(--color-text-2)" }}>
                  {f.name}
                </span>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--fw-bold)", color: "var(--color-amber)" }}>
                  🔥 {f.streak}d
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min((f.streak / 30) * 100, 100)}%`,
                    background: f.color,
                  }}
                  role="progressbar"
                  aria-valuenow={f.streak}
                  aria-valuemin={0}
                  aria-valuemax={30}
                  aria-label={`${f.name}: ${f.streak} day streak`}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
