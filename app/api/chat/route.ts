import { NextResponse } from "next/server";
import { checkClinicalGuardrails } from "@/lib/rag/guardrails";
import { retrieveClinicalContext } from "@/lib/rag/retriever";
import { generateClinicalResponse } from "@/lib/rag/clinical-engine";
import { emitAuraMedWebhook } from "@/lib/integration/webhook-emitter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, procedureSlug, recoveryDay, history, patient } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "El mensaje de consulta es obligatorio." },
        { status: 400 }
      );
    }

    const effectiveSlug = procedureSlug || "toxina-botulinica-botox-facial";
    const effectiveDay = typeof recoveryDay === "number" ? recoveryDay : 2;

    // 1. Triage médico de seguridad y detección de urgencias
    const guardrailResult = checkClinicalGuardrails(message);

    // Si se detecta señal de alarma crítica, emitir webhook inmediato hacia el Sistema Madre de AuraMed
    if (guardrailResult.isEmergency) {
      void emitAuraMedWebhook({
        event: "patient.emergency_alert_triggered",
        timestamp: new Date().toISOString(),
        patient: patient
          ? {
              external_id: patient.external_id || null,
              full_name: patient.full_name || "Paciente AuraMed",
              phone: patient.phone || null,
            }
          : undefined,
        procedure_slug: effectiveSlug,
        recovery_day: effectiveDay,
        urgency_level:
          guardrailResult.urgencyLevel || "CRITICAL_SYMPTOM_DETECTED",
        matched_categories: guardrailResult.matchedCriteria || [],
        user_message: message.trim(),
        automated_actions_taken: [
          "Instrucción inmediata de reposo y no manipulación emitida al paciente",
          "Canal directo de WhatsApp prioritario hacia AuraMed presentado en el chat",
          "Webhook de alerta crítica transmitido al Sistema Madre de AuraMed",
        ],
      });
    }

    // 2. Recuperación semántica de protocolos y pautas clínicas
    let context = await retrieveClinicalContext(
      message,
      effectiveSlug,
      effectiveDay
    );

    if (!context) {
      context = await retrieveClinicalContext(
        message,
        "toxina-botulinica-botox-facial",
        effectiveDay
      );
    }

    // 3. Generación de respuesta médica estructurada con Few-Shot y memoria
    const response = generateClinicalResponse(
      message,
      context!,
      guardrailResult,
      effectiveDay,
      Array.isArray(history) ? history : undefined
    );

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({
      success: true,
      reply: "He recibido tu consulta. En este momento se presentó una intermitencia técnica en la consulta de protocolos en línea, pero tu seguridad es lo más importante: si presentas dolor intenso o signos inusuales, comunícate de inmediato con la especialista.",
      isEmergency: false,
      recommendedDos: ["Mantener reposo relativo", "Aplicar compresas frías si hay molestia leve", "Contactar a la especialista"],
      recommendedDonts: ["No frotar ni masajear la zona tratada", "No realizar ejercicio de alto impacto"],
      contactDoctorUrl: "https://wa.me/573001234567?text=URGENCIA%20MEDICA%20-%20Hola%20doctora,%20tengo%20una%20consulta%20urgente%20desde%20AuraTips",
    });
  }
}
