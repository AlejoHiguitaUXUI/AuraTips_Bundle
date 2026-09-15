import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseEditor } from "@/components/CourseEditor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/teaching/${slug}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, owner_id, title, slug, description, cover_url, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!course || course.owner_id !== user.id) {
    // RLS already hides other owners' drafts; this also covers the case
    // where a non-owner requests a published course's edit URL.
    notFound();
  }

  const { data: modules } = await supabase
    .from("modules")
    .select(
      "id, title, position, lessons ( id, title, position, lesson_contents ( body_md, youtube_url ) )",
    )
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const initialModules = (modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    lessons: (m.lessons ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((l) => {
        // lesson_contents is a 1:1 reverse FK but supabase-js types the
        // embed as an array; take the single row if present.
        const content = Array.isArray(l.lesson_contents)
          ? l.lesson_contents[0]
          : l.lesson_contents;
        return {
          id: l.id,
          title: l.title,
          position: l.position,
          body_md: content?.body_md ?? "",
          youtube_url: content?.youtube_url ?? "",
        };
      }),
  }));

  return <CourseEditor course={course} initialModules={initialModules} />;
}
