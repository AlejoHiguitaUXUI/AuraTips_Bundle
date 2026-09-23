import { NextResponse } from "next/server";
import { checkClinicalGuardrails } from "@/lib/rag/guardrails";
import { retrieveClinicalContext } from "@/lib/rag/retriever";
import { generateClinicalResponse } from "@/lib/rag/clinical-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, procedureSlug, recoveryDay, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "El mensaje de consulta es obligatorio." },
        { status: 400 }
      );
    }

    // 1. Triage médico de seguridad y detección de urgencias
    const guardrailResult = checkClinicalGuardrails(message);

    // 2. Recuperación semántica de protocolos y pautas clínicas
    let context = await retrieveClinicalContext(
      message,
      procedureSlug || "toxina-botulinica-botox-facial",
      typeof recoveryDay === "number" ? recoveryDay : 2
    );

    if (!context) {
      context = await retrieveClinicalContext(
        message,
        "toxina-botulinica-botox-facial",
        typeof recoveryDay === "number" ? recoveryDay : 2
      );
    }

    // 3. Generación de respuesta médica estructurada con Few-Shot y memoria
    const response = generateClinicalResponse(
      message,
      context!,
      guardrailResult,
      typeof recoveryDay === "number" ? recoveryDay : 2,
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
