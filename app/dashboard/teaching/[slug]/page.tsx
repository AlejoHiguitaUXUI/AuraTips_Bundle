import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseEditor } from "@/components/CourseEditor";
import { getProcedureBySlug } from "@/lib/clinical-data";

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

  const { data: dbCourse } = await supabase
    .from("courses")
    .select("id, owner_id, title, slug, description, cover_url, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!dbCourse || dbCourse.owner_id !== user.id) {
    notFound();
  }

  const clinicalSpec = getProcedureBySlug(slug);
  const course = {
    id: dbCourse.id,
    owner_id: dbCourse.owner_id,
    title: dbCourse.title,
    slug: dbCourse.slug,
    description: dbCourse.description,
    cover_url: dbCourse.cover_url,
    status: dbCourse.status,
    category: (dbCourse as any).category || clinicalSpec?.category || "Inyectables",
    recovery_time: (dbCourse as any).recovery_time || clinicalSpec?.recovery_time || "24 a 48 horas",
    pain_level: (dbCourse as any).pain_level ?? clinicalSpec?.pain_level ?? 2,
    results_duration: (dbCourse as any).results_duration || clinicalSpec?.results_duration || "6 a 12 meses",
    anesthesia_type: (dbCourse as any).anesthesia_type || clinicalSpec?.anesthesia_type || "Tópica",
    alarm_signs: (dbCourse as any).alarm_signs?.length ? (dbCourse as any).alarm_signs : clinicalSpec?.alarm_signs || [],
  };

  const { data: modules } = await supabase
    .from("modules")
    .select(
      "id, title, position, lessons ( id, title, position, timeline_tag, is_alarm, care_type, lesson_contents ( body_md, youtube_url, dos, donts, checklist_items, emergency_contacts ) )",
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
      .map((l: any) => {
        const content = Array.isArray(l.lesson_contents)
          ? l.lesson_contents[0]
          : l.lesson_contents;
        return {
          id: l.id,
          title: l.title,
          position: l.position,
          timeline_tag: l.timeline_tag || "Día 0",
          is_alarm: Boolean(l.is_alarm),
          care_type: l.care_type || "general",
          body_md: content?.body_md ?? "",
          youtube_url: content?.youtube_url ?? "",
          dos: content?.dos || [],
          donts: content?.donts || [],
          checklist_items: content?.checklist_items || [],
          emergency_contacts: content?.emergency_contacts || "",
        };
      }),
  }));

  return <CourseEditor course={course} initialModules={initialModules} />;
}
