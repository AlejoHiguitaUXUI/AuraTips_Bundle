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
        title: "Fase Inmediata: Primeras 24 Horas Críticas",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            title: "Postura erguida, gesticulación guiada y primeras horas",
            position: 1,
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "### Primeras horas tras la microinyección\n\nDurante las primeras 4 horas, la toxina se une a los receptores presinápticos.\n\n* Mantén la cabeza erguida al menos 4 horas completas.\n* Duerme en decúbito supino (boca arriba) con 2 almohadas elevadas (30°) para favorecer el drenaje linfático.\n* Aplica frío local indirecto con gasa limpia en pulsos de 10 minutos sin presionar.\n* Ingiere 2 litros de agua fresca y evita alcohol o comidas muy calientes/picantes en las primeras 24h.",
            dos: [
              "Permanecer en posición vertical al menos 4 horas completas tras el procedimiento.",
              "Dormir en posición decúbito supino (boca arriba) con 2 almohadas para favorecer el drenaje linfático.",
              "Realizar micro-gesticulaciones suaves las primeras 2 horas para dinamizar la unión neuromuscular.",
              "Lavar el rostro con agua fresca o templada y limpiador Syndet suave sin fricción mecánica.",
              "Hidratación oral abundante con agua templada o fresca (al menos 2 litros)."
            ],
            donts: [
              "No acostarse, tumbarse en el sofá ni agachar la cabeza durante las primeras 4 horas.",
              "No masajear, frotar ni presionar las zonas tratadas (frente, entrecejo, patas de gallo).",
              "No usar gorras, vinchas apretadas ni cascos que compriman las zonas inyectadas.",
              "No aplicar maquillaje, ácidos exfoliantes ni cremas densas las primeras 24 horas.",
              "No consumir bebidas alcohólicas ni comidas muy calientes o picantes."
            ],
            checklist: [
              "🛏️ Permanecí con la cabeza erguida durante las primeras 4 horas sin recostarme",
              "🛏️ Preparé 2 almohadas para dormir boca arriba y evitar apoyar el rostro",
              "🧊 Apliqué frío indirecto con gasa limpia por 10 minutos sin ejercer presión",
              "💧 Bebí al menos 2 litros de agua y evité alcohol y comidas hirviendo/picantes",
              "🚫 Mantuve mis manos alejadas de los puntos de inyección sin masajear",
              "🧴 Dejé el rostro limpio sin maquillaje ni cosméticos densos por hoy"
            ]
          },
        ],
      },
      {
        title: "Fase de Estabilización y Control Térmico",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            title: "Restricción física, fotoprotección y cuidado dérmico",
            position: 1,
            care_type: "prohibited",
            timeline_tag: "Días 1–3",
            body_md: "### Evitar vasodilatación y calor extremo\n\n* Suspende entrenamientos vigorosos, crossfit y pesas pesadas por 48 a 72 horas.\n* Aplica protector solar mineral SPF 50+ con toques suaves.\n* Si aparecieron hematomas puntuales, aplica gel de árnica o vitamina K tópica.\n* Evita saunas, baños turcos y duchas calientes.",
            dos: [
              "Aplicar protector solar mineral SPF 50+ cada mañana con suaves toques de la yema de los dedos.",
              "Si existen hematomas o marcas puntuales, usar gel de árnica o vitamina K en capa fina 2 veces al día.",
              "Continuar durmiendo boca arriba con cabecera ligeramente elevada durante las primeras 72 horas.",
              "Reanudar maquillaje mineral suave utilizando brochas o esponjas desinfectadas.",
              "Mantener hidratación dérmica con lociones calmantes sin fragancias ni ácidos."
            ],
            donts: [
              "Cero ejercicio cardiovascular vigoroso, levantamiento de pesas o crossfit por 48 a 72 horas.",
              "Prohibido entrar a saunas, baños turcos, jacuzzis calientes y secadores de pelo directos al rostro.",
              "No realizar limpiezas faciales profundas, exfoliaciones mecánicas ni masajes Gua Sha.",
              "Evitar dormir de lado aplastando el rostro contra la almohada."
            ],
            checklist: [
              "🧴 Apliqué protector solar mineral SPF 50+ con toques ligeros sin frotar",
              "🏃 Pospuse entrenamientos pesados de pesas y cardio intenso por 48-72h",
              "🧖 Evité saunas, baños calientes y ambientes sofocantes",
              "🌿 Apliqué árnica/vitamina K en toquecitos sobre hematomas si aparecieron",
              "🛏️ Continué durmiendo boca arriba con elevación para drenaje óptimo"
            ]
          },
        ],
      },
      {
        title: "Fase de Fijación y Resultados Definitivos",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            title: "Evolución gradual, simetría y cita de control médico",
            position: 1,
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: "### Línea de tiempo de los resultados definitivos\n\n* Día 3 a 5: Inicio visible de atenuación.\n* Día 7 a 10: Bloqueo muscular del 80-90%.\n* Día 14: Evaluación final del resultado y cita de control/retoque con el especialista.",
            dos: [
              "Observar la atenuación paulatina de las arrugas dinámicas entre el día 4 y el día 10 con paciencia.",
              "Retomar progresivamente la actividad física y deportiva habitual.",
              "Tomar fotografías de control frontal y lateral en reposo y gesticulación para la ficha médica.",
              "Agendar y acudir a la cita médica de valoración y retoque de simetría al cumplirse los 14 días.",
              "Mantener el uso diario de fotoprotección solar para evitar el fotoenvejecimiento."
            ],
            donts: [
              "No solicitar retoques ni aplicaciones adicionales antes del día 14 (el fármaco continúa asentándose).",
              "No someterse a tratamientos térmicos profundos (HIFU, láser ablativo) sin autorización médica.",
              "No suspender la hidratación facial ni los cuidados básicos de la barrera cutánea."
            ],
            checklist: [
              "🪞 Monitoreé la relajación muscular gradual frente al espejo sin ansiedad",
              "🏃 Reanudé mi entrenamiento deportivo habitual de forma progresiva",
              "🧴 Mantuve mi rutina dermocosmética habitual y fotoprotección diaria",
              "📸 Tomé fotografías de frente y perfil para documentar mi evolución",
              "📅 Agendé la cita de revisión médica para el día 14 post-tratamiento"
            ]
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
        timeline_tag: "Día 0",
        lessons: [
          {
            title: "Crioterapia indirecta, reposo labial y prevención de deformaciones",
            position: 1,
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "### Crioterapia y cuidados labiales inmediatos\n\nAplica frío local indirecto envuelto en gasa estéril limpia en pulsos de 10 minutos cada 1-2 horas sin presionar los labios. Duerme semisentada o boca arriba con 2 almohadas. Bebe abundante agua en vaso abierto y PROHIBE EL USO DE SORBETES O PAJILLAS.",
            dos: [
              "Aplicar frío local indirecto con compresa envuelta en gasa en intervalos de 10 minutos cada 1-2 horas.",
              "Dormir semisentada o boca arriba con 2 almohadas para favorecer el drenaje linfático.",
              "Mantener los labios lubricados con bálsamo reparador estéril o vaselina pura de grado médico.",
              "Beber abundante agua (2 a 2.5 litros) a sorbos suaves en vaso abierto o taza amplia.",
              "Consumir alimentos frescos o templados de textura blanda que no requieran apertura bucal forzada."
            ],
            donts: [
              "PROHIBIDO el uso de sorbetes, pitillos o pajillas (la succión desplaza mecánicamente el gel).",
              "No frotar, morder, presionar ni pellizcar los labios; evitar frotar labio contra labio compulsivamente.",
              "Cero besos con presión o mordiscos, gesticulación forzada o morder piezas duras enteras.",
              "No aplicar maquillaje labial con pigmentos, brillos voluminizadores ni delineadores en las primeras 24h.",
              "No fumar, vapear ni consumir bebidas alcohólicas."
            ],
            checklist: [
              "🧊 Apliqué compresas frías envueltas en gasa limpia en pulsos de 10 minutos sin presionar",
              "🛏️ Dormí boca arriba o semisentada con 2 almohadas para favorecer el drenaje linfático",
              "🥤 Bebí abundante agua en vaso abierto y evité terminantemente sorbetes o pajillas",
              "🧴 Apliqué ungüento reparador estéril sin fragancias con bastoncillo limpio",
              "🍲 Evité comidas muy calientes, picantes o muy saladas y consumo de tabaco o alcohol",
              "🚫 Me abstuve de aplicar cosméticos labiales con color y de frotar los labios"
            ]
          },
        ],
      },
      {
        title: "Fase de Máximo Edema y Estabilización",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            title: "Manejo de hematomas, hidratación higroscópica y cuidados peribucales",
            position: 1,
            care_type: "general",
            timeline_tag: "Días 1–3",
            body_md: "### Regla de los 3 días de edema\n\nEl volumen puede aparentar hasta un 30% superior al resultado definitivo por retención hídrica natural. Aplica bálsamo cicatrizante 4-6 veces al día y crema de árnica/vitamina K si hay equimosis.",
            dos: [
              "Aplicar bálsamo reparador cicatrizante (pantenol B5, madecassoside o hialurónico) 4 a 6 veces al día.",
              "Usar crema de árnica o vitamina K en toques delicados sobre hematomas peribucales.",
              "Continuar durmiendo boca arriba con 2 almohadas para acelerar la reabsorción del edema.",
              "Ingerir entre 2 y 2.5 litros de agua diarios para alimentar la matriz hídrica del relleno.",
              "Realizar enjuagues orales suaves sin alcohol tras cada comida para máxima higiene."
            ],
            donts: [
              "No masajear ni intentar aplastar bultitos o irregularidades palpables (el edema es asimétrico).",
              "Evitar la exposición solar directa, lámparas UV, saunas y baños de inmersión caliente.",
              "No someterse a tratamientos odontológicos, limpiezas dentales ni empastes por 2 semanas.",
              "No realizar depilación con cera o hilo en el labio superior ni peelings periorales."
            ],
            checklist: [
              "🧴 Hidraté los labios 4-6 veces al día con bálsamo reparador emoliente neutro",
              "🌿 Apliqué crema de árnica o vitamina K sobre hematomas peribucales en toques suaves",
              "💧 Mantuve la ingesta de más de 2 litros de agua diarios para nutrir el gel de hialurónico",
              "🛏️ Dormí boca arriba con 2 almohadas para evitar presión lateral sobre los labios",
              "🚫 Evité masajear los nódulos transitorios y me abstuve de saunas y ejercicio vigoroso"
            ]
          },
        ],
      },
      {
        title: "Fase de Asentamiento, Textura Final y Revisión",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            title: "Integración tisular, desinflamación y control médico a los 14 días",
            position: 1,
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: "### Resultado definitivo y cita médica\n\nA partir del día 5 al 7 el edema cede, mostrando el perfil y volumen real. Acude a la revisión médica a los 14 días para valorar simetría.",
            dos: [
              "Permitir la integración biológica natural del gel hialurónico en el tejido conectivo hasta el día 14.",
              "Reanudar con total normalidad el uso de cosméticos, barras labiales y perfiladores limpios.",
              "Mantener hidratación externa frecuente con bálsamo nutritivo que contenga filtro solar.",
              "Acudir a la cita de control médico a los 14 días para valorar simetría, arco de cupido y perfilado.",
              "Continuar con ingesta adecuada de agua diaria para optimizar la durabilidad del producto."
            ],
            donts: [
              "No alarmarse por la desinflamación natural del 25-30% del volumen inicial de los primeros días.",
              "No apretar con fuerza manual o uñas nódulos residuales sin indicación médica.",
              "No someterse a micropigmentación labial ni tatuajes periorales antes de 4 semanas."
            ],
            checklist: [
              "🪞 Evalué la forma real de mis labios con la desinflamación natural progresiva",
              "🧴 Apliqué bálsamo protector labial con filtro solar a diario",
              "💄 Reanudé cosméticos y labiales con higiene adecuada",
              "💧 Continué con mi consumo habitual de agua para mantener la hidrofilia del hialurónico",
              "📅 Confirmé la cita de revisión y control con mi especialista a los 14 días"
            ]
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
        title: "Fase Crítica e Inmediata: Día 0 (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            title: "Prohibición absoluta de gafas, postura de descanso y vigilancia vascular",
            position: 1,
            care_type: "prohibited",
            timeline_tag: "Día 0",
            body_md: "### Protección del dorso y vigilancia vascular\n\nPROHIBIDO EL USO DE GAFAS O ANTEOJOS durante 14 días sobre el dorso nasal. Duerme boca arriba estricto con 2 almohadas. Inspecciona que la piel esté rosada y tibia. Aplica frío en mejillas, jamás sobre la nariz.",
            dos: [
              "Dormir en decúbito supino estricto (boca arriba) con 2 almohadas (30-45°) y soporte lateral con cojines.",
              "Inspeccionar periódicamente la coloración de la piel nasal frente al espejo (debe estar sonrosada y cálida).",
              "Limpiar suavemente la zona de micropunción con gasa estéril humedecida en suero fisiológico mediante toques.",
              "Si necesitas corrección visual, usar lentes de contacto o suspender las gafas de la frente con cinta médica.",
              "Beber abundante agua y mantener reposo relativo en casa durante las primeras 24 horas."
            ],
            donts: [
              "PROHIBIDO el uso de gafas de ver, gafas de sol o cascos apoyados sobre el dorso de la nariz.",
              "No presionar, apretar, pellizcar ni intentar moldear la punta o el caballete nasal con los dedos.",
              "No sonarse la nariz con fuerza explosiva ni hurgarse; usar solución salina suave si hay congestión.",
              "No dormir de lado ni boca abajo bajo ninguna circunstancia.",
              "No aplicar maquillaje, correctores ni cremas densas sobre la pirámide nasal en 24h."
            ],
            checklist: [
              "👓 Cero apoyo de gafas o monturas sobre el dorso nasal (usé lentes de contacto o suspensión frontal)",
              "🛏️ Dormí boca arriba con 2 almohadas y soportes laterales para no girar la cabeza",
              "🧊 Apliqué frío indirecto con gasa por 10 minutos en zonas periféricas sin comprimir la nariz",
              "🪞 Inspeccioné la coloración cutánea de la punta y dorso nasal (rosada, sin palidez ni manchas moradas)",
              "💧 Bebí al menos 2 litros de agua y consumí alimentos templados y suaves",
              "🚫 Evité sonarme la nariz bruscamente y mantuve mis manos alejadas de la zona tratada"
            ]
          },
        ],
      },
      {
        title: "Fase de Consolidación y Prevención de Desplazamiento",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            title: "Mantenimiento estructural, fotoprotección mineral y control de hematomas",
            position: 1,
            care_type: "allowed",
            timeline_tag: "Días 1–3",
            body_md: "### Consolidación del soporte nasal\n\nMantén la restricción ininterrumpida de gafas. Aplica protector solar mineral SPF 50+ con toquecitos delicados. Usa crema con árnica o vitamina K en puntos de acceso si hay hematomas.",
            dos: [
              "Mantener la prohibición ininterrumpida de apoyar gafas o anteojos sobre el caballete nasal.",
              "Aplicar protector solar mineral SPF 50+ mediante toques muy suaves y sin presión en las mañanas.",
              "Si existen pequeños hematomas en puntos de entrada, usar gel con árnica o vitamina K 2 veces al día.",
              "Continuar durmiendo boca arriba con cabecera elevada para facilitar el drenaje del edema perinasal.",
              "Mantener reposo relativo evitando actividades que eleven bruscamente la presión facial."
            ],
            donts: [
              "No realizar deportes de contacto, tenis, natación con gafas herméticas ni entrenamientos de pesas.",
              "No realizarse limpiezas con extracción de poros en la nariz ni usar tiras adhesivas depilatorias.",
              "Evitar la exposición a saunas, baños turcos, duchas calientes y cocción a fuego directo con vapor en el rostro.",
              "No inclinarse súbitamente hacia el suelo con la cabeza baja (evitar presión hidrostática nasal)."
            ],
            checklist: [
              "👓 Mantuve la restricción estricta de anteojos y gafas sobre la pirámide nasal",
              "🧴 Apliqué protector solar mineral SPF 50+ mediante toques muy ligeros sin compresión",
              "🌿 Apliqué gel de árnica o vitamina K sobre hematomas discretos en puntos de acceso",
              "🛏️ Dormí en posición supina con dos almohadas durante toda la noche",
              "🏃 Evité entrenamientos vigorosos, levantamiento de cargas y fuentes de calor"
            ]
          },
        ],
      },
      {
        title: "Fase de Asentamiento Estructural y Resultados Definitivos",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            title: "Estabilidad de la corrección nasal y revisión médica a las 2 semanas",
            position: 1,
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: "### Estabilidad del perfil y cita de control\n\nA partir del día 5 al 7 el edema remite. Continúa evitando monturas pesadas hasta cumplir las 2 semanas. Acude a la revisión médica.",
            dos: [
              "Continuar protegiendo el dorso nasal de golpes accidentales o presiones continuadas hasta el día 14.",
              "Retomar de forma progresiva la actividad aeróbica moderada evitando deportes con impacto.",
              "Aplicar fotoprotector solar diario SPF 50+ para evitar pigmentación post-inflamatoria.",
              "Asistir a la cita de control médico a los 14 días para valorar simetría, proyección y estabilidad.",
              "Evaluar la armonía estética mediante fotografías comparativas con tu estado previo."
            ],
            donts: [
              "No utilizar monturas pesadas de pasta o gafas de natación/buceo ajustadas antes del día 14.",
              "No manipular con fuerza los cartílagos alares o el dorso de la nariz al sonarse o secarse.",
              "No aplicarse radiofrecuencia ni ultrasonido focalizado en la pirámide nasal."
            ],
            checklist: [
              "👃 Verifiqué la fijación del dorso y la punta nasal con resolución del edema inicial",
              "🧴 Mantuve fotoprotección SPF 50+ estricta en el dorso y punta nasal a diario",
              "👓 Mantuve prudencia con monturas pesadas hasta cumplir los 14 días reglamentarios",
              "📸 Tomé fotografías de perfil y frente para mi seguimiento clínico",
              "📅 Acudí o confirmé mi cita médica de control estructural a los 14 días"
            ]
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
        title: "Fase Inmediata y Neutralización Cutánea: Día 0 (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            title: "Calma epidérmica, barrera tópica y fotoprotección cero exposición",
            position: 1,
            care_type: "prohibited",
            timeline_tag: "Día 0",
            body_md: "### Calma epidérmica y mantenimiento de barrera\n\nAplica crema reparadora (pantenol B5, madecassoside) de 3 a 5 veces al día. Usa compresas con gasa fría y agua termal por 10 minutos para calmar el ardor. Cero maquillaje, exfoliantes o sol directo.",
            dos: [
              "Aplicar bálsamo reparador epitelizante (con pantenol B5 o madecassoside) de 3 a 5 veces al día.",
              "Rociar bruma de agua termal fresca o compresas con gasa estéril fría en pulsos de 10 minutos para calmar el calor.",
              "Dormir boca arriba con 2 almohadas y funda de almohada limpia para minimizar el roce mecánico nocturno.",
              "Permanecer en interiores protegidos de la radiación solar directa y fuentes de calor.",
              "Hidratación oral intensiva con abundante agua fresca (mínimo 2.5 litros diarios)."
            ],
            donts: [
              "PROHIBIDO arrancar, pellizcar o frotar la piel aunque empiece a sentirse tirante o acartonada.",
              "No lavar el rostro con jabones comunes, esponjas exfoliantes ni agua caliente.",
              "PROHIBIDO aplicar bases de maquillaje, correctores, polvos o iluminadores en 24h.",
              "No usar productos cosméticos con retinol, ácido glicólico, salicílico ni vitamina C ácida.",
              "No exponerse al sol directo ni consumir comidas picantes, muy calientes o alcohol."
            ],
            checklist: [
              "🧴 Apliqué crema barrera reparadora calmante (pantenol/madecassoside) en capa generosa",
              "🧊 Usé compresas de gasa con agua termal fría por 10 minutos para calmar el ardor",
              "🛏️ Dormí boca arriba con 2 almohadas y funda limpia para evitar fricción facial",
              "💧 Bebí 2.5 litros de agua fresca y evité comidas calientes, picantes o alcohol",
              "🚫 Cero maquillaje, exfoliantes, ácidos y cero exposición directa a la radiación solar"
            ]
          },
        ],
      },
      {
        title: "Fase de Descamación Activa y Reepitelización",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            title: "Regla de oro: desprendimiento natural, regeneración y fotoprotección mineral",
            position: 1,
            care_type: "prohibited",
            timeline_tag: "Días 1–3",
            body_md: "### Regla de oro: Jamás arrancar las pieles\n\nLas pieles deben caer por sí solas durante el lavado suave. Tirar de una escama causa manchas o cicatrices. Aplica crema hidratante reparadora 4 a 6 veces al día y protector solar 100% mineral SPF 50+ cada 2 a 3 horas.",
            dos: [
              "REGLA DE ORO: Dejar que las pieles descamadas caigan por sí solas en el lavado suave; jamás arrancarlas.",
              "Aplicar crema hidratante reparadora (Cicaplast B5, Cicalfate o equivalente) de 4 a 6 veces al día.",
              "Aplicar fotoprotector 100% mineral SPF 50+ cada 2 a 3 horas religiosamente desde la mañana.",
              "Lavar suavemente con limpiador Syndet sin jabón y agua tibia, secando con toques suaves.",
              "Utilizar sombrero de ala ancha y gafas oscuras de alta protección al salir al exterior.",
              "Si alguna piel suelta cuelga en exceso, recortar con tijeritas limpias el borde libre sin jalar la raíz."
            ],
            donts: [
              "JAMÁS jalar, pelar ni raspar las escamas de piel seca (riesgo severo de mancha o cicatriz).",
              "No aplicar maquillaje cosmético sobre las áreas que se encuentran activamente pelándose.",
              "Cero ejercicio vigoroso que produzca sudoración profusa (las sales del sudor irritan intensamente).",
              "Prohibido entrar a piscinas con cloro, jacuzzis, saunas y playas.",
              "No utilizar toallitas desmaquillantes, tónicos con alcohol ni cepillos mecánicos."
            ],
            checklist: [
              "🚫 REGLA DE ORO: No arranqué ni tiré de ninguna piel; dejé que se desprendan naturalmente",
              "🧴 Apliqué bálsamo cicatrizante y reparador 4 a 6 veces al día ante cada sensación de tirantez",
              "☀️ Apliqué y reapliqué protector solar mineral SPF 50+ cada 2 a 3 horas religiosamente",
              "🧼 Lavé mi rostro con limpiador Syndet suave con agua tibia y secado por toques",
              "🧢 Usé sombrero de ala ancha y evité por completo el sol directo y el sudor intenso"
            ]
          },
        ],
      },
      {
        title: "Fase de Regeneración de Barrera Cutánea y Fotoprotección Médica",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            title: "Consolidación epidérmica, nutrición avanzada y prevención de manchas",
            position: 1,
            care_type: "allowed",
            timeline_tag: "Días 4–14",
            body_md: "### Protección y consolidación de la piel nueva\n\nReaplica protector solar SPF 50+ cada 3 a 4 horas durante todo el mes. Nutre la barrera con ácido hialurónico y ceramidas. Retoma maquillaje mineral solo al finalizar la descamación total.",
            dos: [
              "Reaplicar protector solar SPF 50+ de amplio espectro cada 3 a 4 horas durante los próximos 30 días.",
              "Nutrir la nueva epidermis con ácido hialurónico puro y cremas reparadoras con ceramidas y niacinamida.",
              "Reanudar el maquillaje cosmético mineral hipoalergénico solo cuando la descamación haya cesado por completo.",
              "Monitorear la uniformidad del tono de piel e informar oportunamente cualquier pigmentación reactiva.",
              "Asistir a la revisión dermatológica de control o sesión complementaria programada."
            ],
            donts: [
              "No exponerse deliberadamente al sol en playas, piscinas o terrazas por al menos un mes.",
              "No reintroducir retinoides, ácido glicólico, salicílico ni exfoliantes físicos antes del día 14.",
              "No realizarse depilación facial con cera, hilo, láser o luz pulsada durante al menos 4 semanas."
            ],
            checklist: [
              "☀️ Mantuve la reaplicación de fotoprotector SPF 50+ cada 3-4 horas sin excepción",
              "🧴 Nutrí la barrera cutánea con ácido hialurónico y ceramidas reconstituyentes",
              "💄 Reanudé maquillaje hipoalergénico solo tras haber finalizado la descamación al 100%",
              "🚫 Pospuse el uso de ácidos exfoliantes, retinoides y depilación facial hasta el día 14+",
              "📅 Agendé la cita de valoración dermatológica de control post-peeling"
            ]
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
        timeline_tag: "Días 1–7",
        lessons: [
          {
            title: "Técnica de masaje 5-5-5 y fotoprotección",
            position: 1,
            care_type: "allowed",
            timeline_tag: "Días 1–7",
            body_md: "### Estimulación uniforme de colágeno\n\nRealiza masajes suaves 5 minutos, 5 veces al día durante los primeros 5 días.",
            dos: [
              "Realizar masaje con crema hidratante suave en movimientos ascendentes.",
              "Aplicar protector solar SPF 50+ diariamente.",
              "Beber abundante agua para favorecer la neocolagénesis."
            ],
            donts: [
              "No realizar presiones excesivas que causen dolor.",
              "Evitar calor extremo y saunas por 72 horas."
            ],
            checklist: [
              "🧴 Realicé mi sesión de masaje pautado 5-5-5",
              "☀️ Apliqué protector solar cada 3-4 horas",
              "💧 Mantuve hidratación hídrica adecuada"
            ]
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
      } else {
        await supabase
          .from("modules")
          .update({
            position: modData.position,
          })
          .eq("id", mod.id);
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
                care_type: lesData.care_type || "allowed",
                timeline_tag: lesData.timeline_tag || modData.timeline_tag || "Día 0",
              })
              .select("id")
              .single();
            les = newLes;
          } else {
            await supabase
              .from("lessons")
              .update({
                position: lesData.position,
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
