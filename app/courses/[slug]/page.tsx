import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";
import { EnrollButton } from "@/components/EnrollButton";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS: visible if status='published' OR owner_id = caller. A draft
  // requested by a non-owner (or anonymous visitor) returns no row here,
  // which we treat as "does not exist".
  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, cover_url, status, owner_id, profiles ( display_name, bio, avatar_url )",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const isOwner = user?.id === course.owner_id;

  const [{ data: modules }, { data: ratingRow }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, title, position, lessons ( id, title, position )")
      .eq("course_id", course.id)
      .order("position", { ascending: true }),
    supabase
      .from("course_ratings")
      .select("avg_rating, review_count")
      .eq("course_id", course.id)
      .maybeSingle(),
  ]);

  let isEnrolled = false;
  if (user && !isOwner) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, user_id, rating, body, created_at, profiles ( display_name )")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });

  const myReview = user
    ? (reviews ?? []).find((r) => r.user_id === user.id) ?? null
    : null;

  const author = Array.isArray(course.profiles)
    ? course.profiles[0]
    : course.profiles;

  return (
    <section>
      {course.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.cover_url}
          alt=""
          style={{
            width: "100%",
            maxHeight: 320,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
      )}

      {course.status === "draft" && isOwner && (
        <p className="muted">This course is a draft — only you can see it.</p>
      )}

      <h1>{course.title}</h1>
      <p className="muted">
        by {author?.display_name ?? "Unknown"}
        {author?.bio ? ` — ${author.bio}` : ""}
      </p>
      <RatingBadge
        avgRating={ratingRow?.avg_rating ?? null}
        reviewCount={ratingRow?.review_count ?? 0}
      />

      {course.description && <p>{course.description}</p>}

      <EnrollButton
        courseId={course.id}
        courseSlug={course.slug}
        isSignedIn={!!user}
        isOwner={isOwner}
        isEnrolled={isEnrolled}
      />

      <h2>Lessons</h2>
      <ul>
        {(modules ?? []).map((m) => (
          <li key={m.id} style={{ marginBottom: 8 }}>
            <strong>{m.title}</strong>
            <ul>
              {(m.lessons ?? [])
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((l) => (
                  <li key={l.id}>
                    {isEnrolled || isOwner ? (
                      <a href={`/courses/${course.slug}/lessons/${l.id}`}>
                        {l.title}
                      </a>
                    ) : (
                      <span>{l.title}</span>
                    )}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2>Reviews</h2>
      {user && isEnrolled && (
        <ReviewForm courseId={course.id} existingReview={myReview} />
      )}
      <ReviewList reviews={reviews ?? []} />
    </section>
  );
}
