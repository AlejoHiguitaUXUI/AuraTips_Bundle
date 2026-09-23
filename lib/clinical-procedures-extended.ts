import { ClinicalProcedure } from "./clinical-data";

export const EXTENDED_CLINICAL_PROCEDURES: ClinicalProcedure[] = [
  // =========================================================================
  // FACIAL (Procedimientos 6 al 9)
  // =========================================================================
  {
    id: "proc-limpieza-plasma-facial",
    title: "Limpieza Facial Profunda + Plasma Rico en Plaquetas (PRP)",
    slug: "limpieza-facial-plasma-facial",
    category: "Facial",
    description: "Protocolo dual de higiene dermatológica profunda, extracción asistida de comedones e hidratación celular, complementado con bioestimulación autóloga mediante plasma rico en plaquetas para revitalizar la luminosidad y elasticidad dérmica.",
    cover_url: "/images/plasma-facial.jpg",
    recovery_time: "12 a 24 horas",
    pain_level: 1,
    duration_minutes: 60,
    results_duration: "1 a 3 meses",
    anesthesia_type: "Anestesia tópica en crema",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética Facial",
    alarm_signs: [
      "Enrojecimiento severo o edema periorbital que empeore pasadas 48 horas",
      "Aparición de pústulas, supuración o signos de infección bacteriana",
      "Fiebre o sensación de calor excesivo localizado en el rostro",
      "Reacción alérgica aguda con urticaria o dificultad respiratoria"
    ],
    modules: [
      {
        id: "mod-plasma-1",
        title: "Fase Inmediata: Regeneración y Sellado Dérmico (Horas 0-24)",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-plasma-101",
            title: "Cuidado de micropunciones y absorción de factores de crecimiento",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "Tras la aplicación de plasma rico en plaquetas y la limpieza profunda, los microcanales dérmicos permanecen activos recibiendo los factores de crecimiento autólogos. Mantén la piel limpia sin aplicar productos cosméticos o maquillaje las primeras 24 horas. Lava únicamente con agua fresca o solución salina estéril mediante suaves toques.",
            dos: [
              "Mantener el rostro limpio y descubierto sin tocar con manos no desinfectadas.",
              "Lavar suavemente con solución salina estéril o agua fresca a toques suaves tras 6 horas.",
              "Dormir boca arriba con la cabeza ligeramente elevada para favorecer el drenaje.",
              "Hidratación oral abundante con al menos 2 litros de agua."
            ],
            donts: [
              "No aplicar maquillaje, bases con color ni polvos durante 24 horas.",
              "No frotar, rascar ni exfoliar la piel del rostro.",
              "Evitar exposición solar directa, saunas, baños turcos y piscinas durante 72 horas.",
              "No realizar ejercicio físico vigoroso que induzca sudoración profusa en las primeras 24 horas."
            ],
            checklist: [
              "Dejé reposar el plasma en el rostro sin lavarme de inmediato",
              "Evité el uso de maquillaje durante todo el primer día",
              "Dormí boca arriba con cabecera ligeramente elevada",
              "Apliqué agua fresca sin frotar"
            ]
          }
        ]
      },
      {
        id: "mod-plasma-2",
        title: "Fase de Luminosidad y Fotoprotección (Días 1 a 3)",
        position: 2,
        timeline_tag: "Día 1-3",
        lessons: [
          {
            id: "les-plasma-102",
            title: "Reactivación celular y barrera cutánea",
            care_type: "general",
            timeline_tag: "Día 1-3",
            body_md: "En esta fase disminuye el eritema leve y la piel comienza a sintetizar nuevo colágeno. Es obligatorio el uso de protector solar mineral de amplio espectro FPS 50+ cada 3 a 4 horas para proteger la nueva capa celular.",
            dos: [
              "Aplicar protector solar FPS 50+ no comedogénico cada 3-4 horas.",
              "Utilizar cremas hidratantes formuladas con ácido hialurónico o pantenol.",
              "Reanudar maquillaje ligero mineral a partir de las 24-48 horas."
            ],
            donts: [
              "No utilizar ácidos exfoliantes (glicólico, salicílico, retinoides) durante 7 días.",
              "Evitar el bronceado directo o camas solares.",
              "No acudir a fuentes de calor intenso como saunas o vapores."
            ],
            checklist: [
              "Apliqué protector solar cada 3-4 horas con toques delicados",
              "Hidraté con suero suave sin perfumes ni alcohol",
              "Evité exfoliantes y retinoides"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-dermapen",
    title: "Dermapen (Microneedling de Regeneración Facial)",
    slug: "dermapen-microneedling",
    category: "Facial",
    description: "Terapia médica de inducción de colágeno mediante microagujas oscilantes estériles a profundidad controlada. Estimula la renovación celular, mejora la textura cutánea, minimiza poros dilatados y atenúa cicatrices de acné.",
    cover_url: "/images/dermapen.jpg",
    recovery_time: "24 a 48 horas",
    pain_level: 2,
    duration_minutes: 45,
    results_duration: "6 a 12 meses (progresivo por ciclo de sesiones)",
    anesthesia_type: "Anestesia tópica en crema (lidocaína)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética Facial",
    alarm_signs: [
      "Sensación de ardor extremo o quemazón persistente mayor a 24 horas",
      "Signos de infección cutánea: supuración, costras amarillentas mielicéricas o pústulas",
      "Fiebre o inflamación facial asimétrica progresiva",
      "Hiperpigmentación post-inflamatoria súbita por exposición lumínica prematura"
    ],
    modules: [
      {
        id: "mod-derm-1",
        title: "Fase de Calma Epidérmica y Cierre de Microcanales (Día 0-1)",
        position: 1,
        timeline_tag: "Día 0-1",
        lessons: [
          {
            id: "les-derm-101",
            title: "Control del eritema post-microneedling",
            care_type: "allowed",
            timeline_tag: "Día 0-1",
            body_md: "Es completamente normal experimentar un enrojecimiento similar a una quemadura solar leve y sensación de tirantez. Los microcanales generados cierran en las primeras 24 horas. No apliques productos cosméticos convencionales.",
            dos: [
              "Aplicar suero regenerador estéril o ácido hialurónico puro formulado por la especialista.",
              "Lavar con agua mineral o hervida templada con toques suaves de toalla estéril sin arrastre.",
              "Cambiar la funda de la almohada por una limpia la primera noche."
            ],
            donts: [
              "Cero maquillaje durante las primeras 24 a 48 horas.",
              "No tocar el rostro con las manos sucias.",
              "Evitar el gimnasio, cardio intenso o ambientes con polvo o bacterias.",
              "No aplicar cremas con fragancias, alcohol o ácidos activos."
            ],
            checklist: [
              "Cambié la funda de mi almohada por una limpia",
              "Evité maquillarme durante las 24 horas post-procedimiento",
              "Apliqué solo el suero estéril indicado por la especialista",
              "No realicé actividad deportiva que me hiciera transpirar"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-radiofrecuencia-facial",
    title: "Radiofrecuencia Facial (Lifting no Quirúrgico)",
    slug: "radiofrecuencia-facial",
    category: "Facial",
    description: "Diatermia dérmica controlada mediante ondas electromagnéticas de alta frecuencia para contraer fibras de colágeno existentes y estimular la producción de nueva elastina en tercio inferior, mejillas y cuello.",
    cover_url: "/images/radiofrecuencia-facial.jpg",
    recovery_time: "Inmediata (0 a 2 horas)",
    pain_level: 1,
    duration_minutes: 40,
    results_duration: "4 a 8 meses con sesiones de mantenimiento",
    anesthesia_type: "No requerida (gel conductor térmico)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética Facial",
    alarm_signs: [
      "Aparición de ampollas, vesículas o flictenas térmicas",
      "Eritema persistente con dolor localizado mayor a 24 horas",
      "Pérdida de sensibilidad focal en zonas tratadas",
      "Hinchazón desproporcionada en cuello o mandíbula"
    ],
    modules: [
      {
        id: "mod-rf-1",
        title: "Fase de Hidratación y Mantenimiento Térmico",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-rf-101",
            title: "Post-sesión de radiofrecuencia facial",
            care_type: "general",
            timeline_tag: "Día 0",
            body_md: "La radiofrecuencia no genera incapacidad. Puede presentarse un sutil rubor térmico que desaparece en 1 a 2 horas. Es fundamental mantener una hidratación dérmica profunda para potenciar la síntesis del colágeno.",
            dos: [
              "Ingerir al menos 2 litros de agua durante el día.",
              "Aplicar crema hidratante calmante con ceramidas o aloe vera.",
              "Usar protector solar FPS 50+ si hay exposición a la luz natural."
            ],
            donts: [
              "No aplicar compresas de hielo directo inmediatamente después (el calor terapéutico residual favorece la bioestimulación).",
              "Evitar saunas o duchas de agua hirviendo las primeras 12 horas.",
              "No realizar exfoliaciones agresivas en las 48 horas posteriores."
            ],
            checklist: [
              "Bebí suficiente agua para hidratar las fibras de colágeno",
              "Apliqué protector solar antes de exponerme a la luz",
              "Evité lavar el rostro con agua excesivamente caliente"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-ultrasonido-facial",
    title: "Ultrasonido Facial y Sonoforesis Regenerativa",
    slug: "ultrasonido-facial",
    category: "Facial",
    description: "Emisión de ondas ultrasónicas que inducen micromasaje tisular, promueven la circulación microcapilar y mejoran la permeabilidad dérmica (sonoforesis) para la penetración profunda de antioxidantes y regeneradores celulares.",
    cover_url: "/images/ultrasonido-facial.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 30,
    results_duration: "1 a 2 meses (efecto revitalizante acumulativo)",
    anesthesia_type: "No requerida (gel hidratante neutro)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética Facial",
    alarm_signs: [
      "Eritema o irritación cutánea anormal por sensibilidad a activos",
      "Molestia o sensibilidad mandibular persistente",
      "Reacción alérgica con erupción o picor generalizado"
    ],
    modules: [
      {
        id: "mod-us-1",
        title: "Fase de Fijación de Principios Activos",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-us-101",
            title: "Cuidados post-sonoforesis",
            care_type: "general",
            timeline_tag: "Día 0",
            body_md: "Procedimiento suave y placentero sin tiempo de inactividad. Los activos penetrados continúan actuando en las capas medias de la dermis.",
            dos: [
              "Dejar absorber los principios activos aplicados sin lavar el rostro de inmediato.",
              "Mantener fotoprotección solar constante.",
              "Continuar con la rutina de skincare habitual."
            ],
            donts: [
              "No usar desmaquillantes abrasivos ni cepillos de limpieza facial en 24 horas.",
              "Evitar exposición solar prolongada sin protección."
            ],
            checklist: [
              "Permití la absorción completa de los sueros aplicados",
              "Apliqué fotoprotector solar FPS 50+"
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CORPORAL Y REDUCCIÓN (Procedimientos 10 al 18)
  // =========================================================================
  {
    id: "proc-mesoterapia-corporal",
    title: "Mesoterapia Corporal (Lipoescultura sin Cirugía)",
    slug: "mesoterapia-corporal",
    category: "Corporal y Reducción",
    description: "Microinyecciones intradérmicas y subcutáneas de principios activos lipolíticos, drenantes y reafirmantes (como alcachofa, carnitina, cafeína y silicio orgánico) para tratar adiposidad localizada rebelde y celulitis en abdomen, flancos y muslos.",
    cover_url: "/images/mesoterapia-corporal.jpg",
    recovery_time: "24 a 48 horas",
    pain_level: 2,
    duration_minutes: 30,
    results_duration: "Duradero con hábitos saludables y ciclo de sesiones",
    anesthesia_type: "No requerida / Crioterapia local previa",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Nódulos indurados calientes y dolorosos que aumentan de tamaño tras 48 horas",
      "Hematoma expansivo progresivo de gran tamaño con dolor agudo",
      "Fiebre, escalofríos o malestar general sistémico",
      "Reacción anafiláctica o erupción urticarial generalizada"
    ],
    modules: [
      {
        id: "mod-meso-corp-1",
        title: "Fase de Drenaje y Prevención de Hematomas (Horas 0-48)",
        position: 1,
        timeline_tag: "Día 0-2",
        lessons: [
          {
            id: "les-meso-corp-101",
            title: "Eliminación metabólica de ácidos grasos",
            care_type: "allowed",
            timeline_tag: "Día 0-2",
            body_md: "Los activos aplicados disuelven micelas lipídicas que deben ser depuradas por el sistema linfático y excretadas por vía renal. La ingesta hídrica es el factor clave para optimizar los resultados.",
            dos: [
              "Ingerir entre 2.5 y 3 litros de agua diaria para acelerar la eliminación de toxinas.",
              "Usar prendas de compresión suave o ropa holgada para evitar roces dolorosos.",
              "Caminar 30 minutos al día siguiente para activar la circulación de retorno."
            ],
            donts: [
              "No masajear bruscamente los puntos de inyección en las primeras 24 horas.",
              "No ingerir bebidas alcohólicas ni comidas ricas en sodio que retengan líquidos.",
              "Evitar piscinas, jacuzzis o saunas durante 48 horas para prevenir infecciones en los puntos de punción.",
              "Evitar exposición al sol directo si hay pequeños hematomas (para evitar manchas de hemosiderina)."
            ],
            checklist: [
              "Bebí al menos 2.5 litros de agua pura durante el día",
              "Evité el consumo de alcohol y alimentos hipercalóricos",
              "Protegí las zonas con pequeños hematomas de la radiación solar"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-hidrolipoclasia",
    title: "Hidrolipoclasia Ultrasónica (Cavitación Médica)",
    slug: "hidrolipoclasia-ultrasonica",
    category: "Corporal y Reducción",
    description: "Tratamiento médico-estético para la lisis de células grasas mediante infiltración de solución hipotónica estéril directamente en el tejido adiposo, seguida de la aplicación de ultrasonido cavitacional para romper la membrana del adipocito de forma definitiva.",
    cover_url: "/images/hidrolipoclasia.jpg",
    recovery_time: "48 a 72 horas",
    pain_level: 2,
    duration_minutes: 60,
    results_duration: "Permanente sobre los adipocitos eliminados manteniendo peso estable",
    anesthesia_type: "Anestésico local diluido en solución hipotónica",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Seroma a tensión con fluctuación dolorosa palpable",
      "Hematoma extenso con dolor desproporcionado que no cede",
      "Fiebre, secreción purulenta en sitios de infiltración o celulitis cutánea",
      "Mareos intensos persistentes o hipotensión arterial severa"
    ],
    modules: [
      {
        id: "mod-hidro-1",
        title: "Fase de Compresión y Evacuación Linfática (Días 0 a 3)",
        position: 1,
        timeline_tag: "Día 0-3",
        lessons: [
          {
            id: "les-hidro-101",
            title: "Uso de faja de compresión y drenaje linfático",
            care_type: "allowed",
            timeline_tag: "Día 0-3",
            body_md: "Tras la cavitación y lisis celular, queda líquido residual en el espacio intersticial. Es indispensable el uso constante de faja de compresión graduada para moldear el contorno y evitar la formación de seromas.",
            dos: [
              "Portar la faja de compresión médica según indicación de la especialista (20-22 horas al día).",
              "Iniciar sesiones de Drenaje Linfático Manual a partir de las 24 a 48 horas post-tratamiento.",
              "Ingerir abundante agua (2.5 a 3 litros al día).",
              "Reposo relativo durante las primeras 24 horas, caminando distancias cortas."
            ],
            donts: [
              "No retirar la faja durante periodos prolongados en los primeros días.",
              "No realizar ejercicio físico vigoroso ni levantamiento de pesas durante 5 a 7 días.",
              "Evitar el consumo de sal en exceso, ultraprocesados y alcohol.",
              "No exponerse al calor extremo ni tomar baños de inmersión."
            ],
            checklist: [
              "Me coloqué la faja de compresión médica ajustada adecuadamente",
              "Agendé mi primera sesión de drenaje linfático post-hidrolipoclasia",
              "Mantuve reposo relativo sin esfuerzo físico pesado",
              "Bebí abundante agua para facilitar el drenaje metabólico"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-carboxiterapia",
    title: "Carboxiterapia Médica Corporal",
    slug: "carboxiterapia-corporal",
    category: "Corporal y Reducción",
    description: "Infiltración médica subcutánea de dióxido de carbono medicinal (CO₂) estéril para estimular la microcirculación, activar el efecto Bohr, romper adipocitos localizados y estimular la producción de colágeno contra celulitis, flacidez y estrías.",
    cover_url: "/images/carboxiterapia.jpg",
    recovery_time: "4 a 12 horas",
    pain_level: 3,
    duration_minutes: 30,
    results_duration: "6 a 12 meses según estilo de vida y mantenimiento",
    anesthesia_type: "No requerida (sensación de pesadez y crepitación transitoria)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Dolor torácico agudo o dificultad respiratoria súbita (urgencia máxima)",
      "Crepitación gaseosa que no disminuye pasadas 24 horas",
      "Enrojecimiento intenso con calor y dolor punzante en la zona tratada",
      "Signos de infección cutánea en los puntos de microinyección"
    ],
    modules: [
      {
        id: "mod-carboxy-1",
        title: "Fase de Difusión Gaseosa y Oxigenación Tisular",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-carboxy-101",
            title: "Sensación de crepitación y reabsorción del gas",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "El CO₂ se difunde rápidamente por los tejidos subdérmicos y se reabsorbe de forma fisiológica a través de la vía respiratoria en un lapso de 30 minutos a 2 horas. Es común sentir una ligera crepitación táctil (como burbujas) transitoria.",
            dos: [
              "Mantenerse en movimiento suave (caminar) para acelerar la difusión del gas.",
              "Ingerir agua para apoyar la eliminación metabólica.",
              "Mantener las zonas tratadas limpias y secas."
            ],
            donts: [
              "No ducharse con agua muy fría las primeras 4 horas.",
              "Evitar sumergirse en piscinas, lagos o tinas el día del procedimiento.",
              "No exponerse al sol si aparecen pequeños hematomas puntiformes."
            ],
            checklist: [
              "Verifiqué que la sensación de burbujeo disminuyó progresivamente",
              "Realicé una caminata suave para favorecer la circulación",
              "Evité la inmersión en agua las primeras horas"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-radiofrecuencia-corporal",
    title: "Radiofrecuencia Corporal (Tensado y Anticelulitis)",
    slug: "radiofrecuencia-corporal",
    category: "Corporal y Reducción",
    description: "Tecnología electromagnética profunda que genera hipertermia controlada en dermis e hipodermis, compactando los septos fibrosos de la celulitis, reafirmando zonas con flacidez (abdomen, brazos, glúteos y piernas) y estimulando colágeno.",
    cover_url: "/images/radiofrecuencia-corporal.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 45,
    results_duration: "6 a 9 meses con mantenimiento",
    anesthesia_type: "No requerida (control térmico continuo)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Aparición de quemaduras térmicas o ampollas flictenulares",
      "Dolor urente (ardor) localizado que persista más de 12 horas",
      "Endurecimiento o nódulo graso doloroso post-térmico"
    ],
    modules: [
      {
        id: "mod-rf-corp-1",
        title: "Fase de Reafirmación Tisular",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-rf-corp-101",
            title: "Cuidados tras la radiofrecuencia corporal",
            care_type: "general",
            timeline_tag: "Día 0",
            body_md: "No genera tiempo de recuperación. La zona puede lucir ligeramente sonrosada por el aumento de la circulación sanguínea local. El estímulo de colágeno se desarrolla gradualmente a lo largo de las siguientes 3 a 6 semanas.",
            dos: [
              "Beber abundante agua para hidratar las fibras tisulares.",
              "Aplicar cremas hidratantes o reafirmantes formuladas.",
              "Mantener una rutina de ejercicio para preservar el tono muscular."
            ],
            donts: [
              "No aplicar hielo ni frío inmediato que contrarreste el calor terapéutico biológico.",
              "Evitar duchas de agua excesivamente caliente el mismo día."
            ],
            checklist: [
              "Mantuve una adecuada ingesta de líquidos",
              "Apliqué crema hidratante en la zona tratada",
              "Evité la aplicación de compresas frías inmediatas"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-ultrasonido-corporal",
    title: "Ultrasonido Corporal y Drenaje Mecánico",
    slug: "ultrasonido-corporal",
    category: "Corporal y Reducción",
    description: "Aplicación de ondas mecánicas de 3 MHz para desinflamar tejidos corporales, ablandar zonas con fibrosis post-quirúrgica o post-traumática, mejorar la microcirculación y favorecer el drenaje en protocolos reductores.",
    cover_url: "/images/ultrasonido-corporal.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 30,
    results_duration: "Progresivo con ciclo de sesiones",
    anesthesia_type: "No requerida",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Dolor óseo o articular vecino por aplicación inadecuada sobre rebordes óseos",
      "Alergia o dermatitis por el gel de contacto conductor"
    ],
    modules: [
      {
        id: "mod-us-corp-1",
        title: "Fase de Desinflamación Tisular",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-us-corp-101",
            title: "Protocolo de drenaje asistido por ultrasonido",
            care_type: "general",
            timeline_tag: "Día 0",
            body_md: "Sesión confortable y relajante sin hematomas ni dolor. Ayuda significativamente a desinflamar zonas inflamadas o en proceso de moldeamiento.",
            dos: [
              "Mantener hidratación hídrica constante.",
              "Combinar con caminatas suaves o presoterapia si está indicada."
            ],
            donts: [
              "No suspender el uso de prendas compresivas si es parte de un protocolo post-operatorio."
            ],
            checklist: [
              "Completé mi sesión de ultrasonido desinflamatorio",
              "Mantuve la hidratación recomendada"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-masaje-reductor",
    title: "Masaje Reductor y Moldeador de Contorno",
    slug: "masaje-reductor",
    category: "Corporal y Reducción",
    description: "Técnica manual vigorosa y rítmica con maniobras de amasamiento, fricción y percusión orientada a movilizar grasa localizada, aumentar la temperatura tisular para dinamizar el metabolismo lipídico y perfilar la silueta en cintura y abdomen.",
    cover_url: "/images/masaje-reductor.jpg",
    recovery_time: "Inmediata a 24 horas",
    pain_level: 2,
    duration_minutes: 45,
    results_duration: "Sujeto a hábitos nutricionales e hidratación",
    anesthesia_type: "No requerida (uso de geles termogénicos)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Hematomas extensos y dolorosos por fuerza o presión excesiva",
      "Dolor muscular agudo que impida la movilidad normal",
      "Aparición de petequias generalizadas"
    ],
    modules: [
      {
        id: "mod-reductor-1",
        title: "Fase de Moldeamiento y Metabolismo Activo",
        position: 1,
        timeline_tag: "Día 0-1",
        lessons: [
          {
            id: "les-reductor-101",
            title: "Optimización de la reducción de medidas",
            care_type: "allowed",
            timeline_tag: "Día 0-1",
            body_md: "Puede experimentarse una ligera sensibilidad muscular similar a la que queda tras realizar ejercicio físico intenso. El cuerpo moviliza líquidos y toxinas.",
            dos: [
              "Beber abundante agua antes y después del masaje.",
              "Mantener una alimentación baja en carbohidratos simples y grasas saturadas.",
              "Complementar con actividad cardiovascular ligera."
            ],
            donts: [
              "No ingerir comidas pesadas o ultraprocesadas inmediatamente después de la sesión.",
              "No realizar masajes agresivos si la piel presenta hematomas activos."
            ],
            checklist: [
              "Tomé agua antes y después de mi sesión",
              "Mantuve una cena ligera y balanceada",
              "Verifiqué que no haya dolor excesivo o hematomas severos"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-drenaje-linfatico",
    title: "Drenaje Linfático Manual Médico (DLM)",
    slug: "drenaje-linfatico-manual",
    category: "Corporal y Reducción",
    description: "Técnica manual especializada con maniobras rítmicas, suaves y precisas (método Vodder/Leduc) para estimular los ganglios linfáticos, evacuar edemas post-quirúrgicos o circulatorios y promover una desinflamación acelerada sin dolor.",
    cover_url: "/images/drenaje-linfatico.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 50,
    results_duration: "Efecto desinflamatorio inmediato y acumulativo",
    anesthesia_type: "No requerida (técnica ultra suave)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Moldeamiento",
    alarm_signs: [
      "Edema asimétrico unilateral súbito en pierna con dolor en pantorrilla (sospecha de trombosis venosa profunda TVP - urgencia médica)",
      "Fiebre o signos de infección linfática aguda (linfangitis o erisipela)",
      "Dificultad respiratoria súbita o dolor torácico pleurítico"
    ],
    modules: [
      {
        id: "mod-dlm-1",
        title: "Fase de Drenaje Linfático y Alivio del Edema",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-dlm-101",
            title: "Activación del sistema linfático",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "El drenaje no debe doler bajo ninguna circunstancia. Es habitual experimentar un aumento en la diuresis (necesidad de orinar) en las horas posteriores debido a la evacuación efectiva de líquidos retenidos.",
            dos: [
              "Descansar con las extremidades ligeramente elevadas para favorecer el retorno venoso.",
              "Ingerir agua pura para facilitar la filtración renal de toxinas.",
              "Llevar puestas prendas o medias de compresión si han sido formuladas."
            ],
            donts: [
              "No solicitar presiones dolorosas ni masajes bruscos sobre zonas inflamadas.",
              "Evitar el consumo excesivo de sal y alimentos que propicien retención de líquidos."
            ],
            checklist: [
              "Experimenté alivio en la pesadez corporal",
              "Aumenté mi ingesta de agua para eliminar toxinas",
              "Mantuve las piernas o zona tratada en reposo elevado"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-masaje-relajante",
    title: "Masaje Relajante y Descontracturante",
    slug: "masaje-relajante",
    category: "Corporal y Reducción",
    description: "Protocolo manual terapéutico corporal que combina pases suaves y fluidos con presiones medias en puntos gatillo para disolver contracturas musculares por estrés, disminuir el cortisol y promover el bienestar integral.",
    cover_url: "/images/masaje-relajante.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 60,
    results_duration: "1 a 2 semanas de sensación de bienestar y alivio",
    anesthesia_type: "No requerida (aromaterapia y aceites esenciales)",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Estética y Bienestar",
    alarm_signs: [
      "Dolor punzante o pérdida de fuerza motora irradiada a extremidades (signo radicular)",
      "Mareo intenso o síncope postural al ponerse de pie de manera súbita"
    ],
    modules: [
      {
        id: "mod-relajante-1",
        title: "Fase de Relajación y Equilibrio Muscular",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-relajante-101",
            title: "Post-masaje de bienestar y descanso",
            care_type: "general",
            timeline_tag: "Día 0",
            body_md: "Permítete disfrutar de la sensación de desconexión y alivio muscular. Es recomendable no someterse a situaciones de estrés ni esfuerzos físicos intensos tras la sesión.",
            dos: [
              "Ingerir una infusión tibia o agua para rehidratar el tejido fascial.",
              "Disfrutar de un descanso o siesta reparadora si el horario lo permite.",
              "Ducharse con agua tibia para prolongar la relajación muscular."
            ],
            donts: [
              "No realizar entrenamientos de fuerza máxima o levantamiento de pesas el mismo día.",
              "Evitar bebidas energizantes con alto contenido de cafeína inmediatamente después."
            ],
            checklist: [
              "Tomé agua o infusión relajante tras la sesión",
              "Mantuve una tarde/noche tranquila sin esfuerzos pesados",
              "Verifiqué que no hayan dolores anormales en articulaciones"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-sueroterapia",
    title: "Sueroterapia Intravenosa (Wellness, Inmune & Detox)",
    slug: "sueroterapia-intravenosa",
    category: "Corporal y Reducción",
    description: "Infusión médica intravenosa directa de oligoelementos, aminoácidos esenciales, megadosis de Vitamina C y antioxidantes maestros (Glutatión) para revitalización celular, fortalecimiento del sistema inmunológico y detoxificación metabólica.",
    cover_url: "/images/sueroterapia.jpg",
    recovery_time: "Inmediata (0 horas)",
    pain_level: 1,
    duration_minutes: 45,
    results_duration: "3 a 6 semanas según demanda física y metabólica",
    anesthesia_type: "No requerida / Punción venosa periférica estéril",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Medicina Estética y Funcional",
    alarm_signs: [
      "Dificultad respiratoria, disnea, opresión en el pecho o sibilancias (reacción anafiláctica - urgencia máxima)",
      "Signos de flebitis en el sitio de venopunción: cordón venoso duro, caliente, rojo y muy doloroso",
      "Edema súbito de párpados, labios o lengua (angioedema)",
      "Fiebre con escalofríos y temblores durante o poco después de la aplicación"
    ],
    modules: [
      {
        id: "mod-suero-1",
        title: "Fase de Absorción Celular y Vitalidad",
        position: 1,
        timeline_tag: "Día 0",
        lessons: [
          {
            id: "les-suero-101",
            title: "Cuidados tras la sueroterapia intravenosa",
            care_type: "allowed",
            timeline_tag: "Día 0",
            body_md: "Al ser una vía intravenosa directa con 100% de biodisponibilidad, los nutrientes actúan de inmediato a nivel celular. Mantén la gasa o parche del sitio de punción seco y limpio.",
            dos: [
              "Mantener el parche estéril sobre la vena durante 30 a 60 minutos.",
              "Continuar con buena hidratación oral durante todo el día.",
              "Retomar tus actividades cotidianas con normalidad."
            ],
            donts: [
              "No doblar bruscamente el brazo ni cargar pesos excesivos con el brazo puncionado durante 2 horas.",
              "No frotar el sitio de venopunción para evitar la formación de hematomas.",
              "Evitar el consumo de bebidas alcohólicas el día de la sesión para optimizar la acción antioxidante."
            ],
            checklist: [
              "Mantuve el parche sobre la punción por al menos 30 minutos",
              "Bebí suficiente agua para apoyar la función renal",
              "Evité cargar peso con el brazo de la canalización",
              "Verifiqué que no haya enrojecimiento o endurecimiento en la vena"
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // CAPILAR (Procedimientos 19 y 20)
  // =========================================================================
  {
    id: "proc-mesoterapia-capilar",
    title: "Terapia Capilar con Mesoterapia (Bioestimulación Folicular)",
    slug: "mesoterapia-capilar",
    category: "Capilar",
    description: "Microinyecciones intradérmicas directas en cuero cabelludo con cócteles estériles de péptidos biomiméticos, biotina, D-pantenol, vasodilatadores y nutrientes para frenar la miniaturización del folículo piloso, estimular la fase anágena y densificar el cabello.",
    cover_url: "/images/mesoterapia-capilar.jpg",
    recovery_time: "12 a 24 horas",
    pain_level: 2,
    duration_minutes: 30,
    results_duration: "Mantenimiento semestral tras ciclo inicial de 4-6 sesiones",
    anesthesia_type: "Crioterapia local / anestesia tópica opcional",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Tricología y Medicina Estética",
    alarm_signs: [
      "Dolor punzante o cefalea persistente que no ceda con analgésicos convencionales",
      "Signos de foliculitis bacteriana o infección en cuero cabelludo (pústulas, calor y supuración)",
      "Edema frontal que descienda hacia los párpados",
      "Reacción alérgica aguda con prurito incontrolable o eritema generalizado"
    ],
    modules: [
      {
        id: "mod-meso-cap-1",
        title: "Fase de Fijación Folicular (Primeras 24 Horas)",
        position: 1,
        timeline_tag: "Día 0-1",
        lessons: [
          {
            id: "les-meso-cap-101",
            title: "Cuidados del cuero cabelludo post-microinyección",
            care_type: "allowed",
            timeline_tag: "Día 0-1",
            body_md: "Las microinyecciones depositan los activos directamente en la papila dérmica folicular. Es fundamental mantener el cuero cabelludo limpio y libre de productos capilares densos durante las primeras 24 horas.",
            dos: [
              "Dejar reposar el producto sin lavar el cabello durante al menos 12 a 24 horas.",
              "Lavar el cabello al día siguiente con champú suave neutro sin frotar con las uñas.",
              "Secar con toalla suave mediante toques delicados."
            ],
            donts: [
              "No lavar el cabello inmediatamente después de la sesión.",
              "No usar gorras, sombreros apretados ni cascos de moto durante 24 horas.",
              "No aplicar tintes, decoloraciones, geles ni lacas durante 5 a 7 días.",
              "Evitar saunas, piscinas y ejercicio vigoroso con sudoración profusa en las primeras 24 horas."
            ],
            checklist: [
              "Esperé al menos 12-24 horas antes de lavar mi cabello",
              "Evité el uso de gorras o cascos apretados el primer día",
              "Utilicé un champú suave sin frotar bruscamente",
              "Pospuse tintes y químicos capilares por 7 días"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "proc-plasma-capilar",
    title: "Terapia Capilar con Plasma Rico en Plaquetas (PRP Capilar)",
    slug: "terapia-capilar-plasma",
    category: "Capilar",
    description: "Tratamiento biológico autólogo de regeneración folicular mediante extracción de sangre periférica, centrifugado diferencial e infiltración de plasma concentrado en factores de crecimiento (VEGF, PDGF, IGF-1) para reactivar folículos en reposo y engrosar la fibra capilar.",
    cover_url: "/images/plasma-capilar.jpg",
    recovery_time: "12 a 24 horas",
    pain_level: 2,
    duration_minutes: 45,
    results_duration: "4 a 6 meses por sesión / protocolo de mantenimiento anual",
    anesthesia_type: "Frío local y anestésico tópico en cuero cabelludo",
    price: 0,
    doctor_name: "Dra. Mariana Gómez",
    doctor_specialty: "Médica Especialista en Tricología y Medicina Estética",
    alarm_signs: [
      "Infección en los sitios de punción (eritema caliente, secreción o dolor progresivo)",
      "Hematoma subcutáneo a tensión en cuero cabelludo",
      "Cefalea severa refractaria que no cede",
      "Hinchazón en la zona frontal o periocular"
    ],
    modules: [
      {
        id: "mod-prp-cap-1",
        title: "Fase de Bioestimulación Plaquetaria Folicular",
        position: 1,
        timeline_tag: "Día 0-1",
        lessons: [
          {
            id: "les-prp-cap-101",
            title: "Absorción y bioestimulación autóloga",
            care_type: "allowed",
            timeline_tag: "Día 0-1",
            body_md: "El plasma autólogo libera gradualmente factores que nutren los vasos sanguíneos perifoliculares. Puede sentirse una ligera sensibilidad en el cuero cabelludo en las primeras horas.",
            dos: [
              "Mantener el cuero cabelludo seco y limpio sin lavarse por 24 horas.",
              "Lavar al día siguiente con agua tibia y champú dermocosmético suave.",
              "Dormir sobre una funda de almohada limpia."
            ],
            donts: [
              "No lavar el cabello en las primeras 24 horas para permitir la acción de los factores plaquetarios.",
              "No usar sombreros, vinchas o cascos ajustados.",
              "Evitar ejercicio físico extenuante y saunas por 24 a 48 horas.",
              "No aplicar tratamientos químicos (tintes o alisados) por al menos 7 días."
            ],
            checklist: [
              "No lavé mi cabello durante las primeras 24 horas",
              "Evité la compresión con gorras o cascos",
              "Dormí en una funda de almohada limpia",
              "Mantuve la zona protegida de radiación solar directa"
            ]
          }
        ]
      }
    ]
  }
];
