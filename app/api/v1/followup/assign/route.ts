import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyServiceToken } from "@/lib/integration/webhook-emitter";
import {
  DEFAULT_PROTOCOL_DURATION_DAYS,
  type HistoricalProcedureRecord,
  type PendingAuraMedDelegation,
} from "@/lib/patient-protocols";

/**
 * POST /api/v1/followup/assign
 * Endpoint M2M para que el Sistema Madre de AuraMed / AuraLead notifique que un paciente
 * finalizó un procedimiento estético en consultorio y quede listo para la delegación
 * del protocolo de cuidados por parte del especialista en AuraTips (o se active si auto_activate = true).
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!verifyServiceToken(authHeader)) {
    return NextResponse.json(
      { error: "No autorizado. Token de servicio AuraTips inválido o ausente." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      patient,
      procedure,
      auto_activate = false,
      expires_after_days = DEFAULT_PROTOCOL_DURATION_DAYS,
    } = body;

    if (!patient || !patient.email || !patient.full_name) {
      return NextResponse.json(
        {
          error:
            "Los datos del paciente (full_name y email) son obligatorios para registrar la notificación.",
        },
        { status: 400 }
      );
    }

    if (!procedure || (!procedure.slug && !procedure.course_id)) {
      return NextResponse.json(
        {
          error:
            "Se requiere especificar el procedimiento realizado (procedure.slug o procedure.course_id).",
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Buscar el protocolo correspondiente en AuraTips
    let courseQuery = adminClient
      .from("courses")
      .select("id, title, slug, category, status");

    if (procedure.course_id) {
      courseQuery = courseQuery.eq("id", procedure.course_id);
    } else {
      courseQuery = courseQuery.eq("slug", procedure.slug);
    }

    const { data: course, error: courseErr } = await courseQuery.maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json(
        {
          error: `El protocolo '${procedure.slug || procedure.course_id}' no existe en el catálogo de AuraTips.`,
        },
        { status: 404 }
      );
    }

    // 2. Localizar o crear al paciente en Supabase Auth
    const targetEmail = String(patient.email).trim().toLowerCase();
    const targetName = String(patient.full_name).trim();
    const targetPhone = patient.phone
      ? String(patient.phone).trim()
      : "+57 300 123 4567";
    const externalId = patient.external_id
      ? String(patient.external_id).trim()
      : null;

    const { data: usersRes } = await adminClient.auth.admin.listUsers();
    const existingUser = (usersRes?.users || []).find(
      (u) =>
        (u.email || "").toLowerCase() === targetEmail ||
        (externalId && u.user_metadata?.external_id === externalId)
    );

    let patientUserId: string;
    let existingMeta: Record<string, any> = {};

    if (existingUser) {
      patientUserId = existingUser.id;
      existingMeta = existingUser.user_metadata || {};
    } else {
      const defaultPassword =
        patient.password && String(patient.password).length >= 6
          ? String(patient.password)
          : "AuraMed2026!";

      const { data: createdAuth, error: createErr } =
        await adminClient.auth.admin.createUser({
          email: targetEmail,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            external_id: externalId,
            full_name: targetName,
            display_name: targetName,
            phone: targetPhone,
            role: "patient",
            procedure_history: [],
            pending_delegations: [],
          },
        });

      if (createErr || !createdAuth?.user) {
        return NextResponse.json(
          {
            error:
              createErr?.message ||
              "No fue posible registrar al paciente proveniente de AuraMed.",
          },
          { status: 400 }
        );
      }

      patientUserId = createdAuth.user.id;
      existingMeta = createdAuth.user.user_metadata || {};
    }

    await adminClient.from("profiles").upsert(
      {
        id: patientUserId,
        display_name: targetName,
      },
      { onConflict: "id" }
    );

    const nowIso = procedure.application_date || new Date().toISOString();
    const durationDays = Math.max(
      1,
      Math.min(90, Number(expires_after_days) || DEFAULT_PROTOCOL_DURATION_DAYS)
    );

    const currentPending: PendingAuraMedDelegation[] = Array.isArray(
      existingMeta.pending_delegations
    )
      ? existingMeta.pending_delegations
      : [];

    const currentHistory: HistoricalProcedureRecord[] = Array.isArray(
      existingMeta.procedure_history
    )
      ? existingMeta.procedure_history
      : [];

    let followupStatus: "pending_specialist_delegation" | "active" =
      "pending_specialist_delegation";
    let enrollmentId: string | null = null;

    if (auto_activate) {
      // Activación directa si el Sistema Madre lo solicita explícitamente
      await adminClient
        .from("enrollments")
        .delete()
        .eq("user_id", patientUserId)
        .eq("course_id", course.id);

      const { data: enrRow, error: enrErr } = await adminClient
        .from("enrollments")
        .insert({
          user_id: patientUserId,
          course_id: course.id,
          status: "active",
          enrolled_at: nowIso,
        })
        .select("id")
        .single();

      if (enrErr) {
        return NextResponse.json(
          { error: enrErr.message || "Error al activar el protocolo." },
          { status: 400 }
        );
      }

      enrollmentId = enrRow?.id || null;
      followupStatus = "active";

      const filteredHistory = currentHistory.filter(
        (h) => h.course_id !== course.id && h.slug !== course.slug
      );

      const newHistoryRecord: HistoricalProcedureRecord = {
        course_id: course.id,
        slug: course.slug,
        title: course.title,
        category: course.category || "Dermoestética",
        enrolled_at: nowIso,
        completed_at: null,
        expires_after_days: durationDays,
        status: "active",
        notes: procedure.treatment_notes || null,
      };

      const remainingPending = currentPending.filter(
        (p) => p.course_id !== course.id && p.slug !== course.slug
      );

      await adminClient.auth.admin.updateUserById(patientUserId, {
        user_metadata: {
          ...existingMeta,
          external_id: externalId || existingMeta.external_id || null,
          full_name: targetName,
          display_name: targetName,
          phone: targetPhone,
          role: "patient",
          procedure_history: [newHistoryRecord, ...filteredHistory],
          pending_delegations: remainingPending,
        },
      });
    } else {
      // Flujo por defecto (Caso A): registrar la notificación para que el especialista en AuraTips delegue el protocolo
      const filteredPending = currentPending.filter(
        (p) => p.course_id !== course.id && p.slug !== course.slug
      );

      const pendingNotification: PendingAuraMedDelegation = {
        id: `del_${Date.now()}`,
        course_id: course.id,
        slug: course.slug,
        title: course.title,
        category: course.category || "Dermoestética",
        notified_at: nowIso,
        doctor_name: procedure.doctor_name || "Especialista AuraMed",
        clinic_location: procedure.clinic_location || "AuraMed",
        notes: procedure.treatment_notes || null,
      };

      await adminClient.auth.admin.updateUserById(patientUserId, {
        user_metadata: {
          ...existingMeta,
          external_id: externalId || existingMeta.external_id || null,
          full_name: targetName,
          display_name: targetName,
          phone: targetPhone,
          role: "patient",
          pending_delegations: [pendingNotification, ...filteredPending],
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        followup_id: enrollmentId || `not_${patientUserId.slice(0, 8)}`,
        patient_id: patientUserId,
        external_id: externalId,
        procedure_slug: course.slug,
        procedure_title: course.title,
        status: followupStatus,
        expires_after_days: durationDays,
        message:
          followupStatus === "active"
            ? "Protocolo activado directamente para el paciente en AuraTips."
            : "Notificación de procedimiento recibida desde AuraMed. Lista para delegación por el especialista en AuraTips.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Error interno al procesar la notificación desde AuraMed.",
      },
      { status: 500 }
    );
  }
}
