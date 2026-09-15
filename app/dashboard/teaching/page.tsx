import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TeachingDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/teaching");
  }

  // RLS already scopes this to the caller's own courses (published or draft);
  // filter by owner_id defensively too.
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, status, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Your courses</h1>
        <Link href="/dashboard/teaching/new" className="btn">
          New course
        </Link>
      </div>

      {error && <div className="error">{error.message}</div>}

      {!error && courses && courses.length === 0 && (
        <div className="empty-state">
          <p>You haven&apos;t created any courses yet.</p>
          <Link href="/dashboard/teaching/new" className="btn">
            Create your first course
          </Link>
        </div>
      )}

      {courses && courses.length > 0 && (
        <div className="grid">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/teaching/${c.slug}`}
              className="card"
              style={{ display: "block", color: "inherit" }}
            >
              <strong>{c.title}</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                {c.status === "published" ? "Published" : "Draft"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
