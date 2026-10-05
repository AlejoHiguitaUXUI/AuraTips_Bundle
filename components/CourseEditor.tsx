"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { ModuleEditor } from "@/components/ModuleEditor";
import { CoverImageUploader } from "@/components/CoverImageUploader";
import type { CourseStatus } from "@/lib/database.types";
import {
  CheckCircle2Icon,
  ShieldAlertIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
  ActivityIcon,
  CalendarIcon,
  SyringeIcon,
  SmileIcon,
  SaveIcon,
  XIcon,
} from "@/components/icons";

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

const CATEGORIES = [
  "Inyectables",
  "Armonización Facial",
  "Corporal y Reducción",
  "Dermoestética",
  "Bioestimulación",
  "Cirugía Ambulatoria",
];

const RECOVERY_PRESETS = [
  "Inmediata (Sin reposo)",
  "24 a 48 horas",
  "3 a 5 días",
  "1 a 2 semanas",
  "2 a 4 semanas",
];

const RESULTS_PRESETS = [
  "Inmediato",
  "3 a 6 meses",
  "6 a 12 meses",
  "1 a 2 años",
  "Permanente",
];

const ANESTHESIA_PRESETS = [
  "Sin anestesia",
  "Tópica (Crema anestésica)",
  "Infiltración Local",
  "Crioterapia / Frío local",
  "Sedación Consciente",
];

const PAIN_LEVELS = [
  { level: 1, label: "Mínima", desc: "Prácticamente imperceptible", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  { level: 2, label: "Leve", desc: "Sensibilidad transitoria", color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
  { level: 3, label: "Moderada", desc: "Molestia manejable con analgesia", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  { level: 4, label: "Intensa", desc: "Molestia aguda controlable", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
  { level: 5, label: "Muy Alta", desc: "Dolor que requiere seguimiento", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
];

export function CourseEditor({
  course,
  initialModules,
}: {
  course: Course;
  initialModules: EditableModule[];
}) {
  const router = useRouter();

  // Wizard Step State (1: Ficha Médica, 2: Cronograma, 3: Pautas Clínicas)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [activeFilterModuleId, setActiveFilterModuleId] = useState<string | "all">("all");

  // Form State
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [coverUrl, setCoverUrl] = useState(course.cover_url ?? "");
  const [category, setCategory] = useState(course.category ?? "Inyectables");
  const [recoveryTime, setRecoveryTime] = useState(course.recovery_time ?? "24 a 48 horas");
  const [painLevel, setPainLevel] = useState(course.pain_level ?? 2);
  const [resultsDuration, setResultsDuration] = useState(course.results_duration ?? "6 a 12 meses");
  const [anesthesiaType, setAnesthesiaType] = useState(course.anesthesia_type ?? "Tópica (Crema anestésica)");
  const [alarmSignsText, setAlarmSignsText] = useState(
    Array.isArray(course.alarm_signs) ? course.alarm_signs.join("\n") : ""
  );
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [modules, setModules] = useState<EditableModule[]>(initialModules);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Parse alarm signs for live preview tags
  const alarmSignsList = alarmSignsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  async function saveCourseFields(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setPending(true);
    const supabase = createClient();

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
        alarm_signs: alarmSignsList,
      })
      .eq("id", course.id);

    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
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
        title: `Etapa ${nextPosition + 1}: Fase de Recuperación`,
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
    <section style={{ maxWidth: "1080px", margin: "0 auto", paddingBottom: "var(--space-12)" }}>
      {/* ──────────────────────────────────────────────────────────
          BARRA SUPERIOR: BREADCRUMB & ACCIONES RÁPIDAS
          ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Link
          href="/dashboard/teaching"
          className="btn-ghost btn btn-sm"
          style={{ textDecoration: "none", color: "var(--color-brand)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          ← Volver a Protocolos Clínicos
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="btn-ghost btn btn-sm"
            style={{ textDecoration: "none", color: "var(--color-muted)", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <span>Ver como paciente ↗</span>
          </Link>

          {/* Estado de publicación (Mantiene test IDs para compatibilidad) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-surface)",
              padding: "6px 14px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span
              data-testid="course-status-badge"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: status === "published" ? "#16a34a" : "#C29B38",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "10px" }}>{status === "published" ? "●" : "○"}</span>
              {status === "published" ? "Activo en Clínica" : "En Borrador"}
            </span>

            <button
              type="button"
              data-testid="publish-course-button"
              className="btn btn-sm secondary"
              onClick={togglePublish}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              {status === "published" ? "Pausar" : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* Header del Protocolo */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-brand)",
              background: "rgba(32, 80, 59, 0.08)",
              padding: "3px 8px",
              borderRadius: "4px",
            }}
          >
            Editor Clínico • Especialista
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--color-muted)",
              background: "var(--color-surface-2)",
              padding: "3px 8px",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
            }}
          >
            {category}
          </span>
        </div>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          {title || "Protocolo Clínico"}
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginTop: "4px", marginBottom: 0 }}>
          Configuración guiada del protocolo médico, etapas de recuperación y checklist para el paciente.
        </p>
      </div>

      {/* Banner de Errores o Éxito */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#b91c1c",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-5)",
            fontSize: "14px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {saveSuccess && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(34, 197, 94, 0.1)",
            color: "#15803d",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-5)",
            fontSize: "14px",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2Icon size={18} color="#15803d" />
          <span>Parámetros de la ficha médica guardados exitosamente en AuraTips.</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          WIZARD STEPPER BAR (3 PASOS ENFOCADOS)
          ────────────────────────────────────────────────────────── */}
      <div className="protocol-wizard-stepper">
        {/* Paso 1 */}
        <button
          type="button"
          className={`wizard-step-tab ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="step-number">{currentStep > 1 ? "✓" : "1"}</span>
          <div className="step-info">
            <span className="step-title">1. Ficha Médica</span>
            <span className="step-subtitle">Parámetros y Alertas</span>
          </div>
        </button>

        <div className="step-connector" />

        {/* Paso 2 */}
        <button
          type="button"
          className={`wizard-step-tab ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="step-number">{currentStep > 2 ? "✓" : "2"}</span>
          <div className="step-info">
            <span className="step-title">2. Cronograma</span>
            <span className="step-subtitle">
              {modules.length} {modules.length === 1 ? "Etapa temporal" : "Etapas temporales"}
            </span>
          </div>
        </button>

        <div className="step-connector" />

        {/* Paso 3 */}
        <button
          type="button"
          className={`wizard-step-tab ${currentStep === 3 ? "active" : ""}`}
          onClick={() => setCurrentStep(3)}
        >
          <span className="step-number">3</span>
          <div className="step-info">
            <span className="step-title">3. Pautas Clínicas</span>
            <span className="step-subtitle">
              {totalLessons} {totalLessons === 1 ? "Pauta y Checklist" : "Pautas y Checklist"}
            </span>
          </div>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
          PASO 1: FICHA MÉDICA Y PARÁMETROS CLÍNICOS
          ────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div
          className="card"
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
                Ficha Médica y Parámetros del Procedimiento
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "13px", marginTop: "4px", marginBottom: 0 }}>
                Establece la base clínica que consulta el paciente y que guía el motor de respuestas de AuraTips.
              </p>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-brand)",
                background: "var(--color-brand-soft)",
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              Paso 1 de 3
            </span>
          </div>

          <form onSubmit={saveCourseFields}>
            {/* Nombre del Procedimiento */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="title"
                style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px" }}
              >
                Nombre Oficial del Procedimiento
              </label>
              <input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Hidrolipoclasia Ultrasónica Corporal"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Categoría Médica (Chips Interactivos) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Categoría Médica
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Array.from(new Set([...CATEGORIES, ...(category ? [category] : [])])).map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="clinical-category-btn"
                      style={{
                        border: isSelected ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                        background: isSelected ? "var(--color-brand-soft)" : "var(--color-surface-2)",
                        color: isSelected ? "var(--color-brand)" : "var(--color-text)",
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {isSelected && (
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-brand)" }} />
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descripción Resumen */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="description"
                style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "6px" }}
              >
                Descripción Clínica y Objetivos
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito del tratamiento, zona de aplicación y el enfoque de cuidados postoperatorios..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            {/* Divisor de Sección: Parámetros Clínicos de Recuperación */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "26px 0 18px",
              }}
            >
              <div style={{ height: "1px", flex: 1, background: "var(--color-border)" }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ActivityIcon size={14} color="var(--color-brand)" />
                <span>Parámetros Clínicos y de Recuperación</span>
              </span>
              <div style={{ height: "1px", flex: 1, background: "var(--color-border)" }} />
            </div>

            {/* Tiempo de Recuperación & Anestesia (2 Columnas con Alineación Perfecta y Tarjetas Simétricas) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
                alignItems: "stretch",
              }}
            >
              {/* Columna 1: Tiempo de Recuperación Estimado */}
              <div
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    htmlFor="recovery_time"
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--color-text)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CalendarIcon size={14} color="var(--color-brand)" />
                    <span>Tiempo de Recuperación Estimado</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 500 }}>
                    Fase Postoperatoria
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                  }}
                >
                  <input
                    id="recovery_time"
                    value={recoveryTime}
                    onChange={(e) => setRecoveryTime(e.target.value)}
                    placeholder="ej. 24 a 48 horas"
                    style={{
                      width: "100%",
                      height: "36px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "13px",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {RECOVERY_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRecoveryTime(preset)}
                        className="clinical-preset-btn"
                        style={{
                          border: recoveryTime === preset ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                          background: recoveryTime === preset ? "var(--color-brand-soft)" : "transparent",
                          color: recoveryTime === preset ? "var(--color-brand)" : "var(--color-muted)",
                          fontWeight: recoveryTime === preset ? 700 : 500,
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna 2: Tipo de Anestesia Empleada */}
              <div
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    htmlFor="anesthesia_type"
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--color-text)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <SyringeIcon size={14} color="var(--color-brand)" />
                    <span>Tipo de Anestesia Empleada</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 500 }}>
                    Manejo Clínico
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                  }}
                >
                  <input
                    id="anesthesia_type"
                    value={anesthesiaType}
                    onChange={(e) => setAnesthesiaType(e.target.value)}
                    placeholder="ej. Tópica (Crema anestésica)"
                    style={{
                      width: "100%",
                      height: "36px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "13px",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {ANESTHESIA_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAnesthesiaType(preset)}
                        className="clinical-preset-btn"
                        style={{
                          border: anesthesiaType === preset ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                          background: anesthesiaType === preset ? "var(--color-brand-soft)" : "transparent",
                          color: anesthesiaType === preset ? "var(--color-brand)" : "var(--color-muted)",
                          fontWeight: anesthesiaType === preset ? 700 : 500,
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nivel de Molestia (Escala Visual 1 a 5) */}
            <div style={{ marginBottom: "22px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "24px",
                  marginBottom: "10px",
                }}
              >
                <label
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--color-text)",
                    margin: 0,
                    lineHeight: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <SmileIcon size={14} color="var(--color-brand)" />
                  <span>Nivel de Molestia o Dolor Estimado (Escala Clínica 1 a 5)</span>
                </label>
                <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 500 }}>
                  Sensibilidad percibida
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                {PAIN_LEVELS.map((item) => {
                  const isSelected = Number(painLevel) === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setPainLevel(item.level)}
                      className="clinical-pain-btn"
                      style={{
                        borderRadius: "var(--radius-lg)",
                        border: isSelected ? `2px solid ${item.color}` : "1px solid var(--color-border)",
                        background: isSelected ? item.bg : "var(--color-surface-2)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ fontWeight: 800, fontSize: "15px", color: isSelected ? item.color : "var(--color-text)" }}>
                          Nivel {item.level}
                        </span>
                        {isSelected && <span style={{ color: item.color, fontSize: "12px" }}>●</span>}
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--color-muted)", marginTop: "2px", lineHeight: "1.2" }}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duración de Resultados & Fotografía Médica (2 Columnas con Alineación Perfecta) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
                alignItems: "stretch",
              }}
            >
              {/* Columna 1: Duración Estimada de los Resultados (Card con altura y cabecera simétrica) */}
              <div
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    htmlFor="results_duration"
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--color-text)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ClockIcon size={14} color="var(--color-brand)" />
                    <span>Duración Estimada de los Resultados</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 500 }}>
                    Persistencia
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                  }}
                >
                  <input
                    id="results_duration"
                    value={resultsDuration}
                    onChange={(e) => setResultsDuration(e.target.value)}
                    placeholder="ej. 6 a 12 meses"
                    style={{
                      width: "100%",
                      height: "36px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "13px",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {RESULTS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setResultsDuration(preset)}
                        className="clinical-preset-btn"
                        style={{
                          border: resultsDuration === preset ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                          background: resultsDuration === preset ? "var(--color-brand-soft)" : "transparent",
                          color: resultsDuration === preset ? "var(--color-brand)" : "var(--color-muted)",
                          fontWeight: resultsDuration === preset ? 700 : 500,
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna 2: Fotografía Médica / Portada (Card en CoverImageUploader con altura simétrica) */}
              <div style={{ height: "100%" }}>
                <CoverImageUploader
                  coverUrl={coverUrl}
                  onChange={setCoverUrl}
                  testId="course-cover-input"
                  compact
                />
              </div>
            </div>

            {/* Criterios de Alarma Médica General — WCAG 2.1 AAA Compliant */}
            <div className="clinical-alarm-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlertIcon size={16} color="var(--color-clinical-alarm-icon)" />
                  <label
                    htmlFor="alarm_signs"
                    className="clinical-alarm-title"
                    style={{ margin: 0 }}
                  >
                    Criterios de Alerta Médica General (Uno por línea)
                  </label>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--color-clinical-alarm-text)",
                    background: "rgba(220, 38, 38, 0.12)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px solid var(--color-clinical-alarm-border)",
                  }}
                >
                  {alarmSignsList.length} {alarmSignsList.length === 1 ? "criterio activo" : "criterios activos"}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: "0 0 10px 0" }}>
                Si el paciente reporta 3 o más de estos signos de alarma simultáneos en el chat, AuraTips activa de inmediato el protocolo de emergencia prioritaria.
              </p>
              <textarea
                id="alarm_signs"
                rows={3}
                value={alarmSignsText}
                onChange={(e) => setAlarmSignsText(e.target.value)}
                placeholder="Caída involuntaria del párpado superior&#10;Palidez cutánea violácea o livedo reticularis&#10;Dolor agudo pulsátil no aliviado con analgésicos"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--color-clinical-alarm-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              />

              {alarmSignsList.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {alarmSignsList.map((sign, i) => (
                    <span key={i} className="clinical-alarm-tag">
                      <ShieldAlertIcon size={13} color="var(--color-clinical-alarm-tag-text)" />
                      <span>{sign}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = alarmSignsList.filter((_, idx) => idx !== i).join("\n");
                          setAlarmSignsText(updated);
                        }}
                        aria-label={`Eliminar criterio: ${sign}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: "0 0 0 4px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-clinical-alarm-tag-text)",
                          opacity: 0.7,
                          transition: "opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.7";
                        }}
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Wizard Footer Paso 1 */}
            <div className="wizard-footer-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--color-muted)" }}>
                <CheckCircle2Icon size={15} color="var(--color-brand)" />
                <span>Base clínica verificada para el motor de atención AuraTips</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn secondary"
                  disabled={pending}
                  style={{
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <SaveIcon size={15} />
                  <span>{pending ? "Guardando…" : "Guardar Ficha Médica"}</span>
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await saveCourseFields();
                    setCurrentStep(2);
                  }}
                  style={{
                    backgroundColor: "var(--color-brand)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 700,
                    padding: "10px 22px",
                    boxShadow: "0 2px 8px rgba(32, 80, 59, 0.25)",
                  }}
                >
                  <span>Continuar a Cronograma de Etapas</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          PASO 2: CRONOGRAMA Y ETAPAS DE RECUPERACIÓN (VISTA RESUMEN)
          ────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
                Cronograma Temporal de Recuperación
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "13px", marginTop: "4px", marginBottom: 0 }}>
                Organiza las etapas secuenciales (ej. Primeras 24h, Desinflamación, Mantenimiento) del paciente.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-sm secondary"
              onClick={addModule}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            >
              <PlusIcon size={15} />
              <span>+ Añadir Nueva Etapa</span>
            </button>
          </div>

          {modules.length === 0 ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px dashed var(--color-border)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Sin etapas definidas</h3>
              <p style={{ color: "var(--color-muted)", fontSize: "13px", marginBottom: "16px" }}>
                Añade la primera etapa cronológica para organizar las indicaciones de tu paciente.
              </p>
              <button
                type="button"
                className="btn"
                onClick={addModule}
                style={{ backgroundColor: "var(--color-brand)", color: "#fff" }}
              >
                + Crear Primera Etapa
              </button>
            </div>
          ) : (
            <div>
              {modules.map((m, i) => (
                <ModuleEditor
                  key={m.id}
                  courseId={course.id}
                  module={m}
                  stageIndex={i + 1}
                  viewMode="summary"
                  canMoveUp={i > 0}
                  canMoveDown={i < modules.length - 1}
                  onMove={(direction) => moveModule(m.id, direction)}
                  onSelectForEdit={() => {
                    setActiveFilterModuleId(m.id);
                    setCurrentStep(3);
                  }}
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
          )}

          {/* Wizard Footer Paso 2 */}
          <div className="wizard-footer-bar">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setCurrentStep(1)}
            >
              ← Volver a Ficha Médica
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setActiveFilterModuleId("all");
                setCurrentStep(3);
              }}
              style={{
                backgroundColor: "var(--color-brand)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                padding: "10px 22px",
              }}
            >
              <span>Continuar a Pautas Clínicas (Paso 3)</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          PASO 3: PAUTAS CLÍNICAS, CHECKLIST Y ALERTAS DE SEGURIDAD
          ────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
                Estudio de Pautas Clínicas y Checklist
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "13px", marginTop: "4px", marginBottom: 0 }}>
                Detalla las recomendaciones (DOs), restricciones (DONTs), tareas interactivas y videos explicativos.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-sm secondary"
              onClick={addModule}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <PlusIcon size={14} />
              <span>+ Añadir Etapa</span>
            </button>
          </div>

          {/* Selector / Filtro por Etapa (Para no abrumar al especialista) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "10px",
              marginBottom: "18px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
              Filtrar etapa:
            </span>

            <button
              type="button"
              onClick={() => setActiveFilterModuleId("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: activeFilterModuleId === "all" ? 700 : 500,
                border: activeFilterModuleId === "all" ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                background: activeFilterModuleId === "all" ? "var(--color-brand-soft)" : "var(--color-surface)",
                color: activeFilterModuleId === "all" ? "var(--color-brand)" : "var(--color-text)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Todas las etapas ({totalLessons})
            </button>

            {modules.map((m, idx) => {
              const isSelected = activeFilterModuleId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveFilterModuleId(m.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                    background: isSelected ? "var(--color-brand-soft)" : "var(--color-surface)",
                    color: isSelected ? "var(--color-brand)" : "var(--color-text)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Etapa {idx + 1}: {m.title} ({m.lessons.length})
                </button>
              );
            })}
          </div>

          {/* Lista de Módulos y Pautas en modo Studio */}
          {modules.length === 0 ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px dashed var(--color-border)",
              }}
            >
              <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>
                Primero crea una etapa en el Paso 2 para comenzar a añadir pautas de cuidado.
              </p>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setCurrentStep(2)}
              >
                Ir al Cronograma de Etapas
              </button>
            </div>
          ) : (
            <div>
              {modules
                .filter((m) => activeFilterModuleId === "all" || m.id === activeFilterModuleId)
                .map((m) => {
                  const stageIndex = modules.findIndex((x) => x.id === m.id) + 1;
                  return (
                    <ModuleEditor
                      key={m.id}
                      courseId={course.id}
                      module={m}
                      stageIndex={stageIndex}
                      viewMode="full"
                      canMoveUp={stageIndex > 1}
                      canMoveDown={stageIndex < modules.length}
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
                  );
                })}
            </div>
          )}

          {/* Wizard Footer Paso 3 */}
          <div className="wizard-footer-bar">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setCurrentStep(2)}
            >
              ← Volver al Cronograma
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="btn secondary"
                style={{ textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>Ver Vista Previa Paciente ↗</span>
              </Link>

              <Link
                href="/dashboard/teaching"
                className="btn"
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                }}
              >
                <CheckCircle2Icon size={16} color="#ffffff" />
                <span>Finalizar y Salir</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          ZONA DE SEGURIDAD MÉDICA / ELIMINACIÓN DE PROCEDIMIENTO
          ────────────────────────────────────────────────────────── */}
      <div className="clinical-danger-zone">
        <div>
          <strong className="clinical-danger-badge" style={{ fontSize: "13px" }}>Zona de Seguridad Médica</strong>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
            Eliminar este procedimiento retirará de forma permanente sus pautas clínicas y respuestas del motor AuraTips.
          </p>
        </div>
        <button
          type="button"
          className="btn secondary btn-sm clinical-danger-btn"
          style={{ fontSize: "12px" }}
          onClick={deleteCourse}
          disabled={deleting}
        >
          {deleting ? "Eliminando…" : "Eliminar Procedimiento"}
        </button>
      </div>
    </section>
  );
}
