import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClinicalRole } from "@/lib/auth-role";
import LearningDashboard from "@/app/dashboard/learning/page";
import { EditorialHero } from "@/components/EditorialHero";
import { AuraVoiceSection } from "@/components/AuraVoiceSection";
import {
  LeafIcon,
  ShieldCheckIcon,
  ClockIcon,
  StethoscopeIcon,
  SparklesIcon,
  ArrowRightIcon,
  PhoneIcon,
  ChevronRightIcon,
  MessageCircleIcon,
  UserCheckIcon,
  PlusIcon,
  PencilIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AuraTips · Acompañamiento Clínico | AuraMed Grupo Estético",
  description:
    "Portal clínico exclusivo de acompañamiento y seguimiento post-procedimiento estético bajo la supervisión médica de la Dra. Mariana Gómez.",
};

interface HomePageProps {
  searchParams?: Promise<{ demo?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. CASO PACIENTE AUTENTICADO:
  // Renderizar directamente "Mi Recuperación" en la raíz (URL limpia /)
  if (user) {
    const { isSpecialist } = await getClinicalRole(supabase, user);

    if (!isSpecialist) {
      return <LearningDashboard searchParams={searchParams as any} />;
    }

    // 2. CASO ESPECIALISTA (DRA. MARIANA):
    // Renderizar directamente el Centro de Mando en la raíz (URL limpia /)
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, slug, status, category, recovery_time, updated_at")
      .order("updated_at", { ascending: false });

    const totalCourses = courses?.length || 0;
    const publishedCount = (courses ?? []).filter((c) => c.status === "published").length;

    let activePatients: any[] = [];
    try {
      const adminClient = createAdminClient();
      const { data: enrolledData } = await adminClient
        .from("enrollments")
        .select(
          "id, user_id, course_id, status, enrolled_at, courses ( id, title, slug, category, recovery_time ), profiles ( display_name )"
        )
        .order("enrolled_at", { ascending: false });

      if (enrolledData && enrolledData.length > 0) {
        let userMap = new Map();
        try {
          const { data: authUsers } = await adminClient.auth.admin.listUsers();
          userMap = new Map((authUsers?.users || []).map((u) => [u.id, u]));
        } catch (e) {
          console.warn("Could not list auth users for phone enrich:", e);
        }

        activePatients = enrolledData.map((ep: any) => {
          const authUser = userMap.get(ep.user_id);
          const patientName =
            ep.profiles?.display_name ||
            authUser?.user_metadata?.full_name ||
            authUser?.user_metadata?.display_name ||
            "Paciente AuraMed";
          const patientPhone =
            authUser?.user_metadata?.phone || "+57 300 123 4567";

          return {
            ...ep,
            patientName,
            patientPhone,
          };
        });
      }
    } catch (err) {
      console.warn("HomePage (Specialist): Error fetching active enrollments:", err);
    }

    const uniquePatientsCount = new Set(activePatients.map((p) => p.user_id)).size;

    return (
      <div className="animate-fade-in" style={{ paddingBottom: "var(--space-12)" }}>
        {/* Banner de Bienvenida Centro de Mando */}
        <div className="command-center-hero">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(194, 155, 56, 0.25) 0%, rgba(24, 60, 44, 0.8) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FAF8F5",
                  border: "2px solid rgba(194, 155, 56, 0.75)",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                  flexShrink: 0,
                }}
              >
                <StethoscopeIcon size={30} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      color: "#E6CA85",
                    }}
                  >
                    Centro de Mando · Dirección Clínica AuraTips
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(194, 155, 56, 0.2)",
                      border: "1px solid rgba(194, 155, 56, 0.4)",
                      color: "#F3E3B6",
                    }}
                  >
                    RM-482910-ANT
                  </span>
                </div>
                <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: 0, color: "#FAF8F5", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                  Dra. Mariana Gómez
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(250, 248, 245, 0.88)", maxWidth: "560px", lineHeight: 1.45 }}>
                  Supervisión médica integral, seguimiento post-procedimiento y evolución clínica activa de pacientes de AuraMed.
                </p>
              </div>
            </div>

            {/* Estado de Turno / Badge Clínico */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(12px)",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(194, 155, 56, 0.3)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#FAF8F5" }}>
                Supervisión Médica Activa
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Acciones Rápidas */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-6)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/dashboard/protocolos/new"
              className="btn-clinical-primary"
              title="Crear un nuevo protocolo clínico para pacientes"
            >
              <PlusIcon size={16} />
              <span>Nuevo Protocolo Clínico</span>
            </Link>

            <Link
              href="/dashboard/protocolos"
              className="btn-clinical-secondary"
              title="Ir al panel de gestión y edición de protocolos"
            >
              <span>Gestionar Protocolos Clínicos</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>

          <Link
            href="/procedimientos"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-brand)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              transition: "background var(--dur-fast)",
            }}
          >
            <span>Ver catálogo &quot;Conoce otros procedimientos&quot;</span>
            <ChevronRightIcon size={14} />
          </Link>
        </div>

        {/* Métricas Clínicas Principales (KPI Strip) */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pacientes en Recuperación
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(34, 197, 94, 0.12)",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserCheckIcon size={20} />
              </div>
            </div>
            <div>
              <strong style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
                {uniquePatientsCount}
              </strong>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                  {activePatients.length} tratamientos en seguimiento
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Biblioteca de Protocolos
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(194, 155, 56, 0.15)",
                  color: "var(--color-gold-text, #997316)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheckIcon size={20} />
              </div>
            </div>
            <div>
              <strong style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
                {totalCourses}
              </strong>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                  Faciales, corporales y dermoestética
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pautas Disponibles
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SparklesIcon size={20} />
              </div>
            </div>
            <div>
              <strong style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
                {publishedCount}
              </strong>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0284c7" }} />
                <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                  100% verificadas para consulta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN PRINCIPAL: MONITOR DE PACIENTES EN RECUPERACIÓN ACTIVA */}
        <section style={{ marginBottom: "var(--space-8)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-4)",
              flexWrap: "wrap",
              gap: "var(--space-2)",
              padding: "4rem 0 1rem 0",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
                  }}
                />
                Pacientes en Recuperación Activa
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", margin: "3px 0 0" }}>
                Supervisión médica del día de evolución, pautas asignadas y contacto clínico directo.
              </p>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                background: "rgba(34, 197, 94, 0.12)",
                color: "#16a34a",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              {activePatients.length} tratamientos en seguimiento
            </span>
          </div>

          {activePatients.length === 0 ? (
            <div
              className="empty-state"
              style={{
                padding: "var(--space-10) var(--space-6)",
                textAlign: "center",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--color-brand-soft)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-3)",
                }}
              >
                <UserCheckIcon size={28} />
              </div>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 6px" }}>
                No hay pacientes con procedimientos activos en este momento
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", margin: "0 auto var(--space-4)", maxWidth: "440px", lineHeight: 1.5 }}>
                Cuando registres a un paciente tras su consulta médica, podrás monitorear aquí su evolución y pautas día a día.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {activePatients.map((ep) => {
                const patientName = ep.patientName;
                const phone = ep.patientPhone;
                const procTitle = (ep.courses as any)?.title || "Procedimiento Asignado";
                const procCategory = (ep.courses as any)?.category || "Dermoestética";
                const procSlug = (ep.courses as any)?.slug || "";
                const recoveryEstimate = (ep.courses as any)?.recovery_time || "24 a 48 horas";

                const procDate = new Date(ep.enrolled_at);
                const elapsedDays = Math.max(0, Math.floor((Date.now() - procDate.getTime()) / (1000 * 60 * 60 * 24)));
                const dayLabel = elapsedDays === 0 ? "Día 0 · Primeras 4 a 12 horas" : `Día ${elapsedDays + 1} de evolución`;

                const phoneClean = phone.replace(/[^0-9]/g, "");
                const waMessage = encodeURIComponent(
                  `Hola ${patientName}, te saluda la Dra. Mariana Gómez de AuraMed. Queremos consultar cómo avanza tu evolución de ${procTitle}.`
                );

                const initials = patientName
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() || "PA";

                return (
                  <div key={ep.id} className="patient-tracking-card">
                    <div>
                      {/* Cabecera Tarjeta Paciente */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "var(--space-3)",
                          paddingBottom: "var(--space-3)",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "rgba(32, 80, 59, 0.15)",
                              border: "1.5px solid rgba(194, 155, 56, 0.4)",
                              color: "var(--color-brand)",
                              fontWeight: 800,
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <strong style={{ fontSize: "var(--text-base)", color: "var(--color-text)", display: "block", lineHeight: 1.2 }}>
                              {patientName}
                            </strong>
                            <span style={{ fontSize: "12px", color: "var(--color-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <PhoneIcon size={11} />
                              <span>{phone}</span>
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(34, 197, 94, 0.12)",
                            color: "#16a34a",
                            border: "1px solid rgba(34, 197, 94, 0.25)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dayLabel}
                        </span>
                      </div>

                      {/* Procedimiento Clínico Asignado */}
                      <div
                        style={{
                          background: "var(--color-bg)",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-border)",
                          marginBottom: "var(--space-3)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--color-brand)",
                            }}
                          >
                            {procCategory}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--color-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <ClockIcon size={12} />
                            <span>Reposo: {recoveryEstimate}</span>
                          </span>
                        </div>
                        <strong style={{ display: "block", fontSize: "14px", color: "var(--color-text)", lineHeight: 1.3 }}>
                          {procTitle}
                        </strong>
                      </div>

                      {/* Pauta médica rápida */}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--color-muted)",
                          lineHeight: 1.5,
                          marginBottom: "var(--space-4)",
                          background: "var(--color-surface-2)",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-md)",
                          border: "1px dashed var(--color-border)",
                        }}
                      >
                        <strong style={{ color: "var(--color-text-2)" }}>Pauta médica activa:</strong> Control de fotoprotección, pautas de frío/hielo local y verificación de confort.
                      </div>
                    </div>

                    {/* Acciones para la Especialista */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "var(--space-3)",
                        borderTop: "1px solid var(--color-border)",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={`https://wa.me/${phoneClean}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-direct"
                        title={`Escribir a WhatsApp a ${patientName}`}
                      >
                        <MessageCircleIcon size={14} />
                        <span>Contactar por WhatsApp</span>
                      </a>

                      {procSlug && (
                        <Link
                          href={`/procedimientos/${procSlug}`}
                          style={{
                            fontSize: "12px",
                            color: "var(--color-brand)",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <span>Ver pautas</span>
                          <ArrowRightIcon size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ACCESO RÁPIDO: PROTOCOLOS CLÍNICOS RECIENTES */}
        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-5)",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0 }}>
                Protocolos Recientes
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "13px", margin: "3px 0 0" }}>
                Accede rápidamente a editar o revisar las pautas de tus procedimientos más utilizados.
              </p>
            </div>
            <Link
              href="/dashboard/protocolos"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-brand)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
              }}
            >
              <span>Ver biblioteca completa ({totalCourses})</span>
              <ChevronRightIcon size={14} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {(courses ?? []).slice(0, 4).map((c) => (
              <div key={c.id} className="protocol-quick-card">
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-brand)",
                      }}
                    >
                      {c.category}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#16a34a",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                      Activo
                    </span>
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      lineHeight: 1.35,
                      marginBottom: "8px",
                    }}
                  >
                    {c.title}
                  </strong>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--color-muted)",
                    }}
                  >
                    <ClockIcon size={12} />
                    <span>Reposo: {c.recovery_time || "24 a 48h"}</span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: "var(--space-3)",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Link
                    href={`/dashboard/protocolos/${c.slug}`}
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(194, 155, 56, 0.12)",
                      color: "var(--color-gold-text, #997316)",
                      border: "1px solid rgba(194, 155, 56, 0.35)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all var(--dur-fast)",
                    }}
                    title={`Editar protocolo de ${c.title}`}
                  >
                    <PencilIcon size={12} />
                    <span>Editar pautas</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // 3. CASO VISITANTE (NO AUTENTICADO):
  // Renderizar la landing pública sobria de AuraTips
  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-12)" }}>
      {/* Hero Principal Editorial con Arcos de Procedimientos y Acceso a Cuidados */}
      <EditorialHero />

      {/* Sección Asesora Clínica por Voz AURA */}
      <AuraVoiceSection />
    </div>
  );
}
