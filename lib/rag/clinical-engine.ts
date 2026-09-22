import { GuardrailCheckResult } from "./guardrails";
import { RetrievedClinicalContext } from "./retriever";
import { findMatchingFewShot } from "./few-shot-examples";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

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
}

export function generateClinicalResponse(
  userQuery: string,
  context: RetrievedClinicalContext,
  guardrail: GuardrailCheckResult,
  recoveryDay?: number,
  history?: ChatHistoryMessage[]
): ClinicalAssistantResponse {
  // 1. Caso de atención prioritaria (cumple 3 o más criterios de alarma simultáneos)
  if (guardrail.isEmergency) {
    const reply = `### ${guardrail.actionTitle}\n\n` +
      `Hola. Comprendo completamente que notar estos cambios te cause inquietud y queremos darte total acompañamiento y tranquilidad.\n\n` +
      `En **AuraTips**, por protocolo médico de seguridad, cuando se presentan **3 o más criterios de observación de forma simultánea**, lo más prudente y conveniente para tu bienestar es que la **Dra. Mariana Gómez** realice una valoración médica prioritaria directa.\n\n` +
      `**Pautas de cuidado preventivo inmediato:**\n` +
      `* Mantén la calma, nuestro equipo médico está disponible para ayudarte.\n` +
      `* **No masajees** la zona ni apliques presión, frío o calor.\n` +
      `* Comunícate ahora mismo con la **Dra. Mariana Gómez** a través del botón directo a continuación.\n\n` +
      `*Tu tranquilidad y salud son nuestra prioridad absoluta.*`;

    return {
      reply,
      isEmergency: true,
      urgencyLevel: "emergency",
      matchedProcedure: context.procedureTitle,
      recommendedDos: ["Mantener la calma y reposo", "Contactar a la Dra. Mariana Gómez de forma prioritaria"],
      recommendedDonts: ["No presionar ni masajear la zona", "No aplicar calor ni hielo directo", "No esperar si las molestias continúan"],
      alarmSigns: context.alarmSigns,
      contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20Prioritaria%20Post-Tratamiento%20Dra%20Mariana%20Gomez",
    };
  }

  // 2. Comprobar si coincide con un caso maestro Few-Shot calibrado con la Dra. Mariana Gómez
  const matchedFewShot = findMatchingFewShot(userQuery);
  if (matchedFewShot) {
    return {
      reply: matchedFewShot.auraTipsResponse,
      isEmergency: false,
      urgencyLevel: "normal",
      matchedProcedure: context.procedureTitle,
      recoveryPhase: context.currentPhaseTitle,
      recommendedDos: context.dos.slice(0, 3),
      recommendedDonts: context.donts.slice(0, 3),
      alarmSigns: context.alarmSigns,
      contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20de%20Seguimiento%20Dra%20Mariana%20Gomez",
    };
  }

  // 3. Consulta de evolución habitual post-tratamiento (RAG dinámico desde Supabase)
  const day = recoveryDay ?? 2;
  const q = userQuery.toLowerCase();

  let adviceSection = "";

  // Detección de intenciones con empatía profunda, reduciendo la ansiedad del paciente
  if (q.includes("hinchad") || q.includes("inflama") || q.includes("edema") || q.includes("volumen")) {
    adviceSection = `**Sobre la inflamación y volumen en tu Día ${day}:**\n` +
      `Te comprendo perfectamente; es muy natural que al mirarte al espejo sientas inquietud por el volumen o la sensación de tirantez. Queremos darte toda la tranquilidad: en las primeras 48 a 72 horas los tejidos reaccionan con un edema inflamatorio completamente habitual y transitorio (pueden verse hasta un 25-30% más inflamados que el resultado definitivo). A partir del día 4 notarás cómo empieza a ceder gradualmente.`;
  } else if (q.includes("morad") || q.includes("hematoma") || q.includes("moret") || q.includes("mancha")) {
    adviceSection = `**Sobre pequeños moretones o cambios de tono en tu Día ${day}:**\n` +
      `Entiendo que te preocupe el aspecto visual. Los pequeños hematomas en los puntos de aplicación son comunes e inofensivos. Irán aclarando de tono con los días de forma natural. Puedes aplicar suavemente crema con árnica o vitamina K tópica, siempre con toques delicados sin frotar.`;
  } else if (q.includes("ejercicio") || q.includes("gimnasio") || q.includes("entrenar") || q.includes("correr") || q.includes("pesas")) {
    adviceSection = `**Sobre la actividad física y el descanso (Día ${day}):**\n` +
      `Tu cuerpo está en un momento de adaptación. Por eso es muy recomendable mantener un reposo relativo de ejercicio intenso durante las primeras 48 a 72 horas. Esto ayuda a evitar aumentos bruscos de presión que puedan provocar mayor inflamación.`;
  } else if (q.includes("sol") || q.includes("playa") || q.includes("sauna") || q.includes("calor")) {
    adviceSection = `**Sobre la protección térmica y solar:**\n` +
      `Para proteger tu piel y asegurar el mejor resultado estético, te aconsejo evitar la exposición solar directa, saunas o duchas con agua muy caliente durante los primeros 7 días. Usa siempre tu protector solar FPS 50+ con toques suaves.`;
  } else if (q.includes("dolor") || q.includes("molestia") || q.includes("medicamento") || q.includes("analg")) {
    adviceSection = `**Sobre el manejo de la sensibilidad y molestias:**\n` +
      `Es normal experimentar cierta sensibilidad localizada. Por favor **revisa en primer lugar la fórmula médica** entregada en tu consulta. Recuerda que si el dolor persiste o es molesto, debes comunicarte directamente con la Dra. Mariana Gómez para ajustar tu pauta. Evita automedicarte con Ibuprofeno o Aspirina en estas primeras 48 horas.`;
  } else if (q.includes("maquillaje") || q.includes("crema") || q.includes("lavar")) {
    adviceSection = `**Sobre la higiene y cosméticos:**\n` +
      `Durante las **primeras 48 horas** mantenemos una **restricción estricta de maquillaje** en los puntos de punción para prevenir infecciones bacterianas. Puedes lavar tu rostro con agua templada y jabón syndet suave, secando con palmaditas sin frotar.`;
  } else {
    adviceSection = `**Orientación de cuidado para tu Día ${day}:**\n` +
      `Durante esta fase de **${context.currentPhaseTitle || "Recuperación activa"}**, nuestro objetivo es acompañarte para que tu recuperación sea cómoda, segura y con los mejores resultados estéticos.`;
  }

  // Conexión contextual si hay historial previo de conversación
  let conversationNote = "";
  if (history && history.length > 1) {
    const lastUserMsg = history[history.length - 2]?.content || "";
    if (lastUserMsg.length > 0) {
      conversationNote = `\n\n*Teniendo en cuenta lo que conversamos anteriormente sobre tus cuidados de hoy, recuerda seguir el protocolo paso a paso.*`;
    }
  }

  // Nota de observación preventiva (educativa y tranquilizadora, sin alarmismo)
  const observationNote = guardrail.matchedCriteriaCount > 0
    ? `\n\n> 💡 *Nota de tranquilidad:* Percibimos que mencionas alguna molestia puntual. Recuerda que nuestro protocolo de **AuraTips** activa atención médica prioritaria si se presentan **3 o más criterios de alarma juntos**. Si en algún momento necesitas hablar directamente con la especialista, cuentas con el botón de contacto directo.`
    : "";

  const reply = `### Acompañamiento AuraTips: ${context.procedureTitle}\n\n` +
    `¡Hola! Te acompaño en tu **Día ${day} post-procedimiento** (${context.currentPhaseTitle}):\n\n` +
    `${adviceSection}${conversationNote}${observationNote}\n\n` +
    `#### 🟢 Pautas recomendadas (Qué hacer hoy):\n` +
    context.dos.slice(0, 3).map((d) => `* ${d}`).join("\n") + "\n\n" +
    `#### 🔴 Acciones a evitar (Qué evitar hoy):\n` +
    context.donts.slice(0, 3).map((d) => `* ${d}`).join("\n") + "\n\n" +
    `*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`;

  return {
    reply,
    isEmergency: false,
    urgencyLevel: guardrail.urgencyLevel,
    matchedProcedure: context.procedureTitle,
    recoveryPhase: context.currentPhaseTitle,
    recommendedDos: context.dos.slice(0, 3),
    recommendedDonts: context.donts.slice(0, 3),
    alarmSigns: context.alarmSigns,
    contactDoctorUrl: "https://wa.me/573009123456?text=Consulta%20de%20Seguimiento%20Dra%20Mariana%20Gomez",
  };
}
