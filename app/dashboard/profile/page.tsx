import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/profile");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return <div className="error">No se pudo cargar tu perfil clínico.</div>;
  }

  return (
    <section style={{ maxWidth: 480 }}>
      <h1>Tu Perfil Clínico</h1>
      <ProfileForm profile={profile} />
    </section>
  );
}
