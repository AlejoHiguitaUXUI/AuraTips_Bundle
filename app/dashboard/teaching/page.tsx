import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  StethoscopeIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@/components/icons";

export const metadata = {
  title: "Dirección de Protocolos Clínicos · AuraTips | Dra. Mariana Gómez",
  description:
    "Panel médico de administración de protocolos de recuperación, pautas clínicas y criterios de seguridad.",
};

export default async function TeachingDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/teaching");
  }

  // RLS scopes to owner_id
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, status, category, recovery_time, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const publishedCount = (courses ?? []).filter((c) => c.status === "published").length;

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
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-gold-light, #E6CA85)",
              }}
            >
              Dirección de Protocolos Clínicos · AuraTips
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
        <div style={{ display: "flex", gap: "16px" }}>
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
            <span style={{ fontSize: "11px", opacity: 0.8 }}>Protocolos Registrados</span>
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
            <span style={{ fontSize: "11px", opacity: 0.85, color: "#E5E7EB" }}>Activos en AuraTips</span>
          </div>
        </div>
      </div>

      {/* Barra de Título y Nuevo Protocolo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, letterSpacing: "-0.01em", margin: 0 }}>
            Dirección de Protocolos Clínicos
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginTop: "2px" }}>
            Gestión de pautas de cuidado post-tratamiento, cronogramas de recuperación, pautas recomendadas (qué hacer) y acciones a evitar (qué evitar).
          </p>
        </div>
        <Link
          href="/dashboard/teaching/new"
          className="btn"
          style={{
            backgroundColor: "var(--color-brand, #20503b)",
            color: "#ffffff",
            padding: "8px 18px",
            fontWeight: 600,
          }}
        >
          + Nuevo Protocolo Clínico
        </Link>
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
        <div className="grid" style={{ gap: "var(--space-3)" }}>
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/teaching/${c.slug}`}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
                padding: "var(--space-4) var(--space-5)",
                borderRadius: "var(--radius-lg)",
                transition: "all var(--dur-fast) ease",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "var(--text-base)", color: "var(--color-text)" }}>{c.title}</strong>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "rgba(194, 155, 56, 0.1)",
                      color: "var(--color-brand)",
                      fontWeight: 600,
                    }}
                  >
                    {c.category || "Inyectables"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--color-muted)", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ClockIcon size={12} color="var(--color-muted)" />
                    <span>Reposo estimado: {c.recovery_time || "24 a 48h"}</span>
                  </span>
                  <span>ID: <code style={{ color: "var(--color-brand)" }}>{c.slug}</code></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: c.status === "published" ? "rgba(34, 197, 94, 0.12)" : "rgba(194, 155, 56, 0.12)",
                    color: c.status === "published" ? "#22c55e" : "#C29B38",
                    border: `1px solid ${c.status === "published" ? "rgba(34, 197, 94, 0.3)" : "rgba(194, 155, 56, 0.3)"}`,
                  }}
                >
                  {c.status === "published" ? "● Activo en AuraTips" : "○ En Borrador"}
                </span>
                <ChevronRightIcon size={16} color="var(--color-muted)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
