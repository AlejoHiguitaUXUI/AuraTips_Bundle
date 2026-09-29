import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/RatingBadge";
import { ClinicalSearchBar } from "@/components/ClinicalSearchBar";
import { CLINICAL_PROCEDURES, getProcedureBySlug } from "@/lib/clinical-data";
import { ClinicalPill } from "@/components/ClinicalPill";
import { filterCourses, getPublishedCourses } from "@/lib/queries";
import {
  LeafIcon,
  ClockIcon,
  ActivityIcon,
  StethoscopeIcon,
  ArrowRightIcon,
  SparklesIcon,
  SyringeIcon,
  SmileIcon,
} from "@/components/icons";

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

  let dbCourses: any[] | null = null;
  try {
    const supabase = await createClient();
    dbCourses = await getPublishedCourses(supabase);
  } catch (err) {
    console.warn("CatalogPage: Supabase query failed, falling back to local clinical data:", err);
  }

  // Conectar con los datos de Supabase y enriquecer con los metadatos clínicos
  const procedures = (dbCourses && dbCourses.length > 0)
    ? dbCourses.map((c) => {
        const spec = getProcedureBySlug(c.slug);
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          category: c.category || spec?.category || "Facial",
          description: c.description || spec?.description || "",
          cover_url: c.cover_url || spec?.cover_url || "/images/botox.jpg",
          recovery_time: c.recovery_time || spec?.recovery_time || "24 a 48 horas",
          pain_level: c.pain_level ?? spec?.pain_level ?? 2,
          results_duration: c.results_duration || spec?.results_duration || "6 a 12 meses",
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

  // Ordenar conforme al catálogo clínico oficial (Facial -> Corporal -> Capilar)
  procedures.sort((a, b) => {
    const idxA = CLINICAL_PROCEDURES.findIndex((p) => p.slug === a.slug);
    const idxB = CLINICAL_PROCEDURES.findIndex((p) => p.slug === b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return 0;
  });

  const filteredProcedures = filterCourses(procedures, {
    category: currentCategory,
  });

  const categories = [
    { name: "Todos", icon: <SparklesIcon size={16} /> },
    { name: "Facial", icon: <SmileIcon size={16} /> },
    { name: "Corporal y Reducción", icon: <ActivityIcon size={16} /> },
    { name: "Capilar", icon: <LeafIcon size={16} /> },
  ];

  return (
    <>
      {/* Hero Especializado en Acompañamiento Clínico AuraTips */}
      <section className="aesthetic-hero animate-fade-in" aria-labelledby="hero-heading">
        <div className="aesthetic-badge">
          <LeafIcon size={14} /> AuraTips · Acompañamiento Clínico de Recuperación
        </div>
        <h1 id="hero-heading">Tu recuperación y cuidado estético, guiados con calidez y rigor médico.</h1>
        <p>
          Protocolos personalizados bajo la dirección de la especialista: líneas de tiempo de desinflamación, pautas recomendadas (qué hacer), acciones a evitar en las primeras 48 horas y signos de observación para tu máxima tranquilidad.
        </p>

        {/* Buscador Clínico RAG & Asistente Semántico */}
        <ClinicalSearchBar />
      </section>

      {/* Selector de Categorías Estilo Mangomint */}
      <nav className="category-filter-bar" aria-label="Filtrar por categoría médica">
        {categories.map((cat) => {
          const isActive = currentCategory.toLowerCase() === cat.name.toLowerCase();
          const href = cat.name === "Todos" ? "/" : `/?category=${encodeURIComponent(cat.name)}`;
          return (
            <ClinicalPill
              key={cat.name}
              href={href}
              icon={cat.icon}
              label={cat.name}
              isActive={isActive}
            />
          );
        })}
      </nav>

      {/* Grid de Procedimientos Clínicos */}
      {filteredProcedures.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-4)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            marginBlock: "var(--space-6)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-full)",
              background: "var(--color-brand-soft)",
              color: "var(--color-brand)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-3)",
            }}
          >
            <LeafIcon size={24} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)" }}>
            No hay procedimientos en esta categoría
          </h3>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", maxWidth: "440px", margin: "0 auto var(--space-4)" }}>
            Actualmente no encontramos protocolos registrados bajo la categoría &ldquo;{currentCategory}&rdquo;.
          </p>
          <Link href="/" className="btn secondary btn-sm" style={{ textDecoration: "none" }}>
            Ver todos los procedimientos
          </Link>
        </div>
      ) : (
        <section
          data-testid="catalog-grid"
          className="catalog-grid stagger animate-slide-up"
          aria-label="Catálogo de procedimientos"
        >
          {filteredProcedures.map((proc) => {
            const painMeter = "●".repeat(proc.pain_level) + "○".repeat(5 - proc.pain_level);

            return (
              <Link
                key={proc.id}
                data-testid="procedure-card"
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
                      <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ClockIcon size={13} /> Reposo estimado
                      </span>
                      <span className="metric-value">{proc.recovery_time}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ActivityIcon size={13} /> Molestia esperada
                      </span>
                      <span className="metric-value" title={`Nivel ${proc.pain_level} de 5`} style={{ color: "var(--color-brand)" }}>
                        {painMeter} <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>({proc.pain_level}/5)</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer con Especialista y CTA */}
                  <div className="procedure-card-footer">
                    <div className="doctor-avatar-tag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <StethoscopeIcon size={14} style={{ color: "var(--color-brand)" }} />
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
                      <span>Ver Protocolo</span>
                      <ArrowRightIcon size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}

