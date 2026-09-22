import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProcedureBySlug, CLINICAL_PROCEDURES, getPhaseForDay } from "@/lib/clinical-data";
import { ActiveProcedureCard, ActiveProcedure } from "../_components/ActiveProcedureCard";
import { DailyCareChecklist } from "../_components/DailyCareChecklist";
import { SymptomSafetyWidget } from "../_components/SymptomSafetyWidget";
import { DoctorFollowUpCard } from "../_components/DoctorFollowUpCard";
import { ClinicalAssistantDrawer } from "../_components/ClinicalAssistantDrawer";
import {
  LeafIcon,
  SyringeIcon,
  SmileIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClipboardCheckIcon,
} from "@/components/icons";

export const metadata = {
  title: "Mis Cuidados Activos · AuraTips",
  description:
    "Centro clínico de acompañamiento y recuperación post-procedimiento estético con la Dra. Mariana Gómez.",
};

interface PageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function LearningDashboard({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resolvedSearchParams = await searchParams;
  const demoSlug = resolvedSearchParams?.demo;

  if (!user && !demoSlug) redirect("/login?next=/dashboard/learning");

  // Fetch enrollments with course data if user is authenticated
  const { data: enrollments } = user
    ? await supabase
        .from("enrollments")
        .select("id, enrolled_at, courses ( id, title, slug, cover_url, status )")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("enrolled_at", { ascending: false })
    : { data: [] };

  // Check whether we have real enrollments or a demo selected
  const hasRealEnrollments = !!(enrollments && enrollments.length > 0);
  const demoProcedure = demoSlug ? getProcedureBySlug(demoSlug) : null;

  // If no enrollments and no demo selected, show empty state with demo options
  if (!hasRealEnrollments && !demoProcedure) {
    return (
      <section aria-labelledby="dashboard-heading" className="animate-fade-in">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-6)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <h1
              id="dashboard-heading"
              style={{
                fontSize: "var(--text-3xl)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--color-text)",
                lineHeight: 1.15,
              }}
            >
              Mis Cuidados Activos
            </h1>
            <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
              Centro clínico de acompañamiento y evolución guiada · Dra. Mariana Gómez
            </p>
          </div>
          <span className="badge badge-brand">0 Protocolos Activos</span>
        </div>

        {/* Empty State Card */}
        <div
          className="empty-state animate-slide-up"
          style={{
            padding: "var(--space-10) var(--space-6)",
            maxWidth: 680,
            marginInline: "auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(32, 80, 59, 0.1)",
              border: "1px solid rgba(32, 80, 59, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-brand)",
              marginInline: "auto",
              marginBottom: "var(--space-4)",
            }}
          >
            <LeafIcon size={32} />
          </div>

          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "var(--space-2)",
            }}
          >
            Tu espacio de recuperación clínica guiada
          </h2>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "var(--text-base)",
              lineHeight: 1.6,
              marginBottom: "var(--space-6)",
              maxWidth: 520,
              marginInline: "auto",
            }}
          >
            Aún no tienes un protocolo de recuperación activo. Al iniciar tu tratamiento con la Dra. Mariana Gómez, este panel calculará automáticamente tu día de evolución, las pautas diarias recomendadas, acciones a evitar y la fecha de tu cita de control médico.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-3)",
              flexWrap: "wrap",
              marginBottom: "var(--space-8)",
            }}
          >
            <Link href="/" className="btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span>Explorar Protocolos de Recuperación</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>

          {/* Quick interactive demo previews */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-6)",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                display: "block",
                marginBottom: "var(--space-3)",
                textAlign: "center",
              }}
            >
              O explora una simulación guiada de recuperación:
            </span>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "var(--space-3)",
              }}
            >
              {CLINICAL_PROCEDURES.slice(0, 2).map((proc) => (
                <Link
                  key={proc.id}
                  href={`/dashboard/learning?demo=${proc.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    textDecoration: "none",
                    transition: "all var(--dur-fast) ease",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(32, 80, 59, 0.08)",
                      color: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {proc.category === "Inyectables" ? (
                      <SyringeIcon size={18} />
                    ) : (
                      <SparklesIcon size={18} />
                    )}
                  </div>
                  <div>
                    <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-text)", display: "block" }}>
                      {proc.title}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--color-muted)" }}>
                      Simular recuperación y cuidados diarios ({proc.recovery_time})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <ClinicalAssistantDrawer
          procedureSlug="toxina-botulinica-botox-facial"
          procedureTitle="Toxina Botulínica Facial (Botox)"
          recoveryDay={1}
        />
      </section>
    );
  }

  // Determine active procedure: either real enrollment or demo
  let activeProcedure: ActiveProcedure;
  let clinicalSpec: ReturnType<typeof getProcedureBySlug>;
  let otherEnrollments: typeof enrollments = [];

  if (demoProcedure) {
    clinicalSpec = demoProcedure;
    activeProcedure = {
      id: demoProcedure.id,
      title: demoProcedure.title,
      slug: demoProcedure.slug,
      cover_url: demoProcedure.cover_url,
      category: demoProcedure.category,
      recovery_time: demoProcedure.recovery_time,
      pain_level: demoProcedure.pain_level,
      anesthesia_type: demoProcedure.anesthesia_type,
      enrolled_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Day 2 simulation
      doctor_name: demoProcedure.doctor_name,
      doctor_specialty: demoProcedure.doctor_specialty,
    };
  } else {
    const latest = enrollments![0];
    const course = Array.isArray(latest.courses) ? latest.courses[0] : latest.courses;
    clinicalSpec = getProcedureBySlug(course?.slug ?? "");

    activeProcedure = {
      id: course?.id ?? latest.id,
      title: course?.title ?? "Procedimiento Activo",
      slug: course?.slug ?? "",
      cover_url: course?.cover_url ?? "/images/botox.jpg",
      category: course?.category ?? clinicalSpec?.category ?? "Inyectables",
      recovery_time: course?.recovery_time ?? clinicalSpec?.recovery_time ?? "4 a 24 horas",
      pain_level: course?.pain_level ?? clinicalSpec?.pain_level ?? 1,
      anesthesia_type: course?.anesthesia_type ?? clinicalSpec?.anesthesia_type ?? "Crioterapia / Frío local",
      enrolled_at: latest.enrolled_at,
      doctor_name: clinicalSpec?.doctor_name ?? "Dra. Mariana Gómez",
      doctor_specialty: clinicalSpec?.doctor_specialty ?? "Médica Especialista en Medicina Estética Facial",
    };

    otherEnrollments = enrollments!.slice(1);
  }

  // Calculate current day
  const enrolledDate = new Date(activeProcedure.enrolled_at);
  const diffTime = Math.max(0, Date.now() - enrolledDate.getTime());
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(1, elapsedDays + 1);

  // Extract checklist, alarms, dos, donts matching current recovery phase
  const phaseData = clinicalSpec ? getPhaseForDay(clinicalSpec, currentDay) : null;
  const initialChecklist = phaseData?.checklist ?? clinicalSpec?.modules?.[0]?.lessons?.[0]?.checklist;
  const dos = phaseData?.dos ?? clinicalSpec?.modules?.[0]?.lessons?.[0]?.dos ?? [];
  const donts = phaseData?.donts ?? clinicalSpec?.modules?.[0]?.lessons?.[0]?.donts ?? [];
  const alarmSigns = clinicalSpec?.alarm_signs ?? [];

  return (
    <section aria-labelledby="dashboard-heading" className="animate-fade-in">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h1
              id="dashboard-heading"
              style={{
                fontSize: "var(--text-3xl)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--color-text)",
                lineHeight: 1.15,
              }}
            >
              Mis Cuidados Activos
            </h1>
            {demoProcedure && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(194, 155, 56, 0.15)",
                  color: "#997316",
                  border: "1px solid rgba(194, 155, 56, 0.3)",
                }}
              >
                Simulación de Acompañamiento Clínico
              </span>
            )}
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
            Monitoreo diario de recuperación, pautas médicas y control post-procedimiento · Dra. Mariana Gómez
          </p>
        </div>

        {/* Demo Switcher Pill / Treatment Count */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {demoProcedure ? (
            <Link href="/dashboard/learning" className="btn-ghost btn btn-sm" style={{ fontSize: "12px" }}>
              Salir de Modo Demo
            </Link>
          ) : (
            <span className="badge badge-brand">
              {enrollments?.length ?? 0} Procedimiento{enrollments?.length !== 1 ? "s" : ""}
            </span>
          )}

          {/* Quick switch between clinical procedures */}
          <div style={{ display: "flex", gap: "6px" }}>
            {CLINICAL_PROCEDURES.map((p) => {
              const isActive = activeProcedure.slug === p.slug;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/learning?demo=${p.slug}`}
                  className="btn-ghost btn btn-sm"
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "var(--radius-full)",
                    border: isActive ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
                    background: isActive ? "rgba(32, 80, 59, 0.1)" : "var(--color-surface)",
                    color: isActive ? "var(--color-brand)" : "var(--color-text)",
                    fontWeight: isActive ? 700 : 500,
                  }}
                  title={`Ver cuidados de ${p.title}`}
                >
                  {p.category === "Inyectables" ? (
                    <SyringeIcon size={12} />
                  ) : p.category === "Dermoestética" ? (
                    <SparklesIcon size={12} />
                  ) : (
                    <SmileIcon size={12} />
                  )}
                  <span>{p.title.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bento Grid: Clinical Care Hub */}
      <div className="bento-grid">
        {/* 1. Active Procedure Card */}
        <ActiveProcedureCard procedure={activeProcedure} />

        {/* 2. Doctor Follow-up & Appointment Card */}
        <DoctorFollowUpCard
          doctorName={activeProcedure.doctor_name}
          doctorSpecialty={activeProcedure.doctor_specialty}
          enrolledAt={activeProcedure.enrolled_at}
        />

        {/* 3. Daily Care Checklist */}
        <DailyCareChecklist
          procedureSlug={activeProcedure.slug}
          currentDay={currentDay}
          initialItems={initialChecklist}
          dos={dos}
          donts={donts}
        />

        {/* 4. Symptom & Safety Monitor */}
        <SymptomSafetyWidget
          alarmSigns={alarmSigns}
          currentDay={currentDay}
          procedureTitle={activeProcedure.title}
        />

        {/* 5. Additional / History Procedures (if user has more than 1) */}
        {otherEnrollments.length > 0 && (
          <div
            className="bento-card bento-history"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ClipboardCheckIcon size={18} color="var(--color-brand)" />
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                Otros Protocolos en tu Historial Clínico
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "var(--space-3)",
              }}
            >
              {otherEnrollments.map((enr) => {
                const c = Array.isArray(enr.courses) ? enr.courses[0] : enr.courses;
                if (!c) return null;
                return (
                  <div
                    key={enr.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)",
                      background: "var(--color-surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-text)", display: "block" }}>
                        {c.title}
                      </strong>
                      <span style={{ fontSize: "11px", color: "var(--color-muted)" }}>
                        Registrado el {new Date(enr.enrolled_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="btn-ghost btn btn-sm"
                      style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>Ver Protocolo</span>
                      <ArrowRightIcon size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ClinicalAssistantDrawer
        procedureSlug={activeProcedure.slug}
        procedureTitle={activeProcedure.title}
        recoveryDay={currentDay}
      />
    </section>
  );
}
