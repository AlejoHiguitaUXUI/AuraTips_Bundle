import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicalRole } from "@/lib/auth-role";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    return NextResponse.json(
      {
        error:
          "Los protocolos clínicos son asignados directamente por tu especialista en AuraMed al finalizar tu procedimiento.",
      },
      { status: 403 },
    );
  }

  // Already enrolled? Treat as a no-op success rather than an error.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ enrollment: existing }, { status: 200 });
  }

  // RLS also enforces: user_id = auth.uid() AND target course is published.
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId })
    .select("id")
    .single();

  if (error) {
    // Unique violation (race) => already enrolled, not an error to the user.
    if (error.code === "23505") {
      return NextResponse.json({ enrolled: true }, { status: 200 });
    }
    return NextResponse.json(
      { error: "Could not enroll. The course may not be published." },
      { status: 400 },
    );
  }

  return NextResponse.json({ enrollment: data }, { status: 201 });
}
