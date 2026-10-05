"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  CheckCircle2Icon,
  UserCheckIcon,
  StethoscopeIcon,
  PhoneIcon,
  BellIcon,
} from "@/components/icons";

export interface ProfileData {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role?: string;
  roleLabel?: string;
  phone?: string | null;
  notification_preferences?: {
    whatsapp?: boolean;
    email?: boolean;
  } | null;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(
    profile.notification_preferences?.whatsapp !== false
  );
  const [notifyEmail, setNotifyEmail] = useState(
    profile.notification_preferences?.email ?? false
  );
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const isSpecialist = profile.role === "specialist" || profile.role === "admin";
  const roleLabel = profile.roleLabel || (isSpecialist ? "Dirección Clínica" : "Paciente en Cuidados");

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
      };

      // Si la columna phone existe, se actualiza; si no, el catch la ignorará
      if (phone) updatePayload.phone = phone;
      updatePayload.notification_preferences = notifPrefs;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatePayload as any)
        .eq("id", profile.id);

      if (updateError) {
        // Si falló por columnas nuevas aún no en caché, actualizar solo los campos base
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
          notification_preferences: notifPrefs,
        },
      });

      setSaved(true);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar tu perfil.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Badge de Rol Clínico */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          borderRadius: "var(--radius-lg)",
          background: isSpecialist ? "rgba(194, 155, 56, 0.12)" : "var(--color-brand-soft)",
          border: isSpecialist
            ? "1px solid rgba(194, 155, 56, 0.35)"
            : "1px solid var(--color-brand-border)",
          width: "fit-content",
        }}
      >
        {isSpecialist ? (
          <StethoscopeIcon size={18} style={{ color: "var(--color-gold-text, #997316)" }} />
        ) : (
          <UserCheckIcon size={18} style={{ color: "var(--color-brand)" }} />
        )}
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            color: isSpecialist ? "var(--color-gold-text, #997316)" : "var(--color-brand)",
          }}
        >
          {roleLabel}
        </span>
      </div>

      {error && <div className="error">{error}</div>}
      {saved && !error && (
        <p
          className="muted"
          style={{
            color: "var(--color-brand)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 600,
          }}
        >
          <CheckCircle2Icon size={16} />
          <span>Perfil actualizado correctamente.</span>
        </p>
      )}

      {/* Nombre */}
      <div>
        <label htmlFor="display_name" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Nombre completo
        </label>
        <input
          id="display_name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ej: Ana María Gómez"
        />
      </div>

      {/* WhatsApp / Teléfono de Contacto Clínico */}
      <div>
        <label
          htmlFor="phone"
          style={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <PhoneIcon size={15} style={{ color: "var(--color-brand)" }} />
          <span>Teléfono / WhatsApp de Contacto Clínico</span>
        </label>
        <p className="muted" style={{ fontSize: "12px", margin: "0 0 6px 0" }}>
          Utilizado por la especialista y el equipo de AuraMed para recordatorios de cuidados y contacto de seguridad.
        </p>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+57 300 123 4567"
        />
      </div>

      {/* Preferencias de Notificación */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <BellIcon size={15} style={{ color: "var(--color-brand)" }} />
          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
            Preferencias de Notificaciones de Cuidado
          </span>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            marginBottom: "8px",
          }}
        >
          <input
            type="checkbox"
            checked={notifyWhatsapp}
            onChange={(e) => setNotifyWhatsapp(e.target.checked)}
          />
          <span>Recibir recordatorios y pautas del día por WhatsApp</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
          }}
        >
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.checked)}
          />
          <span>Recibir resumen de seguimiento por correo electrónico</span>
        </label>
      </div>

      {/* Notas / Bio */}
      <div>
        <label htmlFor="bio" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
          {isSpecialist ? "Reseña profesional y especialidad" : "Notas personales / Observaciones de cuidado"}
        </label>
        <textarea
          id="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={
            isSpecialist
              ? "Médica especialista en armonización facial..."
              : "Observaciones o disponibilidad para contacto..."
          }
        />
      </div>

      {/* Fotografía opcional */}
      <div>
        <label htmlFor="avatar_url" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Fotografía de perfil (URL)
        </label>
        <input
          id="avatar_url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <button className="btn" type="submit" disabled={pending} style={{ marginTop: "var(--space-2)" }}>
        {pending ? "Guardando…" : "Guardar Perfil"}
      </button>
    </form>
  );
}
