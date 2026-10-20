import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CLINICAL_PROCEDURES, getProcedureBySlug } from "@/lib/clinical-data";
import { filterCourses, getPublishedCourses } from "@/lib/queries";
import { ClinicalPill } from "@/components/ClinicalPill";
import { getClinicalRole } from "@/lib/auth-role";
import { ProcedureCatalog, ProcedureItem } from "@/components/ProcedureCatalog";
import { getSiteUrl } from "@/lib/site-url";
import {
  LeafIcon,
  ActivityIcon,
  SparklesIcon,
  SmileIcon,
  ShieldCheckIcon,
  MessageCircleIcon,
} from "@/components/icons";

type ProcedimientosPageProps = {
  searchParams?: Promise<{ category?: string; proc?: string; selected?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProcedimientosPageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {};
  const procSlug = resolvedParams.proc || resolvedParams.selected;

  if (procSlug) {
    const localProc = getProcedureBySlug(procSlug);
    let title = localProc?.title;
    let description = localProc?.description;
    let coverUrl = localProc?.cover_url;
    let canonicalSlug = localProc?.slug || procSlug;

    if (!localProc) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("courses")
          .select("title, description, cover_url, slug")
          .eq("slug", procSlug)
          .maybeSingle();
        if (data) {
          title = data.title;
          description = data.description ?? undefined;
          coverUrl = data.cover_url ?? undefined;
          canonicalSlug = data.slug;
        }

      } catch {
        // fallback
      }
    }

    if (title) {
      const cleanDesc =
        description && description.length >= 50
          ? description.slice(0, 160)
          : `Ficha clínica informativa, tiempos de recuperación y cuidados post-tratamiento de ${title} en AuraMed por la Dra. Mariana Gómez.`;

      return {
        title: `${title} · Cuidados y Recuperación | AuraMed`,
        description: cleanDesc,
        alternates: {
          canonical: `/procedimientos?proc=${encodeURIComponent(canonicalSlug)}`,
        },
        openGraph: {
          title: `${title} · AuraMed & AuraTips`,
          description: cleanDesc,
          url: `/procedimientos?proc=${encodeURIComponent(canonicalSlug)}`,
          images: coverUrl
            ? [{ url: coverUrl, width: 1200, height: 630, alt: title }]
            : [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
        },
      };
    }
  }

  return {
    title: "Procedimientos de Medicina Estética · AuraMed Grupo Estético",
    description:
      "Descubre los tratamientos médicos de vanguardia de AuraMed: beneficios estéticos, tiempos de reposo esperados y pautas informativas bajo supervisión de la Dra. Mariana Gómez.",
    alternates: {
      canonical: "/procedimientos",
    },
    openGraph: {
      title: "Procedimientos de Medicina Estética · AuraMed & AuraTips",
      description:
        "Explora nuestros tratamientos estéticos faciales, corporales y capilares con tiempos de recuperación y supervisión médica especializada.",
      url: "/procedimientos",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function ProcedimientosPage({
  searchParams,
}: ProcedimientosPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentCategory = resolvedParams.category || "Todos";
  const initialSelectedSlug = resolvedParams.proc || resolvedParams.selected || undefined;


  let dbCourses: any[] | null = null;
  let isSpecialist = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const roleInfo = await getClinicalRole(supabase, user);
    isSpecialist = roleInfo.isSpecialist;

    dbCourses = await getPublishedCourses(supabase);
  } catch (err) {
    console.warn("ProcedimientosPage: Supabase query failed, falling back to local clinical data:", err);
  }

  // Mapear procedimientos y enriquecer con datos clínicos
  const rawProcedures: ProcedureItem[] = (dbCourses && dbCourses.length > 0)
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
          duration_minutes: c.duration_minutes ?? spec?.duration_minutes ?? 30,
          anesthesia_type: c.anesthesia_type || spec?.anesthesia_type || "Tópica / Frío local",
          author_name: Array.isArray(c.profiles)
            ? c.profiles[0]?.display_name
            : c.profiles?.display_name || spec?.doctor_name || "Dra. Mariana Gómez",
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
        duration_minutes: p.duration_minutes,
        anesthesia_type: p.anesthesia_type,
        author_name: p.doctor_name || "Dra. Mariana Gómez",
      }));

  // Filtrar estrictamente cualquier protocolo de testing automatizado / playwright
  const procedures = rawProcedures.filter(
    (p) =>
      !p.title.toLowerCase().includes("playwright") &&
      !p.slug.toLowerCase().includes("playwright")
  );

  procedures.sort((a, b) => {
    const idxA = CLINICAL_PROCEDURES.findIndex((p) => p.slug === a.slug);
    const idxB = CLINICAL_PROCEDURES.findIndex((p) => p.slug === b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return 0;
  });

  const filteredProcedures = filterCourses(procedures, {
    category: currentCategory,
  }) as ProcedureItem[];

  const categories = [
    { name: "Todos", icon: <SparklesIcon size={16} /> },
    { name: "Facial", icon: <SmileIcon size={16} /> },
    { name: "Corporal y Reducción", icon: <ActivityIcon size={16} /> },
    { name: "Capilar", icon: <LeafIcon size={16} /> },
  ];

  const siteUrl = getSiteUrl();
  const activeProc = initialSelectedSlug
    ? procedures.find(
        (p) => p.slug.toLowerCase() === initialSelectedSlug.toLowerCase()
      )
    : undefined;

  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...(activeProc
        ? [
            {
              "@type": "MedicalProcedure",
              "@id": `${siteUrl}/procedimientos?proc=${encodeURIComponent(activeProc.slug)}#procedure`,
              name: activeProc.title,
              description: activeProc.description,
              image: activeProc.cover_url.startsWith("http")
                ? activeProc.cover_url
                : `${siteUrl}${activeProc.cover_url}`,
              procedureType: "https://schema.org/TherapeuticProcedure",
              bodyLocation: activeProc.category,
              followup: activeProc.recovery_time,
              performer: {
                "@type": "Physician",
                name: activeProc.author_name || "Dra. Mariana Gómez",
                jobTitle: "Médica Especialista en Medicina Estética",
              },
              publisher: {
                "@type": "MedicalClinic",
                name: "AuraTips · By AuraMed Grupo Estético",
                url: siteUrl,
              },
            },
          ]
        : []),
      {
        "@type": "ItemList",
        name: "Catálogo de Procedimientos de Medicina Estética — AuraMed",
        numberOfItems: procedures.length,
        itemListElement: procedures.map((proc, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${siteUrl}/procedimientos?proc=${encodeURIComponent(proc.slug)}`,
          item: {
            "@type": "MedicalProcedure",
            name: proc.title,
            description: proc.description,
            image: proc.cover_url.startsWith("http")
              ? proc.cover_url
              : `${siteUrl}${proc.cover_url}`,
            procedureType: "https://schema.org/TherapeuticProcedure",
            followup: proc.recovery_time,
          },
        })),
      },
    ],
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-12)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      {/* Encabezado Editorial "Conoce otros procedimientos" (Con Vidrio Esmerilado Frosted Glass & Alto Contraste) */}
      <section
        className="glass-panel"
        style={{
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8) var(--space-6)",
          marginBottom: "var(--space-8)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "780px" }}>
          {/* Chip amarillo "AuraMed Grupo Estético" eliminado según requerimiento (redundante con el logo del header) */}

          <h1
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              lineHeight: 1.15,
              marginBottom: "var(--space-3)",
            }}
          >
            Conoce otros procedimientos
            <span className="sr-only">
              {" "}— Tratamientos de Medicina Estética Facial, Corporal y Capilar en AuraMed
            </span>
          </h1>

          <p
            style={{
              fontSize: "var(--text-base)",
              color: "var(--color-text-2)",
              fontWeight: 500,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Explora nuestros tratamientos médicos de vanguardia. Conoce sus beneficios estéticos, los tiempos de reposo esperados y el protocolo integral de cuidados post-tratamiento que recibirás en AuraTips para asegurar resultados armónicos y seguros.
          </p>
        </div>

        {/* Banner Sutil de Consulta AuraMed */}
        <div
          style={{
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-5)",
            borderTop: "1px solid rgba(194, 155, 56, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "var(--text-sm)", display: "block" }}>
                Supervisión Médica Especializada
              </strong>
              <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                Dirigido por la Dra. Mariana Gómez · Medicina Estética Facial y Corporal
              </span>
            </div>
          </div>

          <a
            href="https://wa.me/573001234567?text=Hola,%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20los%20procedimientos%20de%20AuraMed"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            <MessageCircleIcon size={14} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Selector de Categorías Médicas */}
      <nav className="category-filter-bar" aria-label="Filtrar por categoría médica">
        {categories.map((cat) => {
          const isActive = currentCategory.toLowerCase() === cat.name.toLowerCase();
          const href =
            cat.name === "Todos"
              ? "/procedimientos"
              : `/procedimientos?category=${encodeURIComponent(cat.name)}`;
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

      {/* Grid de Tarjetas de Procedimientos con Pop-up Informativo */}
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
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: "0 0 8px" }}>
            No hay procedimientos en esta categoría
          </h3>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
            Actualmente no hay protocolos bajo la categoría &ldquo;{currentCategory}&rdquo;.
          </p>
          <Link href="/procedimientos" className="btn secondary btn-sm" style={{ textDecoration: "none" }}>
            Ver todos los procedimientos
          </Link>
        </div>
      ) : (
        <Suspense fallback={null}>
          <ProcedureCatalog
            procedures={filteredProcedures}
            isSpecialist={isSpecialist}
            initialSelectedSlug={initialSelectedSlug}
          />
        </Suspense>
      )}
    </div>
  );
}

