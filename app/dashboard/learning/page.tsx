import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ResumeCard } from "../_components/ResumeCard";
import { StreakWidget } from "../_components/StreakWidget";
import { AiRecommendation } from "../_components/AiRecommendation";
import { FriendStreaks } from "../_components/FriendStreaks";
import { ProgressGrid } from "../_components/ProgressGrid";

export const metadata = { title: "My Learning" };

// Skeleton for streaming
function BentoSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`bento-card ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-base-2) 50%, var(--color-surface-2) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        minHeight: 200,
      }}
      aria-hidden="true"
    />
  );
}

export default async function LearningDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/learning");

  // Fetch enrollments with course data
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, courses ( id, title, slug, cover_url, status )")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  // Most recent active enrollment
  const latest = enrollments?.[0];
  const latestCourse =
    latest && (Array.isArray(latest.courses) ? latest.courses[0] : latest.courses);

  // Fetch modules for progress grid (first 3 courses)
  const activeCourseIds = (enrollments ?? [])
    .slice(0, 3)
    .map((e) => (Array.isArray(e.courses) ? e.courses[0]?.id : e.courses?.id))
    .filter(Boolean) as string[];

  const { data: modules } = activeCourseIds.length
    ? await supabase
        .from("modules")
        .select("id, title, position, course_id")
        .in("course_id", activeCourseIds)
        .order("position")
    : { data: [] };

  // Build progress data (no completed_modules table yet — show 0 progress)
  const courseProgressList = (enrollments ?? []).slice(0, 3).map((e) => {
    const course = Array.isArray(e.courses) ? e.courses[0] : e.courses;
    return {
      courseId: course?.id ?? "",
      courseTitle: course?.title ?? "",
      courseSlug: course?.slug ?? "",
      modules: (modules ?? []).filter((m) => m.course_id === course?.id),
      completedModuleIds: [] as string[],
      currentModuleId: undefined as string | undefined,
    };
  }).filter((c) => c.courseId);

  return (
    <section aria-labelledby="dashboard-heading">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-2)",
        }}
      >
        <h1
          id="dashboard-heading"
          style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "-0.02em" }}
        >
          Your learning
        </h1>
        <span className="badge badge-brand">
          {enrollments?.length ?? 0} course{enrollments?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* BENTO GRID */}
      <div className="bento-grid animate-fade-in">

        {/* A: Resume Learning */}
        <Suspense fallback={<BentoSkeleton className="bento-resume" />}>
          <ResumeCard
            course={latestCourse ?? null}
            progressPercent={0}
          />
        </Suspense>

        {/* B: Streak */}
        <StreakWidget streakDays={0} freezeAvailable={true} />

        {/* C: AI Recommendation */}
        <AiRecommendation
          lastCompletedTitle={latestCourse?.title}
          suggestion={undefined}
        />

        {/* D: Friend Streaks */}
        <FriendStreaks />

        {/* E: Progress Grid — only if enrolled */}
        {courseProgressList.length > 0 && (
          <ProgressGrid courses={courseProgressList} />
        )}

      </div>

      {/* Empty state when no enrollments */}
      {(!enrollments || enrollments.length === 0) && (
        <div className="empty-state animate-slide-up" style={{ marginTop: "var(--space-8)" }}>
          <p>You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/" className="btn">Browse the catalog</Link>
        </div>
      )}
    </section>
  );
}
