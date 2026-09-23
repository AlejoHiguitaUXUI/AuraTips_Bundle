import { NextResponse } from "next/server";
import { searchCoursesBySimilarity } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";
import { CLINICAL_PROCEDURES, getProcedureBySlug } from "@/lib/clinical-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ courses: [], query: "", total: 0 });
    }

    let formattedCourses: any[] = [];

    try {
      const supabase = await createClient();
      const courses = await searchCoursesBySimilarity(query, 5, supabase);
      if (courses && courses.length > 0) {
        formattedCourses = courses.map((course: any) => {
          const spec = getProcedureBySlug(course.slug);
          const initialLesson = spec?.modules?.[0]?.lessons?.[0];
          return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description || spec?.description || "",
            category: spec?.category || course.category || "Facial",
            recovery_time: spec?.recovery_time || course.recovery_time || "24-48 horas",
            pain_level: spec?.pain_level ?? course.pain_level ?? 2,
            results_duration: spec?.results_duration || course.results_duration || "6 a 12 meses",
            anesthesia_type: spec?.anesthesia_type || "Tópica o frío local",
            alarm_signs: spec?.alarm_signs || course.alarm_signs || [],
            care_dos: initialLesson?.dos?.slice(0, 4) || [],
            care_donts: initialLesson?.donts?.slice(0, 4) || [],
            cover_url: course.cover_url || spec?.cover_url || null,
            precio: course.price ?? course.precio ?? 0,
            price: course.price ?? course.precio ?? 0,
          };
        });
      }
    } catch (dbErr) {
      console.warn("DB similarity search fallback to clinical data:", dbErr);
    }

    // Si la base de datos no arrojó resultados o falló, buscar en el catálogo clínico
    if (formattedCourses.length === 0) {
      const normalizedQuery = query.toLowerCase().trim();
      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

      const matched = CLINICAL_PROCEDURES.filter((p) => {
        const fullHaystack = `${p.title} ${p.description} ${p.category} ${p.slug} ${p.alarm_signs.join(" ")}`.toLowerCase();
        // Coincidencia exacta o por tokens
        return fullHaystack.includes(normalizedQuery) || tokens.some((t) => fullHaystack.includes(t));
      });

      const candidates = matched.length > 0 ? matched : CLINICAL_PROCEDURES.slice(0, 5);

      formattedCourses = candidates.map((p) => {
        const initialLesson = p.modules?.[0]?.lessons?.[0];
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          category: p.category,
          recovery_time: p.recovery_time,
          pain_level: p.pain_level,
          results_duration: p.results_duration,
          anesthesia_type: p.anesthesia_type,
          alarm_signs: p.alarm_signs,
          care_dos: initialLesson?.dos?.slice(0, 4) || [],
          care_donts: initialLesson?.donts?.slice(0, 4) || [],
          cover_url: p.cover_url,
          precio: p.price,
          price: p.price,
        };
      });
    }

    return NextResponse.json({
      courses: formattedCourses,
      query,
      total: formattedCourses.length,
    });
  } catch (error: any) {
    console.error("API /courses/search critical error:", error);
    return NextResponse.json({ courses: [], query: "", total: 0 });
  }
}
