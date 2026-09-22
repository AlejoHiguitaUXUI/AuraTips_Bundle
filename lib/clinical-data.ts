export interface ClinicalProcedure {
  id: string;
  title: string;
  slug: string;
  category: "Inyectables" | "Armonización Facial" | "Dermoestética" | "Bioestimulación";
  description: string;
  cover_url: string;
  recovery_time: string;
  pain_level: number; // 1 to 5
  duration_minutes: number;
  results_duration: string;
  anesthesia_type: string;
  price: number;
  alarm_signs: string[];
  doctor_name: string;
  doctor_specialty: string;
  modules: {
    id: string;
    title: string;
    position: number;
    timeline_tag: string;
    lessons: {
      id: string;
      title: string;
      care_type: "general" | "allowed" | "prohibited" | "alarm";
      timeline_tag: string;
      body_md: string;
      dos: string[];
      donts: string[];
      checklist: string[];
      youtube_url?: string;
    }[];
  }[];
}

export const CLINICAL_PROCEDURES: ClinicalProcedure[] = [
  {
    id: "proc-botox-facial",
    title: "Toxina Botulínica Facial (Botox)",
    slug: "toxina-botulinica-botox-facial",
    category: "Inyectables",
    description: "Protocolo médico integral de relajación neuromuscular selectiva para líneas de expresión frontales, glabelares (entrecejo) y perioculares (patas de gallo). Guía clínica de recuperación día a día, control de difusión y prevención de asimetrías.",
    cover_url: "/images/botox.jpg",
    recovery_time: "4 a 24 horas",
    pain_level: 1,
    duration_minutes: 30,
    results_duration: "4 a 6 meses",
    anesthesia_type: "Crioterapia / Frío local",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética Facial",
    alarm_signs: [
      "Caída del párpado superior o ceja con dificultad para abrir el ojo (ptosis palpebral)",
      "Visión doble (diplopía) o visión borrosa persistente al enfocar",
      "Asimetría facial marcada e involuntaria al gesticular o en reposo",
      "Dificultad para tragar (disfagia) o hablar (evento adverso sistémico de máxima urgencia)"
    ],
    modules: [
      {
        id: "mod-botox-1",
        title: "Fase Inmediata: Primeras 24 Horas Críticas",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-botox-101",
            title: "Postura erguida, gesticulación guiada y primeras horas",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: `### Primeras horas tras la microinyección

Durante las primeras 4 horas, las moléculas de neurotoxina botulínica se unen activamente a los receptores presinápticos de la placa motora neuromuscular. La presión física, compresión o posiciones declives pueden favorecer la difusión indeseada del fármaco hacia músculos vecinos (como el elevador del párpado superior).

* **Postura y descanso:** Permanece con la cabeza erguida al menos 4 horas completas (prohibido tumbarse en el sofá, tomar siestas o agacharse a recoger objetos del suelo). Para dormir la primera noche, hazlo estrictamente **boca arriba (decúbito supino) con 2 almohadas** o la cabecera elevada a 30° para promover el drenaje linfático y prevenir edema periorbitario matutino.
* **Aplicación de frío:** Si notas inflamación leve o molestia en los puntos de inyección, aplica frío seco local **envuelto en una gasa estéril limpia en pulsos de 10 minutos**, sin apoyar peso ni ejercer presión sobre las zonas inyectadas.
* **Skincare y maquillaje:** Cero maquillaje durante las primeras 24 horas para mantener las micro-punciones selladas y libres de contaminación bacteriana. Lava el rostro con agua fresca o templada y limpiador Syndet (sin jabón) mediante toques delicados sin frotar. Si necesitas salir de día, aplica protector solar mineral con toques suaves de la yema de los dedos sin arrastrar.
* **Alimentación e hidratación:** Ingiere al menos 2 litros de agua fresca a temperatura ambiente. Evita bebidas alcohólicas durante las primeras 24 horas (el alcohol genera vasodilatación y amplifica hematomas), así como comidas excesivamente calientes o hipercondimentadas.`,
            dos: [
              "Permanecer en posición vertical y erguida al menos 4 horas completas tras la infiltración.",
              "Dormir en posición decúbito supino (boca arriba) con 2 almohadas (elevación de 30°) para favorecer el drenaje linfático.",
              "Realizar micro-gesticulaciones faciales suaves (sonreír, fruncir sutilmente) durante las primeras 2 horas para dinamizar la unión neuromuscular.",
              "Lavar el rostro con agua fresca o templada y limpiador dermocosmético suave Syndet con toques sin frotar.",
              "Hidratación oral abundante con agua templada o fresca (al menos 2 litros)."
            ],
            donts: [
              "No acostarse, tumbarse horizontalmente en la cama o sofá ni agachar la cabeza durante las primeras 4 horas.",
              "No masajear, frotar, rascar ni presionar los puntos de punción (frente, entrecejo, patas de gallo).",
              "No usar gorras, vinchas apretadas, cascos de moto ni gafas pesadas que ejerzan compresión frontal.",
              "No aplicar maquillaje, bases cosméticas con color ni ácidos exfoliantes en las primeras 24 horas.",
              "No consumir bebidas alcohólicas ni comidas excesivamente calientes, picantes o hipercalóricas."
            ],
            checklist: [
              "🛏️ Permanecí con la cabeza erguida durante las primeras 4 horas sin recostarme",
              "🛏️ Preparé 2 almohadas para dormir boca arriba y evitar apoyar el rostro",
              "🧊 Apliqué frío indirecto con gasa limpia por 10 minutos sin ejercer presión",
              "💧 Bebí al menos 2 litros de agua y evité alcohol y comidas hirviendo/picantes",
              "🚫 Mantuve mis manos alejadas de los puntos de inyección sin masajear",
              "🧴 Dejé el rostro limpio sin maquillaje ni cosméticos densos por hoy"
            ]
          }
        ]
      },
      {
        id: "mod-botox-2",
        title: "Fase de Estabilización y Control Térmico",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            id: "les-botox-201",
            title: "Restricción física, fotoprotección y cuidado dérmico",
            care_type: "prohibited",
            timeline_tag: "Días 1–3",
            body_md: `### Evitar vasodilatación, sudoración y tensión muscular

Durante los días 1 a 3, la toxina se internaliza en las terminaciones nerviosas. El aumento excesivo de temperatura local o corporal por esfuerzo físico eleva el flujo vascular facial acelerando el aclaramiento del producto antes de completar su fijación biológica.

* **Descanso y postura:** Continúa descansando boca arriba con elevación durante las primeras 48 a 72 horas para prevenir asimetrías transitorias y reabsorción de micro-edemas.
* **Manejo de hematomas (equimosis):** Si apareció algún pequeño hematoma en los sitios de punción, aplica una capa fina de crema o gel con **árnica o vitamina K tópica** con toquecitos ligeros, 2 veces al día.
* **Skincare y fotoprotección:** Aplica religiosamente **protector solar 100% mineral SPF 50+** cada mañana y reaplica a mediodía mediante toques suaves. Se autoriza maquillaje ligero o mineral a partir de las 24 horas, siempre utilizando brochas o esponjas previamente lavadas y desinfectadas.
* **Actividad física y calor:** Prohibido el ejercicio físico extenuante (running, crossfit, levantamiento de pesas), saunas, baños turcos, duchas calientes prolongadas y posturas invertidas de yoga durante 48 a 72 horas.`,
            dos: [
              "Aplicar protector solar mineral SPF 50+ cada mañana con suaves toques de la yema de los dedos.",
              "Si existen hematomas o marcas puntuales, usar gel de árnica o vitamina K en capa fina 2 veces al día.",
              "Continuar durmiendo boca arriba con cabecera ligeramente elevada durante las primeras 72 horas.",
              "Reanudar maquillaje mineral suave utilizando brochas o aplicadores limpios y desinfectados.",
              "Mantener hidratación dérmica con lociones calmantes sin ácidos irritantes ni fragancias."
            ],
            donts: [
              "Cero ejercicio cardiovascular vigoroso, crossfit o levantamiento de pesas pesadas durante 48 a 72 horas.",
              "Prohibido entrar a saunas, baños turcos, jacuzzis calientes y exponerse al calor directo del horno.",
              "No realizar limpiezas faciales profundas, exfoliaciones mecánicas, radiofrecuencia ni masajes Gua Sha.",
              "Evitar dormir de lado aplastando el rostro o frotando las cejas contra las sábanas."
            ],
            checklist: [
              "🧴 Apliqué protector solar mineral SPF 50+ con toques ligeros sin frotar",
              "🏃 Pospuse entrenamientos pesados de pesas y cardio intenso por 48-72h",
              "🧖 Evité saunas, baños calientes y ambientes sofocantes",
              "🌿 Apliqué árnica/vitamina K en toquecitos sobre hematomas si aparecieron",
              "🛏️ Continué durmiendo boca arriba con elevación para drenaje óptimo"
            ]
          }
        ]
      },
      {
        id: "mod-botox-3",
        title: "Fase de Fijación y Resultados Definitivos",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            id: "les-botox-301",
            title: "Evolución gradual, simetría y cita de control médico",
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: `### Cronograma biológico de resultados

La denervación química reversible progresa de forma paulatina:
* **Días 3 a 5:** Notarás que el músculo comienza a perder fuerza y las líneas de expresión dinámicas se suavizan.
* **Días 7 a 10:** El bloqueo alcanza entre el 80% y el 90% de su efectividad.
* **Día 14:** Momento clínico exacto en que la fijación es completa al 100%. Es aquí donde se evalúa el resultado definitivo y se realiza cualquier micro-retoque de simetría en consulta médica.

* **Rutina y actividad:** Puedes reincorporar tu actividad física habitual sin restricciones y tu rutina completa de dermocosmética habitual.
* **Fotoprotección:** Mantén el protector solar SPF 50+ como hábito diario para salvaguardar la calidad dérmica y prolongar la durabilidad del tratamiento.`,
            dos: [
              "Observar la atenuación paulatina de las arrugas dinámicas entre el día 4 y el día 10 con paciencia.",
              "Retomar progresivamente la actividad física y deportiva habitual.",
              "Tomar fotografías de control frontal y lateral en reposo y gesticulación para tu historia clínica.",
              "Agendar y acudir a la cita médica de valoración y retoque de simetría al cumplirse los 14 días.",
              "Mantener el uso diario de fotoprotección solar para evitar fotoenvejecimiento añadido."
            ],
            donts: [
              "No solicitar retoques ni aplicaciones adicionales antes del día 14 (el fármaco continúa asentándose).",
              "No someterse a tratamientos térmicos profundos (HIFU, láser ablativo) en la zona tratada sin autorización médica.",
              "No suspender la hidratación facial ni los cuidados generales de la barrera cutánea."
            ],
            checklist: [
              "🪞 Monitoreé la relajación muscular gradual frente al espejo sin ansiedad",
              "🏃 Reanudé mi entrenamiento deportivo habitual de forma progresiva",
              "🧴 Mantuve mi rutina dermocosmética habitual y fotoprotección diaria",
              "📸 Tomé fotografías de frente y perfil para documentar mi evolución",
              "📅 Agendé la cita de revisión médica para el día 14 post-tratamiento"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-acido-hialuronico-labios",
    title: "Relleno y Perfilado de Labios con Ácido Hialurónico (Russian Lips)",
    slug: "acido-hialuronico-labios-russian-lips",
    category: "Inyectables",
    description: "Protocolo clínico para aumento, eversión sutil, definición del arco de cupido e hidratación profunda con ácido hialurónico reticulado. Manejo integral de edema higroscópico, prevención de compresión vascular y pautas de higiene post-inyección.",
    cover_url: "/images/lips.jpg",
    recovery_time: "48 a 72 horas",
    pain_level: 2,
    duration_minutes: 45,
    results_duration: "9 a 12 meses",
    anesthesia_type: "Crema anestésica tópica + Lidocaína incorporada",
    price: 0,
    doctor_name: "Dr. Alejandro Serrano",
    doctor_specialty: "Cirujano Plástico & Medicina Estética",
    alarm_signs: [
      "Palidez marmórea, blanqueamiento o moteado azul-violáceo persistente en el labio o filtro nasal (requiere valoración médica directa)",
      "Dolor desproporcionado, agudo y pulsátil que no cede con analgésicos comunes",
      "Aparición de pequeñas ampollas o vesículas en racimo con base eritematosa (reactivación de herpes simple labial)",
      "Sensación de frialdad cutánea localizada en el bermellón o piel perioral"
    ],
    modules: [
      {
        id: "mod-labios-1",
        title: "Fase Inmediata: Día 0 (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-labios-101",
            title: "Crioterapia indirecta, reposo labial y prevención de deformaciones",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: `### Control agudo de inflamación y protección del gel reticulado

El bermellón labial es una mucosa ricamente vascularizada e inervada. Tras la técnica Russian Lips (micro-inyecciones verticales columnares), es completamente fisiológico un edema pronunciado en las primeras 24 a 48 horas.

* **Aplicación de frío seguro:** Aplica compresas frías o gel refrigerante **envuelto en gasa estéril limpia en pulsos de 10 minutos** por hora durante la tarde y noche. **Bajo ninguna circunstancia presiones con fuerza los labios ni apliques hielo directo**, pues congelaría la mucosa o deformaría las columnas de soporte recién moldeadas.
* **Postura y descanso:** Duerme semisentada o estrictamente **boca arriba con 2 almohadas altas** (cabecera a 30° o 45°). La elevación de la cabeza activa el drenaje venolinfático y mitiga significativamente la hinchazón matutina.
* **Skincare y labios:** Aplica constantemente un bálsamo reparador labial estéril neutro (ácido hialurónico no reticulado, manteca de karité pura o vaselina estéril de grado médico) utilizando un bastoncillo de algodón limpio. Prohibido pintalabios cosméticos con pigmento, delineadores o brillos con mentol/capsaicina (voluminizadores) durante 24h.
* **Alimentación e hidratación:** Bebe abundante agua (2 a 2.5 litros) a pequeños sorbos **en vaso de boca ancha o taza abierta**. **PROHIBIDO EL USO DE SORBETES, PAJILLAS O PITILLOS**, ya que la presión negativa de succión ejerce fuerzas tensoras que desplazan el ácido hialurónico. Consume alimentos templados o frescos, de consistencia blanda, y evita condimentos picantes o comidas con alto contenido de sodio. Cero consumo de alcohol y tabaco.`,
            dos: [
              "Aplicar frío local indirecto con compresa envuelta en gasa estéril limpia en intervalos de 10 minutos cada 1-2 horas.",
              "Dormir semisentada o boca arriba con 2 almohadas para favorecer el drenaje linfático facial.",
              "Mantener los labios lubricados con bálsamo reparador estéril emoliente neutro o vaselina pura de grado médico.",
              "Beber abundante agua (2 a 2.5 litros) a sorbos suaves en vaso abierto o taza amplia.",
              "Consumir alimentos frescos o templados de textura blanda que no requieran apertura bucal forzada."
            ],
            donts: [
              "PROHIBIDO el uso de sorbetes, pitillos o pajillas (la succión desplaza mecánicamente el gel reticulado).",
              "No frotar, morder, presionar ni pellizcar los labios; evitar frotar labio contra labio compulsivamente.",
              "Cero besos con presión o mordiscos, gestos de succión forzada o morder piezas enteras duras (manzanas, bocadillos rígidos).",
              "No aplicar maquillaje labial con pigmentos, tintas permanentes ni brillos voluminizadores en las primeras 24h.",
              "No fumar, vapear ni consumir bebidas alcohólicas (empeoran el edema y dañan la microcirculación)."
            ],
            checklist: [
              "🧊 Apliqué compresas frías envueltas en gasa limpia en pulsos de 10 minutos sin presionar",
              "🛏️ Dormí boca arriba o semisentada con 2 almohadas para favorecer el drenaje linfático",
              "🥤 Bebí abundante agua en vaso abierto y evité terminantemente sorbetes o pajillas",
              "🧴 Apliqué ungüento reparador estéril sin fragancias con bastoncillo limpio",
              "🍲 Evité comidas muy calientes, picantes o muy saladas y consumo de tabaco o alcohol",
              "🚫 Me abstuve de aplicar cosméticos labiales con color y de frotar los labios"
            ]
          }
        ]
      },
      {
        id: "mod-labios-2",
        title: "Fase de Máximo Edema y Estabilización",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            id: "les-labios-201",
            title: "Manejo de hematomas, hidratación higroscópica y cuidados peribucales",
            care_type: "general",
            timeline_tag: "Días 1–3",
            body_md: `### La regla del edema y el comportamiento higroscópico

Entre las 24 y 72 horas post-inyección se experimenta el pico máximo de inflamación. El volumen labial puede aparentar entre un 25% y un 35% superior al resultado definitivo debido a la alta capacidad del ácido hialurónico para retener agua tisular.

* **Hematomas peribucales:** Es habitual la aparición de pequeñas equimosis ("moraditos") en las comisuras o bermellón por la técnica de micropunción. Aplica **crema o gel con árnica o vitamina K tópica** con toquecitos muy delicados 2 a 3 veces al día en la piel peribucal.
* **Descanso nocturno:** Mantén la elevación de cabecera al dormir con 2 almohadas para evitar despertar con congestión labial asimétrica.
* **Skincare y protección:** Aplica bálsamo reparador con pantenol B5 o madecassoside de 4 a 6 veces al día. A partir del segundo día puedes usar fotoprotector labial mineral SPF 30+ o SPF 50+ si vas a salir al exterior. Maquillaje labial suave permitido desde el día 2 si se retira con agua micelar suave sin frotar.
* **Restricción térmica y bucodental:** Cero saunas, baños turcos o duchas con agua ardiente. Pospón limpiezas dentales o citas odontológicas al menos 14 días.`,
            dos: [
              "Aplicar bálsamo reparador cicatrizante (pantenol B5, madecassoside o ácido hialurónico) 4 a 6 veces al día.",
              "Usar crema de árnica o vitamina K en toques delicados sobre zonas con hematomas peribucales.",
              "Continuar durmiendo boca arriba con 2 almohadas para acelerar la reabsorción del edema matutino.",
              "Ingerir entre 2 y 2.5 litros de agua diarios para alimentar la matriz hídrica del hialurónico.",
              "Realizar enjuagues orales suaves sin alcohol tras cada comida para máxima higiene."
            ],
            donts: [
              "No masajear ni intentar aplastar bultitos o irregularidades palpables (la inflamación es heterogénea).",
              "Evitar la exposición solar directa, lámparas UV, saunas y baños de inmersión caliente.",
              "No someterse a tratamientos dentales, empastes ni limpiezas orales profundas durante 2 semanas.",
              "No realizar depilación con cera o hilo en el labio superior (área del bozo) ni peelings periorales."
            ],
            checklist: [
              "🧴 Hidraté los labios 4-6 veces al día con bálsamo reparador emoliente neutro",
              "🌿 Apliqué crema de árnica o vitamina K sobre hematomas peribucales en toques suaves",
              "💧 Mantuve la ingesta de más de 2 litros de agua diarios para nutrir el gel de hialurónico",
              "🛏️ Dormí boca arriba con 2 almohadas para evitar presión lateral sobre los labios",
              "🚫 Evité masajear los nódulos transitorios y me abstuve de saunas y ejercicio vigoroso"
            ]
          }
        ]
      },
      {
        id: "mod-labios-3",
        title: "Fase de Asentamiento, Textura Final y Revisión",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            id: "les-labios-301",
            title: "Integración tisular, desinflamación y control médico a los 14 días",
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: `### Revelación del contorno natural y evaluación médica

A partir del día 5 al 7, el edema agudo cede casi en su totalidad. El producto se integra a nivel intersticial entre las fibras del músculo orbicular de los labios, tornándose suave, elástico y flexible al hablar o sonreír.

* **Evolución del volumen:** Notarás que el volumen inicial disminuye hasta acomodarse en la proyección natural proyectada. Las pequeñas induraciones se suavizan espontáneamente con la dinámica labial habitual.
* **Cuidados cotidianos:** Puedes reincorporar tu maquillaje labial preferido, hidratantes cosméticos y realizar ejercicio físico con normalidad. Mantén el uso de protector solar labial para prolongar la integridad del ácido hialurónico.
* **Cita médica de control (Día 14):** A las dos semanas el resultado es 100% definitivo. Es el momento pautado para acudir con tu especialista para fotografiar el resultado final y realizar balance de simetría si correspondiera.`,
            dos: [
              "Permitir la integración biológica natural del gel hialurónico en el tejido conectivo hasta el día 14.",
              "Reanudar con total normalidad el uso de cosméticos, barras labiales y perfiladores limpios.",
              "Mantener hidratación externa frecuente con bálsamo nutritivo que contenga filtro solar.",
              "Acudir a la cita de control médico a los 14 días para valorar simetría, arco de cupido y perfilado.",
              "Continuar con ingesta adecuada de agua diaria para optimizar la turgencia y durabilidad."
            ],
            donts: [
              "No alarmarse por la desinflamación natural del 25-30% del volumen inicial observado los primeros días.",
              "No apretar con pinzas o uñas nódulos residuales sin la instrucción explícita de tu médico.",
              "No someterse a micropigmentación labial ni tatuaje perioral antes de cumplirse 4 semanas."
            ],
            checklist: [
              "🪞 Evalué la forma real de mis labios con la desinflamación natural progresiva",
              "🧴 Apliqué bálsamo protector labial con filtro solar a diario",
              "💄 Reanudé cosméticos y labiales con higiene adecuada",
              "💧 Continué con mi consumo habitual de agua para mantener la hidrofilia del hialurónico",
              "📅 Confirmé la cita de revisión y control con mi especialista a los 14 días"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-rinomodelacion",
    title: "Rinomodelación sin Cirugía con Ácido Hialurónico",
    slug: "rinomodelacion-sin-cirugia-acido-hialuronico",
    category: "Armonización Facial",
    description: "Corrección tridimensional no quirúrgica del dorso, ángulo nasolabial y elevación de la punta nasal mediante ácido hialurónico reticulado de alta viscoelasticidad. Protocolo de bioseguridad vascular, protección estructural contra presiones externas y preservación de perfusión.",
    cover_url: "/images/rhino.jpg",
    recovery_time: "48 a 72 horas",
    pain_level: 2,
    duration_minutes: 40,
    results_duration: "12 a 18 meses",
    anesthesia_type: "Anestesia local infiltrativa / Tópica",
    price: 0,
    doctor_name: "Dra. Camila Restrepo",
    doctor_specialty: "Otorrinolaringología & Medicina Estética",
    alarm_signs: [
      "Palidez marmórea súbita, blanqueamiento o piel fría en la punta nasal, alas de la nariz o entrecejo (Signo crítico de compresión o embolia vascular)",
      "Dolor desproporcionado, agudo y punzante que irradia hacia la frente, la órbita ocular o los dientes",
      "Cambio de coloración cutánea hacia un tono violáceo, livedo reticularis o moteado grisáceo",
      "Pérdida visual súbita parcial o total, visión borrosa o dolor ocular retrobulbar (EMERGENCIA OFTALMOLÓGICA ABSOLUTA: acudir de inmediato)"
    ],
    modules: [
      {
        id: "mod-rino-1",
        title: "Fase Crítica e Inmediata: Día 0 (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-rino-101",
            title: "Prohibición absoluta de gafas, postura de descanso y vigilancia vascular",
            care_type: "prohibited",
            timeline_tag: "Día 0",
            body_md: `### Cuidado de la pirámide nasal y vigilancia de la microcirculación

La rinomodelación deposita depósitos de alta precisión de ácido hialurónico reticulado sobre el plano supraperióstico y supra pericóndrico. Durante las primeras horas el material es altamente maleable y vulnerable a la fuerza de la gravedad y compresiones externas.

* **PROHIBICIÓN ESTRICTA DE GAFAS O ANTEOJOS:** Está **terminantemente prohibido apoyar gafas formuladas, monturas ópticas, gafas de sol o cascos sobre el dorso de la nariz durante al menos 14 días**. El peso de la montura creará una indentación irreversible o desplazará el implante hacia los lados del dorso. Si requieres corrección visual, utiliza lentes de contacto o suspende las gafas fijándolas a la frente con esparadrapo médico sin tocar la nariz.
* **Postura y descanso nocturno:** Duerme estrictamente **boca arriba (decúbito supino) con 2 almohadas altas** para asegurar drenaje linfático. Coloca cojines a los lados de la cabeza para asegurar que no te gires accidentalmente durante el sueño. Prohibido dormir boca abajo o de lado.
* **Aplicación de frío seguro:** Aplica frío indirecto envuelto en gasa estéril limpia **únicamente en los pómulos o entrecejo por periodos de 10 minutos**. **NUNCA apoyes compresas ni ejerzas presión mecánica sobre el puente ni la punta nasal**.
* **Vigilancia vascular:** Revisa periódicamente en el espejo que la piel de la punta y dorso mantenga una coloración rosada natural, con temperatura cálida. Comunica al instante cualquier palidez o dolor intenso.
* **Higiene y alimentación:** Lava el rostro con gasas con suero fisiológico estéril en toques suaves sin arrastrar. Bebe al menos 2 litros de agua y consume alimentos templados de fácil masticación, evitando sonarte la nariz con fuerza.`,
            dos: [
              "Dormir en decúbito supino estricto (boca arriba) con 2 almohadas elevadas (30-45°) y soporte lateral con cojines.",
              "Inspeccionar periódicamente la coloración de la piel nasal frente al espejo (debe estar sonrosada y cálida).",
              "Limpiar suavemente la zona de los orificios de punción con gasa estéril humedecida en suero fisiológico mediante toquecitos.",
              "Si necesitas corrección óptica, usar lentes de contacto o suspender las gafas de la frente con cinta médica microporosa sin contacto nasal.",
              "Beber abundante agua y mantener reposo relativo en casa durante las primeras 24 horas."
            ],
            donts: [
              "PROHIBIDO el uso de gafas de ver, gafas de sol, monturas ópticas o visores de realidad virtual apoyados en la nariz.",
              "No presionar, apretar, pellizcar, empujar ni intentar moldear la punta o el dorso nasal con los dedos.",
              "No sonarse la nariz con fuerza explosiva ni hurgarse las fosas nasales; emplear solución salina suave si hay congestión.",
              "No dormir de lado ni boca abajo bajo ninguna circunstancia.",
              "No aplicar maquillaje, correctores ni cremas densas sobre la pirámide nasal en las primeras 24 horas."
            ],
            checklist: [
              "👓 Cero apoyo de gafas o monturas sobre el dorso nasal (usé lentes de contacto o suspensión frontal)",
              "🛏️ Dormí boca arriba con 2 almohadas y soportes laterales para no girar la cabeza",
              "🧊 Apliqué frío indirecto con gasa por 10 minutos en zonas periféricas sin comprimir la nariz",
              "🪞 Inspeccioné la coloración cutánea de la punta y dorso nasal (rosada, sin palidez ni manchas moradas)",
              "💧 Bebí al menos 2 litros de agua y consumí alimentos templados y suaves",
              "🚫 Evité sonarme la nariz bruscamente y mantuve mis manos alejadas de la zona tratada"
            ]
          }
        ]
      },
      {
        id: "mod-rino-2",
        title: "Fase de Consolidación y Prevención de Desplazamiento",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            id: "les-rino-201",
            title: "Mantenimiento estructural, fotoprotección mineral y control de hematomas",
            care_type: "allowed",
            timeline_tag: "Días 1–3",
            body_md: `### Fijación inicial de la corrección nasal

Durante los días 1 a 3, el ácido hialurónico comienza a interactuar con los glucosaminoglicanos y colágeno del tejido receptor. La estructura moldeada se afianza progresivamente.

* **Continuidad en la prohibición de gafas:** La restricción de gafas sobre el puente nasal se mantiene de manera rigurosa.
* **Skincare y fotoprotección:** Aplica protector solar 100% mineral SPF 50+ con toques milimétricos suaves de las yemas de los dedos, sin arrastrar producto sobre el dorso. Si notas algún hematoma puntual en el orificio de entrada de la cánula o aguja, aplica gel de **árnica o vitamina K** en capa fina con un bastoncillo limpio.
* **Postura y actividad física:** Mantén el descanso boca arriba con cabecera elevada. Suspende deportes de impacto, pesas, flexiones o posturas donde la cabeza quede por debajo del corazón (evitar congestión cefálica por aumento de presión hidrostática). Evita saunas y baños calientes.`,
            dos: [
              "Mantener la prohibición ininterrumpida de apoyar gafas o anteojos sobre el caballete nasal.",
              "Aplicar protector solar mineral SPF 50+ mediante toques muy suaves y sin presión en las mañanas.",
              "Si existen hematomas pequeños en el punto de entrada, usar gel con árnica o vitamina K en capa fina 2 veces al día.",
              "Continuar durmiendo boca arriba con cabecera elevada para facilitar el drenaje del edema perinasal.",
              "Mantener reposo relativo evitando actividades que eleven bruscamente la presión sanguínea facial."
            ],
            donts: [
              "No realizar deportes de contacto, tenis, natación con gafas herméticas ni entrenamientos de pesas vigorosos.",
              "No realizarse limpiezas de cutis con extracción de puntos negros en la nariz ni usar tiras adhesivas depilatorias.",
              "Evitar la exposición a saunas, baños turcos, duchas calientes y cocción a fuego directo con vapor en el rostro.",
              "No inclinarse súbitamente hacia el suelo con la cabeza baja (evitar aumento de presión hidrostática nasal)."
            ],
            checklist: [
              "👓 Mantuve la restricción estricta de anteojos y gafas sobre la pirámide nasal",
              "🧴 Apliqué protector solar mineral SPF 50+ mediante toques muy ligeros sin compresión",
              "🌿 Apliqué gel de árnica o vitamina K sobre hematomas discretos en puntos de acceso",
              "🛏️ Dormí en posición supina con dos almohadas durante toda la noche",
              "🏃 Evité entrenamientos vigorosos, levantamiento de cargas y fuentes de calor"
            ]
          }
        ]
      },
      {
        id: "mod-rino-3",
        title: "Fase de Asentamiento Estructural y Resultados Definitivos",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            id: "les-rino-301",
            title: "Estabilidad de la corrección nasal y revisión médica a las 2 semanas",
            care_type: "general",
            timeline_tag: "Días 4–14",
            body_md: `### Consolidación y evaluación del perfil nasal definitivo

A partir del día 5 a 7, el edema transitorio en el dorso y la punta nasal desaparece casi en su totalidad, revelando un dorso rectilíneo armonioso y una punta nasal estilizada y elevada.

* **Reincorporación gradual de monturas:** Se aconseja esperar al cumplimiento de las 2 semanas completas antes de volver a utilizar gafas convencionales de montura ligera. Evita monturas pesadas de acetato grueso o gafas de trabajo rígidas hasta recibir el visto bueno médico.
* **Fotoprotección continuada:** Continúa aplicando protector solar diario SPF 50+ para proteger el punto de punción de cánula y prevenir hiperpigmentaciones solares indeseadas.
* **Cita médica de valoración (Día 14):** Acude a tu control con el médico especialista para evaluar la estabilidad estructural, la simetría del perfil y archivar la fotografía de resultado final.`,
            dos: [
              "Continuar protegiendo el dorso nasal de golpes accidentales o presiones continuadas hasta el día 14.",
              "Retomar de forma progresiva la actividad aeróbica moderada evitando deportes con riesgo de impacto directo.",
              "Aplicar fotoprotector solar diario SPF 50+ para evitar pigmentación post-inflamatoria en el orificio de entrada.",
              "Asistir a la cita de control médico a los 14 días para valorar simetría, proyección y estabilidad del implante.",
              "Evaluar la armonía estética mediante fotografías de perfil y frente comparativas."
            ],
            donts: [
              "No utilizar monturas pesadas de pasta o gafas de natación/buceo ajustadas antes del día 14 sin consultar.",
              "No manipular con fuerza los cartílagos alares o el dorso de la nariz al sonarse o secarse el rostro.",
              "No aplicarse aparatología facial focalizada en la nariz (radiofrecuencia o ultrasonido focalizado)."
            ],
            checklist: [
              "👃 Verifiqué la fijación del dorso y la punta nasal con resolución del edema inicial",
              "🧴 Mantuve fotoprotección SPF 50+ estricta en el dorso y punta nasal a diario",
              "👓 Mantuve prudencia con monturas pesadas hasta cumplir los 14 días reglamentarios",
              "📸 Tomé fotografías de perfil y frente para mi seguimiento clínico",
              "📅 Acudí o confirmé mi cita médica de control estructural a los 14 días"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-peeling-quimico",
    title: "Peeling Químico Médico Facial (AHA / TCA / Retinoico)",
    slug: "peeling-quimico-medico-facial",
    category: "Dermoestética",
    description: "Protocolo médico de exfoliación química controlada para renovación celular dérmica, atenuación de manchas pigmentarias, secuelas de acné y textura cutánea. Manejo estricto de la barrera cutánea, reepitelización segura, hidratación emoliente y fotoprotección médica innegociable.",
    cover_url: "/images/peeling.jpg",
    recovery_time: "5 a 7 días",
    pain_level: 2,
    duration_minutes: 45,
    results_duration: "Efecto acumulativo en ciclos periódicos",
    anesthesia_type: "Sin anestesia / Ventilación de aire frío",
    price: 0,
    doctor_name: "Dr. Fernando Morales",
    doctor_specialty: "Dermatólogo Clínico y Estético",
    alarm_signs: [
      "Aparición de ampollas dolorosas con contenido seroso amarillento o exudado purulento (sospecha de sobreinfección)",
      "Enrojecimiento severo que aumenta en intensidad y temperatura pasadas las primeras 48 horas",
      "Dolor quemante urente persistente que no cede con la aplicación de bálsamo reparador emoliente",
      "Oscurecimiento reactivo abrupto o pigmentación moteada grisácea (hiperpigmentación post-inflamatoria reactiva)"
    ],
    modules: [
      {
        id: "mod-peel-1",
        title: "Fase Inmediata y Neutralización Cutánea: Día 0 (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-peel-101",
            title: "Calma epidérmica, barrera tópica y fotoprotección cero exposición",
            care_type: "prohibited",
            timeline_tag: "Día 0",
            body_md: `### Cuidado de la epidermis sensibilizada y mantenimiento de la barrera

En las primeras 24 horas tras el peeling médico, los agentes químicos (ácido glicólico, mandélico, TCA o retinoico) han iniciado la degradación controlada de los corneocitos del estrato córneo. La piel se siente tirante, enrojecida y sensible al calor.

* **Alivio seguro del calor cutáneo:** Si experimentas sensación de ardor o calor, no apliques hielo directo. Utiliza **brumas de agua termal fría** (conservada en refrigerador) o compresas de gasa estéril humedecida en agua termal en **pulsos de 10 minutos** para calmar la reactividad dérmica sin frotar.
* **Postura y descanso:** Duerme boca arriba con 2 almohadas y utiliza una funda de almohada limpia de algodón suave o seda para evitar fricciones nocturnas involuntarias sobre el rostro.
* **Skincare y nutrición dérmica:** Aplica en capa generosa un **bálsamo reparador epidérmico calmante** (con pantenol B5, madecassoside, óxido de zinc o ceramidas, como Cicalfate o Cicaplast B5) de 3 a 5 veces al día según la sensación de tirantez. No laves la cara con jabones convencionales ni agua caliente; usa agua templada o fresca sola.
* **Cero maquillaje y cero irritantes:** Totalmente prohibido el uso de bases de maquillaje, correctores, polvos, perfumes o cosméticos con retinoides, ácidos exfoliantes o vitamina C.
* **Alimentación y protección solar:** Bebe al menos 2.5 litros de agua fresca para contrarrestar la pérdida transepidérmica de agua. Evita comidas picantes o muy calientes y alcohol. Permanece en interiores alejado de la luz solar directa.`,
            dos: [
              "Aplicar bálsamo reparador epitelizante (con pantenol B5 o madecassoside) de 3 a 5 veces al día ante cualquier tirantez.",
              "Rociar bruma de agua termal fresca o aplicar compresas con gasa estéril fría en pulsos de 10 minutos para calmar el calor.",
              "Dormir boca arriba con 2 almohadas y funda de almohada limpia para minimizar el roce mecánico nocturno.",
              "Permanecer en interiores protegidos de la radiación solar directa y fuentes de calor.",
              "Hidratación oral intensiva con abundante agua fresca (mínimo 2.5 litros diarios)."
            ],
            donts: [
              "PROHIBIDO arrancar, pellizcar o frotar la piel aunque comience a sentirse apergaminada o acartonada.",
              "No lavar el rostro con jabones comunes con detergentes, esponjas exfoliantes ni agua caliente.",
              "PROHIBIDO aplicar bases de maquillaje, correctores, polvos o iluminadores durante las primeras 24 horas.",
              "No usar productos cosméticos con retinol, ácido glicólico, salicílico ni vitamina C ácida.",
              "No exponerse al sol directo ni consumir comidas picantes, muy calientes o bebidas alcohólicas."
            ],
            checklist: [
              "🧴 Apliqué crema barrera reparadora calmante (pantenol/madecassoside) en capa generosa",
              "🧊 Usé compresas de gasa con agua termal fría por 10 minutos para calmar el ardor",
              "🛏️ Dormí boca arriba con 2 almohadas y funda limpia para evitar fricción facial",
              "💧 Bebí 2.5 litros de agua fresca y evité comidas calientes, picantes o alcohol",
              "🚫 Cero maquillaje, exfoliantes, ácidos y cero exposición directa a la radiación solar"
            ]
          }
        ]
      },
      {
        id: "mod-peel-2",
        title: "Fase de Descamación Activa y Reepitelización",
        position: 2,
        timeline_tag: "Días 1–3",
        lessons: [
          {
            id: "les-peel-201",
            title: "Regla de oro: desprendimiento natural, regeneración y fotoprotección mineral",
            care_type: "prohibited",
            timeline_tag: "Días 1–3",
            body_md: `### La regla inquebrantable de la descamación médica

Entre el día 2 y el día 4 comenzará la fase de descamación activa ("pelado"), normalmente iniciando alrededor de la boca y extendiéndose hacia mejillas y frente.

* **LA REGLA DE ORO DEL PEELING:** **BAJO NINGUNA CIRCUNSTANCIA DEBES ARRANCAR, JALAR, DESPEGAR NI RASCAR LAS PIELES SECAS.** La epidermis subyacente aún no ha completado su queratinización madura. Si jalas una escama forzadamente, arrancarás queratinocitos inmaduros exponiendo la dermis papilar, lo que provocará una mancha oscura permanente (**hiperpigmentación postinflamatoria**) o cicatriz atrófica.
* **Cómo gestionar las pieles sueltas:** Las pieles deben desprenderse espontáneamente durante el lavado suave facial. Si una lámina de piel suelta cuelga y resulta molesta, puedes recortar cuidadosamente el extremo libre con una tijerita limpia y desinfectada, **NUNCA jalarla de la raíz**.
* **Skincare y nutrición dérmica:** Hidrata continuamente con crema reparadora emoliente (Cicaplast B5, Cicalfate o equivalente) entre 4 y 6 veces al día. Lava suavemente con un limpiador Syndet sin jabón y agua tibia, secando con toquecitos delicados de toalla limpia sin frotar.
* **Fotoprotección mineral innegociable:** La piel nueva carece temporalmente de manto lipídico y melanina defensiva. Aplica **protector solar 100% mineral SPF 50+ cada 2 a 3 horas de forma innegociable**, incluso si estás dentro de casa. Si sales a la calle, usa sombrero de ala ancha y gafas oscuras.`,
            dos: [
              "REGLA DE ORO: Dejar que las pieles descamadas caigan por sí solas en el lavado suave; jamás arrancarlas.",
              "Aplicar crema hidratante reparadora (Cicaplast B5, Cicalfate o equivalente) de 4 a 6 veces al día.",
              "Aplicar fotoprotector 100% mineral SPF 50+ cada 2 a 3 horas religiosamente desde la mañana.",
              "Lavar suavemente con limpiador Syndet sin jabón y agua tibia, secando con toques suaves de toalla limpia.",
              "Utilizar sombrero de ala ancha y gafas oscuras de alta protección al salir al exterior.",
              "Si alguna piel suelta cuelga en exceso, recortar con tijeritas limpias el borde libre sin jalar la raíz."
            ],
            donts: [
              "JAMÁS jalar, pelar ni raspar las escamas de piel seca (riesgo severo de mancha o cicatriz permanente).",
              "No aplicar maquillaje cosmético sobre las áreas que se encuentran activamente pelándose.",
              "Cero ejercicio vigoroso que produzca sudoración profusa (las sales del sudor irritan intensamente la piel nueva).",
              "Prohibido entrar a piscinas con cloro, jacuzzis, saunas y playas.",
              "No utilizar toallitas desmaquillantes, tónicos astringentes con alcohol ni cepillos mecánicos de limpieza."
            ],
            checklist: [
              "🚫 REGLA DE ORO: No arranqué ni tiré de ninguna piel; dejé que se desprendan naturalmente",
              "🧴 Apliqué bálsamo cicatrizante y reparador 4 a 6 veces al día ante cada sensación de tirantez",
              "☀️ Apliqué y reapliqué protector solar mineral SPF 50+ cada 2 a 3 horas religiosamente",
              "🧼 Lavé mi rostro con limpiador Syndet suave con agua tibia y secado por toques",
              "🧢 Usé sombrero de ala ancha y evité por completo el sol directo y el sudor intenso"
            ]
          }
        ]
      },
      {
        id: "mod-peel-3",
        title: "Fase de Regeneración de Barrera Cutánea y Fotoprotección Médica",
        position: 3,
        timeline_tag: "Días 4–14",
        lessons: [
          {
            id: "les-peel-301",
            title: "Consolidación epidérmica, nutrición avanzada y prevención de manchas",
            care_type: "allowed",
            timeline_tag: "Días 4–14",
            body_md: `### Consolidación de la nueva epidermis y protocolo anti-manchas

Hacia el día 5 al 7, la descamación concluye. La nueva capa epidérmica está completamente expuesta: se aprecia más luminosa, con poros más compactos y tono homogéneo, pero con una reactividad vascular elevada.

* **El escudo solar diario:** La prevención de hiperpigmentación postinflamatoria exige mantener la reaplicación de **protector solar SPF 50+ cada 3 a 4 horas durante al menos 30 días posteriores al tratamiento**.
* **Nutrición de la barrera cutánea:** Enriquecer la rutina con sueros de **ácido hialurónico puro**, lociones con **ceramidas, niacinamida y fosfolípidos** para restituir la barrera hidrolipídica y optimizar la elasticidad dérmica.
* **Reanudación del maquillaje:** Puedes reanudar el uso de maquillaje cosmético hipoalergénico una vez que la descamación haya finalizado al 100% en todo el rostro.
* **Activos cosméticos y depilación:** No reintroduzcas ácidos glicólicos, salicílicos, exfoliantes físicos ni retinoides hasta haber completado los 14 días y consultar la pauta médica. Suspende cualquier método de depilación facial durante al menos 4 semanas.`,
            dos: [
              "Reaplicar protector solar SPF 50+ de amplio espectro cada 3 a 4 horas durante los próximos 30 días.",
              "Nutrir la nueva epidermis con ácido hialurónico puro y cremas reparadoras con ceramidas y niacinamida.",
              "Reanudar el maquillaje cosmético mineral hipoalergénico solo cuando la descamación haya cesado por completo.",
              "Monitorear la uniformidad del tono de piel e informar oportunamente cualquier pigmentación reactiva.",
              "Asistir a la revisión dermatológica de control o sesión complementaria programada."
            ],
            donts: [
              "No exponerse deliberadamente al sol en playas, piscinas o terrazas durante al menos un mes completo.",
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
          }
        ]
      }
    ]
  }
];

export function getProcedureBySlug(slug: string): ClinicalProcedure | undefined {
  return CLINICAL_PROCEDURES.find((p) => p.slug === slug);
}

/**
 * Devuelve el módulo y lección clínica que corresponde según el día de recuperación del paciente:
 * - Día 0 o 1: Módulo 1 (Fase Inmediata - Horas 0-24)
 * - Días 2 a 3 (o 1 a 3): Módulo 2 (Fase de Estabilización y Edema)
 * - Días 4 en adelante: Módulo 3 (Fase de Asentamiento y Resultados Finales)
 */
export function getPhaseForDay(procedure: ClinicalProcedure, day: number) {
  if (!procedure.modules || procedure.modules.length === 0) {
    return null;
  }

  let moduleIndex = 0;
  if (day >= 4 && procedure.modules.length > 2) {
    moduleIndex = 2;
  } else if (day >= 2 && procedure.modules.length > 1) {
    moduleIndex = 1;
  }

  const mod = procedure.modules[moduleIndex];
  const lesson = mod.lessons?.[0];

  return {
    module: mod,
    lesson,
    timelineTag: lesson?.timeline_tag || mod.timeline_tag,
    phaseTitle: mod.title,
    dos: lesson?.dos || [],
    donts: lesson?.donts || [],
    checklist: lesson?.checklist || []
  };
}
