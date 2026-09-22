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

/**
 * MANUAL DE VOZ, TONO Y SISTEMA DE COMUNICACIÓN CLÍNICA: AURATIPS
 * Supervisado por la Dra. Mariana Gómez
 *
 * 1. IDENTIDAD Y PROPÓSITO:
 *    AuraTips es el asistente clínico de recuperación post-tratamiento de la Dra. Mariana Gómez.
 *    Su misión es educar, contener la ansiedad visual del paciente y brindar pautas médicas
 *    seguras y empáticas basadas en la cronología de cada procedimiento.
 *
 * 2. SALUDO OFICIAL Y TONO:
 *    - Saludo unificado obligatorio: "¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación..."
 *    - Tono: Validación emocional inicial con tuteo respetuoso y cercano, seguido de
 *      pedagogía médica clara y explicaciones somáticas directas sin caer en tecnicismos incomprensibles.
 *
 * 3. PRINCIPIO PEDAGÓGICO: EXPLICACIONES CLÍNICAS DIRECTAS Y RIGUROSAS (SIN ANALOGÍAS FORZADAS):
 *    - Erradicar cualquier analogía doméstica, infantil o fuera de contexto.
 *    - Puntos de punción: Microorificios en la piel que tardan entre 24 y 48 horas en completar su sellado y cicatrización natural; aplicar cosméticos introduce bacterias directamente hacia las capas dérmicas profundas.
 *    - Fármacos AINEs (Ibuprofeno/Aspirina): Efecto antiagregante plaquetario que disminuye temporalmente la capacidad de coagulación en los microvasos intervenidos, facilitando el sangrado bajo la piel y los moretones.
 *    - Hinchazón/volumen: Edema reactivo de defensa de la piel sumado a la alta capacidad hidrófila del ácido hialurónico (atrae y retiene agua), provocando una sobredimensión temporal de hasta un 30%.
 *    - Asimetría: Cada mitad del rostro tiene su propia red independiente de microcirculación y drenaje linfático; la postura al dormir acumula retención por gravedad. El "Pacto de Paciencia del Día 14" permite que el producto se asiente por completo.
 *    - Nódulos ("bolitas"): Depósito inicial concentrado que experimenta biointegración tisular (14-21 días) ablandándose e integrándose en el tejido; cero manipulación para evitar fricción traumática y desplazamiento.
 *    - Hematomas: Salida localizada de una microgota de sangre (extravasación capilar) que el cuerpo reabsorbe y degrada de forma celular natural en 5-10 días (de violáceo a verdoso y amarillo); aplicar árnica o vitamina K en toques suaves sin frotar.
 *    - Alcohol: Vasodilatación capilar inmediata que acelera el flujo sanguíneo y reactiva hinchazón y morados.
 *
 * 4. DIRECTRICES CLÍNICAS OBLIGATORIAS:
 *    - NUNCA usar diagnósticos alarmistas ni términos fatalistas como "posible riesgo de isquemia",
 *      "necrosis" o "hemorragia". Referirse como "cambio de coloración o temperatura dérmica que requiere valoración médica directa".
 *    - Erradicar anglicismos: Emplear siempre de manera estricta:
 *      "#### 🟢 Pautas recomendadas (Qué hacer):"
 *      "#### 🔴 Acciones a evitar (Qué evitar):"
 */
export const AURA_TIPS_SYSTEM_PROMPT = `Eres AuraTips, el asistente clínico de recuperación médica estética de la Dra. Mariana Gómez.

DIRECTRICES CLÍNICAS Y DE CONVERSACIÓN:
1. Saludo oficial obligatorio:
   "¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación..."
2. Tono y pedagogía médica:
   Validación emocional inicial con tuteo respetuoso y cercano. Explica los términos médicos mediante descripciones fisiológicas claras, directas, elegantes y comprensibles, sin analogías forzadas ni términos infantiles o metafóricos.
3. Prohibición estricta de términos alarmistas:
   NUNCA usar diagnósticos alarmistas ni términos fatalistas como "posible riesgo de isquemia", "necrosis" o "hemorragia".
4. Erradicación total de anglicismos:
   Utilizar siempre y de forma estricta:
   - "#### 🟢 Pautas recomendadas (Qué hacer):"
   - "#### 🔴 Acciones a evitar (Qué evitar):"
5. Cierre oficial:
   "*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*"
`;

export function generateClinicalResponse(
  userQuery: string,
  context: RetrievedClinicalContext,
  guardrail: GuardrailCheckResult,
  recoveryDay?: number,
  history?: ChatHistoryMessage[]
): ClinicalAssistantResponse {
  // 1. Caso de atención prioritaria (cumple 3 o más criterios de alarma simultáneos)
  if (guardrail.isEmergency) {
    const reply =
      `### ${guardrail.actionTitle}\n\n` +
      `¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación. Comprendo completamente que notar estos cambios te cause inquietud y queremos darte total acompañamiento, serenidad y soporte médico directo.\n\n` +
      `En **AuraTips**, por protocolo clínico preventivo de seguridad, cuando se presentan **3 o más criterios de observación de forma simultánea**, lo más prudente y seguro para tu bienestar es que la **Dra. Mariana Gómez** realice una valoración médica prioritaria directa.\n\n` +
      `#### 🟢 Pautas recomendadas (Qué hacer):\n` +
      `* Mantén la calma: nuestro equipo médico está disponible para asistirte de inmediato.\n` +
      `* Comunícate ahora mismo con la **Dra. Mariana Gómez** a través del botón de atención médica prioritaria a continuación.\n` +
      `* Reposa en un lugar fresco y mantén la cabeza elevada.\n\n` +
      `#### 🔴 Acciones a evitar (Qué evitar):\n` +
      `* No masajees la zona ni intentes manipularla bajo ninguna circunstancia.\n` +
      `* No apliques compresas calientes, hielo directo ni presiones sobre el área.\n` +
      `* No te automediques con fármacos o ungüentos no prescritos.\n\n` +
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

  // 3. Consulta de evolución habitual post-tratamiento (RAG dinámico con explicaciones anatómicas directas)
  const day = recoveryDay ?? 2;
  const q = userQuery.toLowerCase();

  let adviceSection = "";

  // Detección de intenciones con pedagogía médica sobria, empática y clara
  if (
    q.includes("deforme") ||
    q.includes("horrible") ||
    q.includes("me arrepiento") ||
    q.includes("odio como") ||
    q.includes("me veo mal")
  ) {
    adviceSection =
      `**Sobre la percepción visual y la adaptación en tu Día ${day}:**\n` +
      `Comprendo profundamente lo angustiante que resulta mirarte y sentir que no te reconoces. Por favor ten total serenidad: tras la aplicación con microaguja o cánula, la piel responde con un **edema agudo** (una hinchazón defensiva natural para reparar los tejidos). A esto se suma la **alta capacidad hidrófila del ácido hialurónico**, que atrae y retiene agua para asentarse, produciendo una **sobredimensión temporal de hasta un 30%** por encima del resultado real proyectado. Lo que ves hoy no es tu aspecto definitivo; juzgarlo en este momento genera alarma innecesaria porque los tejidos aún no han drenado los líquidos retenidos. Te invitamos a pausar la revisión compulsiva en el espejo mientras los tejidos drenan de forma natural.`;
  } else if (
    q.includes("asimetr") ||
    q.includes("torcid") ||
    q.includes("desigual") ||
    q.includes("un lado mas")
  ) {
    adviceSection =
      `**Sobre la asimetría temporal y el balance en tu Día ${day}:**\n` +
      `Te comprendo perfectamente; es muy común notar que un lado luce con más volumen o altura que el otro. Cada mitad del rostro tiene su propia red independiente de microcirculación y canales de **drenaje linfático**, por lo que un lado suele procesar la inflamación más rápido que el otro. Además, la postura al dormir influye directamente: el lado sobre el que apoyas la cara acumula más líquido por gravedad y presión continua de la almohada. Nuestro **"Pacto de Paciencia"** establece que la simetría real se evalúa en tu control del Día 14 con la Dra. Mariana Gómez, momento en el que el producto se ha estabilizado y la inflamación desaparece por completo. Si notas mayor tensión en un lado, aplica frío seco local intermitente, y realiza únicamente los masajes si la doctora te los enseñó en consulta. No intentes empujar ni moldear la zona por tu cuenta.`;
  } else if (
    q.includes("bolita") ||
    q.includes("pelota") ||
    q.includes("durez") ||
    q.includes("bulto") ||
    q.includes("encapsul")
  ) {
    adviceSection =
      `**Sobre pequeñas durezas o textura al tacto en tu Día ${day}:**\n` +
      `Entiendo la inquietud que produce tocar una pequeña bolita y pensar en un encapsulamiento. Puedes tener absoluta tranquilidad: el ácido hialurónico no se encapsula en pocos días; en este momento inicial se encuentra en un depósito concentrado en el plano donde fue colocado. El proceso médico normal se llama **biointegración tisular** (tarda entre 14 y 21 días en ablandarse y entretejerse de manera homogénea con tu propia piel o mucosa). La regla de oro es **CERO MANIPULACIÓN**: si la pellizcas o aprietas, ejerces una fricción traumática que inflama el tejido y corre el riesgo de desplazar el implante.`;
  } else if (
    q.includes("morad") ||
    q.includes("hematoma") ||
    q.includes("moret") ||
    q.includes("mancha")
  ) {
    adviceSection =
      `**Sobre pequeños moretones o cambios de tono en tu Día ${day}:**\n` +
      `Entiendo que te preocupe el aspecto visual. Un hematoma ocurre cuando la aguja entra en contacto con un capilar sanguíneo diminuto durante la aplicación, provocando una pequeña salida de sangre bajo la piel (**extravasación capilar**). El cuerpo descompone y reabsorbe esa sangre de forma celular natural en un ciclo de 5 a 10 días (pasando de un tono violáceo a verdoso y amarillo claro hasta borrarse). Aplica suavemente crema con árnica o vitamina K tópica **en toquecitos superficiales sin frotar**, para no irritar los capilares que se están reparando, y usa protector solar mineral FPS 50+ para evitar que la luz fije la mancha.`;
  } else if (
    q.includes("hinchad") ||
    q.includes("inflama") ||
    q.includes("edema") ||
    q.includes("volumen")
  ) {
    adviceSection =
      `**Sobre la inflamación y volumen en tu Día ${day}:**\n` +
      `Te comprendo perfectamente; es muy natural que al mirarte sientas inquietud por el volumen. En las primeras 48 a 72 horas los tejidos reaccionan con un **edema inflamatorio transitorio** (una hinchazón defensiva) que, sumado a la retención de agua propia del ácido hialurónico, puede verse hasta un 25-30% más voluminoso que el resultado real. A partir del cuarto día notarás cómo empieza a ceder gradualmente con el descanso adecuado y el drenaje natural.`;
  } else if (
    q.includes("alcohol") ||
    q.includes("vino") ||
    q.includes("cerveza") ||
    q.includes("fiesta") ||
    q.includes("evento") ||
    q.includes("boda") ||
    q.includes("cena") ||
    q.includes("maquill")
  ) {
    adviceSection =
      `**Sobre eventos sociales, bebidas y cosméticos en tu Día ${day}:**\n` +
      `Es totalmente entendible que quieras disfrutar de tus compromisos, pero en las primeras 48 horas rige una restricción estricta en los puntos de punción. Cada microorificio de punción tarda entre 24 y 48 horas en completar su sellado y cicatrización natural (aplicar bases o brochas usadas introduce bacterias directamente hacia las capas dérmicas profundas). Además, el alcohol produce **vasodilatación capilar inmediata**, aumentando el flujo de sangre y reactivando la inflamación y los morados. La alternativa para no aislarte: resalta tu mirada con maquillaje de ojos y cejas, luce tu peinado y brinda con deliciosos mocktails hidratantes.`;
  } else if (
    q.includes("ejercicio") ||
    q.includes("gimnasio") ||
    q.includes("entrenar") ||
    q.includes("correr") ||
    q.includes("pesas")
  ) {
    adviceSection =
      `**Sobre la actividad física y el descanso en tu Día ${day}:**\n` +
      `Tu cuerpo está en un momento de adaptación y cicatrización dérmica. El ejercicio intenso eleva la frecuencia cardíaca y la presión sanguínea periférica en el rostro, lo que puede reactivar el edema o hacer reaparecer hematomas en las zonas intervenidas. Es fundamental mantener un reposo deportivo durante las primeras 48 a 72 horas.`;
  } else if (
    q.includes("sol") ||
    q.includes("playa") ||
    q.includes("sauna") ||
    q.includes("calor")
  ) {
    adviceSection =
      `**Sobre la protección térmica y solar:**\n` +
      `Las fuentes directas de calor (sol directo, saunas, baños turcos o agua muy caliente) actúan como vasodilatadores térmicos, aumentando la inflamación de los tejidos. Te aconsejo proteger tu piel del calor directo durante los primeros 7 días y aplicar tu protector solar FPS 50+ mineral con toques suaves.`;
  } else if (
    q.includes("dolor") ||
    q.includes("molestia") ||
    q.includes("medicamento") ||
    q.includes("analg") ||
    q.includes("ibuprofeno") ||
    q.includes("aspirina")
  ) {
    adviceSection =
      `**Sobre el manejo de la sensibilidad y molestias:**\n` +
      `Es normal experimentar cierta sensibilidad localizada. Por favor **revisa en primer lugar la fórmula médica** entregada en tu consulta. Recuerda evitar automedicarte con Ibuprofeno, Aspirina o Naproxeno en estas primeras 48 horas: estos fármacos tienen efecto **antiagregante plaquetario** (disminuyen temporalmente la capacidad de coagulación de las plaquetas que sellan los microvasos intervenidos, lo que facilita el sangrado bajo la piel y aumenta los morados). Si requieres alivio, el **Acetaminofén** es la alternativa segura pautada por la clínica porque alivia el dolor sin alterar la coagulación ni la función plaquetaria. Si el dolor persiste o es molesto, comunícate directamente con la Dra. Mariana Gómez.`;
  } else {
    adviceSection =
      `**Orientación de cuidado para tu Día ${day}:**\n` +
      `Durante esta fase de **${context.currentPhaseTitle || "Recuperación activa"}**, nuestro objetivo es acompañarte para que tu recuperación sea cómoda, segura y con los más altos estándares de armonía estética.`;
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
  const observationNote =
    guardrail.matchedCriteriaCount > 0
      ? `\n\n> 💡 *Nota de tranquilidad:* Percibimos que mencionas alguna molestia puntual. Recuerda que nuestro protocolo de **AuraTips** activa atención médica prioritaria si se presentan **3 o más criterios de alarma juntos**. Si en algún momento necesitas hablar directamente con la especialista, cuentas con el botón de contacto directo.`
      : "";

  const reply =
    `### Acompañamiento AuraTips: ${context.procedureTitle}\n\n` +
    `¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación. Te acompaño en tu **Día ${day} post-procedimiento** (${context.currentPhaseTitle}):\n\n` +
    `${adviceSection}${conversationNote}${observationNote}\n\n` +
    `#### 🟢 Pautas recomendadas (Qué hacer):\n` +
    context.dos.slice(0, 3).map((d) => `* ${d}`).join("\n") +
    "\n\n" +
    `#### 🔴 Acciones a evitar (Qué evitar):\n` +
    context.donts.slice(0, 3).map((d) => `* ${d}`).join("\n") +
    "\n\n" +
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
