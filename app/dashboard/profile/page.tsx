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
    return <div className="error">Could not load your profile.</div>;
  }

  return (
    <section style={{ maxWidth: 480 }}>
      <h1>Your profile</h1>
      <ProfileForm profile={profile} />
    </section>
  );
}
