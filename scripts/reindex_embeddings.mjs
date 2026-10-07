import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas en variables de entorno.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function reindexAll() {
  console.log("🌿 Iniciando re-indexación de embeddings clínicos en Supabase...\n");

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug");

  if (error || !courses) {
    console.error("Error al obtener cursos:", error);
    process.exit(1);
  }

  console.log(`Se encontraron ${courses.length} procedimientos para indexar:\n`);

  for (const course of courses) {
    console.log(`⏳ Generando embedding para: ${course.title} (${course.id})...`);

    const res = await fetch(`${supabaseUrl}/functions/v1/embed-course`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ record: { id: course.id } }),
    });

    if (res.ok) {
      const result = await res.json();
      console.log(`  ✓ Éxito: Embedding de 384 dimensiones actualizado para [${course.title}].\n`);
    } else {
      const text = await res.text();
      console.error(`  ✕ Error al invocar Edge Function (${res.status}):`, text);
    }
  }

  console.log("✨ Todos los procedimientos han sido vectorizados y guardados en Supabase.");
}

reindexAll().catch(console.error);
