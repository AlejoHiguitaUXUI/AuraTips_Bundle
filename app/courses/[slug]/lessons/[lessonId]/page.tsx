import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { youTubeEmbedUrl } from "@/lib/youtube";
import { PatientChecklist } from "@/components/PatientChecklist";
import { getProcedureBySlug } from "@/lib/clinical-data";
import { ClinicalAssistantDrawer } from "@/app/dashboard/_components/ClinicalAssistantDrawer";
import {
  ClockIcon,
  CheckCircle2Icon,
  BanIcon,
  ShieldCheckIcon,
} from "@/components/icons";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Intentar cargar desde Supabase
  const { data: dbCourse } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .maybeSingle();

  const clinicalProc = getProcedureBySlug(slug);

  if (!dbCourse && !clinicalProc) {
    notFound();
  }

  let courseTitle = dbCourse?.title || clinicalProc?.title || "Procedimiento";
  let courseSlug = dbCourse?.slug || clinicalProc?.slug || slug;

  let lessonTitle = "";
  let timelineTag = "";
  let careType = "general";
  let bodyMd = "";
  let youtubeUrl: string | null = null;
  let dos: string[] = [];
  let donts: string[] = [];
  let checklist: string[] = [];

  if (dbCourse) {
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, title, timeline_tag, care_type, module_id, modules ( course_id )")
      .eq("id", lessonId)
      .maybeSingle();

    const lessonCourseId = Array.isArray(lesson?.modules)
      ? lesson?.modules[0]?.course_id
      : lesson?.modules?.course_id;

    if (lesson && lessonCourseId === dbCourse.id) {
      lessonTitle = lesson.title;
      timelineTag = (lesson as any).timeline_tag || "Fase de Cuidados";
      careType = (lesson as any).care_type || "general";

      const { data: content } = await supabase
        .from("lesson_contents")
        .select("body_md, youtube_url, dos, donts, checklist_items")
        .eq("lesson_id", lesson.id)
        .maybeSingle();

      if (!content) {
        return (
          <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
            <p style={{ marginBottom: "16px" }}>
              <Link href={`/courses/${courseSlug}`} style={{ color: "var(--color-muted)" }}>
                ← Volver a {courseTitle}
              </Link>
            </p>
            <h1>{lesson.title}</h1>
            <div className="empty-state" style={{ marginTop: "24px" }}>
              <p>
                {user
                  ? "Debes activar la guía de este procedimiento para acceder a sus pautas detalladas."
                  : "Inicia sesión para registrar tu progreso y ver este protocolo."}
              </p>
              <Link href={`/courses/${courseSlug}`} className="btn" style={{ marginTop: "16px" }}>
                Ver Procedimiento
              </Link>
            </div>
          </section>
        );
      }

      bodyMd = content.body_md || "";
      youtubeUrl = content.youtube_url || null;
      dos = (content as any).dos || [];
      donts = (content as any).donts || [];
      checklist = Array.isArray((content as any).checklist_items)
        ? (content as any).checklist_items
        : [];
    }
  }

  // 2. Si no se encontró en Supabase o es un procedimiento de ejemplo
  if (!lessonTitle && clinicalProc) {
    for (const mod of clinicalProc.modules) {
      const foundLes = mod.lessons.find((l) => l.id === lessonId);
      if (foundLes) {
        lessonTitle = foundLes.title;
        timelineTag = foundLes.timeline_tag;
        careType = foundLes.care_type;
        bodyMd = foundLes.body_md;
        youtubeUrl = foundLes.youtube_url || null;
        dos = foundLes.dos || [];
        donts = foundLes.donts || [];
        checklist = foundLes.checklist || [];
        break;
      }
    }
  }

  if (!lessonTitle) {
    notFound();
  }

  return (
    <article className="animate-fade-in" style={{ maxWidth: "840px", margin: "0 auto", paddingBottom: "64px" }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "20px", fontSize: "14px" }}>
        <Link href={`/courses/${courseSlug}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          ← Volver al Protocolo de {courseTitle}
        </Link>
      </nav>

      {/* Cabecera de la Pauta Clínica */}
      <header style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          {timelineTag && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <ClockIcon size={12} color="var(--color-brand)" />
              <span>{timelineTag}</span>
            </span>
          )}
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-muted)",
              fontWeight: 500,
            }}
          >
            Protocolo Médico Oficial
          </span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)", margin: 0 }}>
          {lessonTitle}
        </h1>
      </header>

      {/* Video Demostrativo si existe */}
      {youtubeUrl && (
        <div style={{ aspectRatio: "16/9", marginBottom: "28px", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          <iframe
            src={youTubeEmbedUrl(youtubeUrl)}
            title={lessonTitle}
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Semáforo de Cuidados: Permitido vs Prohibido */}
      {(dos.length > 0 || donts.length > 0) && (
        <section className="semaphore-grid" aria-label="Semáforo de indicaciones y contraindicaciones">
          {dos.length > 0 && (
            <div className="semaphore-col allowed">
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2Icon size={14} color="#16a34a" />
                <span>Pautas recomendadas (Qué hacer)</span>
              </h4>
              <ul className="semaphore-list">
                {dos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {donts.length > 0 && (
            <div className="semaphore-col prohibited">
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <BanIcon size={14} color="#dc2626" />
                <span>Acciones a evitar (Qué evitar)</span>
              </h4>
              <ul className="semaphore-list">
                {donts.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Lista de Verificación / Checklist Interactivo */}
      {checklist.length > 0 && (
        <PatientChecklist lessonId={lessonId} items={checklist} />
      )}

      {/* Contenido Clínico Detallado */}
      {bodyMd && (
        <div
          className="prose"
          style={{
            lineHeight: 1.75,
            fontSize: "1.05rem",
            color: "var(--color-text-2)",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <ReactMarkdown>{bodyMd}</ReactMarkdown>
        </div>
      )}

      {/* Footer de Seguridad Médica */}
      <footer
        style={{
          marginTop: "48px",
          padding: "16px 20px",
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "var(--color-muted)",
        }}
      >
        <ShieldCheckIcon size={22} color="var(--color-brand)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Nota de Responsabilidad Médica:</strong> Este protocolo ofrece pautas estandarizadas de post-cuidado. En caso de dudas agudas o asimetrías súbitas, comunícate con tu especialista tratante.
        </span>
      </footer>

      <ClinicalAssistantDrawer
        procedureSlug={courseSlug}
        procedureTitle={courseTitle}
        recoveryDay={timelineTag.includes("0") ? 0 : 2}
      />
    </article>
  );
}

