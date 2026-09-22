import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";
import { EnrollButton } from "@/components/EnrollButton";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { getProcedureBySlug } from "@/lib/clinical-data";
import {
  ClockIcon,
  SyringeIcon,
  ShieldAlertIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Intentar cargar desde Supabase
  const { data: dbCourse } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, cover_url, status, owner_id, profiles ( display_name, bio, avatar_url )"
    )
    .eq("slug", slug)
    .maybeSingle();

  // 2. Si no está en Supabase, buscar en el dataset clínico local
  const clinicalProc = getProcedureBySlug(slug);

  if (!dbCourse && !clinicalProc) {
    notFound();
  }

  const isOwner = user?.id === dbCourse?.owner_id;

  // Unificamos datos del procedimiento
  const course = dbCourse
    ? {
        id: dbCourse.id,
        title: dbCourse.title,
        slug: dbCourse.slug,
        description: dbCourse.description,
        cover_url: dbCourse.cover_url || clinicalProc?.cover_url || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
        category: (dbCourse as any).category || clinicalProc?.category || "Inyectables",
        recovery_time: (dbCourse as any).recovery_time || clinicalProc?.recovery_time || "24 a 48 horas",
        pain_level: (dbCourse as any).pain_level ?? clinicalProc?.pain_level ?? 2,
        duration_minutes: (dbCourse as any).duration_minutes ?? clinicalProc?.duration_minutes ?? 45,
        results_duration: (dbCourse as any).results_duration || clinicalProc?.results_duration || "6 a 12 meses",
        anesthesia_type: (dbCourse as any).anesthesia_type || clinicalProc?.anesthesia_type || "Tópica",
        alarm_signs: (dbCourse as any).alarm_signs?.length ? (dbCourse as any).alarm_signs : clinicalProc?.alarm_signs || [],
        status: dbCourse.status,
        owner_id: dbCourse.owner_id,
        author: Array.isArray(dbCourse.profiles) ? dbCourse.profiles[0] : dbCourse.profiles,
      }
    : {
        id: clinicalProc!.id,
        title: clinicalProc!.title,
        slug: clinicalProc!.slug,
        description: clinicalProc!.description,
        cover_url: clinicalProc!.cover_url,
        category: clinicalProc!.category,
        recovery_time: clinicalProc!.recovery_time,
        pain_level: clinicalProc!.pain_level,
        duration_minutes: clinicalProc!.duration_minutes,
        results_duration: clinicalProc!.results_duration,
        anesthesia_type: clinicalProc!.anesthesia_type,
        alarm_signs: clinicalProc!.alarm_signs,
        status: "published",
        owner_id: "",
        author: {
          display_name: clinicalProc!.doctor_name,
          bio: clinicalProc!.doctor_specialty,
          avatar_url: null,
        },
      };

  // Módulos y lecciones (Fases de Recuperación)
  let modulesData: any[] = [];
  let ratingRow: any = null;
  let isEnrolled = false;
  let reviews: any[] = [];

  if (dbCourse) {
    const [{ data: mods }, { data: rRow }] = await Promise.all([
      supabase
        .from("modules")
        .select("id, title, position, lessons ( id, title, position, timeline_tag, care_type )")
        .eq("course_id", dbCourse.id)
        .order("position", { ascending: true }),
      supabase
        .from("course_ratings")
        .select("avg_rating, review_count")
        .eq("course_id", dbCourse.id)
        .maybeSingle(),
    ]);

    modulesData = mods || [];
    ratingRow = rRow;

    if (user && !isOwner) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", dbCourse.id)
        .eq("user_id", user.id)
        .maybeSingle();
      isEnrolled = !!enrollment;
    }

    const { data: revs } = await supabase
      .from("reviews")
      .select("id, user_id, rating, body, created_at, profiles ( display_name )")
      .eq("course_id", dbCourse.id)
      .order("created_at", { ascending: false });

    reviews = revs || [];
  } else if (clinicalProc) {
    modulesData = clinicalProc.modules.map((m) => ({
      id: m.id,
      title: m.title,
      position: m.position,
      timeline_tag: m.timeline_tag,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        position: 1,
        timeline_tag: l.timeline_tag,
        care_type: l.care_type,
      })),
    }));
    isEnrolled = true; // Permite acceso libre a los protocolos de ejemplo
  }

  const myReview = user
    ? reviews.find((r) => r.user_id === user.id) ?? null
    : null;

  return (
    <article className="animate-fade-in" style={{ maxWidth: "980px", margin: "0 auto", paddingBottom: "64px" }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "16px", fontSize: "14px" }}>
        <Link href="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          ← Volver a Procedimientos
        </Link>
        <span style={{ margin: "0 8px", color: "var(--color-muted)" }}>/</span>
        <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>{course.category}</span>
      </nav>

      {/* Hero Portada del Procedimiento con Frosted Glass Foreground */}
      {course.cover_url && (
        <div className="procedure-hero-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.cover_url}
            alt={course.title}
            className="procedure-hero-img"
          />
          <div className="procedure-hero-backdrop" aria-hidden="true" />
          <div className="procedure-hero-card animate-slide-up">
            <span className="category-pill-gold">
              <span>✦</span> {course.category}
            </span>
            <h1>{course.title}</h1>
            <p>
              Supervisado por <strong>{course.author?.display_name || "Comité Médico Estético"}</strong>
              {course.author?.bio ? ` — ${course.author.bio}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Ribbon de Métricas Clínicas */}
      <div className="clinical-detail-ribbon">
        <div className="ribbon-cell">
          <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ClockIcon size={13} color="var(--color-muted)" />
            <span>Tiempo de Recuperación</span>
          </span>
          <span className="val">{course.recovery_time}</span>
        </div>
        <div className="ribbon-cell">
          <span className="lbl">Nivel de Molestia</span>
          <span className="val">
            {"●".repeat(course.pain_level)}{"○".repeat(5 - course.pain_level)} ({course.pain_level}/5)
          </span>
        </div>
        <div className="ribbon-cell">
          <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ClockIcon size={13} color="var(--color-muted)" />
            <span>Duración de Resultados</span>
          </span>
          <span className="val">{course.results_duration}</span>
        </div>
        <div className="ribbon-cell">
          <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <SyringeIcon size={13} color="var(--color-muted)" />
            <span>Tipo de Anestesia</span>
          </span>
          <span className="val">{course.anesthesia_type}</span>
        </div>
      </div>

      {/* Descripción Clínica */}
      {course.description && (
        <section style={{ marginBottom: "32px", lineHeight: 1.7, fontSize: "1.05rem", color: "var(--color-text-2)" }}>
          <p>{course.description}</p>
        </section>
      )}

      {/* Box de Signos de Alarma / Cuándo acudir a urgencias */}
      {course.alarm_signs && course.alarm_signs.length > 0 && (
        <section className="alarm-callout" aria-labelledby="alarm-heading">
          <div className="alarm-callout-header">
            <ShieldAlertIcon size={20} color="var(--color-error)" />
            <h2 id="alarm-heading" style={{ fontSize: "16px", margin: 0, color: "var(--color-error)" }}>
              Signos de Alarma — Cuándo contactar a tu médico de inmediato
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-2)", marginBottom: "8px" }}>
            Si experimentas alguno de estos síntomas en las primeras horas o días, comunícate inmediatamente con la clínica o tu especialista tratante:
          </p>
          <ul>
            {course.alarm_signs.map((sign: string, idx: number) => (
              <li key={idx}><strong>{sign}</strong></li>
            ))}
          </ul>
        </section>
      )}

      {/* Botón de Inscripción / Seguimiento del Paciente */}
      {dbCourse && (
        <div style={{ marginBottom: "32px", padding: "16px 20px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>¿Te realizaste o vas a realizarte este procedimiento?</h3>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: "4px 0 0" }}>
              Activa la guía interactiva para guardar tu progreso, checklist diario y recordatorios de medicación.
            </p>
          </div>
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            isSignedIn={!!user}
            isOwner={isOwner}
            isEnrolled={isEnrolled}
          />
        </div>
      )}

      {/* Línea de Tiempo de Recuperación & Protocolos */}
      <section aria-labelledby="timeline-heading" style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "rgba(32, 80, 59, 0.08)",
              color: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 id="timeline-heading" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
              Línea de Tiempo & Fases de Cuidados
            </h2>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: "2px 0 0" }}>
              Haz clic en cada pauta para abrir el protocolo completo, semáforo de qué hacer y lista de verificación.
            </p>
          </div>
        </div>

        {modulesData.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>Pronto publicaremos los protocolos de este tratamiento.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {modulesData.map((m: any, idx: number) => (
              <div key={m.id || idx} className="recovery-stage-card">
                <div className="stage-header">
                  <span className="stage-title">Fase {idx + 1}: {m.title}</span>
                  {m.timeline_tag && <span className="stage-tag">{m.timeline_tag}</span>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(m.lessons ?? [])
                    .slice()
                    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                    .map((l: any) => (
                      <Link
                        key={l.id}
                        href={`/courses/${course.slug}/lessons/${l.id}`}
                        className="stage-lesson-link"
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ClipboardCheckIcon size={15} color="var(--color-brand)" />
                          <span>{l.title}</span>
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--color-brand)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>Ver Pauta y Checklist</span>
                          <ArrowRightIcon size={12} />
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonios y Experiencias de Pacientes */}
      <section style={{ borderTop: "1px solid var(--color-border)", paddingTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Experiencias de Pacientes</h2>
          {ratingRow && (
            <RatingBadge
              avgRating={ratingRow.avg_rating ?? null}
              reviewCount={ratingRow.review_count ?? 0}
            />
          )}
        </div>

        {user && isEnrolled && dbCourse && (
          <ReviewForm courseId={course.id} existingReview={myReview} />
        )}
        <ReviewList reviews={reviews} />
      </section>
    </article>
  );
}

