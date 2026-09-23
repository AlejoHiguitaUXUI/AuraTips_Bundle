import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CLINICAL_PROCEDURES } from "@/lib/clinical-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Obtener o crear especialista médico
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let instructor = listData.users.find(
      (u) => u.email?.toLowerCase() === "especialista@auratips.io"
    );

    if (!instructor) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: "especialista@auratips.io",
        password: "Password123!",
        email_confirm: true,
        user_metadata: { full_name: "Dra. Mariana Gómez" },
      });
      if (createError) throw createError;
      instructor = createData.user;
    }

    await supabase.from("profiles").upsert({
      id: instructor.id,
      display_name: "Dra. Mariana Gómez",
      bio: "Médica Especialista en Medicina Estética Facial y Armonización. Directora de Protocolos Clínicos en AuraTips & AuraMed Medellín.",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
      updated_at: new Date().toISOString(),
    });

    // 2. Obtener o crear paciente demo
    let patient = listData.users.find(
      (u) => u.email?.toLowerCase() === "paciente@auratips.io"
    );

    if (!patient) {
      const { data: pData, error: pErr } = await supabase.auth.admin.createUser({
        email: "paciente@auratips.io",
        password: "Password123!",
        email_confirm: true,
        user_metadata: { full_name: "Ana Gómez" },
      });
      if (pErr) throw pErr;
      patient = pData.user;
    }

    await supabase.from("profiles").upsert({
      id: patient.id,
      display_name: "Ana Gómez",
      bio: "Paciente en seguimiento activo de cuidados post-tratamiento estético.",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      updated_at: new Date().toISOString(),
    });

    // 3. Sincronizar todos los 20 procedimientos en Supabase (courses, modules, lessons, lesson_contents)
    const results = [];

    for (const proc of CLINICAL_PROCEDURES) {
      let { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", proc.slug)
        .maybeSingle();

      let courseId: string;
      const coursePayload = {
        owner_id: instructor.id,
        title: proc.title,
        slug: proc.slug,
        description: proc.description,
        cover_url: proc.cover_url,
        status: "published",
        price: proc.price || 0,
        category: proc.category,
        recovery_time: proc.recovery_time,
        pain_level: proc.pain_level,
        duration_minutes: proc.duration_minutes,
        results_duration: proc.results_duration,
        anesthesia_type: proc.anesthesia_type,
        alarm_signs: proc.alarm_signs,
        updated_at: new Date().toISOString(),
      };

      if (course) {
        courseId = course.id;
        const { error: updateErr } = await supabase
          .from("courses")
          .update(coursePayload)
          .eq("id", courseId);
        if (updateErr) throw updateErr;
      } else {
        const { data: newCourse, error: cErr } = await supabase
          .from("courses")
          .insert(coursePayload)
          .select("id")
          .single();
        if (cErr) throw cErr;
        courseId = newCourse.id;
      }

      // Sincronizar módulos y lecciones
      if (proc.modules && proc.modules.length > 0) {
        for (const modData of proc.modules) {
          let { data: mod } = await supabase
            .from("modules")
            .select("id")
            .eq("course_id", courseId)
            .eq("title", modData.title)
            .maybeSingle();

          if (!mod) {
            const { data: newMod, error: mErr } = await supabase
              .from("modules")
              .insert({
                course_id: courseId,
                title: modData.title,
                position: modData.position,
              })
              .select("id")
              .single();
            if (mErr) throw mErr;
            mod = newMod;
          } else {
            await supabase
              .from("modules")
              .update({ position: modData.position })
              .eq("id", mod.id);
          }

          if (mod && modData.lessons) {
            for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
              const lesData = modData.lessons[lIdx];
              const lessonPos = (lesData as any).position || (lIdx + 1);

              let { data: les } = await supabase
                .from("lessons")
                .select("id")
                .eq("module_id", mod.id)
                .eq("title", lesData.title)
                .maybeSingle();

              if (!les) {
                const { data: newLes, error: lErr } = await supabase
                  .from("lessons")
                  .insert({
                    module_id: mod.id,
                    title: lesData.title,
                    position: lessonPos,
                    care_type: lesData.care_type || "allowed",
                    timeline_tag: lesData.timeline_tag || modData.timeline_tag || "Día 0",
                  })
                  .select("id")
                  .single();
                if (lErr) throw lErr;
                les = newLes;
              } else {
                await supabase
                  .from("lessons")
                  .update({
                    position: lessonPos,
                    care_type: lesData.care_type || "allowed",
                    timeline_tag: lesData.timeline_tag || modData.timeline_tag || "Día 0",
                  })
                  .eq("id", les.id);
              }

              if (les) {
                await supabase.from("lesson_contents").upsert({
                  lesson_id: les.id,
                  body_md: lesData.body_md,
                  dos: lesData.dos || [],
                  donts: lesData.donts || [],
                  checklist_items: lesData.checklist || [],
                  updated_at: new Date().toISOString(),
                });
              }
            }
          }
        }
      }

      results.push({
        id: courseId,
        title: proc.title,
        slug: proc.slug,
        category: proc.category,
      });
    }

    // Inscripción demo
    const { data: botoxCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", "toxina-botulinica-botox-facial")
      .single();

    if (botoxCourse && patient) {
      await supabase.from("enrollments").upsert(
        {
          user_id: patient.id,
          course_id: botoxCourse.id,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `¡Sincronización completa! Se han registrado ${results.length} procedimientos en las tablas 'courses', 'modules', 'lessons' y 'lesson_contents' de Supabase.`,
      count: results.length,
      procedures: results,
    });
  } catch (err: any) {
    console.error("Error en sincronización Supabase:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
