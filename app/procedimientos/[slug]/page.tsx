import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClinicalRole } from "@/lib/auth-role";
import { RatingBadge } from "@/components/RatingBadge";
import { EnrollButton } from "@/components/EnrollButton";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { CLINICAL_PROCEDURES } from "@/lib/clinical-data";
import {
  ClockIcon,
  SyringeIcon,
  ShieldAlertIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  ActivityIcon,
} from "@/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>;
};

interface UnifiedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  recovery_time: string;
  pain_level: number;
  duration_minutes: number;
  results_duration: string;
  anesthesia_type: string;
  alarm_signs: string[];
  status: string;
  owner_id: string;
  author: {
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
  } | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchCourse(slugOrId: string): Promise<{
  dbCourse: any | null;
  clinicalProc: (typeof CLINICAL_PROCEDURES)[number] | null;
  user: any | null;
  isOwner: boolean;
  isSpecialist: boolean;
  modulesData: any[];
  ratingRow: any | null;
  isEnrolled: boolean;
  reviews: any[];
}> {
  let user: any = null;
  let dbCourse: any = null;
  let isSpecialist = false;
  const isUUID = UUID_REGEX.test(slugOrId);

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user ?? null;

    if (user) {
      const roleInfo = await getClinicalRole(supabase, user);
      isSpecialist = roleInfo.isSpecialist;
    }

    const selectQuery =
      "id, title, slug, description, cover_url, status, owner_id, category, recovery_time, pain_level, duration_minutes, results_duration, anesthesia_type, alarm_signs, profiles ( display_name, bio, avatar_url )";

    if (isUUID) {
      const { data } = await supabase
        .from("courses")
        .select(selectQuery)
        .eq("id", slugOrId)
        .maybeSingle();
      dbCourse = data;
    } else {
      const { data } = await supabase
        .from("courses")
        .select(selectQuery)
        .eq("slug", slugOrId)
        .maybeSingle();
      dbCourse = data;

      if (!dbCourse) {
        const { data: byId } = await supabase
          .from("courses")
          .select(selectQuery)
          .eq("id", slugOrId)
          .maybeSingle();
        dbCourse = byId;
      }
    }
  } catch (err) {
    console.warn("[courses/[slug]] Supabase offline, using local data:", err);
  }

  const clinicalProc = isUUID
    ? (CLINICAL_PROCEDURES.find((p) => p.id === slugOrId) ??
       CLINICAL_PROCEDURES.find((p) => p.slug === slugOrId) ??
       null)
    : (CLINICAL_PROCEDURES.find((p) => p.slug === slugOrId) ??
       CLINICAL_PROCEDURES.find((p) => p.id === slugOrId) ??
       null);

  let modulesData: any[] = [];
  let ratingRow: any = null;
  let isEnrolled = false;
  let reviews: any[] = [];
  const isOwner = user?.id === dbCourse?.owner_id;

  if (dbCourse) {
    try {
      const supabase = await createClient();
      const [{ data: mods }, { data: rRow }] = await Promise.all([
        supabase
          .from("modules")
          .select(
            "id, title, position, lessons ( id, title, position, timeline_tag, care_type )"
          )
          .eq("course_id", dbCourse.id)
          .order("position", { ascending: true }),
        supabase
          .from("course_ratings")
          .select("avg_rating, review_count")
          .eq("course_id", dbCourse.id)
          .maybeSingle(),
      ]);

      modulesData = mods ?? [];
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
        .select(
          "id, user_id, rating, body, created_at, profiles ( display_name )"
        )
        .eq("course_id", dbCourse.id)
        .order("created_at", { ascending: false });

      reviews = revs ?? [];
    } catch (e) {
      console.warn("[courses/[slug]] Failed to fetch modules:", e);
    }
  }

  if (modulesData.length === 0 && clinicalProc) {
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
  }

  return {
    dbCourse,
    clinicalProc,
    user,
    isOwner,
    isSpecialist,
    modulesData,
    ratingRow,
    isEnrolled,
    reviews,
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugOrId } = await params;
  const isUUID = UUID_REGEX.test(slugOrId);

  try {
    const supabase = await createClient();
    const selectQuery = "title, description, cover_url, slug";

    let data: any = null;
    if (isUUID) {
      const { data: res } = await supabase
        .from("courses")
        .select(selectQuery)
        .eq("id", slugOrId)
        .maybeSingle();
      data = res;
    } else {
      const { data: res } = await supabase
        .from("courses")
        .select(selectQuery)
        .eq("slug", slugOrId)
        .maybeSingle();
      data = res;
      if (!data) {
        const { data: byId } = await supabase
          .from("courses")
          .select(selectQuery)
          .eq("id", slugOrId)
          .maybeSingle();
        data = byId;
      }
    }

    if (data) {
      const FALLBACK_DESC =
        "Protocolo clínico de recuperación post-procedimiento estético guiado por la Dra. Mariana Gómez en AuraTips.";
      const rawDesc = data.description?.slice(0, 160) ?? "";
      // S3: garantizar descripción de mínimo 50 caracteres para SEO
      const description = rawDesc.length >= 50 ? rawDesc : FALLBACK_DESC;

      return {
        title: data.title,
        description,
        openGraph: {
          title: `${data.title} · AuraTips`,
          description,
          images: data.cover_url
            ? [{ url: data.cover_url, width: 1200, height: 630 }]
            : [{ url: "/og/default.png", width: 1200, height: 630 }],
        },
        alternates: {
          canonical: `/procedimientos/${data.slug}`,
        },
      };
    }
  } catch {
    // fallback al dataset local
  }

  const clinicalProc = isUUID
    ? (CLINICAL_PROCEDURES.find((p) => p.id === slugOrId) ??
       CLINICAL_PROCEDURES.find((p) => p.slug === slugOrId))
    : (CLINICAL_PROCEDURES.find((p) => p.slug === slugOrId) ??
       CLINICAL_PROCEDURES.find((p) => p.id === slugOrId));

  if (clinicalProc) {
    const description = clinicalProc.description.slice(0, 160);
    return {
      title: clinicalProc.title,
      description,
      openGraph: {
        title: `${clinicalProc.title} · AuraTips`,
        description,
        images: [{ url: "/og/default.png", width: 1200, height: 630 }],
      },
      alternates: {
        canonical: `/procedimientos/${clinicalProc.slug}`,
      },
    };
  }

  return {
    title: "Procedimiento no encontrado",
    description: "El procedimiento que buscas no está disponible en AuraTips.",
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function ProcedureJsonLd({ course }: { course: UnifiedCourse }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: course.title,
    description: course.description ?? undefined,
    image: course.cover_url ?? undefined,
    // S7: procedureType con URL estándar de schema.org para maximizar rich snippets
    procedureType: "https://schema.org/TherapeuticProcedure",
    // Categoría libre accesible como additionalType
    additionalType: `https://schema.org/${encodeURIComponent(course.category)}`,
    followup: course.recovery_time,
    performer: course.author?.display_name
      ? {
          "@type": "Physician",
          name: course.author.display_name,
          jobTitle: course.author.bio ?? "Médica Especialista en Estética",
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "AuraTips",
      url: "https://auratips.com",
      logo: {
        "@type": "ImageObject",
        url: "https://auratips.com/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({ params }: Props) {
  const { slug: slugOrId } = await params;

  const {
    dbCourse,
    clinicalProc,
    user,
    isOwner,
    isSpecialist,
    modulesData,
    ratingRow,
    isEnrolled,
    reviews,
  } = await fetchCourse(slugOrId);

  if (!dbCourse && !clinicalProc) {
    notFound();
  }

  // Pacientes o visitantes no asignados al protocolo no deben ingresar a la vista clínica interna:
  // Se les redirige a la ficha informativa de procedimientos con el modal abierto.
  if (!isSpecialist && !isOwner && !isEnrolled) {
    const targetSlug = dbCourse?.slug || clinicalProc?.slug || slugOrId;
    redirect(`/procedimientos?proc=${encodeURIComponent(targetSlug)}`);
  }

  const FALLBACK_COVER =
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80";

  const course: UnifiedCourse = dbCourse
    ? {
        id: dbCourse.id,
        title: dbCourse.title,
        slug: dbCourse.slug,
        description: dbCourse.description,
        cover_url: dbCourse.cover_url ?? clinicalProc?.cover_url ?? FALLBACK_COVER,
        category: dbCourse.category ?? clinicalProc?.category ?? "Inyectables",
        recovery_time:
          dbCourse.recovery_time ?? clinicalProc?.recovery_time ?? "24 a 48 horas",
        pain_level: dbCourse.pain_level ?? clinicalProc?.pain_level ?? 2,
        duration_minutes:
          dbCourse.duration_minutes ?? clinicalProc?.duration_minutes ?? 45,
        results_duration:
          dbCourse.results_duration ?? clinicalProc?.results_duration ?? "6 a 12 meses",
        anesthesia_type:
          dbCourse.anesthesia_type ?? clinicalProc?.anesthesia_type ?? "Tópica",
        alarm_signs: dbCourse.alarm_signs?.length
          ? dbCourse.alarm_signs
          : clinicalProc?.alarm_signs ?? [],
        status: dbCourse.status,
        owner_id: dbCourse.owner_id,
        author: Array.isArray(dbCourse.profiles)
          ? dbCourse.profiles[0]
          : dbCourse.profiles,
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

  const myReview = user
    ? reviews.find((r: any) => r.user_id === user.id) ?? null
    : null;

  return (
    <>
      <ProcedureJsonLd course={course} />

      <article
        className="animate-fade-in"
        style={{ maxWidth: "980px", margin: "0 auto", paddingBottom: "64px" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Migas de pan" style={{ marginBottom: "16px", fontSize: "14px" }}>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <li>
              <Link
                href="/procedimientos"
                style={{ color: "var(--color-muted)", textDecoration: "none" }}
                aria-label="Volver al catálogo de otros procedimientos"
              >
                ← Otros procedimientos
              </Link>
            </li>
            <li aria-hidden="true" style={{ color: "var(--color-muted)" }}>/</li>
            <li>
              <span
                style={{ color: "var(--color-brand)", fontWeight: 600 }}
                aria-current="page"
              >
                {course.category}
              </span>
            </li>
          </ol>
        </nav>

        {/* S5: h1 siempre renderizado para garantizar jerarquía de headings.
             Cuando hay imagen de portada se oculta visualmente (sr-only) para evitar
             duplicado; la portada muestra el título decorativo dentro del hero. */}
        <h1
          data-testid="course-page-title"
          className={course.cover_url ? "sr-only" : undefined}
          style={!course.cover_url ? { fontSize: "2rem", fontWeight: 800, marginBottom: "8px" } : undefined}
        >
          {course.title}
        </h1>

        {/* Hero — portada decorativa (el h1 semántico ya está arriba) */}
        {course.cover_url && (
          <div className="procedure-hero-banner">
            <Image
              src={course.cover_url}
              alt={`Imagen de portada del procedimiento: ${course.title}`}
              fill
              sizes="(max-width: 980px) 100vw, 980px"
              className="procedure-hero-img"
              priority
              style={{ objectFit: "cover" }}
            />
            <div className="procedure-hero-backdrop" aria-hidden="true" />
            <div className="procedure-hero-card animate-slide-up" aria-hidden="true">
              <span
                className="category-pill-gold"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <SparklesIcon size={12} aria-hidden="true" />
                <span>{course.category}</span>
              </span>
              {/* Título visual dentro del hero — aria-hidden porque el h1 ya está arriba */}
              <p className="procedure-hero-title" aria-hidden="true">{course.title}</p>
              <p>
                Supervisado por{" "}
                <strong>
                  {course.author?.display_name ?? "Comité Médico Estético"}
                </strong>
                {course.author?.bio ? ` — ${course.author.bio}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Ribbon métricas clínicas */}
        <div
          className="clinical-detail-ribbon"
          role="region"
          aria-label="Métricas clínicas del procedimiento"
        >
          <div className="ribbon-cell">
            <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ClockIcon size={13} color="var(--color-muted)" aria-hidden="true" />
              <span>Tiempo de Recuperación</span>
            </span>
            <span className="val">{course.recovery_time}</span>
          </div>
          <div className="ribbon-cell">
            <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ActivityIcon size={13} color="var(--color-muted)" aria-hidden="true" />
              <span>Nivel de Molestia</span>
            </span>
            <span className="val" aria-label={`Nivel de molestia: ${course.pain_level} de 5`}>
              {"●".repeat(course.pain_level)}{"○".repeat(5 - course.pain_level)} ({course.pain_level}/5)
            </span>
          </div>
          <div className="ribbon-cell">
            <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ClockIcon size={13} color="var(--color-muted)" aria-hidden="true" />
              <span>Duración de Resultados</span>
            </span>
            <span className="val">{course.results_duration}</span>
          </div>
          <div className="ribbon-cell">
            <span className="lbl" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <SyringeIcon size={13} color="var(--color-muted)" aria-hidden="true" />
              <span>Tipo de Anestesia</span>
            </span>
            <span className="val">{course.anesthesia_type}</span>
          </div>
        </div>

        {/* Descripción clínica */}
        {course.description && (
          <section
            aria-labelledby="desc-heading"
            style={{ marginBottom: "32px", lineHeight: 1.7, fontSize: "1.05rem", color: "var(--color-text-2)" }}
          >
            <h2 id="desc-heading" className="sr-only">
              Descripción del procedimiento
            </h2>
            <p>{course.description}</p>
          </section>
        )}

        {/* Signos de alarma */}
        {course.alarm_signs.length > 0 && (
          <section className="alarm-callout" aria-labelledby="alarm-heading">
            <div className="alarm-callout-header">
              <ShieldAlertIcon size={20} color="var(--color-error)" aria-hidden="true" />
              <h2
                id="alarm-heading"
                style={{ fontSize: "16px", margin: 0, color: "var(--color-error)" }}
              >
                Signos de Alarma — Cuándo contactar a tu médico de inmediato
              </h2>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-2)", marginBottom: "8px" }}>
              Si experimentas alguno de estos síntomas en las primeras horas o días,
              comunícate inmediatamente con la clínica o tu especialista tratante:
            </p>
            <ul>
              {course.alarm_signs.map((sign: string, idx: number) => (
                <li key={idx}>
                  <strong>{sign}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Inscripción */}
        {dbCourse && (
          <div
            style={{
              marginBottom: "32px",
              padding: "16px 20px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                ¿Te realizaste o vas a realizarte este procedimiento?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: "4px 0 0" }}>
                Activa la guía interactiva para guardar tu progreso, checklist diario
                y recordatorios de medicación.
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

        {/* Línea de tiempo */}
        <section aria-labelledby="timeline-heading" style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              aria-hidden="true"
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
                Línea de Tiempo &amp; Fases de Cuidados
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: "2px 0 0" }}>
                Haz clic en cada pauta para abrir el protocolo completo,
                semáforo de qué hacer y lista de verificación.
              </p>
            </div>
          </div>

          {modulesData.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }}>
              Pronto publicaremos los protocolos de este tratamiento.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modulesData.map((m: any, idx: number) => (
                <div key={m.id ?? idx} className="recovery-stage-card">
                  <div className="stage-header">
                    <span className="stage-title">Fase {idx + 1}: {m.title}</span>
                    {m.timeline_tag && <span className="stage-tag">{m.timeline_tag}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(m.lessons ?? [])
                      .slice()
                      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
                      .map((l: any) => (
                        <Link
                          key={l.id}
                          href={`/procedimientos/${course.slug}/lessons/${l.id}`}
                          className="stage-lesson-link"
                          aria-label={`Ver pauta y checklist: ${l.title}`}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ClipboardCheckIcon size={15} color="var(--color-brand)" aria-hidden="true" />
                            <span>{l.title}</span>
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--color-brand)",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>Ver Pauta y Checklist</span>
                            <ArrowRightIcon size={12} aria-hidden="true" />
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reseñas */}
        <section
          aria-labelledby="reviews-heading"
          style={{ borderTop: "1px solid var(--color-border)", paddingTop: "32px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 id="reviews-heading" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              Experiencias de Pacientes
            </h2>
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
    </>
  );
}
