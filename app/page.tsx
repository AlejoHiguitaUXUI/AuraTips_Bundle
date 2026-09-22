import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";
import { ClinicalSearchBar } from "@/components/ClinicalSearchBar";
import { CLINICAL_PROCEDURES, getProcedureBySlug } from "@/lib/clinical-data";

export const metadata = {
  title: "AuraTips · Acompañamiento Clínico de Recuperación | Dra. Mariana Gómez",
  description:
    "Protocolos médicos paso a paso para tu recuperación estética. Guía experta y supervisión médica de la Dra. Mariana Gómez: tiempos de desinflamación y pautas de cuidado.",
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
          author_name: Array.isArray(c.profiles) ? c.profiles[0]?.display_name : c.profiles?.display_name || spec?.doctor_name || "Dra. Mariana Gómez",
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
        author_name: p.doctor_name || "Dra. Mariana Gómez",
      }));

  const filteredProcedures =
    currentCategory === "Todos"
      ? procedures
      : procedures.filter((p) => p.category.toLowerCase() === currentCategory.toLowerCase());

  const categories = ["Todos", "Inyectables", "Armonización Facial", "Dermoestética", "Bioestimulación"];

  return (
    <>
      {/* Hero Especializado en Acompañamiento Clínico AuraTips */}
      <section className="aesthetic-hero animate-fade-in" aria-labelledby="hero-heading">
        <div className="aesthetic-badge">
          <span>🌿</span> AuraTips · Acompañamiento Clínico de Recuperación
        </div>
        <h1 id="hero-heading">Tu recuperación y cuidado estético, guiados con calidez y rigor médico.</h1>
        <p>
          Protocolos personalizados bajo la dirección de la Dra. Mariana Gómez: líneas de tiempo de desinflamación, pautas recomendadas (qué hacer), acciones a evitar en las primeras 48 horas y signos de observación para tu máxima tranquilidad.
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
                    <span className="metric-label">⏱️ Reposo estimado</span>
                    <span className="metric-value">{proc.recovery_time}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Molestia esperada</span>
                    <span className="metric-value" title={`Nivel ${proc.pain_level} de 5`} style={{ color: "var(--color-brand)" }}>
                      {painMeter} <span style={{ fontSize: "10px", color: "var(--color-muted)" }}>({proc.pain_level}/5)</span>
                    </span>
                  </div>
                </div>

                {/* Footer con Especialista y CTA */}
                <div className="procedure-card-footer">
                  <div className="doctor-avatar-tag">
                    <span style={{ fontSize: "14px" }}>🩺</span>
                    <span>{proc.author_name || "Dra. Mariana Gómez"}</span>
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
                    Ver Protocolo de Cuidados →
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

