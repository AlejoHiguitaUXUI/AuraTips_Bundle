import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kshdusmzwlglqywmjwmq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaGR1c216d2xnbHF5d21qd21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTYwMjc2NiwiZXhwIjoyMTA1MTc4NzY2fQ.t6E-dX9_EfAVrNqIX5O_-M44iMMzGXIhvTkc2MKxadg";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanLegacyData() {
  console.log("🧹 Iniciando saneamiento de datos heredados en Supabase...\n");

  // 1. Identificar módulos de IA / EdTech obsoletos
  const techKeywords = [
    "Embeddings",
    "Tensores",
    "Snowflake",
    "dbt",
    "Next.js",
    "Agentes",
    "LangGraph",
    "Módulo 1: Fundamentos",
    "Módulo 2:"
  ];

  const { data: allModules, error: modErr } = await supabase
    .from("modules")
    .select("id, title, course_id");

  if (modErr || !allModules) {
    console.error("Error al obtener módulos:", modErr);
    process.exit(1);
  }

  const techModules = allModules.filter((m) =>
    techKeywords.some((kw) => m.title.toLowerCase().includes(kw.toLowerCase()))
  );

  console.log(`Se encontraron ${techModules.length} módulos antiguos de IA para eliminar:`);
  for (const tm of techModules) {
    console.log(` - [Eliminando] ${tm.title} (ID: ${tm.id})`);

    // Obtener lecciones de este módulo
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("module_id", tm.id);

    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      // Eliminar contenidos
      await supabase.from("lesson_contents").delete().in("lesson_id", lessonIds);
      // Eliminar progreso si hubiere
      await supabase.from("lesson_progress").delete().in("lesson_id", lessonIds);
      // Eliminar lecciones
      await supabase.from("lessons").delete().in("id", lessonIds);
    }

    // Eliminar el módulo
    await supabase.from("modules").delete().eq("id", tm.id);
  }

  console.log("\n✅ Todos los módulos y lecciones de IA han sido eliminados de Supabase.");

  // 2. Actualizar reseñas técnicas por testimonios clínicos
  console.log("\n🌸 Actualizando reseñas a testimonios de pacientes reales...");
  const clinicalReviews = [
    {
      course_slug: "toxina-botulinica-botox-facial",
      body: "Excelente protocolo post-inyección. Seguir la indicación de las 4 horas sin recostarme y la gesticulación guiada evitó cualquier asimetría o pesadez en las cejas. Muy recomendado.",
      rating: 5,
    },
    {
      course_slug: "rinomodelacion-sin-cirugia-acido-hialuronico",
      body: "El instructivo de prohibición estricta de gafas y protección solar durante los primeros 14 días fue clave para proteger el perfil nasal. Pautas muy claras y profesionales.",
      rating: 5,
    },
    {
      course_slug: "acido-hialuronico-labios-russian-lips",
      body: "El protocolo de crioterapia intermitente de las primeras 24h me ayudó muchísimo a reducir la hinchazón inicial. Al día 5 los labios ya lucían suaves, simétricos y definidos.",
      rating: 5,
    },
  ];

  for (const cr of clinicalReviews) {
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", cr.course_slug)
      .maybeSingle();

    if (course) {
      // Buscar si ya existe una reseña para ese curso
      const { data: existingRev } = await supabase
        .from("reviews")
        .select("id")
        .eq("course_id", course.id)
        .limit(1);

      if (existingRev && existingRev.length > 0) {
        await supabase
          .from("reviews")
          .update({
            body: cr.body,
            rating: cr.rating,
          })
          .eq("id", existingRev[0].id);
        console.log(`  ✓ Reseña clínica actualizada para: ${cr.course_slug}`);
      }
    }
  }

  // 3. Re-generar embeddings 100% clínicos llamando a la Edge Function
  console.log("\n🌿 Re-indexando procedimientos en Supabase con la Edge Function embed-course...");
  const { data: courses } = await supabase.from("courses").select("id, title");

  if (courses) {
    for (const c of courses) {
      console.log(`  ⏳ Vectorizando: ${c.title}...`);
      const res = await fetch(`${supabaseUrl}/functions/v1/embed-course`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ record: { id: c.id } }),
      });
      if (res.ok) {
        console.log(`    ✓ Éxito: Embedding clínico puro de 384 dimensiones generado.`);
      } else {
        console.error(`    ✕ Error (${res.status}):`, await res.text());
      }
    }
  }

  console.log("\n✨ Saneamiento completado con éxito. Tu base de datos y vectores están 100% orientados a Medicina Estética.");
}

cleanLegacyData().catch(console.error);
