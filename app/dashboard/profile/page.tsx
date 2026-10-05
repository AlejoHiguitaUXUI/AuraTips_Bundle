import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm, ProfileData } from "@/components/ProfileForm";
import { getClinicalRole } from "@/lib/auth-role";

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
  let notificationPreferences = user.user_metadata?.notification_preferences || { whatsapp: true, email: false };

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      if (profile.display_name) displayName = profile.display_name;
      if (profile.bio) bio = profile.bio;
      if (profile.avatar_url) avatarUrl = profile.avatar_url;
    }
  } catch (err) {
    console.warn("ProfilePage: Supabase profiles fetch error (using fallback):", err);
  }

  const profileData: ProfileData = {
    id: user.id,
    display_name: displayName,
    bio,
    avatar_url: avatarUrl,
    role,
    roleLabel: label,
    phone,
    notification_preferences: notificationPreferences,
  };

  return (
    <section style={{ maxWidth: 560, margin: "0 auto", padding: "var(--space-6) var(--space-4)" }}>
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "4px" }}>
          Tu Perfil Clínico
        </h1>
        <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
          {isSpecialist
            ? "Configuración del perfil profesional y credenciales de Dirección Clínica."
            : "Datos de contacto prioritario para avisos de cuidados post-tratamiento."}
        </p>
      </div>

      <ProfileForm profile={profileData} />
    </section>
  );
}
