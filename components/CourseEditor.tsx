"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { ModuleEditor } from "@/components/ModuleEditor";
import type { CourseStatus } from "@/lib/database.types";

export interface EditableLesson {
  id: string;
  title: string;
  position: number;
  timeline_tag?: string;
  is_alarm?: boolean;
  care_type?: string;
  body_md: string;
  youtube_url: string;
  dos?: string[];
  donts?: string[];
  checklist_items?: Array<{ id: string; label: string; required?: boolean }> | string[];
  emergency_contacts?: string;
}

export interface EditableModule {
  id: string;
  title: string;
  position: number;
  lessons: EditableLesson[];
}

interface Course {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  status: CourseStatus;
  category?: string | null;
  recovery_time?: string | null;
  pain_level?: number | null;
  results_duration?: string | null;
  anesthesia_type?: string | null;
  alarm_signs?: string[] | null;
}

export function CourseEditor({
  course,
  initialModules,
}: {
  course: Course;
  initialModules: EditableModule[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [coverUrl, setCoverUrl] = useState(course.cover_url ?? "");
  const [category, setCategory] = useState(course.category ?? "Inyectables");
  const [recoveryTime, setRecoveryTime] = useState(course.recovery_time ?? "24 a 48 horas");
  const [painLevel, setPainLevel] = useState(course.pain_level ?? 2);
  const [resultsDuration, setResultsDuration] = useState(course.results_duration ?? "6 a 12 meses");
  const [anesthesiaType, setAnesthesiaType] = useState(course.anesthesia_type ?? "Tópica");
  const [alarmSignsText, setAlarmSignsText] = useState(
    Array.isArray(course.alarm_signs) ? course.alarm_signs.join("\n") : ""
  );
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [modules, setModules] = useState<EditableModule[]>(initialModules);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveCourseFields(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const alarmSigns = alarmSignsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        title,
        description: description || null,
        cover_url: coverUrl || null,
        category,
        recovery_time: recoveryTime,
        pain_level: Number(painLevel),
        results_duration: resultsDuration,
        anesthesia_type: anesthesiaType,
        alarm_signs: alarmSigns,
      })
      .eq("id", course.id);
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  async function togglePublish() {
    setError(null);
    const next = status === "published" ? "draft" : "published";
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("courses")
      .update({ status: next })
      .eq("id", course.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStatus(next);
  }

  async function deleteCourse() {
    if (
      !confirm(
        `¿Eliminar el procedimiento "${course.title}"? Esta acción no se puede deshacer y borrará todas sus etapas y pautas clínicas.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/dashboard/teaching");
    router.refresh();
  }

  async function moveModule(id: string, direction: -1 | 1) {
    const index = modules.findIndex((m) => m.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= modules.length) {
      return;
    }
    const a = modules[index];
    const b = modules[targetIndex];

    const supabase = createClient();
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("modules").update({ position: b.position }).eq("id", a.id),
      supabase.from("modules").update({ position: a.position }).eq("id", b.id),
    ]);
    if (err1 || err2) {
      setError((err1 ?? err2)?.message ?? "No se pudieron reordenar las etapas.");
      return;
    }

    const reordered = modules.slice();
    reordered[index] = { ...b, position: a.position };
    reordered[targetIndex] = { ...a, position: b.position };
    reordered.sort((x, y) => x.position - y.position);
    setModules(reordered);
  }

  async function addModule() {
    const supabase = createClient();
    const nextPosition = modules.length;
    const { data, error: insertError } = await supabase
      .from("modules")
      .insert({
        course_id: course.id,
        title: "Nueva Etapa de Recuperación",
        position: nextPosition,
      })
      .select("id, title, position")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "No se pudo agregar la etapa.");
      return;
    }
    setModules((prev) => [...prev, { ...data, lessons: [] }]);
  }

  return (
    <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Barra superior de navegación */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href="/dashboard/teaching"
          className="btn-ghost btn btn-sm"
          style={{ textDecoration: "none", color: "var(--color-brand)" }}
        >
          ← Volver a Procedimientos Clínicos
        </Link>
      </div>

      {/* Header del Protocolo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                background: "rgba(32, 80, 59, 0.08)",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              Dra. Mariana Gómez • Especialista Responsable
            </span>
          </div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            {title || "Protocolo Clínico"}
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
            Configuración de parámetros médicos, pautas de recuperación y signos de alarma en AuraTips
          </p>
        </div>

        {/* Estado de publicación */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--color-surface)",
            padding: "8px 16px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: status === "published" ? "#22c55e" : "#C29B38",
              }}
            >
              {status === "published" ? "● Activo en Clínica" : "○ En Borrador"}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm secondary"
            onClick={togglePublish}
          >
            {status === "published" ? "Pausar" : "Publicar"}
          </button>
        </div>
      </div>

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

      {/* Formulario de Parámetros Clínicos del Procedimiento */}
      <div
        className="card"
        style={{
          marginBottom: 28,
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-5)",
        }}
      >
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "16px" }}>
          1. Parámetros Médicos del Procedimiento
        </h2>

        <form onSubmit={saveCourseFields}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="title" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Nombre del Procedimiento
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Toxina Botulínica Facial Integral"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="description" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Descripción Clínica y Resumen
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen del tratamiento para el paciente y para el motor RAG de AuraTips..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label htmlFor="category" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Categoría Médica
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              >
                <option value="Inyectables">Inyectables</option>
                <option value="Armonización Facial">Armonización Facial</option>
                <option value="Dermoestética">Dermoestética</option>
                <option value="Bioestimulación">Bioestimulación</option>
              </select>
            </div>
            <div>
              <label htmlFor="recovery_time" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Tiempo de Recuperación Estimado
              </label>
              <input
                id="recovery_time"
                value={recoveryTime}
                placeholder="ej. 24 a 48 horas"
                onChange={(e) => setRecoveryTime(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label htmlFor="pain_level" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Nivel de Molestia (Escala 1 a 5)
              </label>
              <input
                id="pain_level"
                type="number"
                min={1}
                max={5}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
            <div>
              <label htmlFor="results_duration" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Duración de Resultados
              </label>
              <input
                id="results_duration"
                value={resultsDuration}
                placeholder="ej. 4 a 6 meses"
                onChange={(e) => setResultsDuration(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
            <div>
              <label htmlFor="anesthesia_type" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Tipo de Anestesia
              </label>
              <input
                id="anesthesia_type"
                value={anesthesiaType}
                placeholder="ej. Crioterapia / Tópica"
                onChange={(e) => setAnesthesiaType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="cover_url" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Fotografía Médica / Portada (URL)
            </label>
            <input
              id="cover_url"
              type="text"
              value={coverUrl}
              placeholder="/images/botox.jpg o URL externa"
              onChange={(e) => setCoverUrl(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="alarm_signs" style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Criterios de Alarma Médica (Uno por línea — Si coinciden 3 o más criterios simultáneos, AuraTips activa atención prioritaria)
            </label>
            <textarea
              id="alarm_signs"
              rows={3}
              value={alarmSignsText}
              placeholder="Caída involuntaria del párpado superior&#10;Palidez cutánea violácea en zona tratada&#10;Dolor agudo pulsátil no controlado"
              onChange={(e) => setAlarmSignsText(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "13px" }}
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={pending}
            style={{
              backgroundColor: "var(--color-brand, #20503b)",
              color: "#ffffff",
              padding: "10px 24px",
              fontWeight: 700,
            }}
          >
            {pending ? "Guardando cambios…" : "Guardar Parámetros del Procedimiento"}
          </button>
        </form>
      </div>

      {/* Sección 2: Etapas de Recuperación y Pautas Clínicas */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
              2. Etapas de Recuperación y Protocolos Diarios
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "13px", margin: "4px 0 0" }}>
              Define qué debe hacer y qué debe evitar el paciente en cada fase temporal (Día 0, 1–3, 4–14).
            </p>
          </div>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={addModule}
          >
            + Nueva Etapa de Recuperación
          </button>
        </div>

        {modules.map((m, i) => (
          <ModuleEditor
            key={m.id}
            courseId={course.id}
            module={m}
            canMoveUp={i > 0}
            canMoveDown={i < modules.length - 1}
            onMove={(direction) => moveModule(m.id, direction)}
            onModuleChange={(updated) =>
              setModules((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x)),
              )
            }
            onModuleDeleted={(id) =>
              setModules((prev) => prev.filter((x) => x.id !== id))
            }
          />
        ))}
      </div>

      {/* Zona de peligro / Eliminación */}
      <div
        style={{
          marginTop: 40,
          borderTop: "1px solid var(--color-border)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong style={{ color: "#ef4444", fontSize: "14px" }}>Zona de Seguridad Médica</strong>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
            Eliminar este procedimiento retirará sus protocolos del motor RAG de AuraTips.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          style={{ background: "#dc2626", color: "#ffffff", borderColor: "#dc2626", fontSize: "13px" }}
          onClick={deleteCourse}
          disabled={deleting}
        >
          {deleting ? "Eliminando…" : "Eliminar Procedimiento"}
        </button>
      </div>
    </section>
  );
}
