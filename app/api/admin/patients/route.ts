import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClinicalRole } from "@/lib/auth-role";
import {
  DEFAULT_PROTOCOL_DURATION_DAYS,
  type HistoricalProcedureRecord,
  type PendingAuraMedDelegation,
} from "@/lib/patient-protocols";
import { emitAuraMedWebhook } from "@/lib/integration/webhook-emitter";

const SPECIALIST_EMAIL_KEYWORDS = ["especialista", "doctor", "mariana"];

function isSpecialistAuthUser(u: any, profileRole?: string): boolean {
  if (profileRole === "specialist" || profileRole === "admin") return true;
  const metaRole = u?.user_metadata?.role;
  if (metaRole === "specialist" || metaRole === "admin") return true;
  const emailLower = (u?.email || "").toLowerCase();
  return SPECIALIST_EMAIL_KEYWORDS.some((kw) => emailLower.includes(kw));
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    return NextResponse.json(
      { error: "Acceso exclusivo para especialistas de AuraMed." },
      { status: 403 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const [{ data: authUsersRes }, { data: profiles }, { data: courses }] =
      await Promise.all([
        adminClient.auth.admin.listUsers(),
        adminClient.from("profiles").select("id, display_name"),
        adminClient
          .from("courses")
          .select("id, title, slug, category, status, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false }),
      ]);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p.display_name])
    );

    const patients = (authUsersRes?.users || [])
      .filter((u) => !isSpecialistAuthUser(u))
      .map((u) => {
        const displayName =
          profileMap.get(u.id) ||
          u.user_metadata?.full_name ||
          u.user_metadata?.display_name ||
          (u.email ? u.email.split("@")[0] : "Paciente AuraMed");
        const phone = u.user_metadata?.phone || "+57 300 123 4567";
        const history: HistoricalProcedureRecord[] = Array.isArray(
          u.user_metadata?.procedure_history
        )
          ? u.user_metadata.procedure_history
          : [];
        const pendingDelegations: PendingAuraMedDelegation[] = Array.isArray(
          u.user_metadata?.pending_delegations
        )
          ? u.user_metadata.pending_delegations
          : [];

        return {
          id: u.id,
          external_id: u.user_metadata?.external_id || null,
          email: u.email || "",
          display_name: displayName,
          phone,
          history_count: history.length,
          pending_delegations: pendingDelegations,
        };
      })
      .sort((a, b) => a.display_name.localeCompare(b.display_name, "es"));

    return NextResponse.json({
      patients,
      protocols: courses || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "No se pudo consultar el directorio de pacientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    return NextResponse.json(
      { error: "Solo un especialista puede delegar protocolos clínicos." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      mode, // "existing" | "new"
      patientId,
      fullName,
      email,
      phone,
      password,
      courseId,
      expiresAfterDays = DEFAULT_PROTOCOL_DURATION_DAYS,
      notes = "",
    } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Selecciona el protocolo clínico a asignar." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Verificar que el protocolo existe
    const { data: course, error: courseErr } = await adminClient
      .from("courses")
      .select("id, title, slug, category, status")
      .eq("id", courseId)
      .single();

    if (courseErr || !course) {
      return NextResponse.json(
        { error: "El protocolo seleccionado no fue encontrado." },
        { status: 404 }
      );
    }

    let targetUserId = patientId as string | undefined;
    let targetEmail = (email || "").trim().toLowerCase();
    let targetName = (fullName || "").trim();
    let targetPhone = (phone || "+57 300 123 4567").trim();
    let credentialsPassword: string | null = password ? String(password) : null;
    let existingAuthUser: any = null;

    if (mode === "existing") {
      if (!targetUserId) {
        return NextResponse.json(
          { error: "Selecciona un paciente registrado de la lista." },
          { status: 400 }
        );
      }
      const { data: userLookup, error: lookupErr } =
        await adminClient.auth.admin.getUserById(targetUserId);
      if (lookupErr || !userLookup?.user) {
        return NextResponse.json(
          { error: "No se encontró el paciente seleccionado." },
          { status: 404 }
        );
      }
      existingAuthUser = userLookup.user;
      targetEmail = existingAuthUser.email || targetEmail;
      targetName =
        targetName ||
        existingAuthUser.user_metadata?.full_name ||
        existingAuthUser.user_metadata?.display_name ||
        targetEmail.split("@")[0];
      targetPhone =
        phone || existingAuthUser.user_metadata?.phone || "+57 300 123 4567";

      // Si el especialista definió una nueva contraseña opcional para el paciente existente
      if (credentialsPassword && credentialsPassword.length >= 6) {
        await adminClient.auth.admin.updateUserById(targetUserId, {
          password: credentialsPassword,
        });
      } else {
        credentialsPassword = null;
      }
    } else {
      // Modo "new": Crear paciente o reutilizar si el correo ya existe
      if (!targetEmail || !targetName) {
        return NextResponse.json(
          { error: "Ingresa el nombre completo y correo electrónico del paciente." },
          { status: 400 }
        );
      }

      const { data: allUsers } = await adminClient.auth.admin.listUsers();
      const foundByEmail = (allUsers?.users || []).find(
        (u) => (u.email || "").toLowerCase() === targetEmail
      );

      if (foundByEmail) {
        targetUserId = foundByEmail.id;
        existingAuthUser = foundByEmail;
        if (credentialsPassword && credentialsPassword.length >= 6) {
          await adminClient.auth.admin.updateUserById(targetUserId, {
            password: credentialsPassword,
          });
        }
      } else {
        const finalPassword =
          credentialsPassword && credentialsPassword.length >= 6
            ? credentialsPassword
            : "AuraMed2026!";
        credentialsPassword = finalPassword;

        const { data: createdAuth, error: createErr } =
          await adminClient.auth.admin.createUser({
            email: targetEmail,
            password: finalPassword,
            email_confirm: true,
            user_metadata: {
              full_name: targetName,
              display_name: targetName,
              phone: targetPhone,
              role: "patient",
              procedure_history: [],
            },
          });

        if (createErr || !createdAuth?.user) {
          return NextResponse.json(
            {
              error:
                createErr?.message ||
                "No se pudo crear la cuenta del paciente.",
            },
            { status: 400 }
          );
        }

        targetUserId = createdAuth.user.id;
        existingAuthUser = createdAuth.user;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "No se pudo identificar al paciente." },
        { status: 400 }
      );
    }

    // 2. Asegurar registro en public.profiles
    await adminClient.from("profiles").upsert(
      {
        id: targetUserId,
        display_name: targetName,
      },
      { onConflict: "id" }
    );

    const nowIso = new Date().toISOString();
    const durationDays = Math.max(
      1,
      Math.min(90, Number(expiresAfterDays) || DEFAULT_PROTOCOL_DURATION_DAYS)
    );

    // 3. Crear o renovar la asignación activa en public.enrollments
    await adminClient
      .from("enrollments")
      .delete()
      .eq("user_id", targetUserId)
      .eq("course_id", course.id);

    const { data: enrollmentRow, error: enrollErr } = await adminClient
      .from("enrollments")
      .insert({
        user_id: targetUserId,
        course_id: course.id,
        status: "active",
        enrolled_at: nowIso,
      })
      .select("id, enrolled_at")
      .single();

    if (enrollErr) {
      return NextResponse.json(
        { error: enrollErr.message || "Error al activar el protocolo." },
        { status: 400 }
      );
    }

    // 4. Registrar en user_metadata.procedure_history del paciente
    const currentHistory: HistoricalProcedureRecord[] = Array.isArray(
      existingAuthUser?.user_metadata?.procedure_history
    )
      ? existingAuthUser.user_metadata.procedure_history
      : [];

    const filteredHistory = currentHistory.filter(
      (item) => item.course_id !== course.id && item.slug !== course.slug
    );

    const newRecord: HistoricalProcedureRecord = {
      course_id: course.id,
      slug: course.slug,
      title: course.title,
      category: course.category || "Dermoestética",
      enrolled_at: nowIso,
      completed_at: null,
      expires_after_days: durationDays,
      status: "active",
      notes: notes ? String(notes).trim() : null,
    };

    const updatedHistory = [newRecord, ...filteredHistory];

    const currentPending: PendingAuraMedDelegation[] = Array.isArray(
      existingAuthUser?.user_metadata?.pending_delegations
    )
      ? existingAuthUser.user_metadata.pending_delegations
      : [];
    const remainingPending = currentPending.filter(
      (p) => p.course_id !== course.id && p.slug !== course.slug
    );

    await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...(existingAuthUser?.user_metadata || {}),
        full_name: targetName,
        display_name: targetName,
        phone: targetPhone,
        role: "patient",
        procedure_history: updatedHistory,
        pending_delegations: remainingPending,
      },
    });

    return NextResponse.json(
      {
        success: true,
        assignment: {
          enrollment_id: enrollmentRow?.id,
          patient_id: targetUserId,
          patient_name: targetName,
          patient_email: targetEmail,
          patient_phone: targetPhone,
          password: credentialsPassword,
          course_id: course.id,
          course_title: course.title,
          course_slug: course.slug,
          expires_after_days: durationDays,
          enrolled_at: nowIso,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error interno al delegar el protocolo." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    return NextResponse.json(
      { error: "Solo un especialista puede finalizar o retirar protocolos." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { enrollmentId, userId, courseId } = body;

    const adminClient = createAdminClient();

    // Localizar la inscripción antes de eliminarla para guardar el récord histórico
    let targetUserId = userId as string | undefined;
    let targetCourseId = courseId as string | undefined;
    let enrolledAtIso = new Date().toISOString();
    let courseMeta: any = null;

    if (enrollmentId) {
      const { data: existingEnr } = await adminClient
        .from("enrollments")
        .select(
          "id, user_id, course_id, enrolled_at, courses ( id, title, slug, category )"
        )
        .eq("id", enrollmentId)
        .maybeSingle();

      if (existingEnr) {
        targetUserId = existingEnr.user_id;
        targetCourseId = existingEnr.course_id;
        enrolledAtIso = existingEnr.enrolled_at;
        courseMeta = Array.isArray(existingEnr.courses)
          ? existingEnr.courses[0]
          : existingEnr.courses;
      }

      await adminClient.from("enrollments").delete().eq("id", enrollmentId);
    } else if (targetUserId && targetCourseId) {
      const { data: existingEnr } = await adminClient
        .from("enrollments")
        .select(
          "id, user_id, course_id, enrolled_at, courses ( id, title, slug, category )"
        )
        .eq("user_id", targetUserId)
        .eq("course_id", targetCourseId)
        .maybeSingle();

      if (existingEnr) {
        enrolledAtIso = existingEnr.enrolled_at;
        courseMeta = Array.isArray(existingEnr.courses)
          ? existingEnr.courses[0]
          : existingEnr.courses;
      }

      await adminClient
        .from("enrollments")
        .delete()
        .eq("user_id", targetUserId)
        .eq("course_id", targetCourseId);
    } else {
      return NextResponse.json(
        { error: "Identificador de asignación requerido." },
        { status: 400 }
      );
    }

    // Conservar el procedimiento en el récord histórico del paciente como 'completed'
    if (targetUserId) {
      const { data: userLookup } =
        await adminClient.auth.admin.getUserById(targetUserId);
      const authUser = userLookup?.user;
      if (authUser) {
        const currentHistory: HistoricalProcedureRecord[] = Array.isArray(
          authUser.user_metadata?.procedure_history
        )
          ? authUser.user_metadata.procedure_history
          : [];

        const nowIso = new Date().toISOString();
        let foundInHistory = false;
        let completedDurationDays = DEFAULT_PROTOCOL_DURATION_DAYS;

        const updatedHistory = currentHistory.map((item) => {
          if (
            (targetCourseId && item.course_id === targetCourseId) ||
            (courseMeta?.slug && item.slug === courseMeta.slug)
          ) {
            foundInHistory = true;
            completedDurationDays =
              item.expires_after_days || DEFAULT_PROTOCOL_DURATION_DAYS;
            return {
              ...item,
              status: "completed" as const,
              completed_at: nowIso,
            };
          }
          return item;
        });

        if (!foundInHistory && (targetCourseId || courseMeta)) {
          updatedHistory.unshift({
            course_id: targetCourseId || courseMeta?.id || "",
            slug: courseMeta?.slug || "",
            title: courseMeta?.title || "Procedimiento AuraMed",
            category: courseMeta?.category || "Dermoestética",
            enrolled_at: enrolledAtIso,
            completed_at: nowIso,
            expires_after_days: DEFAULT_PROTOCOL_DURATION_DAYS,
            status: "completed",
            notes: null,
          });
        }

        await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            ...authUser.user_metadata,
            procedure_history: updatedHistory,
          },
        });

        // Notificar al Sistema Madre de AuraMed que el especialista finalizó el protocolo
        void emitAuraMedWebhook({
          event: "patient.protocol_completed",
          timestamp: nowIso,
          patient: {
            id: targetUserId,
            external_id: authUser.user_metadata?.external_id || null,
            full_name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.display_name ||
              "Paciente AuraMed",
            email: authUser.email || "",
            phone: authUser.user_metadata?.phone || null,
          },
          procedure: {
            course_id: targetCourseId || courseMeta?.id || "",
            slug: courseMeta?.slug || "",
            title: courseMeta?.title || "Procedimiento AuraMed",
            category: courseMeta?.category || "Dermoestética",
            enrolled_at: enrolledAtIso,
            completed_at: nowIso,
            duration_days: completedDurationDays,
          },
          closure_reason: "closed_by_specialist",
          next_action_hint: "ready_for_followup_or_repurchase",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Protocolo finalizado para el paciente. El registro permanece en su historial clínico sin acceso al contenido del protocolo.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "No se pudo finalizar el protocolo." },
      { status: 500 }
    );
  }
}
