"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { isValidYouTubeUrl, youTubeEmbedUrl } from "@/lib/youtube";
import type { EditableLesson } from "@/components/CourseEditor";
import {
  ShieldAlertIcon,
  CheckCircle2Icon,
  BanIcon,
  PlusIcon,
  XIcon,
  PhoneIcon,
  ClipboardCheckIcon,
  VideoIcon,
  SparklesIcon,
} from "@/components/icons";

type CareTabType = "dos_donts" | "checklist" | "sos" | "detailed";

export function LessonEditor({
  lesson,
  canMoveUp,
  canMoveDown,
  onMove,
  onLessonChange,
  onLessonDeleted,
}: {
  lesson: EditableLesson;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onLessonChange: (updated: EditableLesson) => void;
  onLessonDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [timelineTag, setTimelineTag] = useState(lesson.timeline_tag || "Día 0");
  const [isAlarm, setIsAlarm] = useState(Boolean(lesson.is_alarm));
  const [careType, setCareType] = useState(lesson.care_type || "general");
  const [bodyMd, setBodyMd] = useState(lesson.body_md || "");
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url || "");

  // Internal Focused Tab
  const [activeTab, setActiveTab] = useState<CareTabType>("dos_donts");

  // DOs state (tag list + new input + raw toggle)
  const initialDos = Array.isArray(lesson.dos)
    ? lesson.dos.filter(Boolean)
    : [];
  const [dosList, setDosList] = useState<string[]>(initialDos);
  const [newDoInput, setNewDoInput] = useState("");
  const [rawDosMode, setRawDosMode] = useState(false);
  const [rawDosText, setRawDosText] = useState(initialDos.join("\n"));

  // DONTs state (tag list + new input + raw toggle)
  const initialDonts = Array.isArray(lesson.donts)
    ? lesson.donts.filter(Boolean)
    : [];
  const [dontsList, setDontsList] = useState<string[]>(initialDonts);
  const [newDontInput, setNewDontInput] = useState("");
  const [rawDontsMode, setRawDontsMode] = useState(false);
  const [rawDontsText, setRawDontsText] = useState(initialDonts.join("\n"));

  // Checklist state
  const initialChecklist: string[] = Array.isArray(lesson.checklist_items)
    ? lesson.checklist_items
        .map((it) => (typeof it === "string" ? it : it.label || ""))
        .filter(Boolean)
    : [];
  const [checklist, setChecklist] = useState<string[]>(initialChecklist);
  const [newChecklistInput, setNewChecklistInput] = useState("");
  const [rawChecklistMode, setRawChecklistMode] = useState(false);
  const [rawChecklistText, setRawChecklistText] = useState(initialChecklist.join("\n"));

  const [emergencyContacts, setEmergencyContacts] = useState(lesson.emergency_contacts || "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Synchronize raw texts when switching back from raw mode or on updates
  function addDoItem(text: string) {
    const val = text.trim();
    if (!val) return;
    const next = [...dosList, val];
    setDosList(next);
    setRawDosText(next.join("\n"));
    setNewDoInput("");
  }

  function removeDoItem(idx: number) {
    const next = dosList.filter((_, i) => i !== idx);
    setDosList(next);
    setRawDosText(next.join("\n"));
  }

  function handleRawDosChange(text: string) {
    setRawDosText(text);
    const parsed = text.split("\n").map((s) => s.trim()).filter(Boolean);
    setDosList(parsed);
  }

  function addDontItem(text: string) {
    const val = text.trim();
    if (!val) return;
    const next = [...dontsList, val];
    setDontsList(next);
    setRawDontsText(next.join("\n"));
    setNewDontInput("");
  }

  function removeDontItem(idx: number) {
    const next = dontsList.filter((_, i) => i !== idx);
    setDontsList(next);
    setRawDontsText(next.join("\n"));
  }

  function handleRawDontsChange(text: string) {
    setRawDontsText(text);
    const parsed = text.split("\n").map((s) => s.trim()).filter(Boolean);
    setDontsList(parsed);
  }

  function addChecklistItem(text: string) {
    const val = text.trim();
    if (!val) return;
    const next = [...checklist, val];
    setChecklist(next);
    setRawChecklistText(next.join("\n"));
    setNewChecklistInput("");
  }

  function removeChecklistItem(idx: number) {
    const next = checklist.filter((_, i) => i !== idx);
    setChecklist(next);
    setRawChecklistText(next.join("\n"));
  }

  function handleRawChecklistChange(text: string) {
    setRawChecklistText(text);
    const parsed = text.split("\n").map((s) => s.trim()).filter(Boolean);
    setChecklist(parsed);
  }

  async function save() {
    setError(null);
    setSaved(false);

    const trimmedUrl = youtubeUrl.trim();
    if (trimmedUrl && !isValidYouTubeUrl(trimmedUrl)) {
      setError("El enlace no corresponde a un video válido de YouTube.");
      return;
    }

    setPending(true);
    const supabase = createClient();

    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        title,
        timeline_tag: timelineTag,
        is_alarm: isAlarm,
        care_type: careType,
      })
      .eq("id", lesson.id);

    if (lessonError) {
      setPending(false);
      setError(lessonError.message);
      return;
    }

    const parsedChecklist = checklist.map((label, idx) => ({
      id: `chk-${lesson.id}-${idx + 1}`,
      label,
      required: true,
    }));

    const { error: contentError } = await supabase
      .from("lesson_contents")
      .upsert(
        {
          lesson_id: lesson.id,
          body_md: bodyMd || null,
          youtube_url: trimmedUrl || null,
          dos: dosList,
          donts: dontsList,
          checklist_items: parsedChecklist,
          emergency_contacts: emergencyContacts || "",
        },
        { onConflict: "lesson_id" }
      );

    setPending(false);

    if (contentError) {
      setError(contentError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 4000);

    onLessonChange({
      ...lesson,
      title,
      timeline_tag: timelineTag,
      is_alarm: isAlarm,
      care_type: careType,
      body_md: bodyMd,
      youtube_url: trimmedUrl,
      dos: dosList,
      donts: dontsList,
      checklist_items: parsedChecklist,
      emergency_contacts: emergencyContacts,
    });
  }

  async function deleteLesson() {
    if (!confirm(`¿Eliminar la pauta de cuidado "${lesson.title}"?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onLessonDeleted(lesson.id);
  }

  const validEmbedUrl = youtubeUrl.trim() && isValidYouTubeUrl(youtubeUrl.trim())
    ? youTubeEmbedUrl(youtubeUrl.trim())
    : null;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-surface)",
        marginBottom: "var(--space-4)",
        boxShadow: "var(--shadow-xs)",
        borderLeft: isAlarm ? "4px solid #ef4444" : "4px solid var(--color-brand)",
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Header colapsable y barra de control */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          padding: "14px 18px",
          background: isExpanded ? "var(--color-surface-2)" : "var(--color-surface)",
          borderBottom: isExpanded ? "1px solid var(--color-border)" : "none",
          cursor: "pointer",
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== "BUTTON") {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          <button
            type="button"
            className="btn-ghost btn btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Colapsar pauta: ${title}` : `Expandir pauta: ${title}`}
            style={{ padding: "4px 8px", fontSize: "11px" }}
          >
            <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
          </button>

          <strong style={{ fontSize: "15px", color: "var(--color-text)", fontWeight: 700 }}>
            {title || "Pauta de cuidado sin título"}
          </strong>

          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "rgba(32, 80, 59, 0.08)",
              color: "var(--color-brand)",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            {timelineTag || "Día 0"}
          </span>

          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
              textTransform: "capitalize",
            }}
          >
            {careType}
          </span>

          {isAlarm && (
            <span
              className="clinical-alarm-tag"
              style={{
                fontSize: "11px",
                padding: "2px 8px",
              }}
            >
              <ShieldAlertIcon size={12} color="var(--color-clinical-alarm-tag-text)" />
              <span>Criterio SOS</span>
            </span>
          )}

          {/* Guidelines count summary when collapsed */}
          {!isExpanded && (
            <span style={{ fontSize: "12px", color: "var(--color-muted)", marginLeft: "auto" }}>
              {dosList.length} DOs • {dontsList.length} DONTs • {checklist.length} tareas
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label="Mover pauta arriba"
            style={{ padding: "4px 8px" }}
          >
            ↑
          </button>
          <button
            type="button"
            className="btn secondary btn-sm"
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label="Mover pauta abajo"
            style={{ padding: "4px 8px" }}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Cuerpo expandible */}
      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Sub-cabecera rápida: Título y Momento Temporal */}
          <div
            style={{
              padding: "16px 20px 14px",
              background: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
              display: "grid",
              gridTemplateColumns: "2.2fr 1fr 1fr",
              gap: "14px",
            }}
          >
            <div>
              <label
                htmlFor={`lesson-title-${lesson.id}`}
                style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
              >
                Título de la Pauta / Protocolo
              </label>
              <input
                id={`lesson-title-${lesson.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Postura de reposo y aplicación de compresas"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`lesson-timeline-${lesson.id}`}
                style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
              >
                Momento Temporal
              </label>
              <input
                id={`lesson-timeline-${lesson.id}`}
                value={timelineTag}
                onChange={(e) => setTimelineTag(e.target.value)}
                placeholder="Día 0 / Días 1-3"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`lesson-caretype-${lesson.id}`}
                style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
              >
                Tipo de Cuidado
              </label>
              <select
                id={`lesson-caretype-${lesson.id}`}
                value={careType}
                onChange={(e) => setCareType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                }}
              >
                <option value="general">General</option>
                <option value="higiene">Higiene</option>
                <option value="medicacion">Medicación / Analgesia</option>
                <option value="alarma">Signo de Alarma</option>
              </select>
            </div>
          </div>

          {/* Mensajes de Estado (Error / Guardado) */}
          {error && (
            <div
              className="clinical-alarm-box"
              style={{
                margin: "12px 20px 0",
                padding: "10px 14px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {saved && (
            <div
              style={{
                margin: "12px 20px 0",
                padding: "8px 14px",
                background: "rgba(34, 197, 94, 0.1)",
                color: "#15803d",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2Icon size={16} color="#15803d" />
              <span>Pauta clínica guardada y sincronizada exitosamente.</span>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              PESTAÑAS DE EDICIÓN ENFOCADA (DESMENUZADO DE BLOQUES)
              ────────────────────────────────────────────────────────── */}
          <div className="care-guideline-tabs" style={{ marginTop: "4px" }}>
            <button
              type="button"
              className={`care-tab-btn ${activeTab === "dos_donts" ? "active" : ""}`}
              onClick={() => setActiveTab("dos_donts")}
            >
              <SparklesIcon size={14} />
              <span>Recomendaciones & Restricciones</span>
              <span className={`care-tab-badge ${dosList.length + dontsList.length > 0 ? "highlight" : ""}`}>
                {dosList.length + dontsList.length}
              </span>
            </button>

            <button
              type="button"
              className={`care-tab-btn ${activeTab === "checklist" ? "active" : ""}`}
              onClick={() => setActiveTab("checklist")}
            >
              <ClipboardCheckIcon size={14} />
              <span>Checklist Paciente</span>
              <span className={`care-tab-badge ${checklist.length > 0 ? "highlight" : ""}`}>
                {checklist.length}
              </span>
            </button>

            <button
              type="button"
              className={`care-tab-btn ${activeTab === "sos" ? "sos-active" : ""}`}
              onClick={() => setActiveTab("sos")}
            >
              <ShieldAlertIcon size={14} color={isAlarm ? "var(--color-clinical-alarm-icon)" : "currentColor"} />
              <span>Alerta SOS & Guardia</span>
              {isAlarm && <span className="care-tab-badge danger">SOS Activo</span>}
            </button>

            <button
              type="button"
              className={`care-tab-btn ${activeTab === "detailed" ? "active" : ""}`}
              onClick={() => setActiveTab("detailed")}
            >
              <VideoIcon size={14} />
              <span>Instrucciones & Video</span>
              {(bodyMd || youtubeUrl) && (
                <span className="care-tab-badge highlight">Configurado</span>
              )}
            </button>
          </div>

          {/* Contenido según la Pestaña Activa */}
          <div style={{ padding: "18px 20px" }}>
            {/* PESTAÑA 1: DOs & DONTs (Semáforo Clínico) */}
            {activeTab === "dos_donts" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* PANEL DOs (Recomendaciones) */}
                <div
                  className="clinical-dos-box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="clinical-dos-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2Icon size={14} color="var(--color-clinical-do-text)" />
                      Pautas Recomendadas (Qué hacer)
                    </span>
                    <button
                      type="button"
                      onClick={() => setRawDosMode(!rawDosMode)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "11px",
                        color: "var(--color-muted)",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {rawDosMode ? "Modo Interactivo" : "Pegar varias líneas"}
                    </button>
                  </div>

                  {rawDosMode ? (
                    <textarea
                      rows={4}
                      value={rawDosText}
                      onChange={(e) => handleRawDosChange(e.target.value)}
                      placeholder="Dormir con cabeza ligeramente elevada&#10;Aplicar compresa fría seca por 10 min&#10;Consumir abundante agua"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-clinical-do-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontSize: "12px",
                      }}
                    />
                  ) : (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "36px" }}>
                        {dosList.length === 0 ? (
                          <span style={{ fontSize: "12px", color: "var(--color-muted)", fontStyle: "italic" }}>
                            Sin pautas agregadas aún.
                          </span>
                        ) : (
                          dosList.map((item, idx) => (
                            <span
                              key={idx}
                              className="clinical-dos-tag"
                            >
                              <span>✓ {item}</span>
                              <button
                                type="button"
                                onClick={() => removeDoItem(idx)}
                                aria-label={`Eliminar pauta: ${item}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "0",
                                  display: "inline-flex",
                                  color: "inherit",
                                }}
                              >
                                <XIcon size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          value={newDoInput}
                          onChange={(e) => setNewDoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addDoItem(newDoInput);
                            }
                          }}
                          placeholder="+ Añadir recomendación clínica (Enter)..."
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-clinical-do-border)",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            fontSize: "12px",
                          }}
                        />
                        <button
                          type="button"
                          className="btn secondary btn-sm"
                          onClick={() => addDoItem(newDoInput)}
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* PANEL DONTs (Restricciones) */}
                <div
                  className="clinical-donts-box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="clinical-donts-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <BanIcon size={14} color="var(--color-clinical-dont-text)" />
                      Acciones a Evitar (Restricciones)
                    </span>
                    <button
                      type="button"
                      onClick={() => setRawDontsMode(!rawDontsMode)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "11px",
                        color: "var(--color-muted)",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {rawDontsMode ? "Modo Interactivo" : "Pegar varias líneas"}
                    </button>
                  </div>

                  {rawDontsMode ? (
                    <textarea
                      rows={4}
                      value={rawDontsText}
                      onChange={(e) => handleRawDontsChange(e.target.value)}
                      placeholder="No frotar ni masajear la zona&#10;No realizar actividad física de alto impacto&#10;Evitar saunas o exposición al sol"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-clinical-dont-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontSize: "12px",
                      }}
                    />
                  ) : (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "36px" }}>
                        {dontsList.length === 0 ? (
                          <span style={{ fontSize: "12px", color: "var(--color-muted)", fontStyle: "italic" }}>
                            Sin restricciones agregadas aún.
                          </span>
                        ) : (
                          dontsList.map((item, idx) => (
                            <span
                              key={idx}
                              className="clinical-donts-tag"
                            >
                              <span>✕ {item}</span>
                              <button
                                type="button"
                                onClick={() => removeDontItem(idx)}
                                aria-label={`Eliminar restricción: ${item}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "0",
                                  display: "inline-flex",
                                  color: "inherit",
                                }}
                              >
                                <XIcon size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          value={newDontInput}
                          onChange={(e) => setNewDontInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addDontItem(newDontInput);
                            }
                          }}
                          placeholder="+ Añadir restricción clínica (Enter)..."
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-clinical-dont-border)",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            fontSize: "12px",
                          }}
                        />
                        <button
                          type="button"
                          className="btn secondary btn-sm"
                          onClick={() => addDontItem(newDontInput)}
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: CHECKLIST DEL PACIENTE */}
            {activeTab === "checklist" && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", display: "block" }}>
                      Checklist Interactivo del Paciente
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                      Tareas puntuales que el paciente marcará como cumplidas en su rutina post-tratamiento.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRawChecklistMode(!rawChecklistMode)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "11px",
                      color: "var(--color-muted)",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {rawChecklistMode ? "Modo Interactivo" : "Pegar varias líneas"}
                  </button>
                </div>

                {rawChecklistMode ? (
                  <textarea
                    rows={4}
                    value={rawChecklistText}
                    onChange={(e) => handleRawChecklistChange(e.target.value)}
                    placeholder="Aplicar frío local 10 min&#10;Tomar medicación recetada&#10;Lavar con limpiador suave"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "12px",
                    }}
                  />
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {checklist.length === 0 ? (
                        <span style={{ fontSize: "12px", color: "var(--color-muted)", fontStyle: "italic", padding: "8px 0" }}>
                          Sin tareas en el checklist aún. Agrega la primera abajo.
                        </span>
                      ) : (
                        checklist.map((task, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              background: "var(--color-surface)",
                              border: "1px solid var(--color-border)",
                              fontSize: "13px",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ width: "16px", height: "16px", border: "1.5px solid var(--color-brand)", borderRadius: "4px" }} />
                              <span>{task}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeChecklistItem(idx)}
                              aria-label={`Eliminar tarea: ${task}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "2px",
                                color: "var(--color-muted)",
                              }}
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <input
                        value={newChecklistInput}
                        onChange={(e) => setNewChecklistInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addChecklistItem(newChecklistInput);
                          }
                        }}
                        placeholder="+ Agregar tarea al checklist del paciente (Enter)..."
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--color-border)",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        type="button"
                        className="btn secondary btn-sm"
                        onClick={() => addChecklistItem(newChecklistInput)}
                        style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}
                      >
                        + Añadir
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PESTAÑA 3: ALERTA SOS & CONTACTO DE EMERGENCIA */}
            {activeTab === "sos" && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-lg)",
                  background: isAlarm ? "var(--color-clinical-alarm-bg)" : "var(--color-surface-2)",
                  border: isAlarm ? "1.5px solid var(--color-clinical-alarm-border)" : "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isAlarm}
                        onChange={(e) => setIsAlarm(e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--color-clinical-alarm-icon)" }}
                      />
                      <span style={{ fontWeight: 700, color: isAlarm ? "var(--color-clinical-alarm-text)" : "inherit" }}>
                        Activar como Criterio de Alerta Médica (SOS)
                      </span>
                    </label>
                    <p style={{ margin: "4px 0 0 28px", fontSize: "12px", color: "var(--color-muted)" }}>
                      Al activarse, AuraTips destacará esta pauta con señalización prioritaria roja en el panel del paciente y en el chat clínico.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "260px" }}>
                    <PhoneIcon size={15} color="var(--color-muted)" />
                    <label htmlFor={`lesson-sos-${lesson.id}`} style={{ fontSize: "12px", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                      Línea de Guardia:
                    </label>
                    <input
                      id={`lesson-sos-${lesson.id}`}
                      value={emergencyContacts}
                      onChange={(e) => setEmergencyContacts(e.target.value)}
                      placeholder="+57 300 912 3456"
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: INSTRUCCIONES DETALLADAS & VIDEO */}
            {activeTab === "detailed" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    htmlFor={`lesson-body-${lesson.id}`}
                    style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "6px" }}
                  >
                    Instrucciones Clínicas Detalladas (Markdown para lectura o audio)
                  </label>
                  <textarea
                    id={`lesson-body-${lesson.id}`}
                    rows={7}
                    value={bodyMd}
                    onChange={(e) => setBodyMd(e.target.value)}
                    placeholder="Explicación fisiológica, cuidados específicos al dormir o higienizar..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "12px",
                      lineHeight: "1.5",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`lesson-youtube-${lesson.id}`}
                    style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "6px" }}
                  >
                    Video Guía de YouTube (URL)
                  </label>
                  <input
                    id={`lesson-youtube-${lesson.id}`}
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  />

                  {/* Live Video Preview Box */}
                  {validEmbedUrl ? (
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                        overflow: "hidden",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: "#000",
                      }}
                    >
                      <iframe
                        src={validEmbedUrl}
                        title="Vista previa del video explicativo"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "140px",
                        borderRadius: "8px",
                        border: "1px dashed var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-muted)",
                        fontSize: "12px",
                        background: "var(--color-surface-2)",
                        textAlign: "center",
                        padding: "12px",
                      }}
                    >
                      Pega un enlace de YouTube para ver aquí el reproductor de video en vivo.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Barra de Acciones de la Pauta */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              background: "var(--color-surface-2)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <button
              type="button"
              className="btn btn-sm"
              onClick={save}
              disabled={pending}
              style={{
                backgroundColor: "var(--color-brand)",
                color: "#ffffff",
                padding: "8px 22px",
                fontWeight: 700,
              }}
            >
              {pending ? "Guardando..." : "Guardar Pauta Clínica"}
            </button>

            <button
              type="button"
              className="btn secondary btn-sm clinical-danger-btn"
              onClick={deleteLesson}
              style={{ fontSize: "12px" }}
            >
              Eliminar Pauta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
