/**
 * Batería de Pruebas de Estrés y Calibración Conversacional de AuraTips
 * Lead QA Engineer & Clinical AI Conversation Architect
 *
 * Simula las 5 interacciones clave ante el endpoint POST /api/chat:
 * - Test A (Administrativo / Agendamiento)
 * - Test B (Llamada / Handoff a Humano)
 * - Test C (Pregunta Concisa / Maquillaje)
 * - Test D (Ansiedad Estética / Asimetría)
 * - Test E (Triaje de Alerta / 3 Criterios de Alarma)
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const SCENARIOS = [
  {
    id: "Test A (Administrativo)",
    query: "¿Puedo adelantar mi cita de control? No quiero esperar hasta el día 14",
    procedureSlug: "relleno-perfilado-labios-acido-hialuronico",
    recoveryDay: 3,
    expectedIntent: "scheduling",
    validate: (res) => {
      const issues = [];
      if (res.intent !== "scheduling") {
        issues.push(`Intención incorrecta: esperada 'scheduling', obtenida '${res.intent}'`);
      }
      if (!res.reply.includes("Día 14") && !res.reply.includes("dia 14")) {
        issues.push("No menciona la cita del Día 14");
      }
      if (!res.reply.includes("Mariana Gómez")) {
        issues.push("No menciona a la Dra. Mariana Gómez");
      }
      if (res.reply.includes("#### 🟢 Pautas recomendadas") || res.reply.includes("#### 🔴 Acciones a evitar")) {
        issues.push("FALLO REGLA ESTRICTA: Incluye bloques clínicos de 'Pautas recomendadas / Qué evitar'");
      }
      if (Array.isArray(res.recommendedDos) && res.recommendedDos.length > 0) {
        issues.push("FALLO REGLA ESTRICTA: recommendedDos no está vacío en respuesta de agendamiento");
      }
      if (!res.reply.includes("300") && !res.reply.includes("wa.me")) {
        issues.push("No contiene número o enlace directo de recepción médica");
      }
      return issues;
    },
  },
  {
    id: "Test B (Llamada / Handoff Humano)",
    query: "No me gusta este chat, prefiero que me llame una persona real de la clínica",
    procedureSlug: "relleno-perfilado-labios-acido-hialuronico",
    recoveryDay: 2,
    expectedIntent: "human_handoff",
    validate: (res) => {
      const issues = [];
      if (res.intent !== "human_handoff") {
        issues.push(`Intención incorrecta: esperada 'human_handoff', obtenida '${res.intent}'`);
      }
      if (res.reply.includes("#### 🟢 Pautas recomendadas") || res.reply.includes("#### 🔴 Acciones a evitar")) {
        issues.push("FALLO REGLA ESTRICTA: Suelta pautas clínicas ante solicitud de llamada telefónica");
      }
      if (!res.reply.includes("tel:") && !res.reply.includes("300 912 3456")) {
        issues.push("No ofrece enlace telefónico directo a recepción médica");
      }
      // Anti-biblias: debe ser breve y empática (menos de 600 caracteres)
      if (res.reply.length > 600) {
        issues.push(`Excesiva extensión: ${res.reply.length} caracteres (máx esperado 600)`);
      }
      return issues;
    },
  },
  {
    id: "Test C (Pregunta Concisa)",
    query: "¿Hoy me puedo maquillar?",
    procedureSlug: "relleno-facial-inmediato",
    recoveryDay: 1,
    expectedIntent: "clinical_query",
    validate: (res) => {
      const issues = [];
      if (res.intent !== "clinical_query") {
        issues.push(`Intención incorrecta: esperada 'clinical_query', obtenida '${res.intent}'`);
      }
      const lower = res.reply.toLowerCase();
      if (!lower.includes("punción") && !lower.includes("microorificios") && !lower.includes("sellado") && !lower.includes("48 horas")) {
        issues.push("Falta explicación médica sobre sellado dérmico / 48 horas");
      }
      if (!lower.includes("ojos") && !lower.includes("cejas") && !lower.includes("mirada")) {
        issues.push("Falta alternativa práctica positiva (maquillaje de ojos/cejas)");
      }
      if (res.reply.length > 1300) {
        issues.push(`Respuesta demasiado extensa (anti-biblia): ${res.reply.length} caracteres`);
      }
      return issues;
    },
  },
  {
    id: "Test D (Ansiedad Estética / Asimetría)",
    query: "Me veo un lado más hinchado que el otro, siento que me quedó torcido",
    procedureSlug: "relleno-perfilado-labios-acido-hialuronico",
    recoveryDay: 2,
    expectedIntent: "clinical_query",
    validate: (res) => {
      const issues = [];
      if (res.intent !== "clinical_query") {
        issues.push(`Intención incorrecta: esperada 'clinical_query', obtenida '${res.intent}'`);
      }
      const lower = res.reply.toLowerCase();
      if (!lower.includes("linfático") && !lower.includes("dormir") && !lower.includes("14 días") && !lower.includes("asimetr")) {
        issues.push("Falta explicación de drenaje linfático independiente o regla del Día 14");
      }
      if (res.reply.length > 1800) {
        issues.push(`Respuesta excede límite anti-biblia: ${res.reply.length} caracteres`);
      }
      return issues;
    },
  },
  {
    id: "Test E (Alarma 3 Criterios / Triaje)",
    query: "Siento la piel muy pálida y fría, ampollitas y me duele mucho",
    procedureSlug: "relleno-perfilado-labios-acido-hialuronico",
    recoveryDay: 2,
    expectedIntent: "alert_triage",
    validate: (res) => {
      const issues = [];
      if (!res.isEmergency) {
        issues.push("FALLO CRÍTICO: No marcó isEmergency = true para 3 criterios simultáneos");
      }
      if (res.urgencyLevel !== "emergency") {
        issues.push(`urgencyLevel incorrecto: '${res.urgencyLevel}'`);
      }
      if (!res.contactDoctorUrl || !res.contactDoctorUrl.includes("wa.me")) {
        issues.push("Falta URL directa de WhatsApp de atención médica prioritaria");
      }
      // Regla médica: PROHIBICIÓN de palabras fatalistas
      const lower = res.reply.toLowerCase();
      if (lower.includes("isquemia") || lower.includes("necrosis") || lower.includes("hemorragia")) {
        issues.push("FALLO DE SEGURIDAD: Uso de términos alarmistas prohibidos (isquemia/necrosis/hemorragia)");
      }
      return issues;
    },
  },
];

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🏥 AURATIPS CLINICAL ENGINE • BATERÍA DE PRUEBAS DE ESTRÉS CONVERSACIONAL");
  console.log(`📡 Conectando a: ${BASE_URL}/api/chat`);
  console.log("================================================================================\n");

  let passedTotal = 0;
  let failedTotal = 0;

  for (const scenario of SCENARIOS) {
    console.log(`\n────────────────────────────────────────────────────────────────────────────────`);
    console.log(`🧪 EJECUTANDO: ${scenario.id}`);
    console.log(`💬 Consulta del Paciente: "${scenario.query}"`);
    console.log(`📅 Día de Recuperación: ${scenario.recoveryDay}`);
    console.log(`────────────────────────────────────────────────────────────────────────────────`);

    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: scenario.query,
          procedureSlug: scenario.procedureSlug,
          recoveryDay: scenario.recoveryDay,
        }),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}: ${errorText}`);
        failedTotal++;
        continue;
      }

      const data = await response.json();
      const issues = scenario.validate(data);

      console.log(`⏱️ Latencia: ${elapsed}ms | Intención Detectada: [${data.intent || "sin intent"}] | Urgencia: ${data.urgencyLevel}`);
      console.log(`\n📄 RESPUESTA OBTENIDA:\n`);
      console.log(data.reply);
      console.log(`\n📊 Métricas: Longitud ${data.reply.length} caracteres | Dos: ${data.recommendedDos?.length ?? 0} | Donts: ${data.recommendedDonts?.length ?? 0}`);

      if (issues.length === 0) {
        console.log(`\n✅ RESULTADO: APROBADO (100% de criterios cumplidos)`);
        passedTotal++;
      } else {
        console.log(`\n❌ RESULTADO: FALLIDO`);
        for (const issue of issues) {
          console.log(`   ⚠️ ${issue}`);
        }
        failedTotal++;
      }
    } catch (err) {
      console.error(`💥 Error de ejecución en escenario:`, err.message);
      failedTotal++;
    }
  }

  console.log("\n================================================================================");
  console.log(`📋 RESUMEN FINAL DE QA:`);
  console.log(`   Superados: ${passedTotal} / ${SCENARIOS.length}`);
  console.log(`   Fallidos:  ${failedTotal} / ${SCENARIOS.length}`);
  console.log("================================================================================\n");

  if (failedTotal > 0) {
    process.exit(1);
  }
}

runTestSuite();
