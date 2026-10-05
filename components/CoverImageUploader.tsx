"use client";

import { useState, useRef } from "react";
import { CheckCircle2Icon, XIcon, PlusIcon, ImageIcon } from "@/components/icons";

interface CoverImageUploaderProps {
  coverUrl: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  testId?: string;
  compact?: boolean;
}

const CLINICAL_PRESETS = [
  { label: "Hidrolipoclasia", url: "/images/hidrolipoclasia.jpg" },
  { label: "Botox Facial", url: "/images/botox.jpg" },
  { label: "Ácido Hialurónico", url: "/images/lips.jpg" },
  { label: "Rinomodelación", url: "/images/rhino.jpg" },
  { label: "Bioestimulación", url: "/images/bioestimulacion.jpg" },
  { label: "Drenaje Linfático", url: "/images/drenaje-linfatico.jpg" },
  { label: "Dermapen", url: "/images/dermapen.jpg" },
  { label: "Plasma Rico", url: "/images/plasma-facial.jpg" },
];

export function CoverImageUploader({
  coverUrl,
  onChange,
  label = "Fotografía Médica / Portada",
  helperText = "Sube desde tu ordenador (JPG, PNG, WEBP máx. 5MB), galería o URL.",
  testId = "course-cover-input",
  compact = false,
}: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelect(file: File) {
    setUploadError(null);
    setUploadSuccess(false);

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen supera el límite de 5 MB. Elige una imagen más liviana.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo subir la imagen.");
      }

      onChange(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error al subir la imagen desde el ordenador.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  return (
    <div
      style={{
        background: compact ? "var(--color-surface-2)" : "transparent",
        border: compact ? "1px solid var(--color-border)" : "none",
        borderRadius: compact ? "var(--radius-lg)" : 0,
        padding: compact ? "16px" : 0,
        marginBottom: compact ? 0 : "22px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        height: compact ? "100%" : "auto",
      }}
    >
      {/* Label principal y toggles */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "24px",
          marginBottom: compact ? "10px" : "6px",
          flexWrap: "nowrap",
          gap: "8px",
        }}
      >
        <label
          htmlFor="cover_url"
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
          <ImageIcon size={14} color="var(--color-brand)" />
          <span>{label}</span>
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setShowGallery(!showGallery)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-brand)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              lineHeight: "24px",
            }}
          >
            {showGallery ? "Cerrar" : "Galería Clínica"}
          </button>
          <span style={{ color: "var(--color-border)", fontSize: "11px" }}>•</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              lineHeight: "24px",
            }}
          >
            {showUrlInput ? "Cerrar" : "Ingresar URL"}
          </button>
        </div>
      </div>

      {!compact && (
        <p style={{ color: "var(--color-muted)", fontSize: "12px", margin: "0 0 10px 0" }}>
          {helperText}
        </p>
      )}

      {/* Hidden file input para subir desde el ordenador */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onFileInputChange}
        style={{ display: "none" }}
        id="computer-file-upload-input"
      />

      {/* Galería rápida de imágenes clínicas */}
      {showGallery && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Selecciona una imagen médica:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {CLINICAL_PRESETS.map((p) => {
              const isSelected = coverUrl === p.url;
              return (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => {
                    onChange(p.url);
                    setShowGallery(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: isSelected ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                    background: isSelected ? "var(--color-brand-soft)" : "var(--color-surface-2)",
                    color: isSelected ? "var(--color-brand)" : "var(--color-text)",
                    fontSize: "11px",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.label}
                    style={{ width: "18px", height: "18px", borderRadius: "2px", objectFit: "cover" }}
                  />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenedor interactivo de subida / visualización */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: compact
            ? "1px solid var(--color-border)"
            : isDragOver
            ? "2px dashed var(--color-brand)"
            : "1.5px dashed var(--color-border)",
          borderRadius: "6px",
          padding: compact ? "10px 12px" : "16px",
          background: isDragOver ? "var(--color-brand-soft)" : "var(--color-surface)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          gap: compact ? "6px" : "12px",
          minHeight: compact ? "50px" : "auto",
          height: "auto",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Si ya hay portada configurada */}
        {coverUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <div
              style={{
                width: compact ? "56px" : "110px",
                height: compact ? "44px" : "72px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                background: "#000",
                position: "relative",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="Vista previa de portada médica"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    background: "var(--color-brand-soft)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  Activa
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-muted)",
                    maxWidth: compact ? "120px" : "260px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={coverUrl}
                >
                  {coverUrl.split("/").pop() || coverUrl}
                </span>
              </div>
              {!compact && (
                <p style={{ margin: 0, fontSize: "12px", color: "var(--color-muted)" }}>
                  Esta imagen se mostrará en el catálogo y ficha del paciente.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                className="btn secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: compact ? "5px 8px" : "6px 12px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{uploading ? "..." : "Cambiar"}</span>
              </button>

              <button
                type="button"
                className="btn secondary btn-sm clinical-danger-btn"
                onClick={() => onChange("")}
                disabled={uploading}
                aria-label="Quitar fotografía"
                style={{ padding: compact ? "5px 8px" : "6px 10px", fontSize: "11px" }}
              >
                <XIcon size={12} />
              </button>
            </div>
          </div>
        ) : compact ? (
          /* Estado vacío compacto (exactamente 68px de alto) */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "11px", color: "var(--color-text)" }}>
                  Sin fotografía médica
                </p>
                <p style={{ margin: 0, fontSize: "10px", color: "var(--color-muted)" }}>
                  Sube desde tu ordenador
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "11px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                }}
              >
                <PlusIcon size={13} />
                <span>{uploading ? "..." : "Subir"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cuando aún no hay portada (modo expandido) */
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>
                Sube la fotografía médica desde tu ordenador
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
                Arrastra y suelta tu archivo aquí, o haz clic para examinar (JPG, PNG, WEBP máx. 5 MB)
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "#ffffff",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                }}
              >
                <PlusIcon size={16} />
                <span>{uploading ? "Subiendo desde tu equipo..." : "Subir desde el ordenador"}</span>
              </button>

              <button
                type="button"
                className="btn secondary btn-sm"
                onClick={() => setShowGallery(true)}
                style={{ fontSize: "12px" }}
              >
                Elegir de galería
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Input manual de URL con testId */}
        {showUrlInput && (
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginTop: "4px" }}>
            <label
              htmlFor="cover_url"
              style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
            >
              Enlace o ruta de la fotografía (URL):
            </label>
            <input
              id="cover_url"
              data-testid={testId}
              value={coverUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... o /images/hidrolipoclasia.jpg"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "13px",
              }}
            />
          </div>
        )}

      {/* Mensajes de error o éxito — WCAG 2.1 AAA */}
      {uploadError && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 14px",
            borderRadius: "6px",
            background: "var(--color-clinical-alarm-bg)",
            color: "var(--color-clinical-alarm-text)",
            fontSize: "12px",
            border: "1px solid var(--color-clinical-alarm-border)",
          }}
        >
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 14px",
            borderRadius: "6px",
            background: "var(--color-clinical-do-bg)",
            color: "var(--color-clinical-do-text)",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid var(--color-clinical-do-border)",
          }}
        >
          <CheckCircle2Icon size={15} color="var(--color-clinical-do-text)" />
          <span>Fotografía médica subida desde tu ordenador con éxito.</span>
        </div>
      )}
    </div>
  );
}
