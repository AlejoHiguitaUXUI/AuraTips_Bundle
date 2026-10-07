"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import {
  CheckCircle2Icon,
  UserCheckIcon,
  StethoscopeIcon,
  PhoneIcon,
  BellIcon,
  CameraIcon,
  MailIcon,
  SaveIcon,
  XIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  MessageCircleIcon,
} from "@/components/icons";

export interface ProfileData {
  id: string;
  email?: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role?: string;
  roleLabel?: string;
  phone?: string | null;
  medical_license?: string | null;
  notification_preferences?: {
    whatsapp?: boolean;
    email?: boolean;
  } | null;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [medicalLicense, setMedicalLicense] = useState(profile.medical_license || "");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(
    profile.notification_preferences?.whatsapp !== false
  );
  const [notifyEmail, setNotifyEmail] = useState(
    profile.notification_preferences?.email ?? false
  );
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);

  // Form submission state
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const isSpecialist = profile.role === "specialist" || profile.role === "admin";
  const roleLabel = profile.roleLabel || (isSpecialist ? "Dirección Clínica" : "Paciente en Cuidados Activos");

  // Initials generator for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "AT";
    const cleaned = name.replace(/^(Dra\.|Dr\.|Lic\.)\s*/i, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "AT";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  async function handleAvatarFileSelect(file: File) {
    setAvatarUploadError(null);
    setAvatarUploadSuccess(false);

    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP o GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError("La imagen supera el límite máximo de 5 MB.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo subir la fotografía.");
      }

      setAvatarUrl(data.url);
      setAvatarImageError(false);
      setAvatarUploadSuccess(true);
      setTimeout(() => setAvatarUploadSuccess(false), 3500);
    } catch (err: any) {
      setAvatarUploadError(err.message || "Error al subir la fotografía de perfil.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarFileSelect(file);
    }
  }

  function handleAvatarDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOverAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleAvatarFileSelect(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);

    const supabase = createClient();
    const notifPrefs = { whatsapp: notifyWhatsapp, email: notifyEmail };

    try {
      // 1. Intentar actualizar tabla profiles
      const updatePayload: Record<string, any> = {
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        phone: phone || null,
        notification_preferences: notifPrefs,
      };

      if (isSpecialist && medicalLicense) {
        updatePayload.medical_license = medicalLicense;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatePayload as any)
        .eq("id", profile.id);

      if (updateError) {
        // Fallback si alguna columna aún no está en caché de Supabase
        await supabase
          .from("profiles")
          .update({
            display_name: displayName,
            bio: bio || null,
            avatar_url: avatarUrl || null,
          })
          .eq("id", profile.id);
      }

      // 2. Persistir siempre en auth user_metadata para disponibilidad inmediata
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          full_name: displayName,
          phone: phone || null,
          medical_license: isSpecialist ? (medicalLicense || null) : null,
          notification_preferences: notifPrefs,
          avatar_url: avatarUrl || null,
        },
      });

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 4500);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar tu perfil.");
    } finally {
      setPending(false);
    }
  }

  const backHref = isSpecialist ? "/dashboard/protocolos" : "/dashboard/learning";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 1. TARJETA HERO: FOTOGRAFÍA DE PERFIL Y RESUMEN CLÍNICO */}
      <section
        className="glass-card"
        style={{
          borderRadius: "var(--radius-xl, 20px)",
          padding: "var(--space-6) var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow sutil en la esquina superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "160px",
            height: "160px",
            background: isSpecialist
              ? "radial-gradient(circle at 100% 0%, rgba(194, 155, 56, 0.15) 0%, transparent 70%)"
              : "radial-gradient(circle at 100% 0%, rgba(32, 80, 59, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
            flexWrap: "wrap",
          }}
        >
          {/* Contenedor del Avatar con Soporte Drag-and-Drop */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverAvatar(true);
              }}
              onDragLeave={() => setIsDragOverAvatar(false)}
              onDrop={handleAvatarDrop}
              onClick={() => fileInputRef.current?.click()}
              title="Haz clic para subir una foto desde tu equipo o arrástrala aquí"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                padding: "3px",
                background: isSpecialist
                  ? "linear-gradient(135deg, rgba(194, 155, 56, 0.9), rgba(24, 60, 44, 0.7))"
                  : "linear-gradient(135deg, rgba(32, 80, 59, 0.85), rgba(194, 155, 56, 0.6))",
                boxShadow: isSpecialist
                  ? "0 8px 24px rgba(194, 155, 56, 0.25), 0 2px 8px rgba(0,0,0,0.12)"
                  : "0 8px 24px rgba(32, 80, 59, 0.20), 0 2px 8px rgba(0,0,0,0.12)",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                transform: isDragOverAvatar ? "scale(1.05)" : "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {avatarUrl && !avatarImageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName || "Fotografía de perfil"}
                    onError={() => setAvatarImageError(true)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #183C2C, #20503B)",
                      color: "#FAF8F5",
                      fontWeight: 800,
                      fontSize: "28px",
                      letterSpacing: "0.02em",
                      fontFamily: "var(--font-serif, Georgia, serif)",
                    }}
                  >
                    {getInitials(displayName)}
                  </div>
                )}

                {/* Overlay de carga */}
                {uploadingAvatar && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.65)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: 700,
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2.5px solid rgba(255, 255, 255, 0.3)",
                        borderTopColor: "#FFFFFF",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span>Subiendo...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón flotante de cámara para subir o cambiar foto */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Subir o cambiar fotografía de perfil"
              title={avatarUrl ? "Cambiar foto de perfil" : "Subir fotografía de perfil"}
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "var(--color-brand)",
                color: "#FFFFFF",
                border: "2.5px solid rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
                transition: "transform 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <CameraIcon size={15} />
            </button>
          </div>

          {/* Información del usuario y acciones rápidas de foto */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              {/* Badge Principal de Rol */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  background: isSpecialist ? "rgba(194, 155, 56, 0.14)" : "rgba(32, 80, 59, 0.14)",
                  color: isSpecialist ? "var(--color-gold-text, #997316)" : "var(--color-brand)",
                  border: isSpecialist ? "1px solid rgba(194, 155, 56, 0.35)" : "1px solid var(--color-brand-border)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {isSpecialist ? <StethoscopeIcon size={13} /> : <UserCheckIcon size={13} />}
                <span>{roleLabel}</span>
              </span>

              {/* Tag de Registro Médico si es especialista */}
              {isSpecialist && medicalLicense && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(194, 155, 56, 0.10)",
                    border: "1px solid var(--card-glass-border)",
                    color: "var(--color-gold-text, #997316)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                  title="Licencia Médica Oficial"
                >
                  {medicalLicense}
                </span>
              )}
            </div>

            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--color-text)",
                margin: "0 0 4px 0",
                lineHeight: 1.25,
              }}
            >
              {displayName || "Usuario AuraMed"}
            </h2>

            {profile.email && (
              <p
                style={{
                  margin: avatarUrl ? "0 0 6px 0" : "0",
                  fontSize: "13px",
                  color: "var(--color-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MailIcon size={13} />
                <span>{profile.email}</span>
                <span
                  style={{
                    display: "inline-block",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                  title="Cuenta activa y verificada"
                />
              </p>
            )}

            {/* Opción para quitar foto si existe */}
            {avatarUrl && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl("");
                    setAvatarImageError(false);
                  }}
                  disabled={uploadingAvatar}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--color-clinical-alarm-text, #ef4444)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: 0.85,
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
                  title="Quitar fotografía y volver a las iniciales"
                >
                  <XIcon size={12} />
                  <span>Quitar foto</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Oculto de Archivos para Selección desde el Ordenador */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={onFileInputChange}
          style={{ display: "none" }}
          id="profile-avatar-file-input"
        />

        {/* Mensajes de feedback para avatar */}
        {avatarUploadError && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-clinical-alarm-bg)",
              border: "1px solid var(--color-clinical-alarm-border)",
              color: "var(--color-clinical-alarm-text)",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <ShieldAlertIcon size={14} />
            <span>{avatarUploadError}</span>
          </div>
        )}

        {avatarUploadSuccess && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-clinical-do-bg)",
              border: "1px solid var(--color-clinical-do-border)",
              color: "var(--color-clinical-do-text)",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <CheckCircle2Icon size={14} />
            <span>Fotografía de perfil actualizada con éxito desde tu dispositivo.</span>
          </div>
        )}
      </section>

      {/* 2. TARJETA: IDENTIDAD Y CREDENCIALES PROFESIONALES */}
      <section
        className="glass-card"
        style={{
          borderRadius: "var(--radius-xl, 20px)",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--card-glass-border)", paddingBottom: "12px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "var(--glass-subcard-active, rgba(32, 80, 59, 0.12))",
              color: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <UserCheckIcon size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
              Identidad y Credenciales de la Cuenta
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
              Datos principales visibles en la plataforma y comunicaciones clínicas.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {/* Nombre completo */}
          <div>
            <label htmlFor="display_name" style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "6px" }}>
              Nombre completo <span style={{ color: "var(--color-gold)" }}>*</span>
            </label>
            <input
              id="display_name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Dra. Mariana Gómez"
              style={{ margin: 0 }}
            />
          </div>

          {/* Correo electrónico (protegido / solo lectura informativa) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label htmlFor="account_email" style={{ fontWeight: 600, fontSize: "13px", margin: 0 }}>
                Correo electrónico
              </label>
              <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 500 }}>
                (Identificador de acceso)
              </span>
            </div>
            <input
              id="account_email"
              type="email"
              readOnly
              disabled
              value={profile.email || "No disponible"}
              style={{
                margin: 0,
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                color: "var(--color-muted)",
                cursor: "not-allowed",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid var(--card-glass-border)",
              }}
            />
          </div>

          {/* Registro Médico / Licencia (solo especialista) */}
          {isSpecialist && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="medical_license" style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Registro Médico / Licencia Profesional
              </label>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "var(--color-muted)" }}>
                Identificación profesional visible en la dirección de protocolos y prescripción de cuidados.
              </p>
              <input
                id="medical_license"
                value={medicalLicense}
                onChange={(e) => setMedicalLicense(e.target.value)}
                placeholder="Ej: RM-482910-ANT"
                style={{ margin: 0 }}
              />
            </div>
          )}
        </div>

        {/* Reseña Profesional / Biografía Médica */}
        <div>
          <label htmlFor="bio" style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "4px" }}>
            {isSpecialist ? "Reseña profesional y especialidad médica" : "Notas personales / Observaciones de salud"}
          </label>
          <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "var(--color-muted)" }}>
            {isSpecialist
              ? "Describe tu enfoque clínico, trayectoria y áreas de especialización estética."
              : "Observaciones personales relevantes para el acompañamiento y cuidados post-procedimiento."}
          </p>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              isSpecialist
                ? "Médica Especialista en Medicina Estética Facial y Armonización. Directora de Protocolos Clínicos en AuraTips & AuraMed."
                : "Preferencias de horarios, sensibilidad dérmica o antecedentes de cuidado..."
            }
            style={{ margin: 0, minHeight: "90px" }}
          />
        </div>
      </section>

      {/* 3. TARJETA: CANALES DE CONTACTO CLÍNICO & NOTIFICACIONES */}
      <section
        className="glass-card"
        style={{
          borderRadius: "var(--radius-xl, 20px)",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--card-glass-border)", paddingBottom: "12px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "var(--glass-subcard-active, rgba(32, 80, 59, 0.12))",
              color: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <PhoneIcon size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
              Canales de Contacto Directo & Avisos de Seguridad
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
              Garantiza la recepción oportuna de alertas de cuidado y recordatorios diarios.
            </p>
          </div>
        </div>

        {/* Teléfono / WhatsApp */}
        <div>
          <label
            htmlFor="phone"
            style={{
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <span>Teléfono / WhatsApp de Contacto Clínico</span>
          </label>
          <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: "0 0 6px 0" }}>
            Canal directo para confirmación de pautas, evolución post-tratamiento y contacto prioritario.
          </p>
          <div style={{ position: "relative" }}>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 310 987 6543"
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Preferencias de Notificaciones en Bento Cards Interactivas */}
        <div>
          <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--color-text)", display: "block", marginBottom: "8px" }}>
            Canales de Notificación Activos
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            {/* Opción WhatsApp */}
            <div
              onClick={() => setNotifyWhatsapp(!notifyWhatsapp)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "var(--radius-lg)",
                border: notifyWhatsapp
                  ? "1.5px solid var(--color-brand)"
                  : "1px solid var(--card-glass-border)",
                background: notifyWhatsapp
                  ? "var(--glass-subcard-active, rgba(32, 80, 59, 0.12))"
                  : "var(--glass-subcard-bg, rgba(250, 248, 245, 0.32))",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                cursor: "pointer",
                transition: "all var(--dur-fast)",
              }}
            >
              <input
                type="checkbox"
                id="notify_whatsapp"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "18px",
                  height: "18px",
                  margin: "2px 0 0 0",
                  accentColor: "var(--color-brand)",
                  cursor: "pointer",
                }}
              />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "13px", color: "var(--color-text)", display: "block", lineHeight: 1.3 }}>
                  Alertas y pautas por WhatsApp
                </strong>
                <span style={{ fontSize: "11.5px", color: "var(--color-muted)", display: "block", marginTop: "3px", lineHeight: 1.4 }}>
                  Recordatorios inmediatos sobre aplicación de frío, medicación y signos de alarma.
                </span>
              </div>
            </div>

            {/* Opción Email */}
            <div
              onClick={() => setNotifyEmail(!notifyEmail)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "var(--radius-lg)",
                border: notifyEmail
                  ? "1.5px solid var(--color-gold, #C29B38)"
                  : "1px solid var(--card-glass-border)",
                background: notifyEmail
                  ? "var(--glass-subcard-active, rgba(194, 155, 56, 0.12))"
                  : "var(--glass-subcard-bg, rgba(250, 248, 245, 0.32))",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                cursor: "pointer",
                transition: "all var(--dur-fast)",
              }}
            >
              <input
                type="checkbox"
                id="notify_email"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "18px",
                  height: "18px",
                  margin: "2px 0 0 0",
                  accentColor: "#997316",
                  cursor: "pointer",
                }}
              />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "13px", color: "var(--color-text)", display: "block", lineHeight: 1.3 }}>
                  Resumen por correo electrónico
                </strong>
                <span style={{ fontSize: "11.5px", color: "var(--color-muted)", display: "block", marginTop: "3px", lineHeight: 1.4 }}>
                  Dossier completo de seguimiento y confirmación de protocolos clínicos.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEEDBACK Y BARRA DE ACCIÓN PRINCIPAL */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-clinical-alarm-bg)",
            border: "1px solid var(--color-clinical-alarm-border)",
            color: "var(--color-clinical-alarm-text)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <ShieldAlertIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {saved && !error && (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-clinical-do-bg)",
            border: "1px solid var(--color-clinical-do-border)",
            color: "var(--color-clinical-do-text)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <CheckCircle2Icon size={16} />
          <span>Tu perfil clínico ha sido actualizado y guardado correctamente.</span>
        </div>
      )}

      {/* Botonera de Guardado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          paddingTop: "var(--space-2)",
        }}
      >
        <Link
          href={backHref}
          className="btn secondary"
          style={{ textDecoration: "none", fontSize: "13px" }}
        >
          Descartar cambios
        </Link>

        <button
          className="btn"
          type="submit"
          disabled={pending || uploadingAvatar}
          style={{
            fontSize: "14px",
            fontWeight: 700,
            padding: "11px 24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <SaveIcon size={15} />
          <span>{pending ? "Guardando perfil…" : "Guardar Cambios del Perfil"}</span>
        </button>
      </div>
    </form>
  );
}

