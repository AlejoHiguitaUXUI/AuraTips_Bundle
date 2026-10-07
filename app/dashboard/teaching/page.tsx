import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  StethoscopeIcon,
  ClockIcon,
  ChevronRightIcon,
  PencilIcon,
} from "@/components/icons";

export const metadata = {
  title: "Protocolos Clínicos · Gestión y Pautas Médicas | Dra. Mariana Gómez",
  description:
    "Panel médico de administración y edición de protocolos de recuperación, pautas clínicas y criterios de seguridad.",
};

import { getClinicalRole } from "@/lib/auth-role";

export default async function TeachingDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/teaching");
  }

  const { isSpecialist } = await getClinicalRole(supabase, user);
  if (!isSpecialist) {
    redirect("/dashboard/learning");
  }

  // RLS scopes to owner_id
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, status, category, recovery_time, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const publishedCount = (courses ?? []).filter((c) => c.status === "published").length;

  // Enrollments / Pacientes en seguimiento clínico
  let activePatients: any[] = [];
  try {
    const { data: enrolledData } = await supabase
      .from("enrollments")
      .select("id, enrolled_at, user_id, courses ( title, slug ), profiles ( display_name )")
      .order("enrolled_at", { ascending: false })
      .limit(8);
    activePatients = enrolledData || [];
  } catch (err) {
    console.warn("TeachingDashboard: Could not fetch active enrollments:", err);
  }

  return (
    <section>
      {/* Banner de Especialista Responsable */}
      <div
        style={{
          background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
          color: "#FAF8F5",
          padding: "var(--space-5) var(--space-6)",
          borderRadius: "var(--radius-xl)",
          marginBottom: "var(--space-6)",
          border: "1px solid rgba(194, 155, 56, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FAF8F5",
              border: "2px solid rgba(194, 155, 56, 0.6)",
            }}
          >
            <StethoscopeIcon size={26} />
          </div>
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-gold-light, #E6CA85)",
              }}
            >
              Protocolos Clínicos · AuraTips
            </span>
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: "2px 0 0", color: "#FAF8F5" }}>
              Dra. Mariana Gómez
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.85 }}>
              Especialista en Medicina Estética Facial · Supervisión de pautas post-tratamiento, etapas de recuperación y alertas de seguridad
            </p>
          </div>
        </div>

        {/* Indicadores rápidos */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <strong style={{ fontSize: "20px", display: "block", color: "#FAF8F5" }}>
              {activePatients.length}
            </strong>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>Pacientes Asignados</span>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <strong style={{ fontSize: "20px", display: "block", color: "#FAF8F5" }}>
              {courses?.length ?? 0}
            </strong>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>Protocolos Registrados</span>
          </div>

          <div
            style={{
              background: "rgba(34, 197, 94, 0.15)",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <strong style={{ fontSize: "20px", display: "block", color: "#34D399" }}>
              {publishedCount}
            </strong>
            <span style={{ fontSize: "12px", opacity: 0.85, color: "#E5E7EB" }}>Activos en AuraTips</span>
          </div>
        </div>
      </div>

      {/* Sección Pacientes en Seguimiento Activo */}
      {activePatients.length > 0 && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-5) var(--space-6)",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              Pacientes con Procedimiento Activo
            </h2>
            <span className="badge badge-brand">{activePatients.length} en recuperación</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-3)" }}>
            {activePatients.map((ep) => {
              const patientName = (ep.profiles as any)?.display_name || "Paciente AuraMed";
              const procTitle = (ep.courses as any)?.title || "Procedimiento Asignado";
              return (
                <div
                  key={ep.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: "var(--text-sm)" }}>{patientName}</strong>
                    <span style={{ fontSize: "12px", color: "var(--color-brand)" }}>{procTitle}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#16a34a",
                      fontWeight: 600,
                    }}
                  >
                    En seguimiento
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección Dirección de Protocolos Clínicos (Manejo tipo Protocolos Recientes) */}
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
            gap: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 500px", minWidth: "260px" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0 }}>
              Dirección de Protocolos Clínicos
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "13px", margin: "4px 0 0", maxWidth: "720px", lineHeight: 1.45 }}>
              Gestión de pautas de cuidado post-tratamiento, cronogramas de recuperación, pautas recomendadas (qué hacer) y acciones a evitar (qué evitar).
            </p>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <Link
              href="/dashboard/teaching/new"
              data-testid="new-course-button"
              className="btn"
              style={{
                backgroundColor: "var(--color-brand, #20503b)",
                color: "#ffffff",
                padding: "9px 20px",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "var(--radius-full, 999px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(32, 80, 59, 0.25)",
              }}
            >
              + Nuevo Protocolo Clínico
            </Link>
          </div>
        </div>

        {error && <div className="error">{error.message}</div>}

        {!error && courses && courses.length === 0 && (
          <div className="empty-state" style={{ padding: "var(--space-8)", textAlign: "center" }}>
            <p style={{ marginBottom: "var(--space-3)" }}>Aún no has registrado ningún protocolo clínico de recuperación.</p>
            <Link href="/dashboard/teaching/new" className="btn">
              Crear tu primer protocolo médico
            </Link>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {courses.map((c) => {
              const isPublished = c.status === "published";
              return (
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
                        {c.category || "Inyectables"}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: isPublished ? "#16a34a" : "#d97706",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: isPublished ? "#22c55e" : "#f59e0b",
                          }}
                        />
                        {isPublished ? "Activo" : "Borrador"}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/teaching/${c.slug}`}
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        lineHeight: 1.35,
                        marginBottom: "8px",
                        textDecoration: "none",
                      }}
                    >
                      {c.title}
                    </Link>

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
                      href={`/dashboard/teaching/${c.slug}`}
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
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
