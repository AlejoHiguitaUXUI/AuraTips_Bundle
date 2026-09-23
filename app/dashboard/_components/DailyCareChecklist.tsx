"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2Icon,
  BanIcon,
  MoonIcon,
  SnowflakeIcon,
  SunIcon,
  DropletIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  DumbbellIcon,
  SparklesIcon,
  ClipboardCheckIcon,
} from "@/components/icons";

interface FormattedGuideline {
  lead: string;
  body: string;
  fullText: string;
  iconType: "sun" | "moon" | "snowflake" | "droplet" | "dumbbell" | "ban" | "check" | "sparkles";
}

function cleanTaskText(text: string): string {
  // Strip emojis and leading whitespace cleanly
  return text.replace(/^[\p{Emoji}\uFE0F\u200D\s]+/u, "").trim();
}

function formatClinicalGuideline(text: string, isRestriction: boolean): FormattedGuideline {
  const clean = cleanTaskText(text);
  const lower = clean.toLowerCase();

  let iconType: FormattedGuideline["iconType"] = isRestriction ? "ban" : "check";

  if (lower.includes("sol") || lower.includes("spf") || lower.includes("fotoprotec") || lower.includes("lámparas uv")) {
    iconType = "sun";
  } else if (lower.includes("dormir") || lower.includes("boca arriba") || lower.includes("almohada") || lower.includes("postura") || lower.includes("decúbito") || lower.includes("cabeza")) {
    iconType = "moon";
  } else if (lower.includes("frío") || lower.includes("hielo") || lower.includes("gasa") || lower.includes("compresa")) {
    iconType = "snowflake";
  } else if (lower.includes("agua") || lower.includes("hidrataci") || lower.includes("beber") || lower.includes("bálsamo") || lower.includes("humect") || lower.includes("ungüento")) {
    iconType = "droplet";
  } else if (lower.includes("ejercicio") || lower.includes("pesa") || lower.includes("crossfit") || lower.includes("deporte") || lower.includes("cardio") || lower.includes("aeróbic")) {
    iconType = "dumbbell";
  } else if (lower.includes("maquillaje") || lower.includes("cosmético") || lower.includes("labial") || lower.includes("brocha") || lower.includes("esponja") || lower.includes("peeling")) {
    iconType = "sparkles";
  } else if (lower.includes("sauna") || lower.includes("calor") || lower.includes("baños turcos") || lower.includes("jacuzzi") || lower.includes("horno") || lower.includes("vapor")) {
    iconType = "ban";
  }

  let lead = "";
  let body = "";

  // 1. Colon split (e.g. "REGLA DE ORO: Dejar que las pieles...")
  if (clean.includes(":")) {
    const colonIdx = clean.indexOf(":");
    lead = clean.slice(0, colonIdx).trim();
    body = clean.slice(colonIdx + 1).trim();
  }
  // 2. Parenthesized detail (e.g. "PROHIBIDO el uso de sorbetes (la succión...)")
  else if (clean.match(/^([^(]+)\s*\(([^)]+)\)\.?$/)) {
    const match = clean.match(/^([^(]+)\s*\(([^)]+)\)\.?$/)!;
    lead = match[1].trim();
    body = `(${match[2].trim()})`;
  }
  // 3. Natural punctuation split (comma or semicolon) if within reasonable title length
  else {
    const punctIdx = clean.search(/[,;]/);
    if (punctIdx > 14 && punctIdx < 48) {
      lead = clean.slice(0, punctIdx).trim();
      body = clean.slice(punctIdx + 1).trim();
    } else {
      // 4. Word boundary: take first 4 words as lead if sentence has enough length
      const words = clean.split(" ");
      if (words.length > 5) {
        lead = words.slice(0, 4).join(" ");
        body = words.slice(4).join(" ");
      } else {
        lead = clean;
        body = "";
      }
    }
  }

  return { lead, body, fullText: clean, iconType };
}

interface DailyCareChecklistProps {
  procedureSlug: string;
  currentDay: number;
  initialItems?: string[];
  dos?: string[];
  donts?: string[];
}

interface ProcedureCareProtocol {
  timelineTag: string;
  phaseTitle: string;
  tasks: string[];
  dos: string[];
  donts: string[];
}

const PROCEDURE_CARE_PROTOCOLS: Record<string, { day0: ProcedureCareProtocol; days1_3: ProcedureCareProtocol; days4_14: ProcedureCareProtocol }> = {
  "toxina-botulinica-botox-facial": {
    day0: {
      timelineTag: "Día 0",
      phaseTitle: "Fase Inmediata (Primeras 24 Horas)",
      tasks: [
        "Permanecer con postura vertical y erguida al menos 4 horas (cero recostarse)",
        "Dormir en posición decúbito supino (boca arriba) con 2 almohadas (elevación de 30°)",
        "Si hay molestia, aplicar frío seco con gasa estéril por 10 minutos sin presionar",
        "Beber al menos 2 litros de agua templada o fresca y evitar bebidas alcohólicas",
        "Cero frotamiento, rascado o masajes en los puntos de inyección",
        "Mantener la piel sin maquillaje ni cosméticos densos por 24 horas",
      ],
      dos: [
        "Permanecer en posición erguida al menos 4 horas completas tras el procedimiento.",
        "Dormir en posición decúbito supino (boca arriba) con 2 almohadas para favorecer el drenaje linfático.",
        "Realizar micro-gesticulaciones suaves (sonreír, parpadear) las primeras 2 horas.",
        "Lavar el rostro con agua fresca o templada y limpiador Syndet muy suave sin fricción.",
        "Hidratación oral abundante con agua fresca (al menos 2 litros diarios).",
      ],
      donts: [
        "No acostarse, tumbarse en el sofá ni agachar la cabeza durante las primeras 4 horas críticas.",
        "No masajear, frotar ni presionar las zonas tratadas (frente, entrecejo, patas de gallo).",
        "No usar gorras, vinchas apretadas, cascos ni diademas que ejerzan compresión frontal.",
        "No aplicar maquillaje, bases cosméticas con color ni exfoliantes las primeras 24 horas.",
        "No consumir bebidas alcohólicas ni comidas excesivamente calientes o hipercondimentadas.",
      ],
    },
    days1_3: {
      timelineTag: "Días 1–3",
      phaseTitle: "Fase de Estabilización y Control Térmico",
      tasks: [
        "Aplicar protector solar 100% mineral SPF 50+ con toquecitos suaves cada mañana",
        "Suspender entrenamientos cardiovasculares intensos, pesas y posturas de yoga invertidas",
        "Evitar saunas, baños turcos, duchas calientes y fuentes de calor directo",
        "Aplicar gel de árnica o vitamina K en toques delicados sobre hematomas si aparecieron",
        "Continuar durmiendo boca arriba con elevación para prevenir edemas periorbitarios",
      ],
      dos: [
        "Aplicar protector solar mineral SPF 50+ cada mañana con suaves toques de la yema de los dedos.",
        "Si existen pequeños hematomas, usar gel de árnica o vitamina K en capa fina 2 veces al día.",
        "Continuar durmiendo boca arriba con cabecera ligeramente elevada las primeras 72 horas.",
        "Reanudar maquillaje mineral suave utilizando brochas o esponjas desinfectadas.",
        "Mantener hidratación dérmica con lociones calmantes sin fragancias ni ácidos irritantes.",
      ],
      donts: [
        "Cero ejercicio cardiovascular vigoroso, levantamiento de pesas o crossfit por 48 a 72 horas.",
        "Prohibido saunas, baños turcos, jacuzzis calientes y secadores de pelo directos al rostro.",
        "No realizar limpiezas faciales profundas, exfoliaciones mecánicas ni masajes Gua Sha.",
        "Evitar dormir de lado comprimiendo el rostro contra la almohada.",
      ],
    },
    days4_14: {
      timelineTag: "Días 4–14",
      phaseTitle: "Fase de Fijación y Resultados Definitivos",
      tasks: [
        "Monitorear la relajación muscular progresiva frente al espejo con paciencia",
        "Retomar de forma gradual la rutina física habitual y entrenamiento deportivo",
        "Mantener la rutina diaria de hidratación facial profunda y fotoprotección SPF 50+",
        "Tomar fotografías de seguimiento en reposo y expresión para la ficha médica",
        "Agendar y confirmar la cita de control médico y retoque para el día 14 post-inyección",
      ],
      dos: [
        "Observar la atenuación paulatina de las arrugas dinámicas entre el día 4 y 10 sin ansiedad.",
        "Retomar progresivamente la actividad física y deportiva habitual.",
        "Tomar fotografías de control frontal y lateral para tu historia clínica.",
        "Acudir a la cita médica de valoración y retoque de simetría al cumplirse los 14 días.",
        "Mantener el uso diario de fotoprotección solar para evitar el fotoenvejecimiento añadido.",
      ],
      donts: [
        "No solicitar retoques ni dosis adicionales antes del día 14 (la toxina continúa acoplándose).",
        "No someterse a tratamientos térmicos profundos (HIFU, láser) sin autorización médica.",
        "No suspender la hidratación facial ni los cuidados básicos de la barrera cutánea.",
      ],
    },
  },
  "acido-hialuronico-labios-russian-lips": {
    day0: {
      timelineTag: "Día 0",
      phaseTitle: "Fase Inmediata (Primeras 24 Horas)",
      tasks: [
        "Aplicar compresas frías con gasa limpia en pulsos de 10 minutos sin presionar",
        "Dormir semisentada o boca arriba con 2 almohadas para favorecer el drenaje linfático",
        "Beber abundante agua en vaso abierto evitando terminantemente sorbetes o pajillas",
        "Aplicar ungüento reparador estéril sin fragancias con un hisopo limpio",
        "Evitar comidas muy calientes, picantes o muy saladas y consumo de tabaco o alcohol",
        "No aplicar labiales con pigmento ni frotar labio superior contra labio inferior",
      ],
      dos: [
        "Aplicar frío local indirecto con compresa envuelta en gasa en intervalos de 10 min cada 1-2h.",
        "Dormir semisentada o boca arriba con 2 almohadas para favorecer el drenaje linfático facial.",
        "Mantener labios humectados con bálsamo reparador emoliente neutro o vaselina estéril.",
        "Beber abundante agua (2 a 2.5 litros) a sorbos suaves en vaso abierto o taza amplia.",
        "Consumir alimentos frescos o templados de textura blanda que no exijan apertura bucal forzada.",
      ],
      donts: [
        "PROHIBIDO el uso de sorbetes, pitillos o pajillas (la succión desplaza mecánicamente el gel).",
        "No frotar, morder, presionar ni pellizcar los labios; evitar frotar labio contra labio.",
        "Cero besos con presión o mordiscos, gesticulación lingual forzada o morder piezas enteras duras.",
        "No aplicar cosméticos labiales con color, brillos voluminizadores ni delineadores en 24h.",
        "No fumar, vapear ni consumir alcohol (empeoran el edema y dañan la microcirculación).",
      ],
    },
    days1_3: {
      timelineTag: "Días 1–3",
      phaseTitle: "Fase de Edema Máximo y Estabilización",
      tasks: [
        "Hidratar los labios 4 a 6 veces al día con bálsamo cicatrizante (pantenol / ácido hialurónico)",
        "Aplicar crema de árnica o vitamina K en toques delicados sobre hematomas peribucales",
        "Mantener ingesta de al menos 2 litros de agua diarios para alimentar el gel de hialurónico",
        "Continuar durmiendo boca arriba con 2 almohadas para mitigar la hinchazón matutina",
        "Evitar masajear pequeñas induraciones y abstenerse de saunas y ejercicio vigoroso",
      ],
      dos: [
        "Aplicar bálsamo reparador cicatrizante (pantenol B5, madecassoside o hialurónico) 4-6 veces al día.",
        "Usar crema de árnica o vitamina K en toques delicados sobre hematomas peribucales.",
        "Continuar durmiendo boca arriba con 2 almohadas para acelerar la reabsorción del edema.",
        "Ingerir entre 2 y 2.5 litros de agua diarios para alimentar la matriz hídrica del relleno.",
        "Realizar enjuagues orales suaves sin alcohol tras cada comida para máxima higiene.",
      ],
      donts: [
        "No masajear ni intentar aplastar bultitos o irregularidades palpables (el edema es asimétrico).",
        "Evitar la exposición solar directa, lámparas UV, saunas y baños de inmersión caliente.",
        "No someterse a tratamientos odontológicos, limpiezas dentales ni empastes por 2 semanas.",
        "No realizar depilación con cera o hilo en el labio superior ni peelings periorales.",
      ],
    },
    days4_14: {
      timelineTag: "Días 4–14",
      phaseTitle: "Fase de Asentamiento, Textura Final y Revisión",
      tasks: [
        "Evaluar la forma real de los labios a medida que cede la inflamación transitoria",
        "Aplicar bálsamo labial nutritivo con filtro solar a diario",
        "Reanudar cosméticos y labiales habituales con higiene adecuada",
        "Continuar con hidratación hídrica óptima para prolongar el efecto turgente",
        "Acudir a la cita de control médico a los 14 días para valorar simetría y arco de cupido",
      ],
      dos: [
        "Permitir la integración biológica natural del gel hialurónico en el tejido conectivo hasta el día 14.",
        "Reanudar con total normalidad el uso de cosméticos, barras labiales y perfiladores limpios.",
        "Mantener hidratación externa frecuente con bálsamo nutritivo que contenga filtro solar.",
        "Acudir a la cita de control médico a los 14 días para valorar simetría, arco de cupido y perfilado.",
        "Continuar con ingesta adecuada de agua diaria para optimizar la durabilidad del producto.",
      ],
      donts: [
        "No alarmarse por la desinflamación natural del 25-30% del volumen inicial observado los primeros días.",
        "No apretar con fuerza manual o uñas nódulos residuales sin indicación médica.",
        "No someterse a micropigmentación labial ni tatuajes periorales antes de 4 semanas.",
      ],
    },
  },
  "rinomodelacion-sin-cirugia-acido-hialuronico": {
    day0: {
      timelineTag: "Día 0",
      phaseTitle: "Fase Crítica e Inmediata (Primeras 24 Horas)",
      tasks: [
        "Cero apoyo de gafas o monturas sobre el dorso nasal (usar lentes de contacto o suspensión)",
        "Dormir en decúbito supino estricto (boca arriba) con 2 almohadas y soportes laterales",
        "Aplicar frío indirecto con gasa por 10 minutos en zonas periféricas sin comprimir la nariz",
        "Inspeccionar coloración cutánea de punta y dorso nasal (rosada, sin palidez ni manchas moradas)",
        "Beber al menos 2 litros de agua y consumir alimentos templados y de fácil masticación",
        "Evitar sonarse la nariz con fuerza y mantener las manos alejadas del área tratada",
      ],
      dos: [
        "Dormir en decúbito supino estricto (boca arriba) con 2 almohadas (30-45°) y soporte lateral con cojines.",
        "Inspeccionar periódicamente la coloración de la piel nasal frente al espejo (debe estar sonrosada y cálida).",
        "Limpiar la zona de micropunción con gasa estéril humedecida en suero fisiológico mediante toques.",
        "Si necesitas corrección visual, usar lentes de contacto o suspender las gafas de la frente con cinta médica.",
        "Beber abundante agua y mantener reposo relativo en casa durante las primeras 24 horas.",
      ],
      donts: [
        "PROHIBIDO el uso de gafas de ver, gafas de sol o cascos apoyados sobre el dorso de la nariz.",
        "No presionar, apretar, pellizcar ni intentar moldear la punta o el caballete nasal con los dedos.",
        "No sonarse la nariz con fuerza explosiva ni hurgarse; usar spray salino suave si hay congestión.",
        "No dormir de lado ni boca abajo bajo ninguna circunstancia.",
        "No aplicar maquillaje, correctores ni cremas densas sobre la pirámide nasal las primeras 24h.",
      ],
    },
    days1_3: {
      timelineTag: "Días 1–3",
      phaseTitle: "Fase de Consolidación y Prevención de Desplazamiento",
      tasks: [
        "Mantener la restricción estricta de anteojos y monturas ópticas sobre la pirámide nasal",
        "Aplicar protector solar mineral SPF 50+ con toquecitos milimétricos suaves sin fricción",
        "Aplicar gel de árnica o vitamina K en capa fina con hisopo sobre hematomas discretos",
        "Dormir en posición supina con dos almohadas para drenar el edema perinasal",
        "Evitar entrenamientos vigorosos, posturas invertidas de cabeza y fuentes de calor",
      ],
      dos: [
        "Mantener la prohibición ininterrumpida de apoyar gafas o anteojos sobre el caballete nasal.",
        "Aplicar protector solar mineral SPF 50+ mediante toques muy suaves y sin presión en las mañanas.",
        "Si existen pequeños hematomas en puntos de entrada, usar gel con árnica o vitamina K 2 veces al día.",
        "Continuar durmiendo boca arriba con cabecera elevada para facilitar el drenaje del edema.",
        "Mantener reposo relativo evitando actividades que eleven bruscamente la presión facial.",
      ],
      donts: [
        "No realizar deportes de contacto, tenis, natación con gafas herméticas ni pesas pesadas.",
        "No realizarse limpiezas con extracción de poros en la nariz ni usar tiras adhesivas depilatorias.",
        "Evitar saunas, baños turcos, duchas ardientes y vapores calientes directos al rostro.",
        "No inclinarse súbitamente hacia el suelo con la cabeza baja (evitar presión hidrostática nasal).",
      ],
    },
    days4_14: {
      timelineTag: "Días 4–14",
      phaseTitle: "Fase de Asentamiento Estructural y Resultados Definitivos",
      tasks: [
        "Verificar la consolidación del dorso y la punta nasal con resolución del edema inicial",
        "Mantener fotoprotección estricta SPF 50+ en dorso y punta para evitar manchas",
        "Mantener prudencia con monturas pesadas de pasta hasta completar los 14 días",
        "Tomar fotografías de frente y perfil comparativas para seguimiento médico",
        "Asistir a la cita de control estructural a los 14 días con el especialista",
      ],
      dos: [
        "Continuar protegiendo el dorso nasal de golpes accidentales o presiones continuadas.",
        "Retomar progresivamente la actividad aeróbica moderada evitando deportes con impacto.",
        "Aplicar fotoprotector solar diario SPF 50+ para evitar hiperpigmentación en orificios de entrada.",
        "Asistir a la cita de control médico a los 14 días para valorar simetría, proyección y estabilidad.",
        "Evaluar la armonía estética mediante fotografías comparativas con tu estado previo.",
      ],
      donts: [
        "No utilizar monturas pesadas de pasta o gafas de natación/buceo ajustadas antes del día 14.",
        "No manipular con fuerza los cartílagos alares o el dorso de la nariz al sonarse o secarse.",
        "No aplicarse radiofrecuencia ni ultrasonido focalizado en la pirámide nasal.",
      ],
    },
  },
  "peeling-quimico-medico-facial": {
    day0: {
      timelineTag: "Día 0",
      phaseTitle: "Fase Inmediata y Neutralización (Primeras 24 Horas)",
      tasks: [
        "Aplicar bálsamo reparador calmante (pantenol / madecassoside) en capa generosa ante la tirantez",
        "Utilizar compresas con gasa estéril y agua termal fría por 10 minutos para calmar el calor",
        "Dormir boca arriba con 2 almohadas y funda de almohada limpia de algodón suave",
        "Beber 2.5 litros de agua fresca y evitar comidas calientes, picantes o bebidas alcohólicas",
        "Cero maquillaje, exfoliantes, ácidos activos y cero exposición directa a la radiación solar",
      ],
      dos: [
        "Aplicar bálsamo reparador epitelizante (con pantenol B5 o madecassoside) de 3 a 5 veces al día.",
        "Rociar agua termal fresca o compresas con gasa fría en pulsos de 10 min para calmar ardor.",
        "Dormir boca arriba con 2 almohadas y funda limpia para minimizar el roce mecánico nocturno.",
        "Permanecer en interiores protegidos de la radiación solar directa y fuentes de calor.",
        "Hidratación oral intensiva con abundante agua fresca (mínimo 2.5 litros diarios).",
      ],
      donts: [
        "PROHIBIDO arrancar, pellizcar o frotar la piel aunque empiece a sentirse acartonada.",
        "No lavar el rostro con jabones comunes, esponjas exfoliantes ni agua caliente.",
        "PROHIBIDO aplicar bases de maquillaje, correctores, polvos o iluminadores en 24h.",
        "No usar productos cosméticos con retinol, ácido glicólico, salicílico ni vitamina C ácida.",
        "No exponerse al sol directo ni consumir comidas picantes, muy calientes o alcohol.",
      ],
    },
    days1_3: {
      timelineTag: "Días 1–3",
      phaseTitle: "Fase de Descamación Activa y Reepitelización",
      tasks: [
        "REGLA DE ORO: No arrancar ni tirar de ninguna piel; dejar que se desprendan en el lavado",
        "Aplicar crema cicatrizante y reparadora 4 a 6 veces al día ante cada sensación de sequedad",
        "Aplicar y reaplicar protector solar 100% mineral SPF 50+ cada 2 a 3 horas religiosamente",
        "Lavar el rostro con limpiador Syndet suave y agua tibia, secando con toques de toalla limpia",
        "Usar sombrero de ala ancha y evitar por completo el sol directo y el sudor intenso",
      ],
      dos: [
        "REGLA DE ORO: Dejar que las pieles descamadas caigan por sí solas en el lavado suave.",
        "Aplicar crema hidratante reparadora (Cicaplast B5, Cicalfate o equivalente) 4 a 6 veces al día.",
        "Aplicar fotoprotector 100% mineral SPF 50+ cada 2 a 3 horas religiosamente desde la mañana.",
        "Lavar suavemente con limpiador Syndet sin jabón y agua tibia, secando con toques suaves.",
        "Utilizar sombrero de ala ancha y gafas oscuras de alta protección al salir al exterior.",
        "Si alguna piel cuelga en exceso, recortar con tijeritas limpias el borde libre sin jalar la raíz.",
      ],
      donts: [
        "JAMÁS jalar, pelar ni raspar las escamas de piel seca (riesgo severo de mancha o cicatriz).",
        "No aplicar maquillaje cosmético sobre las áreas que se encuentran activamente pelándose.",
        "Cero ejercicio vigoroso que produzca sudoración profusa (las sales del sudor irritan la dermis).",
        "Prohibido entrar a piscinas con cloro, jacuzzis, saunas y playas.",
        "No utilizar toallitas desmaquillantes, tónicos con alcohol ni cepillos mecánicos.",
      ],
    },
    days4_14: {
      timelineTag: "Días 4–14",
      phaseTitle: "Fase de Regeneración de Barrera Cutánea y Fotoprotección",
      tasks: [
        "Mantener la reaplicación de fotoprotector SPF 50+ cada 3 a 4 horas sin excepción",
        "Nutrir la barrera cutánea con sueros de ácido hialurónico puro y ceramidas",
        "Reanudar maquillaje hipoalergénico solo tras haber finalizado la descamación al 100%",
        "Posponer el uso de exfoliantes, retinoides y depilación facial hasta después del día 14",
        "Agendar y acudir a la cita de control dermatológico post-peeling",
      ],
      dos: [
        "Reaplicar protector solar SPF 50+ de amplio espectro cada 3 a 4 horas los próximos 30 días.",
        "Nutrir la nueva epidermis con ácido hialurónico puro y cremas con ceramidas y niacinamida.",
        "Reanudar el maquillaje cosmético mineral hipoalergénico solo al cesar la descamación.",
        "Monitorear la uniformidad del tono de piel e informar oportunamente cualquier pigmentación.",
        "Asistir a la revisión dermatológica de control o sesión complementaria programada.",
      ],
      donts: [
        "No exponerse deliberadamente al sol en playas, piscinas o terrazas por al menos 30 días.",
        "No reintroducir retinoides, ácido glicólico, salicílico ni exfoliantes físicos antes del día 14.",
        "No realizarse depilación facial con cera, hilo, láser o luz pulsada durante al menos 4 semanas.",
      ],
    },
  },
};

function renderGuidelineIcon(type: FormattedGuideline["iconType"], isRestriction: boolean) {
  const size = 14;
  switch (type) {
    case "sun":
      return <SunIcon size={size} />;
    case "moon":
      return <MoonIcon size={size} />;
    case "snowflake":
      return <SnowflakeIcon size={size} />;
    case "droplet":
      return <DropletIcon size={size} />;
    case "dumbbell":
      return <DumbbellIcon size={size} />;
    case "sparkles":
      return <SparklesIcon size={size} />;
    case "ban":
      return <BanIcon size={size} />;
    default:
      return isRestriction ? <BanIcon size={size} /> : <CheckCircle2Icon size={size} />;
  }
}

export function DailyCareChecklist({
  procedureSlug,
  currentDay,
  initialItems,
  dos = [],
  donts = [],
}: DailyCareChecklistProps) {
  // Determine clinical protocol according to slug and day
  const protocol = PROCEDURE_CARE_PROTOCOLS[procedureSlug];
  let phaseData: ProcedureCareProtocol | null = null;
  if (protocol) {
    if (currentDay >= 4) {
      phaseData = protocol.days4_14;
    } else if (currentDay >= 2) {
      phaseData = protocol.days1_3;
    } else {
      phaseData = protocol.day0;
    }
  }

  // Active items, dos, and donts
  const rawItems = initialItems && initialItems.length > 0 ? initialItems : phaseData?.tasks || [
    "Dormir boca arriba (decúbito supino) con 2 almohadas para favorecer drenaje linfático",
    "Aplicar frío local seguro (gasa estéril limpia, pulsos de 10 minutos, sin presionar)",
    "Aplicar bálsamo reparador o protector solar mineral según la fase",
    "Beber al menos 2 litros de agua fresca y evitar comidas calientes, picantes o saladas",
    "Cero frotamiento, rascado o compresión en la zona tratada",
  ];
  const items = rawItems.map(cleanTaskText);

  const activeDos = dos.length > 0 ? dos : phaseData?.dos || [];
  const activeDonts = donts.length > 0 ? donts : phaseData?.donts || [];

  const storageKey = `auratips_daily_checklist_${procedureSlug}_day_${currentDay}`;
  const legacyStorageKey = `aesthetica_daily_checklist_${procedureSlug}_day_${currentDay}`;
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [guidelineFilter, setGuidelineFilter] = useState<"all" | "dos" | "donts">("all");

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      } else {
        setCheckedItems({});
      }
    } catch {
      // ignore storage access errors
    }
  }, [storageKey, legacyStorageKey]);

  const toggleItem = (index: number) => {
    const updated = { ...checkedItems, [index]: !checkedItems[index] };
    setCheckedItems(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const completedCount = items.filter((_, idx) => checkedItems[idx]).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const isAllCompleted = items.length > 0 && completedCount === items.length;

  return (
    <div
      className="bento-card bento-checklist"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-4)",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            marginBottom: "var(--space-2)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-brand)",
                }}
              >
                Checklist Diario Clínico
              </span>
              {phaseData?.timelineTag && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(32, 80, 59, 0.12)",
                    color: "var(--color-brand)",
                  }}
                >
                  {phaseData.timelineTag}
                </span>
              )}
            </div>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--color-text)",
                lineHeight: 1.2,
                marginTop: "3px",
              }}
            >
              Cuidados Clave de Hoy (Día {currentDay})
            </h3>
            {phaseData?.phaseTitle && (
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
                {phaseData.phaseTitle}
              </p>
            )}
          </div>

          <span
            className="badge badge-brand"
            style={{
              fontWeight: 700,
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: isAllCompleted ? "var(--color-success-soft)" : "rgba(32, 80, 59, 0.1)",
              color: isAllCompleted ? "var(--color-success)" : "var(--color-brand)",
            }}
          >
            {completedCount} de {items.length} completados
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--color-border)",
            overflow: "hidden",
            marginBlock: "var(--space-2)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: isAllCompleted ? "#22c55e" : "var(--color-brand)",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        </div>

        {/* Pilares clínicos rápidos */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBlock: "6px 12px",
            fontSize: "12px",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
            <MoonIcon size={12} color="var(--color-muted)" />
            <span>Postura (boca arriba + 2 almohadas)</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
            <SnowflakeIcon size={12} color="var(--color-muted)" />
            <span>Frío seguro (gasa, 10 min, sin presionar)</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
            <SunIcon size={12} color="var(--color-muted)" />
            <span>Skincare (reparador / SPF mineral)</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: "var(--color-surface-2)", borderRadius: "4px", color: "var(--color-text-2)" }}>
            <DropletIcon size={12} color="var(--color-muted)" />
            <span>Hidratación (&gt;2L, sin picantes)</span>
          </span>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {items.map((task, idx) => {
          const isDone = !!checkedItems[idx];
          return (
            <label
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: isDone ? "rgba(32, 80, 59, 0.06)" : "var(--color-surface-2)",
                border: isDone ? "1px solid rgba(32, 80, 59, 0.25)" : "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all var(--dur-fast) ease",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggleItem(idx)}
                style={{
                  marginTop: "3px",
                  accentColor: "#20503B",
                  width: 17,
                  height: 17,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: isDone ? "var(--color-muted)" : "var(--color-text)",
                  textDecoration: isDone ? "line-through" : "none",
                  lineHeight: 1.4,
                  fontWeight: isDone ? 400 : 500,
                }}
              >
                {task}
              </span>
            </label>
          );
        })}
      </div>

      {isAllCompleted && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "var(--color-success-soft)",
            border: "1px solid #B7EBCE",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            color: "var(--color-success)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2Icon size={16} />
          <span>¡Excelente! Has completado todas las pautas de cuidado de hoy.</span>
        </div>
      )}

      {/* Módulo de Protocolo Clínico Avanzado: Pautas y Restricciones */}
      {(activeDos.length > 0 || activeDonts.length > 0) && (
        <div className="guidelines-wrapper" id="guidelines-accordion">
          <button
            type="button"
            className="guidelines-trigger"
            onClick={() => setShowGuidelines(!showGuidelines)}
            aria-expanded={showGuidelines}
            aria-controls="guidelines-detail-content"
          >
            <div className="guidelines-trigger-title">
              <div className="guidelines-trigger-icon" aria-hidden="true">
                <ShieldCheckIcon size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "14px", color: "var(--color-text)", fontWeight: 700 }}>
                    Pautas Médicas Detalladas
                  </strong>
                  <span
                    style={{
                      fontSize: "var(--text-min)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(32, 80, 59, 0.08)",
                      color: "var(--color-brand)",
                      fontWeight: 700,
                    }}
                  >
                    {activeDos.length + activeDonts.length} Directrices
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)", lineHeight: 1.3 }}>
                  Hábitos recomendados y restricciones clínicas supervisadas por la especialista
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-brand)" }}>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                {showGuidelines ? "Ocultar" : "Consultar"}
              </span>
              <ChevronRightIcon
                size={16}
                style={{
                  transform: showGuidelines ? "rotate(-90deg)" : "rotate(90deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </div>
          </button>

          {showGuidelines && (
            <div
              id="guidelines-detail-content"
              className="guidelines-content"
              role="region"
              aria-label="Contenido de pautas médicas detalladas"
            >
              {/* Barra de Filtro Segmentado por Tipo */}
              <div className="guidelines-filter-bar" role="tablist" aria-label="Filtro de directrices">
                <button
                  type="button"
                  role="tab"
                  aria-selected={guidelineFilter === "all"}
                  onClick={() => setGuidelineFilter("all")}
                  className={`guideline-filter-pill ${guidelineFilter === "all" ? "active" : ""}`}
                >
                  <ClipboardCheckIcon size={13} />
                  <span>Todas ({activeDos.length + activeDonts.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={guidelineFilter === "dos"}
                  onClick={() => setGuidelineFilter("dos")}
                  className={`guideline-filter-pill ${guidelineFilter === "dos" ? "active" : ""}`}
                >
                  <CheckCircle2Icon size={13} />
                  <span>Qué Hacer ({activeDos.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={guidelineFilter === "donts"}
                  onClick={() => setGuidelineFilter("donts")}
                  className={`guideline-filter-pill ${guidelineFilter === "donts" ? "active" : ""}`}
                >
                  <BanIcon size={13} />
                  <span>Qué Evitar ({activeDonts.length})</span>
                </button>
              </div>

              {/* Lista Desplegable de Directrices Clínicas Sin Contenedor de Cajas */}
              <div className={`guidelines-unboxed-grid ${guidelineFilter === "all" ? "comparative" : ""}`}>
                {/* Columna / Pautas de Qué Hacer */}
                {(guidelineFilter === "all" || guidelineFilter === "dos") && activeDos.length > 0 && (
                  <div className="guidelines-group">
                    <div className="guidelines-group-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="guidelines-status-dot do" aria-hidden="true" />
                        <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
                          Pautas Recomendadas
                        </h4>
                      </div>
                      <span className="guideline-count-tag do">{activeDos.length} pautas</span>
                    </div>

                    <ul className="guidelines-bullet-list">
                      {activeDos.map((raw, idx) => {
                        const item = formatClinicalGuideline(raw, false);
                        return (
                          <li className="guideline-bullet-item do" key={`do-${idx}`}>
                            <div className="guideline-bullet-icon do" aria-hidden="true">
                              {renderGuidelineIcon(item.iconType, false)}
                            </div>
                            <div className="guideline-bullet-content">
                              <p className="guideline-bullet-text">
                                <strong className="guideline-bullet-lead">{item.lead}</strong>
                                {item.body && (
                                  <span className="guideline-bullet-desc">
                                    {item.lead.endsWith(":") ? ` ${item.body}` : `: ${item.body}`}
                                  </span>
                                )}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Columna / Restricciones de Qué Evitar */}
                {(guidelineFilter === "all" || guidelineFilter === "donts") && activeDonts.length > 0 && (
                  <div className="guidelines-group">
                    <div className="guidelines-group-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="guidelines-status-dot dont" aria-hidden="true" />
                        <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
                          Restricciones Clínicas
                        </h4>
                      </div>
                      <span className="guideline-count-tag dont">{activeDonts.length} restricciones</span>
                    </div>

                    <ul className="guidelines-bullet-list">
                      {activeDonts.map((raw, idx) => {
                        const item = formatClinicalGuideline(raw, true);
                        return (
                          <li className="guideline-bullet-item dont" key={`dont-${idx}`}>
                            <div className="guideline-bullet-icon dont" aria-hidden="true">
                              {renderGuidelineIcon(item.iconType, true)}
                            </div>
                            <div className="guideline-bullet-content">
                              <p className="guideline-bullet-text">
                                <strong className="guideline-bullet-lead">{item.lead}</strong>
                                {item.body && (
                                  <span className="guideline-bullet-desc">
                                    {item.lead.endsWith(":") ? ` ${item.body}` : `: ${item.body}`}
                                  </span>
                                )}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
