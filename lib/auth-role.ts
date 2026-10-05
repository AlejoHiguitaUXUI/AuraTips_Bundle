import { User } from "@supabase/supabase-js";
import { UserRole } from "./database.types";

/**
 * Resolves the clinical role of a user across database profile, auth metadata, and email fallback.
 */
export async function getClinicalRole(
  supabase: any,
  user: User | null
): Promise<{ role: UserRole; isSpecialist: boolean; label: string }> {
  if (!user) {
    return { role: "patient", isSpecialist: false, label: "Visitante" };
  }

  let role: UserRole = "patient";

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role as UserRole;
    } else if (user.user_metadata?.role) {
      role = user.user_metadata.role as UserRole;
    } else {
      const email = user.email?.toLowerCase() ?? "";
      if (
        email.includes("especialista") ||
        email.includes("doctor") ||
        email.includes("mariana")
      ) {
        role = "specialist";
      }
    }
  } catch (err) {
    // If profiles query fails (offline or schema cache), use metadata or fallback
    if (user.user_metadata?.role) {
      role = user.user_metadata.role as UserRole;
    }
  }

  const isSpecialist = role === "specialist" || role === "admin";
  const label = isSpecialist ? "Dirección Clínica" : "Paciente en Cuidados";

  return { role, isSpecialist, label };
}
