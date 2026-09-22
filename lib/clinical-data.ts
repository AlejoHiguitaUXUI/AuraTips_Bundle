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
    description: "Protocolo médico integral de relajación neuromuscular selectiva para líneas de expresión frontales, glabelares (entrecejo) y patas de gallo. Guía de recuperación y prevención de asimetrías.",
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
      "Caída del párpado superior o ceja (ptosis palpebral)",
      "Visión doble o visión borrosa persistente",
      "Asimetría facial marcada e involuntaria",
      "Dificultad para tragar o hablar (caso extremadamente raro)"
    ],
    modules: [
      {
        id: "mod-botox-1",
        title: "Fase Inmediata: Primeras 4 Horas Críticas",
        position: 1,
        timeline_tag: "0 a 4 Horas",
        lessons: [
          {
            id: "les-botox-101",
            title: "Postura erguida y gesticulación guiada",
            care_type: "allowed",
            timeline_tag: "Horas 0-4",
            body_md: `### Primeras horas tras la microinyección

Durante las primeras 4 horas, la molécula de toxina botulínica se encuentra en proceso de fijación a los receptores presinápticos en la unión neuromuscular. Cualquier presión mecánica puede causar difusión involuntaria hacia músculos adyacentes.

* Mantén la cabeza en posición vertical; no te recuestes boca abajo ni descanses en el sofá horizontalmente.
* Realiza gesticulaciones suaves cada 15 minutos (sonreír, fruncir el ceño ligeramente) para favorecer la captación del fármaco.`,
            dos: [
              "Permanecer sentado o de pie con la cabeza erguida al menos 4 horas.",
              "Gesticular suavemente para dinamizar la unión neuromuscular.",
              "Ingerir agua a temperatura templada o fresca."
            ],
            donts: [
              "No acostarse ni tomar siestas durante las primeras 4 horas.",
              "No masajear, frotar o presionar los puntos de punción.",
              "No usar cintas para el cabello, gorros ajustados ni cascos."
            ],
            checklist: [
              "Permanecí 4 horas con postura vertical",
              "Evité frotar los puntos de aplicación",
              "Realicé micro-gesticulaciones suaves"
            ]
          }
        ]
      },
      {
        id: "mod-botox-2",
        title: "Fase de Estabilización: Primeras 24 a 48 Horas",
        position: 2,
        timeline_tag: "Días 1 a 2",
        lessons: [
          {
            id: "les-botox-201",
            title: "Restricción de actividad física y control térmico",
            care_type: "prohibited",
            timeline_tag: "24-48 Horas",
            body_md: `### Evitar vasodilatación y calor extremo

El aumento del flujo sanguíneo facial derivado del ejercicio de alta intensidad o de fuentes de calor directo (saunas, baños turcos, hornos) acelera la eliminación del producto antes de que logre su acople neuromuscular completo.

* Suspende entrenamientos de crossfit, running o levantamiento de pesas durante 48 horas.
* Aplica protector solar mineral sin presionar con fuerza al lavar la piel.`,
            dos: [
              "Lavado facial suave con agua fría o templada y limpiador Syndet.",
              "Uso de protector solar SPF 50+ con toques suaves.",
              "Dormir en posición decúbito supino (boca arriba) la primera noche."
            ],
            donts: [
              "Cero ejercicio cardiovascular vigoroso o pesas por 48 horas.",
              "Prohibido saunas, vapores, duchas ardientes y camas de bronceado.",
              "No consumir alcohol en exceso las primeras 24 horas (reduce riesgo de hematomas)."
            ],
            checklist: [
              "Pospuse mi entrenamiento por 48 horas",
              "No me expuse a vapores ni saunas",
              "Dormí boca arriba la primera noche"
            ]
          }
        ]
      },
      {
        id: "mod-botox-3",
        title: "Fase de Fijación y Resultados: Días 3 a 15",
        position: 3,
        timeline_tag: "Día 3 al 15",
        lessons: [
          {
            id: "les-botox-301",
            title: "Evolución gradual y cita de control",
            care_type: "general",
            timeline_tag: "Días 7-15",
            body_md: `### Línea de tiempo de los resultados

* **Día 3 a 5:** Notarás que las arrugas dinámicas comienzan a atenuarse progresivamente.
* **Día 7 a 10:** El bloqueo muscular se aproxima al 85-90%.
* **Día 14 a 15:** Es el momento en que se evalúa el resultado definitivo. Si existe alguna leve asimetría o punto residual, se realiza el retoque en consulta médica.`,
            dos: [
              "Tomar fotografías de control frontal y en movimiento para tu ficha médica.",
              "Agendar la cita de revisión al cumplir 14 días.",
              "Continuar con tu rutina habitual de hidratación dérmica."
            ],
            donts: [
              "No solicitar retoques antes del día 14, el efecto aún está en desarrollo.",
              "No realizar limpiezas faciales profundas ni microdermoabrasión antes de 10 días."
            ],
            checklist: [
              "Observé la evolución progresiva sin ansiedad",
              "Agendé mi revisión de control a los 14 días"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-acido-hialuronico-labios",
    title: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    slug: "acido-hialuronico-labios-russian-lips",
    category: "Inyectables",
    description: "Protocolo clínico para aumento, eversión sutil e hidratación profunda con ácido hialurónico reticulado. Manejo paso a paso de edema, hematomas y pautas de higiene post-inyección.",
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
      "Palidez, moteado blanco o azul violáceo en el labio o piel peribucal (Signo de isquemia vascular urgente)",
      "Dolor desproporcionado, agudo y pulsátil que no calma con analgesia común",
      "Aparición de pequeñas pústulas o ampollas en racimo (reactivación herpética)",
      "Temperatura cutánea fría comparada con el resto del rostro"
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
            title: "Crioterapia intermitente y prevención de asimetrías",
            care_type: "allowed",
            timeline_tag: "0-24h",
            body_md: `### Protocolo antiinflamatorio inicial

El tejido labial es altamente vascularizado y sensible. Es completamente normal experimentar edema (inflamación) durante las primeras 48 horas.

* Aplica compresas frías envueltas en una gasa estéril limpia durante 5 a 10 minutos cada dos horas.
* **Nunca** apliques hielo directamente sobre la mucosa sin protección, para evitar quemaduras por congelación.
* Evita bebidas muy calientes mientras continúe el efecto de la anestesia tópica para no morderte involuntariamente.`,
            dos: [
              "Aplicar frío local indirecto por intervalos de 10 minutos.",
              "Mantener los labios lubricados con ungüento reparador estéril (ácido hialurónico puro o vaselina grado médico).",
              "Beber abundante agua a sorbos suaves de vaso abierto."
            ],
            donts: [
              "No utilizar sorbetes, pitillos ni pajillas (la succión desplaza el gel reticulado).",
              "No besar apasionadamente ni presionar los labios fuertemente las primeras 48h.",
              "No fumar, vapear ni consumir alcohol en las primeras 24 horas.",
              "No aplicar maquillaje labial ni labiales con color hasta después de 24 horas."
            ],
            checklist: [
              "Apliqué frío local indirecto con gasa",
              "Evité el uso de pajillas o sorbetes",
              "No apliqué cosméticos labiales con pigmento"
            ]
          }
        ]
      },
      {
        id: "mod-labios-2",
        title: "Fase de Asentamiento: Días 2 a 7",
        position: 2,
        timeline_tag: "Días 2 al 7",
        lessons: [
          {
            id: "les-labios-201",
            title: "Manejo de hematomas, nódulos temporales y edema",
            care_type: "general",
            timeline_tag: "Días 2-7",
            body_md: `### La regla de los 7 días

Entre el día 2 y el día 4 el volumen parecerá un 30% mayor del resultado real debido a la retención de agua propia del ácido hialurónico. Esto no es el resultado final.

* Si palpas pequeñas durezas, no las aprietes agresivamente; el gel se integra gradualmente al tejido con la movilidad natural.
* Puedes aplicar gel de árnica o vitamina K en caso de hematomas superficiales peribucales.`,
            dos: [
              "Dormir con la cabeza ligeramente elevada con doble almohada.",
              "Reanudar maquillaje labial suave con aplicador desinfectado a partir del día 2.",
              "Mantener hidratación sistémica (2 litros de agua diarios)."
            ],
            donts: [
              "No realizar masajes vigorosos salvo indicación expresa de tu especialista.",
              "Evitar tratamientos dentales o limpiezas orales profundas durante 2 semanas.",
              "Evitar vuelos comerciales de larga distancia en las primeras 48h si hay inflamación aguda."
            ],
            checklist: [
              "Dormí con elevación para reducir el edema matutino",
              "Consumí adecuada agua para favorecer la hidrofilia del hialurónico",
              "Esperé pacientemente la desinflamación natural"
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
    description: "Corrección no quirúrgica del dorso y elevación de la punta nasal. Pautas críticas de cuidado para garantizar la integración segura del implante y proteger la perfusión nasal.",
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
      "Palidez marmórea o blanqueamiento en la punta nasal o el entrecejo",
      "Dolor agudo punzante que irradia hacia la frente o los ojos",
      "Cambio de coloración cutánea hacia un tono violáceo o grisáceo",
      "Pérdida visual súbita o dolor ocular (Urgencia oftalmológica absoluta)"
    ],
    modules: [
      {
        id: "mod-rino-1",
        title: "Cuidados Críticos: Primeras 48 Horas",
        position: 1,
        timeline_tag: "Días 0 a 2",
        lessons: [
          {
            id: "les-rino-101",
            title: "Prohibición de anteojos y presión sobre el dorso",
            care_type: "prohibited",
            timeline_tag: "Días 0-15",
            body_md: `### Cuidado estructural de la nariz

La pirámide nasal es una zona anatómica noble con soporte cartilaginoso. El gel inyectado necesita consolidarse sin fuerzas de compresión externas.

* **Está terminantemente prohibido usar gafas formuladas o lentes de sol apoyados sobre el dorso nasal durante al menos 14 días.** Si requieres visión corregida, utiliza lentes de contacto o suspende las gafas de la frente con cinta médica.
* Duerme en decúbito supino estricto (boca arriba). Nunca apoyes la cara lateralmente contra la almohada.`,
            dos: [
              "Dormir boca arriba con soporte lateral para evitar girar la cabeza.",
              "Limpiar la zona con suero fisiológico estéril con toques suaves.",
              "Vigilar la coloración de la piel frente al espejo tres veces al día."
            ],
            donts: [
              "Prohibido usar gafas de sol, monturas ópticas o protectores faciales apoyados en la nariz.",
              "No sonarse la nariz con fuerza explosiva; usar lavados suaves si hay congestión.",
              "No presionar ni pellizcar la punta nasal.",
              "Evitar deportes de contacto por 3 semanas."
            ],
            checklist: [
              "Evité apoyar gafas o lentes en el dorso nasal",
              "Dormí en posición boca arriba toda la noche",
              "Verifiqué que la coloración de la piel esté rosada y uniforme"
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
    description: "Exfoliación química controlada para renovación celular, manchas hiperpigmentarias, secuelas de acné y textura cutánea. Protocolo de reepitelización y protección solar de alta exigencia.",
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
      "Presencia de ampollas dolorosas con líquido amarillento o exudado purulento",
      "Enrojecimiento severo que aumenta de temperatura tras 48 horas",
      "Dolor quemante que no remite con crema cicatrizante emoliente",
      "Pigmentación oscura irregular abrupta (hiperpigmentación post-inflamatoria reactiva)"
    ],
    modules: [
      {
        id: "mod-peel-1",
        title: "Fase de Descamación y Barrera Cutánea: Días 1 a 5",
        position: 1,
        timeline_tag: "Días 1 a 5",
        lessons: [
          {
            id: "les-peel-101",
            title: "Prohibición absoluta de arrancar las pieles y nutrición tópica",
            care_type: "prohibited",
            timeline_tag: "Días 1-5",
            body_md: `### Protección de la piel nueva en regeneración

Alrededor del día 2 al 4 notarás tirantez y la piel comenzará a desprenderse en láminas finas.

* **REGLA DE ORO:** Bajo ninguna circunstancia jales, arranques o rasques las pieles descamadas. Arrancar prematuramente una capa puede generar una cicatriz o mancha oscura permanente (hiperpigmentación postinflamatoria).
* Aplica bálsamos calmantes de grado médico con base en pantenol, madecassoside o ácido hialurónico cuantas veces sea necesario para mantener la piel confortable.`,
            dos: [
              "Aplicar crema hidratante reparadora (Cicaplast B5, Cicalfate o equivalente) 4 a 6 veces al día.",
              "Lavar con agua mineral o agua tibia con limpiador sin jabón (Syndet).",
              "Secar la cara mediante toques suaves con toalla limpia de microfibra, sin frotar."
            ],
            donts: [
              "JAMÁS arrancar o jalar las pieles secas; deben caer por sí solas en el lavado.",
              "Cero exfoliantes físicos (scrubs), ácidos de uso doméstico o retinol durante 14 días.",
              "No exponerse al sol directo ni siquiera con protector puesto."
            ],
            checklist: [
              "Apliqué bálsamo hidratante cada vez que sentí tirantez",
              "Dejé que las escamas caigan solas sin tirar de ellas",
              "Usé jabón suave syndet sin frotar"
            ]
          }
        ]
      },
      {
        id: "mod-peel-2",
        title: "Fotoprotección Estricta: Días 1 a 30",
        position: 2,
        timeline_tag: "Mes 1",
        lessons: [
          {
            id: "les-peel-201",
            title: "El escudo solar: reaplicación cada 3 horas",
            care_type: "allowed",
            timeline_tag: "Día 1-30",
            body_md: `### Fotoprotección médica post-peeling

La nueva epidermis carece temporalmente de su manto lipídico defensivo y de pigmentación protectora. La exposición a rayos UVA/UVB o a luz azul de pantallas sin protección provocará manchas inmediatas.

* Utiliza un fotoprotector mineral o de amplio espectro SPF 50+ con protección UVA alta (PA++++).
* Reaplica cada 3 horas religiosamente si estás cerca de ventanas, conduciendo o al aire libre.`,
            dos: [
              "Fotoprotector solar SPF 50+ cada 3 horas de forma innegociable.",
              "Uso de sombrero de ala ancha y gafas oscuras al transitar en exteriores.",
              "Evitar ambientes con polvo, vapores químicos o humo."
            ],
            donts: [
              "Prohibido tomar el sol en piscinas, playas o terrazas durante 1 mes.",
              "No maquillarse durante los días de descamación activa (días 1 al 4)."
            ],
            checklist: [
              "Reapliqué protector solar 3 veces al día mínimo",
              "Usé sombrero o visera al salir a la calle",
              "Mantuve mi piel alejada de la luz solar directa"
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
