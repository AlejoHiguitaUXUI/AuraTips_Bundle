import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";

export const metadata = {
  title: "Course Catalog",
};

export default async function CatalogPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, cover_url, owner_id, profiles ( display_name )")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);
  const { data: ratings } = courseIds.length
    ? await supabase
        .from("course_ratings")
        .select("course_id, avg_rating, review_count")
        .in("course_id", courseIds)
    : {
        data: [] as {
          course_id: string;
          avg_rating: number | null;
          review_count: number;
        }[],
      };
  const ratingsByCourse = new Map(
    (ratings ?? []).map((r) => [r.course_id, r])
  );

  return (
    <>
      {/* Hero */}
      <section
        className="catalog-hero animate-fade-in"
        aria-labelledby="catalog-heading"
      >
        <h1 id="catalog-heading">Learn without limits.</h1>
        <p>
          Explore expert-led courses and start building skills that matter —
          at your own pace, anytime.
        </p>
      </section>

      {/* Error state */}
      {error && <div className="error">{error.message}</div>}

      {/* Empty state */}
      {!error && courses && courses.length === 0 && (
        <div className="empty-state animate-fade-in">
          <p>No courses published yet — check back soon.</p>
        </div>
      )}

      {/* Catalog grid */}
      {courses && courses.length > 0 && (
        <section
          className="catalog-grid stagger animate-slide-up"
          aria-label="Available courses"
        >
          {courses.map((c) => {
            const author = Array.isArray(c.profiles)
              ? c.profiles[0]
              : c.profiles;
            const rating = ratingsByCourse.get(c.id);

            return (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="course-card"
                aria-label={`${c.title} by ${author?.display_name ?? "Unknown"}`}
              >
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.cover_url}
                    alt=""
                    className="course-card-thumb"
                  />
                ) : (
                  /* Placeholder gradient thumb */
                  <div
                    className="course-card-thumb"
                    style={{
                      background: `linear-gradient(135deg,
                        hsl(${(c.title.charCodeAt(0) * 7) % 360}deg 60% 55%),
                        hsl(${(c.title.charCodeAt(0) * 13) % 360}deg 70% 65%))`,
                    }}
                    aria-hidden="true"
                  />
                )}

                <div className="course-card-body">
                  <p className="course-card-author">
                    {author?.display_name ?? "Unknown instructor"}
                  </p>
                  <h2 className="course-card-title">{c.title}</h2>
                  <RatingBadge
                    avgRating={rating?.avg_rating ?? null}
                    reviewCount={rating?.review_count ?? 0}
                  />
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
