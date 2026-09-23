import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getOrCreateUser(email, password, userMetadata, profileData) {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  let user = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.log(`Creando usuario en Auth: ${email}...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (createError) throw createError;
    user = createData.user;
  } else {
    console.log(`Usuario existente: ${email} (${user.id})`);
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: userMetadata,
    });
  }

  // Actualizar perfil clínico
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: profileData.display_name,
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error(`Error actualizando perfil para ${email}:`, profileError);
    throw profileError;
  }

  console.log(`Perfil actualizado: ${profileData.display_name} (${email})`);
  return user;
}

async function main() {
  console.log("=== INICIANDO SEED CLÍNICO AURATIPS (20 PROCEDIMIENTOS) ===");

  // 1. Usuarios
  const instructor = await getOrCreateUser(
    "especialista@auratips.io",
    "Password123!",
    { full_name: "Dra. Mariana Gómez" },
    {
      display_name: "Dra. Mariana Gómez",
      bio: "Médica Especialista en Medicina Estética Facial y Armonización. Directora de Protocolos Clínicos en AuraTips & AuraMed Medellín.",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    }
  );

  const patient = await getOrCreateUser(
    "paciente@auratips.io",
    "Password123!",
    { full_name: "Ana Gómez" },
    {
      display_name: "Ana Gómez",
      bio: "Paciente en seguimiento activo de cuidados post-tratamiento estético.",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    }
  );

  // 2. Cargar Dataset de 20 Procedimientos
  const datasetPath = path.join(__dirname, "clinical-procedures-dataset.json");
  const proceduresData = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));

  console.log(`Cargando y sincronizando ${proceduresData.length} procedimientos en Supabase...`);

  for (const proc of proceduresData) {
    let { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", proc.slug)
      .maybeSingle();

    let courseId;
    const coursePayload = {
      owner_id: instructor.id,
      title: proc.title,
      slug: proc.slug,
      description: proc.description,
      cover_url: proc.cover_url,
      status: proc.status || "published",
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
      await supabase.from("courses").update(coursePayload).eq("id", courseId);
      console.log(`[ACTUALIZADO] [${proc.category}] ${proc.title}`);
    } else {
      const { data: newCourse, error: cErr } = await supabase
        .from("courses")
        .insert(coursePayload)
        .select("id")
        .single();
      if (cErr) throw cErr;
      courseId = newCourse.id;
      console.log(`[CREADO] [${proc.category}] ${proc.title}`);
    }

    // Módulos y Lecciones
    if (proc.modules && Array.isArray(proc.modules)) {
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
              position: modData.position || 1,
            })
            .select("id")
            .single();
          if (mErr) throw mErr;
          mod = newMod;
        } else {
          await supabase
            .from("modules")
            .update({ position: modData.position || 1 })
            .eq("id", mod.id);
        }

        if (mod && modData.lessons && Array.isArray(modData.lessons)) {
          for (const lesData of modData.lessons) {
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
                  position: lesData.position || 1,
                  care_type: lesData.care_type || "allowed",
                  timeline_tag: lesData.timeline_tag || "Día 0",
                })
                .select("id")
                .single();
              if (lErr) throw lErr;
              les = newLes;
            } else {
              await supabase
                .from("lessons")
                .update({
                  position: lesData.position || 1,
                  care_type: lesData.care_type || "allowed",
                  timeline_tag: lesData.timeline_tag || "Día 0",
                })
                .eq("id", les.id);
            }

            if (les) {
              const content = Array.isArray(lesData.lesson_contents)
                ? lesData.lesson_contents[0]
                : lesData.lesson_contents || lesData;

              await supabase.from("lesson_contents").upsert({
                lesson_id: les.id,
                body_md: content?.body_md || lesData.body_md || "",
                dos: content?.dos || lesData.dos || [],
                donts: content?.donts || lesData.donts || [],
                checklist_items: content?.checklist_items || lesData.checklist || [],
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }
    }
  }

  // 3. Inscripción de Paciente Demo
  const { data: botoxCourse } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "toxina-botulinica-botox-facial")
    .single();

  if (botoxCourse) {
    await supabase.from("enrollments").upsert(
      {
        user_id: patient.id,
        course_id: botoxCourse.id,
        status: "active",
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" }
    );
    console.log("Inscripción de seguimiento demo activa para Ana Gómez.");
  }

  console.log("\n✅ ¡Seed clínico de 20 procedimientos completado exitosamente en Supabase!");
}

main().catch(console.error);
