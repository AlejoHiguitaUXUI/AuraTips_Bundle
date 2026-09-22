import { NextResponse } from "next/server";
import { searchCoursesBySimilarity } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    const courses = await searchCoursesBySimilarity(query, 5, supabase);

    const formattedCourses = (courses || []).map((course: any) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category || "Inyectables",
      recovery_time: course.recovery_time || "24-48 horas",
      pain_level: course.pain_level ?? 2,
      results_duration: course.results_duration || "6 a 12 meses",
      alarm_signs: course.alarm_signs || [],
      cover_url: course.cover_url || null,
      precio: course.price ?? course.precio ?? 0,
      price: course.price ?? course.precio ?? 0,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
