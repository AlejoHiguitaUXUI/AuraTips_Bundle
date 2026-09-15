import Link from "next/link";

interface Module {
  id: string;
  title: string;
  position: number;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  modules: Module[];
  /** IDs of completed modules */
  completedModuleIds: string[];
  /** ID of current (in-progress) module */
  currentModuleId?: string;
}

interface ProgressGridProps {
  courses: CourseProgress[];
}

export function ProgressGrid({ courses }: ProgressGridProps) {
  if (courses.length === 0) return null;

  return (
    <div className="bento-card bento-progress">
      <h3
        style={{
          fontSize: "var(--text-base)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--color-text)",
          marginBottom: "var(--space-5)",
        }}
      >
        Your progress
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "var(--space-5)",
        }}
      >
        {courses.map((c) => {
          const total = c.modules.length;
          const done = c.completedModuleIds.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link
              key={c.courseId}
              href={`/courses/${c.courseSlug}`}
              style={{ textDecoration: "none", color: "inherit" }}
              aria-label={`${c.courseTitle} — ${pct}% complete`}
            >
              <div
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-base-2)",
                  border: "1px solid var(--color-border)",
                  transition: "border-color var(--dur-base) var(--ease-out)",
                }}
                className="card-hover"
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--fw-medium)",
                      color: "var(--color-text)",
                      lineHeight: 1.3,
                      flex: 1,
                      marginRight: "var(--space-3)",
                    }}
                    className="truncate"
                  >
                    {c.courseTitle}
                  </p>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: "var(--fw-bold)",
                      color: pct === 100 ? "var(--color-success)" : "var(--color-brand)",
                      flexShrink: 0,
                    }}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Segmented node progress */}
                <div
                  className="progress-segments"
                  role="progressbar"
                  aria-valuenow={done}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label={`${done} of ${total} modules completed`}
                >
                  {c.modules.map((m) => {
                    const isDone = c.completedModuleIds.includes(m.id);
                    const isCurrent = m.id === c.currentModuleId;
                    return (
                      <div
                        key={m.id}
                        className={`progress-segment ${isDone ? "done" : isCurrent ? "current" : ""}`}
                        title={m.title}
                      />
                    );
                  })}
                </div>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", marginTop: "var(--space-2)" }}>
                  {done}/{total} modules
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
