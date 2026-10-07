"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  StethoscopeIcon,
  ArrowRightIcon,
  ClockIcon,
  ActivityIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/icons";
import { CoverImageUploader } from "@/components/CoverImageUploader";

const CATEGORIES = [
  "Inyectables",
  "Armonización Facial",
  "Corporal y Reducción",
  "Bioestimulación",
  "Dermoestética",
];

const RECOVERY_OPTIONS = [
  "Inmediata (0 horas)",
  "4 a 24 horas",
  "24 a 48 horas",
  "48 a 72 horas",
  "5 a 7 días",
];

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Inyectables");
  const [description, setDescription] = useState("");
  const [recoveryTime, setRecoveryTime] = useState("24 a 48 horas");
  const [painLevel, setPainLevel] = useState(2);
  const [resultsDuration, setResultsDuration] = useState("6 a 12 meses");
  const [coverUrl, setCoverUrl] = useState("");
  const [withDefaultStages, setWithDefaultStages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        description,
        recovery_time: recoveryTime,
        pain_level: Number(painLevel),
        results_duration: resultsDuration,
        cover_url: coverUrl || null,
        with_default_stages: withDefaultStages,
      }),
    });
    const json = await res.json();
    setPending(false);

    if (!res.ok) {
      setError(json.error ?? "No se pudo crear el protocolo clínico.");
      return;
    }

    router.push(`/dashboard/protocolos/${json.course.slug}`);
  }

  return (
    <section style={{ maxWidth: "760px", margin: "0 auto", paddingBottom: "var(--space-8)" }}>
      {/* Navegación y Volver */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href="/dashboard/protocolos"
          className="btn-ghost btn btn-sm"
          style={{ textDecoration: "none", color: "var(--color-brand)" }}
        >
          ← Volver a Dirección Clínica
        </Link>
      </div>

      {/* Header Clínico */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-brand)",
              background: "rgba(32, 80, 59, 0.08)",
              padding: "4px 10px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <StethoscopeIcon size={14} />
            <span>Asistente de Creación · Protocolo Clínico</span>
          </span>
        </div>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          Nuevo Protocolo de Recuperación
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5, margin: 0 }}>
          Registra un procedimiento médico-estético. Podrás definir sus pautas diarias de post-cuidado, checklists interactivos y signos de alarma en AuraTips.
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div
        className="card"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#b91c1c",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Nombre */}
          <div>
            <label
              htmlFor="title"
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Nombre del Procedimiento Clínico *
            </label>
            <input
              id="title"
              data-testid="course-title-input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Rinomodelación sin Cirugía con Ácido Hialurónico"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "15px",
                fontWeight: 600,
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Categoría Médica */}
          <div>
            <label
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Categoría Médica
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected
                        ? "1.5px solid var(--color-brand)"
                        : "1px solid var(--color-border)",
                      background: isSelected ? "var(--color-brand-soft)" : "var(--color-bg)",
                      color: isSelected ? "var(--color-brand)" : "var(--color-muted)",
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Descripción Médica y Resumen
            </label>
            <textarea
              id="description"
              data-testid="course-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objetivo clínico del tratamiento, zonas intervenidas y resumen para la guía del paciente y el motor RAG de AuraTips..."
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "13px",
                lineHeight: 1.5,
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Tiempo de reposo y Nivel de molestia */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label
                style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
              >
                Tiempo de Reposo Estimado
              </label>
              <select
                value={recoveryTime}
                onChange={(e) => setRecoveryTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                }}
              >
                {RECOVERY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="pain_level"
                style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
              >
                Nivel de Molestia (1 = Mínima, 5 = Severa)
              </label>
              <select
                id="pain_level"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                }}
              >
                <option value={1}>1 / 5 · Molestia Mínima (Sin reposo)</option>
                <option value={2}>2 / 5 · Molestia Leve (Tirantez / hormigueo)</option>
                <option value={3}>3 / 5 · Molestia Moderada (Manejable con frío)</option>
                <option value={4}>4 / 5 · Molestia Notable (Analgésico oral)</option>
                <option value={5}>5 / 5 · Molestia Severa (Seguimiento estricto)</option>
              </select>
            </div>
          </div>

          {/* Fotografía Médica / Portada (Subida desde ordenador o galería) */}
          <CoverImageUploader
            coverUrl={coverUrl}
            onChange={setCoverUrl}
            testId="course-cover-input"
          />

          {/* Checkbox inteligente: Estructura clínica base recomendada */}
          <div
            style={{
              background: withDefaultStages ? "rgba(32, 80, 59, 0.08)" : "var(--color-surface-2)",
              border: withDefaultStages ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
            onClick={() => setWithDefaultStages(!withDefaultStages)}
          >
            <input
              type="checkbox"
              id="default_stages_toggle"
              checked={withDefaultStages}
              onChange={(e) => setWithDefaultStages(e.target.checked)}
              style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--color-brand)" }}
            />
            <div>
              <label
                htmlFor="default_stages_toggle"
                style={{ fontWeight: 700, fontSize: "13px", color: "var(--color-text)", cursor: "pointer", display: "block" }}
              >
                Inicializar con estructura clínica base (Recomendado)
              </label>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)", lineHeight: 1.45 }}>
                Genera automáticamente las 3 etapas estándar: <strong>Primeras 24 horas</strong>, <strong>Días 1 a 3</strong> y <strong>Cuidados Preventivos</strong> con recomendaciones clínicas y checklist sugerido para ahorrar tiempo.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ paddingTop: "var(--space-3)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/dashboard/protocolos" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              className="btn-clinical-primary"
              data-testid="course-submit-button"
              type="submit"
              disabled={pending || !title.trim()}
              style={{
                padding: "11px 26px",
              }}
            >
              <span>{pending ? "Creando protocolo…" : "Crear y Abrir en el Editor"}</span>
              {!pending && <ArrowRightIcon size={14} />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

