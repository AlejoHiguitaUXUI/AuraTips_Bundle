"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StethoscopeIcon, ArrowRightIcon } from "@/components/icons";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
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
        description,
        cover_url: coverUrl,
      }),
    });
    const json = await res.json();
    setPending(false);

    if (!res.ok) {
      setError(json.error ?? "No se pudo crear el protocolo clínico.");
      return;
    }

    router.push(`/dashboard/teaching/${json.course.slug}`);
  }

  return (
    <section style={{ maxWidth: "680px", margin: "0 auto", paddingBottom: "var(--space-8)" }}>
      {/* Navegación y Volver */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href="/dashboard/teaching"
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
              padding: "3px 10px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <StethoscopeIcon size={13} />
            <span>Dirección de Protocolos Clínicos • Especialista</span>
          </span>
        </div>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          Nuevo Protocolo de Recuperación
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5, margin: 0 }}>
          Registra un nuevo procedimiento estético para estructurar sus etapas temporales, pautas de post-cuidado diario y criterios de seguridad en AuraTips.
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
          <div>
            <label
              htmlFor="title"
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Nombre del Procedimiento Clínico
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Toxina Botulínica Facial Integral"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Descripción Clínica y Resumen de Recuperación
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el objetivo del tratamiento, zonas intervenidas y consideraciones generales para el paciente..."
              style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div>
            <label
              htmlFor="cover_url"
              style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px", color: "var(--color-text)" }}
            >
              Fotografía de Referencia / Portada Médica (URL)
            </label>
            <input
              id="cover_url"
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="/images/botox.jpg o URL de imagen médica"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div style={{ paddingTop: "var(--space-2)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/dashboard/teaching" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              className="btn"
              type="submit"
              disabled={pending || !title.trim()}
              style={{
                backgroundColor: "var(--color-brand, #20503b)",
                color: "#ffffff",
                padding: "10px 24px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{pending ? "Creando protocolo…" : "Crear Protocolo (Borrador)"}</span>
              {!pending && <ArrowRightIcon size={14} />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
