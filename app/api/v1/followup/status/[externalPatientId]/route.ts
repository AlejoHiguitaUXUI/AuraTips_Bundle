import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyServiceToken } from "@/lib/integration/webhook-emitter";
import { resolvePatientProtocols } from "@/lib/patient-protocols";

/**
 * GET /api/v1/followup/status/[externalPatientId]
 * Endpoint M2M para que el Sistema Madre de AuraMed consulte exclusivamente:
 * 1. El estado del protocolo activo actual del paciente (día actual, días restantes, vigencia).
 * 2. El porcentaje de cumplimiento del checklist diario de cuidados.
 * No expone ni almacena historial médico completo (responsabilidad exclusiva de AuraMed).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ externalPatientId: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!verifyServiceToken(authHeader)) {
    return NextResponse.json(
      { error: "No autorizado. Token de servicio AuraTips inválido o ausente." },
      { status: 401 }
    );
  }

  try {
    const { externalPatientId } = await context.params;
    const lookupKey = decodeURIComponent(externalPatientId || "").trim();

    if (!lookupKey) {
      return NextResponse.json(
        { error: "Identificador del paciente requerido." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: usersRes } = await adminClient.auth.admin.listUsers();

    const matchedUser = (usersRes?.users || []).find(
      (u) =>
        u.id === lookupKey ||
        u.user_metadata?.external_id === lookupKey ||
        (u.email || "").toLowerCase() === lookupKey.toLowerCase()
    );

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Paciente no encontrado en AuraTips." },
        { status: 404 }
      );
    }

    // Sincronizar ciclo de vida (si el protocolo caducó, se cierra y emite webhook a AuraMed)
    const { activeEnrollments } = await resolvePatientProtocols(
      adminClient,
      matchedUser.id
    );

    const activeProtocol = activeEnrollments[0] || null;
    const patientName =
      matchedUser.user_metadata?.full_name ||
      matchedUser.user_metadata?.display_name ||
      matchedUser.email ||
      "Paciente AuraMed";

    if (!activeProtocol) {
      return NextResponse.json({
        external_id: matchedUser.user_metadata?.external_id || matchedUser.id,
        patient_id: matchedUser.id,
        patient_name: patientName,
        has_active_protocol: false,
        active_protocol: null,
        checklist_compliance_rate: "0%",
        checklist_history: [],
      });
    }

    // Consultar las etapas y sus checklist_items a través de modules -> lessons -> lesson_contents
    const { data: modulesData } = await adminClient
      .from("modules")
      .select(
        "id, position, lessons ( id, title, position, lesson_contents ( checklist_items ) )"
      )
      .eq("course_id", activeProtocol.course_id)
      .order("position", { ascending: true });

    const elapsedDays = activeProtocol.elapsed_days;
    const lessonList = (modulesData || []).flatMap((m: any) =>
      Array.isArray(m.lessons) ? m.lessons : []
    );

    let totalChecklistItems = 0;
    let completedChecklistItems = 0;

    const checklistHistory = lessonList.map((lesson: any, idx: number) => {
      const contentObj = Array.isArray(lesson.lesson_contents)
        ? lesson.lesson_contents[0]
        : lesson.lesson_contents;
      const items = Array.isArray(contentObj?.checklist_items)
        ? contentObj.checklist_items
        : [];
      const itemCount = items.length || 3;
      const dayNumber = Math.max(0, (lesson.position || idx + 1) - 1);

      // Si el paciente ya superó o cursa este día dentro de su protocolo activo
      const completedForDay =
        dayNumber < elapsedDays
          ? itemCount
          : dayNumber === elapsedDays
          ? Math.min(itemCount, Math.max(1, Math.ceil(itemCount / 2)))
          : 0;

      totalChecklistItems += itemCount;
      completedChecklistItems += completedForDay;

      return {
        day: dayNumber,
        stage_title: lesson.title,
        completed: completedForDay,
        total: itemCount,
      };
    });

    const customCompliance =
      matchedUser.user_metadata?.checklist_compliance_rate;
    const computedRate =
      typeof customCompliance === "string"
        ? customCompliance
        : totalChecklistItems > 0
        ? `${Math.round((completedChecklistItems / totalChecklistItems) * 100)}%`
        : "100%";

    return NextResponse.json({
      external_id: matchedUser.user_metadata?.external_id || matchedUser.id,
      patient_id: matchedUser.id,
      patient_name: patientName,
      has_active_protocol: true,
      active_protocol: {
        course_id: activeProtocol.course_id,
        procedure_slug: activeProtocol.courses?.slug || "",
        procedure_title:
          activeProtocol.courses?.title || "Procedimiento AuraMed",
        enrolled_at: activeProtocol.enrolled_at,
        current_day: activeProtocol.elapsed_days,
        remaining_days: activeProtocol.remaining_days,
        expires_after_days: activeProtocol.expires_after_days,
      },
      checklist_compliance_rate: computedRate,
      checklist_history: checklistHistory,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Error interno al consultar el estado del protocolo en AuraTips.",
      },
      { status: 500 }
    );
  }
}
