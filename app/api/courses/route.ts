import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

import { getClinicalRole } from "@/lib/auth-role";

const SLUG_UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    return NextResponse.json(
      { error: "Acceso denegado: solo la Dirección Clínica o Especialistas pueden crear protocolos." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : null;
  const coverUrl =
    typeof body.cover_url === "string" && body.cover_url.trim()
      ? body.cover_url.trim()
      : null;

  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 },
    );
  }

  const baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json(
      { error: "Title must contain at least one letter or number." },
      { status: 400 },
    );
  }

  // Retry with -2, -3, ... suffixes on slug collision.
  for (let attempt = 0; attempt < 20; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const category = typeof body.category === "string" ? body.category : "Inyectables";
    const recoveryTime = typeof body.recovery_time === "string" ? body.recovery_time : "24 a 48 horas";
    const painLevel = typeof body.pain_level === "number" ? body.pain_level : 2;
    const resultsDuration = typeof body.results_duration === "string" ? body.results_duration : "6 a 12 meses";
    const anesthesiaType = typeof body.anesthesia_type === "string" ? body.anesthesia_type : "Tópica";
    const alarmSigns = Array.isArray(body.alarm_signs) ? body.alarm_signs : [];

    const { data, error } = await supabase
      .from("courses")
      .insert({
        owner_id: user.id,
        title,
        slug,
        description,
        cover_url: coverUrl,
        category,
        recovery_time: recoveryTime,
        pain_level: painLevel,
        results_duration: resultsDuration,
        anesthesia_type: anesthesiaType,
        alarm_signs: alarmSigns,
        price: 0,
        status: "draft",
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      if (body.with_default_stages !== false) {
        const defaultStages = [
          {
            title: "Fase Inmediata (Primeras 24 horas críticas)",
            position: 0,
            lesson: {
              title: "Cuidados iniciales y reposo relativo",
              timeline_tag: "Día 0",
              care_type: "reposo",
              body_md: "Pautas de cuidado crítico inmediato tras el procedimiento.",
              dos: [
                "Aplicar frío local seco en intervalos de 10 a 15 minutos.",
                "Mantener la cabeza ligeramente elevada al descansar.",
                "Ingerir abundante agua (2 a 2.5 litros al día)."
              ],
              donts: [
                "No frotar, masajear ni comprimir la zona tratada.",
                "Evitar fuentes de calor directo (sauna, vapor o exposición al sol).",
                "No realizar actividad física o esfuerzos extenuantes."
              ],
              checklist_items: [
                { id: "chk-1", label: "Apliqué frío local según la indicación", required: true },
                { id: "chk-2", label: "Mantuve reposo relativo sin frotar la zona", required: true },
                { id: "chk-3", label: "Bebí abundante agua para facilitar el drenaje", required: true }
              ]
            }
          },
          {
            title: "Fase de Desinflamación (Días 1 a 3)",
            position: 1,
            lesson: {
              title: "Control de edema y fotoprotección activa",
              timeline_tag: "Días 1 a 3",
              care_type: "fotoproteccion",
              body_md: "Durante este periodo el proceso inflamatorio se estabiliza y comienza la desinflamación.",
              dos: [
                "Aplicar fotoprotector solar SPF 50+ cada 3 a 4 horas.",
                "Limpieza suave con limpiador syndet dermoestético.",
                "Dormir boca arriba en posición neutra."
              ],
              donts: [
                "No consumir bebidas alcohólicas ni alimentos con exceso de sodio.",
                "No aplicar cosméticos con ácidos o exfoliantes mecánicos."
              ],
              checklist_items: [
                { id: "chk-4", label: "Aplicación de protector solar cada 3 horas", required: true },
                { id: "chk-5", label: "Limpieza dermoestética suave completada", required: true }
              ]
            }
          },
          {
            title: "Fase de Consolidación y Mantenimiento",
            position: 2,
            lesson: {
              title: "Seguimiento médico y valoración de resultados",
              timeline_tag: "Día 4 en adelante",
              care_type: "general",
              body_md: "Fase de asentamiento de resultados clínicos y preparación para la valoración médica.",
              dos: [
                "Reanudar actividades habituales de forma progresiva.",
                "Mantener hidratación cutánea recomendada.",
                "Agendar y asistir a la cita de control de evolución médica."
              ],
              donts: [
                "No realizar otros tratamientos agresivos en la misma zona sin autorización previa."
              ],
              checklist_items: [
                { id: "chk-6", label: "Revisé la simetría y confort de la zona", required: true },
                { id: "chk-7", label: "Agendé mi cita de control en AuraMed", required: true }
              ]
            }
          }
        ];

        for (const st of defaultStages) {
          const { data: mod } = await supabase
            .from("modules")
            .insert({ course_id: data.id, title: st.title, position: st.position })
            .select("id")
            .single();

          if (mod) {
            const { data: les } = await supabase
              .from("lessons")
              .insert({
                module_id: mod.id,
                title: st.lesson.title,
                position: 0,
                timeline_tag: st.lesson.timeline_tag,
                care_type: st.lesson.care_type,
                is_alarm: false,
              })
              .select("id")
              .single();

            if (les) {
              await supabase.from("lesson_contents").insert({
                lesson_id: les.id,
                body_md: st.lesson.body_md,
                dos: st.lesson.dos,
                donts: st.lesson.donts,
                checklist_items: st.lesson.checklist_items,
                emergency_contacts: "+57 300 123 4567 (Dra. Mariana Gómez)",
              });
            }
          }
        }
      }

      return NextResponse.json({ course: data }, { status: 201 });
    }

    if (error && error.code !== SLUG_UNIQUE_VIOLATION) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // else: slug collision, loop and try the next suffix
  }

  return NextResponse.json(
    { error: "Could not generate a unique slug. Try a different title." },
    { status: 409 },
  );
}
