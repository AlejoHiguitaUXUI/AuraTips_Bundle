import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";
import { ClinicalSearchBar } from "@/components/ClinicalSearchBar";
import { CLINICAL_PROCEDURES, getProcedureBySlug } from "@/lib/clinical-data";

export const metadata = {
  title: "Aesthetica Care | Educación Médica & Protocolos Post-Procedimiento",
  description: "Guía médica integral y protocolos de recuperación paso a paso para procedimientos de medicina estética.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentCategory = resolvedParams.category || "Todos";

  const supabase = await createClient();

  const { data: dbCourses } = await supabase
    .from("courses")
    .select("id, title, slug, cover_url, description, owner_id, profiles ( display_name )")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Conectar con los datos de Supabase y enriquecer con los metadatos clínicos
  const procedures = (dbCourses && dbCourses.length > 0)
    ? dbCourses.map((c) => {
        const spec = getProcedureBySlug(c.slug);
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          category: spec?.category || "Inyectables",
          description: c.description || spec?.description || "",
          cover_url: c.cover_url || spec?.cover_url || "/images/botox.jpg",
          recovery_time: spec?.recovery_time || "24 a 48 horas",
          pain_level: spec?.pain_level ?? 2,
          results_duration: spec?.results_duration || "6 a 12 meses",
          author_name: Array.isArray(c.profiles) ? c.profiles[0]?.display_name : c.profiles?.display_name || spec?.doctor_name,
        };
      })
    : CLINICAL_PROCEDURES.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        description: p.description,
        cover_url: p.cover_url,
        recovery_time: p.recovery_time,
        pain_level: p.pain_level,
        results_duration: p.results_duration,
        author_name: p.doctor_name,
      }));

  const filteredProcedures =
    currentCategory === "Todos"
      ? procedures
      : procedures.filter((p) => p.category.toLowerCase() === currentCategory.toLowerCase());

  const categories = ["Todos", "Inyectables", "Armonización Facial", "Dermoestética", "Bioestimulación"];

  return (
    <>
      {/* Hero Especializado en Medicina Estética & Cuidados */}
      <section className="aesthetic-hero animate-fade-in" aria-labelledby="hero-heading">
        <div className="aesthetic-badge">
          <span>🌿</span> Centro de Medicina Estética & Cuidados Clínicos
        </div>
        <h1 id="hero-heading">Tu recuperación y cuidado estético, guiado con rigor médico.</h1>
        <p>
          Protocolos paso a paso para el post-tratamiento: líneas de tiempo de desinflamación, qué hacer y evitar en las primeras 48 horas, y signos de alerta para tu máxima seguridad.
        </p>

        {/* Buscador Clínico RAG & Asistente Semántico */}
        <ClinicalSearchBar />
      </section>

      {/* Selector de Categorías */}
      <nav className="category-filter-bar" aria-label="Filtrar por categoría médica">
        {categories.map((cat) => {
          const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
          const href = cat === "Todos" ? "/" : `/?category=${encodeURIComponent(cat)}`;
          return (
            <Link
              key={cat}
              href={href}
              className={`category-chip ${isActive ? "active" : ""}`}
            >
              {cat}
            </Link>
          );
        })}
      </nav>

      {/* Grid de Procedimientos Clínicos */}
      <section className="catalog-grid stagger animate-slide-up" aria-label="Catálogo de procedimientos">
        {filteredProcedures.map((proc) => {
          const painMeter = "●".repeat(proc.pain_level) + "○".repeat(5 - proc.pain_level);

          return (
            <Link
              key={proc.id}
              href={`/courses/${proc.slug}`}
              className="procedure-card"
              aria-label={`Protocolo de ${proc.title}`}
            >
              {/* Thumbnail con Tag de Categoría */}
              <div className="procedure-thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proc.cover_url}
                  alt={proc.title}
                  className="procedure-thumb"
                  loading="lazy"
                />
                <span className="procedure-category-tag">{proc.category}</span>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="procedure-card-body">
                <h2 className="procedure-card-title">{proc.title}</h2>
                <p className="procedure-card-desc">{proc.description}</p>

                {/* Métricas Clínicas Clave */}
                <div className="procedure-metrics">
                  <div className="metric-item">
                    <span className="metric-label">⏱️ Recuperación</span>
                    <span className="metric-value">{proc.recovery_time}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Molestia</span>
                    <span className="metric-value" title={`Nivel ${proc.pain_level} de 5`} style={{ color: "var(--color-brand)" }}>
                      {painMeter} <span style={{ fontSize: "10px", color: "var(--color-muted)" }}>({proc.pain_level}/5)</span>
                    </span>
                  </div>
                </div>

                {/* Footer con Especialista y CTA */}
                <div className="procedure-card-footer">
                  <div className="doctor-avatar-tag">
                    <span style={{ fontSize: "14px" }}>🩺</span>
                    <span>{proc.author_name || "Especialista Certificado"}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Ver Cuidados →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}

