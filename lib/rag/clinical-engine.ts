import { GuardrailCheckResult } from "./guardrails";
import { RetrievedClinicalContext } from "./retriever";
import { findMatchingFewShot } from "./few-shot-examples";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export type ClinicalIntent =
  | "alert_triage"
  | "scheduling"
  | "human_handoff"
  | "clinical_query";

export interface ClinicalAssistantResponse {
  reply: string;
  isEmergency: boolean;
  urgencyLevel: "emergency" | "warning" | "normal";
  matchedProcedure: string;
  recoveryPhase?: string;
  recommendedDos: string[];
  recommendedDonts: string[];
  alarmSigns: string[];
  contactDoctorUrl: string;
  intent?: ClinicalIntent;
}

/**
 * MANUAL DE VOZ, TONO Y SISTEMA DE COMUNICACIÓN CLÍNICA: AURATIPS
 * Supervisado por la Dra. Mariana Gómez
 *
 * 1. IDENTIDAD Y PROPÓSITO:
 *    AuraTips es el asistente clínico de recuperación post-tratamiento de la Dra. Mariana Gómez.
 *    Su misión es educar, contener la ansiedad visual del paciente y brindar pautas médicas
 *    seguras y empáticas basadas en la cronología de cada procedimiento.
 *
 * 2. ENRUTADOR DE INTENCIONES (INTENT ROUTER):
 *    - alert_triage: >= 3 criterios concurrentes de observación o síntoma sistémico.
 *    - human_handoff: deseo expreso de hablar con persona o llamada telefónica. Cero pautas clínicas.
 *    - scheduling: dudas sobre agendamiento o adelantar cita de control del Día 14. Cero pautas clínicas.
 *    - clinical_query: consultas clínicas específicas con respuestas concisas (anti-biblias).
 *
 * 3. CONTROL DE EXTENSIÓN (ANTI-BIBLIAS):
 *    - Máximo 2 o 3 párrafos cortos (o viñetas claras).
 *    - Lenguaje conversacional natural, en tuteo respetuoso y cercano, sin tecnicismos rimbombantes.
 */
export const AURA_TIPS_SYSTEM_PROMPT = `Eres AuraTips, el asistente clínico de recuperación médica estética de la Dra. Mariana Gómez.

DIRECTRICES CLÍNICAS Y DE CONVERSACIÓN:
1. Saludo oficial cálido y conciso.
2. Tono y pedagogía médica:
   Validación emocional inicial con tuteo respetuoso y cercano. Explica los términos médicos mediante descripciones fisiológicas claras, directas, elegantes y comprensibles, sin analogías forzadas ni términos infantiles o metafóricos.
3. Prohibición estricta de términos alarmistas:
   NUNCA usar diagnósticos alarmistas ni términos fatalistas como "posible riesgo de isquemia", "necrosis" o "hemorragia".
4. Erradicación total de anglicismos:
   Utilizar siempre y de forma estricta:
   - "#### Pautas recomendadas (Qué hacer):"
   - "#### Acciones a evitar (Qué evitar):"
5. Enrutamiento inteligente:
   - Si el usuario pide agendamiento o reprogramar cita: orientar sobre la cita del Día 14 y dar canal de recepción sin bloques de qué hacer/evitar.
   - Si el usuario pide llamada o humano: máxima empatía en 2 líneas y enlace telefónico directo sin pautas clínicas.
6. Cierre oficial:
   "*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*"
`;

/**
 * Clasificador de intenciones clínicas y administrativas
 */
export function classifyClinicalIntent(
  query: string,
  guardrail: GuardrailCheckResult
): ClinicalIntent {
  // 1. Triaje de alerta médica (>= 3 criterios o sistémico)
  if (guardrail.isEmergency) {
    return "alert_triage";
  }

  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Deseo de llamada / Handoff a humano
  if (
    q.includes("no me gusta este chat") ||
    q.includes("persona real") ||
    q.includes("hablar con un humano") ||
    q.includes("hablar con una persona") ||
    q.includes("llamenme") ||
    q.includes("que me llamen") ||
    q.includes("prefiero llamada") ||
    q.includes("prefiero una llamada") ||
    q.includes("prefiero que me llamen") ||
    q.includes("no quiero chatear") ||
    q.includes("hablar por telefono") ||
    q.includes("llamada telefonica") ||
    q.includes("comunicarme con alguien") ||
    q.includes("atencion telefonica") ||
    q.includes("operador") ||
    q.includes("asesor humano")
  ) {
    return "human_handoff";
  }

  // 3. Citas y agendamiento
  if (
    q.includes("adelantar mi cita") ||
    q.includes("adelantar la cita") ||
    q.includes("adelantar cita") ||
    q.includes("cambiar fecha") ||
    q.includes("cambiar la fecha") ||
    q.includes("cambiar mi cita") ||
    q.includes("cambiar el dia") ||
    q.includes("puedo ir antes") ||
    q.includes("podria ir antes") ||
    q.includes("es posible ir antes") ||
    q.includes("reprogramar") ||
    q.includes("mover mi cita") ||
    q.includes("pasar antes") ||
    q.includes("no quiero esperar hasta el dia 14") ||
    q.includes("no quiero esperar al dia 14") ||
    (q.includes("cita") &&
      (q.includes("adelantar") ||
        q.includes("cambiar") ||
        q.includes("antes") ||
        q.includes("reprogramar") ||
        q.includes("mover")))
  ) {
    return "scheduling";
  }

  // 4. Consulta clínica
  return "clinical_query";
}

export function generateClinicalResponse(
  userQuery: string,
  context: RetrievedClinicalContext,
  guardrail: GuardrailCheckResult,
  recoveryDay?: number,
  history?: ChatHistoryMessage[]
): ClinicalAssistantResponse {
  const day = recoveryDay ?? 2;
  const intent = classifyClinicalIntent(userQuery, guardrail);

  // -------------------------------------------------------------------------
  // INTENCIÓN 4: TRIAJE DE ALERTA (>= 3 criterios simultáneos o sistémico)
  // -------------------------------------------------------------------------
  if (intent === "alert_triage") {
    const reply =
      `### Atención Médica Prioritaria Recomendada\n\n` +
      `¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación. Comprendo plenamente que notar estos cambios te cause inquietud y queremos darte total acompañamiento, serenidad y soporte médico directo.\n\n` +
      `En **AuraTips**, por protocolo clínico preventivo de seguridad, cuando se presentan **3 o más criterios de observación de forma simultánea**, lo más prudente y seguro para tu bienestar es que la **Dra. Mariana Gómez** realice una valoración médica prioritaria directa.\n\n` +
      `#### Instrucciones de cuidado inmediato:\n` +
      `* Mantén la calma: nuestro equipo médico está disponible para asistirte de inmediato.\n` +
      `* Comunícate ahora mismo con la **Dra. Mariana Gómez** a través del botón de atención médica prioritaria a continuación.\n` +
      `* Reposa en un lugar fresco, mantén la cabeza elevada y suspende masajes o aplicación de frío/calor.\n\n` +
      `*Tu tranquilidad y salud son nuestra prioridad absoluta.*`;

    return {
      reply,
      isEmergency: true,
      urgencyLevel: "emergency",
      intent: "alert_triage",
      matchedProcedure: context.procedureTitle,
      recoveryPhase: context.currentPhaseTitle,
      recommendedDos: ["Mantener la calma y reposo", "Contactar a la Dra. Mariana Gómez de forma prioritaria"],
      recommendedDonts: ["No presionar ni masajear la zona", "No aplicar calor ni hielo directo", "No automedicarte con ungüentos"],
      alarmSigns: context.alarmSigns,
      contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20Prioritaria%20Post-Tratamiento%20Dra%20Mariana%20Gomez",
    };
  }

  // -------------------------------------------------------------------------
  // INTENCIÓN 2: HANDOFF A HUMANO / DESEO DE LLAMADA TELEFÓNICA
  // -------------------------------------------------------------------------
  if (intent === "human_handoff") {
    const reply =
      `¡Hola! Comprendo totalmente que prefieras hablar directamente por teléfono con nuestro equipo humano en lugar de interactuar por chat.\n\n` +
      `Puedes comunicarte ahora mismo de forma directa haciendo clic aquí: [Llamar a Recepción Médica (+57 300 912 3456)](tel:+573009123456) o escribirnos a nuestro [WhatsApp de Recepción Clínica](https://wa.me/573009123456?text=Hola,%20solicito%20atenci%C3%B3n%20telef%C3%B3nica%20directa%20por%20favor) para devolverte la llamada a la brevedad.`;

    return {
      reply,
      isEmergency: false,
      urgencyLevel: "normal",
      intent: "human_handoff",
      matchedProcedure: context.procedureTitle,
      recoveryPhase: context.currentPhaseTitle,
      recommendedDos: [],
      recommendedDonts: [],
      alarmSigns: [],
      contactDoctorUrl: "tel:+573009123456",
    };
  }

  // -------------------------------------------------------------------------
  // INTENCIÓN 1: CITAS Y AGENDAMIENTO
  // -------------------------------------------------------------------------
  if (intent === "scheduling") {
    const isEarly = day < 14;
    const clinicalSafetyRationale = isEarly
      ? `En tu **Día ${day}**, no es clínicamente aconsejable adelantar la cita antes del Día 14 porque los tejidos aún se encuentran en fase activa de desinflamación y el ácido hialurónico tarda dos semanas en estabilizarse e integrarse de forma definitiva (la simetría real se evalúa a partir de ese momento). Sin embargo, si experimentas alguna molestia puntual o cambio inesperado que requiera valoración previa, podemos atenderte con gusto antes.`
      : `Como ya te encuentras en tu **Día ${day}**, es el momento ideal para realizar tu revisión médica presencial y evaluar el asentamiento definitivo de tu tratamiento.`;

    const reply =
      `### Gestión de Cita de Control • AuraTips\n\n` +
      `¡Hola! Bienvenido(a) a AuraTips. Tu cita formal de revisión y control clínico está programada para el **Día 14 con la Dra. Mariana Gómez**.\n\n` +
      `${clinicalSafetyRationale}\n\n` +
      `Para consultar disponibilidad de agenda o coordinar una reprogramación directa, comunícate con recepción médica aquí: [Contactar a Recepción Médica](https://wa.me/573009123456?text=Hola,%20deseo%20consultar%20sobre%20mi%20cita%20de%20control%20Dra%20Mariana%20Gomez) o llamando al [+57 300 912 3456](tel:+573009123456).`;

    return {
      reply,
      isEmergency: false,
      urgencyLevel: "normal",
      intent: "scheduling",
      matchedProcedure: context.procedureTitle,
      recoveryPhase: context.currentPhaseTitle,
      recommendedDos: [],
      recommendedDonts: [],
      alarmSigns: [],
      contactDoctorUrl: "https://wa.me/573009123456?text=Agendamiento%20Cita%20de%20Control%20Dra%20Mariana%20Gomez",
    };
  }

  // -------------------------------------------------------------------------
  // INTENCIÓN 3: CONSULTA CLÍNICA ESPECÍFICA
  // -------------------------------------------------------------------------
  // 1. Comprobar si coincide con un caso maestro Few-Shot calibrado
  const matchedFewShot = findMatchingFewShot(userQuery);
  if (matchedFewShot) {
    return {
      reply: matchedFewShot.auraTipsResponse,
      isEmergency: false,
      urgencyLevel: "normal",
      intent: "clinical_query",
      matchedProcedure: context.procedureTitle,
      recoveryPhase: context.currentPhaseTitle,
      recommendedDos: context.dos.slice(0, 3),
      recommendedDonts: context.donts.slice(0, 3),
      alarmSigns: context.alarmSigns,
      contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20de%20Seguimiento%20Dra%20Mariana%20Gomez",
    };
  }

  // 2. Consulta de evolución habitual dinámica (RAG dinámico conciso y anti-biblias)
  const q = userQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let adviceSection = "";

  if (
    q.includes("deforme") ||
    q.includes("horrible") ||
    q.includes("me arrepiento") ||
    q.includes("odio como") ||
    q.includes("me veo mal")
  ) {
    adviceSection =
      `Comprendo profundamente tu inquietud al mirarte. En tu Día ${day}, la piel reacciona con un **edema agudo defensivo** sumado a la **alta capacidad hidrófila del ácido hialurónico** (retiene agua para asentarse), lo que produce una **sobredimensión temporal de hasta un 30%**. Lo que observas hoy no es el resultado final; te invitamos a pausar la revisión compulsiva en el espejo mientras los tejidos drenan.`;
  } else if (
    q.includes("asimetr") ||
    q.includes("torcid") ||
    q.includes("desigual") ||
    q.includes("un lado mas") ||
    q.includes("chuec")
  ) {
    adviceSection =
      `Es muy común percibir que un lado luce con más volumen en tu Día ${day}. Cada mitad del rostro cuenta con drenaje linfático independiente y la postura al dormir hace que un lado retenga más líquido por gravedad. El ácido hialurónico tarda 14 días en estabilizarse; la simetría real se evalúa en tu control del Día 14 con la Dra. Mariana Gómez.`;
  } else if (
    q.includes("bolita") ||
    q.includes("pelota") ||
    q.includes("durez") ||
    q.includes("bulto") ||
    q.includes("encapsul")
  ) {
    adviceSection =
      `Tocar una pequeña dureza en tu Día ${day} no significa encapsulamiento. El ácido hialurónico se encuentra en un depósito concentrado en fase de **biointegración tisular** (tarda 14 a 21 días en entretejerse con la piel). La regla de oro es **CERO MANIPULACIÓN**: no pellizques ni aprietes para evitar fricción y desplazamiento.`;
  } else if (
    q.includes("morad") ||
    q.includes("hematoma") ||
    q.includes("moret") ||
    q.includes("cardenal")
  ) {
    adviceSection =
      `Un moretón ocurre cuando la aguja roza un microcapilar dérmico (**extravasación capilar**). El cuerpo lo reabsorbe de forma natural en 5 a 10 días (de violáceo a verdoso y amarillo). Aplica crema de árnica o vitamina K en toques suaves sin frotar y utiliza protector solar FPS 50+.`;
  } else if (
    q.includes("hinchad") ||
    q.includes("inflama") ||
    q.includes("edema") ||
    q.includes("volumen")
  ) {
    adviceSection =
      `En las primeras 48 a 72 horas los tejidos presentan un **edema inflamatorio transitorio** defensivo que, junto a la retención hídrica del producto, puede verse hasta un 30% más voluminoso que el resultado real. Notarás cómo desciende gradualmente con reposo y buena hidratación.`;
  } else if (
    q.includes("alcohol") ||
    q.includes("vino") ||
    q.includes("cerveza") ||
    q.includes("fiesta") ||
    q.includes("evento") ||
    q.includes("boda") ||
    q.includes("cena")
  ) {
    adviceSection =
      `Durante las **primeras 48 horas** rige una restricción de bebidas alcohólicas. El alcohol produce **vasodilatación capilar inmediata**, aumentando el flujo sanguíneo y reactivando la inflamación y los morados. Te sugerimos disfrutar tu evento con mocktails hidratantes o agua con gas.`;
  } else if (
    q.includes("maquill") ||
    q.includes("base") ||
    q.includes("labial")
  ) {
    adviceSection =
      `Los microorificios de punción tardan entre 24 y 48 horas en completar su sellado natural. Aplicar bases o cosméticos directos antes de ese lapso introduce bacterias en las capas profundas. Puedes maquillar libremente ojos y cejas, dejando la zona tratada solo con bálsamo estéril o fotoprotector.`;
  } else if (
    q.includes("ejercicio") ||
    q.includes("gimnasio") ||
    q.includes("entrenar") ||
    q.includes("correr") ||
    q.includes("pesas")
  ) {
    adviceSection =
      `El ejercicio intenso eleva la presión circulatoria en el rostro, lo que puede reactivar la hinchazón y los hematomas. Te aconsejamos mantener reposo deportivo durante las primeras 48 a 72 horas para favorecer la cicatrización dérmica.`;
  } else if (
    q.includes("sol") ||
    q.includes("playa") ||
    q.includes("sauna") ||
    q.includes("calor")
  ) {
    adviceSection =
      `Las fuentes de calor directo (sol, saunas o baños calientes) actúan como vasodilatadores térmicos aumentando el edema. Protege tu piel del calor directo durante los primeros 7 días y usa protector solar FPS 50+ mineral.`;
  } else if (
    q.includes("dolor") ||
    q.includes("molestia") ||
    q.includes("analg") ||
    q.includes("ibuprofeno") ||
    q.includes("aspirina")
  ) {
    adviceSection =
      `Por favor **revisa tu fórmula médica oficial**. Evita automedicarte con Ibuprofeno o Aspirina en estas primeras 48 horas: tienen efecto **antiagregante plaquetario** que favorece los moretones. El **Acetaminofén** es el analgésico seguro pautado por la clínica porque alivia la molestia sin alterar la coagulación.`;
  } else {
    adviceSection =
      `Te acompaño en tu **Día ${day}** (${context.currentPhaseTitle || "Recuperación activa"}). Nuestro compromiso es brindarte un seguimiento cercano, seguro y alineado con las indicaciones de la Dra. Mariana Gómez.`;
  }

  // Conexión contextual breve si hay historial
  let conversationNote = "";
  if (history && history.length > 1) {
    const lastUserMsg = history[history.length - 2]?.content || "";
    if (lastUserMsg.length > 0) {
      conversationNote = `\n\n*Siguiendo lo que revisamos en tu mensaje anterior, mantén las pautas al pie de la letra.*`;
    }
  }

  const reply =
    `### Acompañamiento AuraTips: ${context.procedureTitle}\n\n` +
    `¡Hola! Bienvenido(a) a AuraTips. Te acompaño en tu **Día ${day} post-procedimiento**:\n\n` +
    `${adviceSection}${conversationNote}\n\n` +
    `#### Pautas recomendadas (Qué hacer):\n` +
    context.dos.slice(0, 3).map((d) => `* ${d}`).join("\n") +
    "\n\n" +
    `#### Acciones a evitar (Qué evitar):\n` +
    context.donts.slice(0, 3).map((d) => `* ${d}`).join("\n") +
    "\n\n" +
    `*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`;

  return {
    reply,
    isEmergency: false,
    urgencyLevel: guardrail.urgencyLevel,
    intent: "clinical_query",
    matchedProcedure: context.procedureTitle,
    recoveryPhase: context.currentPhaseTitle,
    recommendedDos: context.dos.slice(0, 3),
    recommendedDonts: context.donts.slice(0, 3),
    alarmSigns: context.alarmSigns,
    contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20de%20Seguimiento%20Dra%20Mariana%20Gomez",
  };
}
