import type { SupabaseClient } from "@supabase/supabase-js";
import { emitAuraMedWebhook } from "@/lib/integration/webhook-emitter";

export const DEFAULT_PROTOCOL_DURATION_DAYS = 14;

export interface PendingAuraMedDelegation {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  category: string;
  notified_at: string;
  doctor_name?: string | null;
  clinic_location?: string | null;
  notes?: string | null;
}

export interface HistoricalProcedureRecord {
  course_id: string;
  slug: string;
  title: string;
  category: string;
  enrolled_at: string;
  completed_at?: string | null;
  expires_after_days: number;
  status: "active" | "completed";
  notes?: string | null;
}

export interface ActiveEnrollmentWithLifecycle {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  elapsed_days: number;
  remaining_days: number;
  expires_after_days: number;
  is_expired: boolean;
  courses: {
    id: string;
    title: string;
    slug: string;
    cover_url?: string | null;
    category?: string | null;
    recovery_time?: string | null;
    pain_level?: number | null;
    anesthesia_type?: string | null;
    status?: string;
  } | null;
}

/**
 * Calcula los días transcurridos desde la asignación del protocolo.
 */
export function calculateElapsedDays(enrolledAtIso: string): number {
  const enrolledTime = new Date(enrolledAtIso).getTime();
  if (Number.isNaN(enrolledTime)) return 0;
  const diffMs = Math.max(0, Date.now() - enrolledTime);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determina si un protocolo fue creado en las últimas 24 horas para señalizarlo como "Nuevo".
 */
export function isRecentlyCreatedProtocol(createdAtIso?: string | null): boolean {
  if (!createdAtIso) return false;
  const createdTime = new Date(createdAtIso).getTime();
  if (Number.isNaN(createdTime)) return false;
  const hours24Ms = 24 * 60 * 60 * 1000;
  return Date.now() - createdTime <= hours24Ms;
}

/**
 * Sincroniza las asignaciones activas de un paciente contra su ciclo de vigencia.
 * - Si un protocolo superó sus días de vigencia (`expires_after_days`, por defecto 14 días),
 *   se retira de `enrollments` (revocando el acceso al contenido propietario del protocolo)
 *   y se conserva en `user_metadata.procedure_history` como procedimiento finalizado en el récord del paciente.
 */
export async function resolvePatientProtocols(
  adminClient: SupabaseClient,
  userId: string
): Promise<{
  activeEnrollments: ActiveEnrollmentWithLifecycle[];
  completedHistory: HistoricalProcedureRecord[];
}> {
  // 1. Obtener usuario de Auth para leer su historial en user_metadata
  const { data: userRes } = await adminClient.auth.admin.getUserById(userId);
  const authUser = userRes?.user;
  const rawHistory: HistoricalProcedureRecord[] = Array.isArray(
    authUser?.user_metadata?.procedure_history
  )
    ? authUser.user_metadata.procedure_history
    : [];

  // 2. Obtener inscripciones activas en la tabla enrollments
  const { data: dbEnrollments } = await adminClient
    .from("enrollments")
    .select(
      "id, user_id, course_id, status, enrolled_at, courses ( id, title, slug, cover_url, category, recovery_time, pain_level, anesthesia_type, status )"
    )
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  const enrollmentsList = dbEnrollments ?? [];
  const activeEnrollments: ActiveEnrollmentWithLifecycle[] = [];
  const expiredEnrollmentIds: string[] = [];
  let historyUpdated = false;
  const historyMap = new Map<string, HistoricalProcedureRecord>();

  for (const item of rawHistory) {
    if (item && (item.course_id || item.slug)) {
      const key = item.course_id || item.slug;
      historyMap.set(key, {
        ...item,
        expires_after_days: item.expires_after_days || DEFAULT_PROTOCOL_DURATION_DAYS,
      });
    }
  }

  for (const enr of enrollmentsList) {
    const courseObj = Array.isArray(enr.courses) ? enr.courses[0] : enr.courses;
    const courseId = enr.course_id || courseObj?.id || "";
    const slug = courseObj?.slug || "";
    const title = courseObj?.title || "Procedimiento AuraMed";
    const category = courseObj?.category || "Dermoestética";

    const existingRecord =
      historyMap.get(courseId) || (slug ? historyMap.get(slug) : undefined);
    const expiresAfterDays =
      existingRecord?.expires_after_days || DEFAULT_PROTOCOL_DURATION_DAYS;

    const elapsedDays = calculateElapsedDays(enr.enrolled_at);
    const isExpired = elapsedDays > expiresAfterDays;

    if (isExpired) {
      const completedAtIso =
        existingRecord?.completed_at || new Date().toISOString();
      expiredEnrollmentIds.push(enr.id);
      historyMap.set(courseId || slug, {
        course_id: courseId,
        slug,
        title,
        category,
        enrolled_at: enr.enrolled_at,
        completed_at: completedAtIso,
        expires_after_days: expiresAfterDays,
        status: "completed",
        notes: existingRecord?.notes ?? null,
      });
      historyUpdated = true;

      // Notificar al Sistema Madre de AuraMed que el protocolo caducó y el tratamiento cerró
      void emitAuraMedWebhook({
        event: "patient.protocol_completed",
        timestamp: completedAtIso,
        patient: {
          id: userId,
          external_id: authUser?.user_metadata?.external_id || null,
          full_name:
            authUser?.user_metadata?.full_name ||
            authUser?.user_metadata?.display_name ||
            "Paciente AuraMed",
          email: authUser?.email || "",
          phone: authUser?.user_metadata?.phone || null,
        },
        procedure: {
          course_id: courseId,
          slug,
          title,
          category,
          enrolled_at: enr.enrolled_at,
          completed_at: completedAtIso,
          duration_days: expiresAfterDays,
        },
        closure_reason: "expired_automatically",
        next_action_hint: "ready_for_followup_or_repurchase",
      });
    } else {
      activeEnrollments.push({
        id: enr.id,
        user_id: enr.user_id,
        course_id: courseId,
        status: enr.status,
        enrolled_at: enr.enrolled_at,
        elapsed_days: elapsedDays,
        remaining_days: Math.max(0, expiresAfterDays - elapsedDays),
        expires_after_days: expiresAfterDays,
        is_expired: false,
        courses: courseObj ?? null,
      });

      if (!existingRecord || existingRecord.status !== "active") {
        historyMap.set(courseId || slug, {
          course_id: courseId,
          slug,
          title,
          category,
          enrolled_at: enr.enrolled_at,
          completed_at: null,
          expires_after_days: expiresAfterDays,
          status: "active",
          notes: existingRecord?.notes ?? null,
        });
        historyUpdated = true;
      }
    }
  }

  // 3. Si hubo protocolos que caducaron automáticamente por días, removerlos de enrollments
  if (expiredEnrollmentIds.length > 0) {
    await adminClient
      .from("enrollments")
      .delete()
      .in("id", expiredEnrollmentIds);
  }

  // 4. Asegurar que cualquier registro en historyMap que ya no esté en activeEnrollments figure como 'completed'
  const activeCourseIds = new Set(activeEnrollments.map((a) => a.course_id));
  const activeSlugs = new Set(
    activeEnrollments.map((a) => a.courses?.slug).filter(Boolean)
  );

  for (const [key, rec] of historyMap.entries()) {
    const isStillActive =
      (rec.course_id && activeCourseIds.has(rec.course_id)) ||
      (rec.slug && activeSlugs.has(rec.slug));
    if (!isStillActive && rec.status === "active") {
      historyMap.set(key, {
        ...rec,
        status: "completed",
        completed_at: rec.completed_at || new Date().toISOString(),
      });
      historyUpdated = true;
    }
  }

  const allHistory = Array.from(historyMap.values()).sort(
    (a, b) =>
      new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
  );

  if (historyUpdated && authUser) {
    try {
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...authUser.user_metadata,
          procedure_history: allHistory,
        },
      });
    } catch (e) {
      console.warn("Could not persist updated procedure_history:", e);
    }
  }

  const completedHistory = allHistory.filter((h) => h.status === "completed");

  return {
    activeEnrollments,
    completedHistory,
  };
}
