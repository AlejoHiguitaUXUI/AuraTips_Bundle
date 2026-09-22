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
    const context = await retrieveClinicalContext(
      message,
      procedureSlug,
      typeof recoveryDay === "number" ? recoveryDay : 2
    );

    if (!context) {
      return NextResponse.json(
        { error: "No se pudo recuperar el contexto clínico para la consulta." },
        { status: 500 }
      );
    }

    // 3. Generación de respuesta médica estructurada con Few-Shot y memoria
    const response = generateClinicalResponse(
      message,
      context,
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
    return NextResponse.json(
      { error: error?.message || "Error interno procesando la consulta clínica." },
      { status: 500 }
    );
  }
}
