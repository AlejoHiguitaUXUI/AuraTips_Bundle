import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
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

const CLINICAL_DATA = [
  {
    title: "Toxina Botulínica Facial (Botox)",
    slug: "toxina-botulinica-botox-facial",
    description: "Protocolo médico integral de relajación neuromuscular selectiva para líneas de expresión frontales, glabelares (entrecejo) y patas de gallo. Guía de recuperación y prevención de asimetrías.",
    cover_url: "/images/botox.jpg",
    status: "published",
    price: 0,
    modules: [
      {
        title: "Fase Inmediata: Primeras 4 Horas Críticas",
        position: 1,
        lessons: [
          {
            title: "Postura erguida y gesticulación guiada",
            position: 1,
            body_md: "### Primeras horas tras la microinyección\n\nDurante las primeras 4 horas, la molécula se fija a los receptores presinápticos.\n\n* Mantén la cabeza erguida.\n* Realiza gesticulaciones suaves cada 15 minutos.\n* No te recuestes ni tomes siestas durante 4 horas.",
          },
        ],
      },
      {
        title: "Fase de Estabilización: Primeras 24 a 48 Horas",
        position: 2,
        lessons: [
          {
            title: "Restricción de actividad física y control térmico",
            position: 1,
            body_md: "### Evitar vasodilatación y calor extremo\n\n* Suspende entrenamientos vigorosos por 48 horas.\n* Evita saunas, vapores y baños calientes.",
          },
        ],
      },
      {
        title: "Fase de Fijación y Resultados: Días 3 a 15",
        position: 3,
        lessons: [
          {
            title: "Evolución gradual y cita de control",
            position: 1,
            body_md: "### Línea de tiempo de los resultados\n\n* Día 3 a 5: Inicio de atenuación.\n* Día 14 a 15: Cita de control y retoque de simetría con tu especialista.",
          },
        ],
      },
    ],
  },
  {
    title: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    slug: "acido-hialuronico-labios-russian-lips",
    description: "Protocolo clínico para aumento, eversión sutil e hidratación profunda con ácido hialurónico reticulado. Manejo paso a paso de edema, hematomas y pautas de higiene post-inyección.",
    cover_url: "/images/lips.jpg",
    status: "published",
    price: 0,
    modules: [
      {
        title: "Fase Inmediata: Día 0 (Primeras 24 Horas)",
        position: 1,
        lessons: [
          {
            title: "Crioterapia intermitente y prevención de asimetrías",
            position: 1,
            body_md: "### Crioterapia indirecta\n\nAplica frío local envuelto en gasa limpia por 10 minutos cada 2 horas. Prohibido el uso de sorbetes o pajillas.",
          },
        ],
      },
      {
        title: "Fase de Asentamiento: Días 2 a 7",
        position: 2,
        lessons: [
          {
            title: "Manejo de hematomas y edema",
            position: 1,
            body_md: "### Regla de los 7 días\n\nEl volumen inicial puede parecer un 30% mayor debido a la retención hídrica natural. Duerme con la cabeza ligeramente elevada.",
          },
        ],
      },
    ],
  },
  {
    title: "Rinomodelación sin Cirugía con Ácido Hialurónico",
    slug: "rinomodelacion-sin-cirugia-acido-hialuronico",
    description: "Corrección no quirúrgica del dorso y elevación de la punta nasal. Pautas críticas de cuidado para garantizar la integración segura del implante y proteger la perfusión nasal.",
    cover_url: "/images/rhino.jpg",
    status: "published",
    price: 0,
    modules: [
      {
        title: "Cuidados Críticos: Primeras 48 Horas",
        position: 1,
        lessons: [
          {
            title: "Prohibición de anteojos y presión sobre el dorso",
            position: 1,
            body_md: "### Protección estructural del dorso\n\nProhibido apoyar monturas ópticas o gafas de sol sobre la nariz durante 14 días. Dormir boca arriba estricto.",
          },
        ],
      },
    ],
  },
  {
    title: "Peeling Químico Médico Facial (AHA / TCA / Retinoico)",
    slug: "peeling-quimico-medico-facial",
    description: "Exfoliación química controlada para renovación celular, manchas hiperpigmentarias, secuelas de acné y textura cutánea. Protocolo de reepitelización y protección solar de alta exigencia.",
    cover_url: "/images/peeling.jpg",
    status: "published",
    price: 0,
    modules: [
      {
        title: "Fase de Descamación y Barrera Cutánea: Días 1 a 5",
        position: 1,
        lessons: [
          {
            title: "Prohibición de arrancar pieles y nutrición tópica",
            position: 1,
            body_md: "### Regeneración cutánea\n\nBajo ninguna circunstancia tires de las pieles secas. Aplica hidratante reparador y protector solar SPF 50+ cada 3 horas.",
          },
        ],
      },
    ],
  },
  {
    title: "Bioestimulación Facial & Inducción de Colágeno",
    slug: "bioestimulacion-facial-colageno",
    description: "Protocolo médico de hidroxiapatita cálcica y polinucleótidos para recuperar firmeza dérmica, redensificación y luminosidad duradera.",
    cover_url: "https://images.unsplash.com/photo-1512290900672-1f48e3e4a2c5?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 0,
    modules: [
      {
        title: "Fase de Integración: Primeros 7 Días",
        position: 1,
        lessons: [
          {
            title: "Técnica de masaje 5-5-5 y fotoprotección",
            position: 1,
            body_md: "### Estimulación uniforme de colágeno\n\nRealiza masajes suaves 5 minutos, 5 veces al día durante los primeros 5 días.",
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("=== INICIANDO SEED CLÍNICO AESTHETICA ===");

  // 1. Usuarios
  const instructor = await getOrCreateUser(
    "especialista@auratips.io",
    "Password123!",
    { full_name: "Dra. Mariana Gómez" },
    {
      display_name: "Dra. Mariana Gómez",
      bio: "Médica Especialista en Medicina Estética Facial y Armonización. Directora de Protocolos Clínicos en AuraTips & Aesthetica Care.",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    }
  );

  const patient = await getOrCreateUser(
    "paciente@auratips.io",
    "Password123!",
    { full_name: "Ana Gómez" },
    {
      display_name: "Ana Gómez",
      bio: "Paciente en seguimiento activo de cuidados post-tratamiento estético facial.",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    }
  );

  // 2. Procedimientos
  for (const proc of CLINICAL_DATA) {
    let { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", proc.slug)
      .maybeSingle();

    let courseId;
    if (course) {
      courseId = course.id;
      await supabase
        .from("courses")
        .update({
          owner_id: instructor.id,
          title: proc.title,
          description: proc.description,
          cover_url: proc.cover_url,
          status: proc.status,
          price: proc.price,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);
      console.log(`Procedimiento actualizado: ${proc.title}`);
    } else {
      const { data: newCourse, error: cErr } = await supabase
        .from("courses")
        .insert({
          owner_id: instructor.id,
          title: proc.title,
          slug: proc.slug,
          description: proc.description,
          cover_url: proc.cover_url,
          status: proc.status,
          price: proc.price,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      courseId = newCourse.id;
      console.log(`Procedimiento creado: ${proc.title}`);
    }

    // Módulos y lecciones
    for (const modData of proc.modules) {
      let { data: mod } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId)
        .eq("title", modData.title)
        .maybeSingle();

      if (!mod) {
        const { data: newMod } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: modData.title,
            position: modData.position,
          })
          .select("id")
          .single();
        mod = newMod;
      }

      if (mod) {
        for (const lesData of modData.lessons) {
          let { data: les } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", mod.id)
            .eq("title", lesData.title)
            .maybeSingle();

          if (!les) {
            const { data: newLes } = await supabase
              .from("lessons")
              .insert({
                module_id: mod.id,
                title: lesData.title,
                position: lesData.position,
              })
              .select("id")
              .single();
            les = newLes;
          }

          if (les) {
            await supabase.from("lesson_contents").upsert({
              lesson_id: les.id,
              body_md: lesData.body_md,
            });
          }
        }
      }
    }
  }

  // 3. Inscripción de Ana Gómez en Botox y Labios
  const { data: botoxCourse } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "toxina-botulinica-botox-facial")
    .single();

  if (botoxCourse) {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("enrollments").upsert(
      {
        user_id: patient.id,
        course_id: botoxCourse.id,
        status: "active",
        enrolled_at: oneDayAgo,
      },
      { onConflict: "user_id,course_id" }
    );
    console.log("Paciente Ana Gómez inscrita en Toxina Botulínica (Día 2).");
  }

  console.log("\nSeed clínico completado exitosamente!");
}

main().catch(console.error);
