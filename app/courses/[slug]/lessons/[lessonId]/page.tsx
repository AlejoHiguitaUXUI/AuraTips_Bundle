import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { youTubeEmbedUrl } from "@/lib/youtube";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, module_id, modules ( course_id )")
    .eq("id", lessonId)
    .maybeSingle();

  const lessonCourseId = Array.isArray(lesson?.modules)
    ? lesson?.modules[0]?.course_id
    : lesson?.modules?.course_id;

  if (!lesson || lessonCourseId !== course.id) {
    notFound();
  }

  // lesson_contents is RLS-gated to owner-or-enrolled. If the viewer is
  // neither, this simply returns no row — that's the enforcement point,
  // not a redirect we compute client-side.
  const { data: content } = await supabase
    .from("lesson_contents")
    .select("body_md, youtube_url")
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (!content) {
    return (
      <section>
        <p>
          <Link href={`/courses/${course.slug}`}>← Back to {course.title}</Link>
        </p>
        <h1>{lesson.title}</h1>
        <div className="empty-state">
          <p>
            {user
              ? "You need to enroll in this course to view this lesson."
              : "Sign in and enroll to view this lesson."}
          </p>
          <Link href={`/courses/${course.slug}`} className="btn">
            Go to course
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p>
        <Link href={`/courses/${course.slug}`}>← Back to {course.title}</Link>
      </p>
      <h1>{lesson.title}</h1>

      {content.youtube_url && (
        <div style={{ aspectRatio: "16/9", marginBottom: 16 }}>
          <iframe
            src={youTubeEmbedUrl(content.youtube_url)}
            title={lesson.title}
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {content.body_md && (
        <article>
          <ReactMarkdown>{content.body_md}</ReactMarkdown>
        </article>
      )}
    </section>
  );
}
