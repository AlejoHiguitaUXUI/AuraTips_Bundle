import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm, ProfileData } from "@/components/ProfileForm";
import { getClinicalRole } from "@/lib/auth-role";
import { ArrowRightIcon } from "@/components/icons";

export const metadata = {
  title: "Tu Perfil Clínico · AuraTips",
  description: "Administra tus datos de contacto clínico, preferencias de avisos y seguimiento.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/profile");
  }

  const { role, isSpecialist, label } = await getClinicalRole(supabase, user);

  let displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuario";
  let bio = "";
  let avatarUrl = "";
  let phone = user.user_metadata?.phone || "";
  let medicalLicense = user.user_metadata?.medical_license || (isSpecialist ? "RM-482910-ANT" : "");
  let notificationPreferences = user.user_metadata?.notification_preferences || { whatsapp: true, email: false };

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url, phone, notification_preferences, medical_license")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      if (profile.display_name) displayName = profile.display_name;
      if (profile.bio) bio = profile.bio;
      if (profile.avatar_url) avatarUrl = profile.avatar_url;
      if (profile.phone) phone = profile.phone;
      if (profile.medical_license) medicalLicense = profile.medical_license;
      if (profile.notification_preferences) notificationPreferences = profile.notification_preferences;
    }
  } catch (err) {
    console.warn("ProfilePage: Supabase profiles fetch error (using fallback):", err);
  }

  const profileData: ProfileData = {
    id: user.id,
    email: user.email || "",
    display_name: displayName,
    bio,
    avatar_url: avatarUrl,
    role,
    roleLabel: label,
    phone,
    medical_license: medicalLicense,
    notification_preferences: notificationPreferences,
  };

  const backHref = isSpecialist ? "/dashboard/protocolos" : "/dashboard/learning";
  const backLabel = isSpecialist ? "← Volver al Centro de Mando" : "← Volver a Mis Cuidados Activos";

  return (
    <section className="animate-fade-in" style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-6) var(--space-4) var(--space-12)" }}>
      {/* Navegación Contextual Superior */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href={backHref}
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--color-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color var(--dur-fast)",
          }}
        >
          <span>{backLabel}</span>
        </Link>
      </div>

      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            marginBottom: "6px",
            color: "var(--color-text)",
            lineHeight: 1.2,
          }}
        >
          Tu Perfil Clínico
        </h1>
        <p className="muted" style={{ fontSize: "var(--text-sm)", margin: 0, lineHeight: 1.5 }}>
          {isSpecialist
            ? "Gestión de tu identidad profesional médica, credenciales de Dirección Clínica y canales de contacto oficial."
            : "Datos de contacto prioritario y canales seguros para el seguimiento de tu recuperación médica."}
        </p>
      </div>

      <ProfileForm profile={profileData} />
    </section>
  );
}
