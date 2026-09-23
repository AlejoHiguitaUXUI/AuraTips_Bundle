import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LeafIcon, StethoscopeIcon, UserCheckIcon } from "@/components/icons";

export async function SiteHeader() {
  let user: any = null;
  let isSpecialist = false;
  let clinicalRoleLabel = "Paciente en Cuidados";

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const userEmail = user.email?.toLowerCase() ?? "";
      if (
        userEmail.includes("especialista") ||
        userEmail.includes("doctor") ||
        userEmail.includes("mariana")
      ) {
        isSpecialist = true;
        clinicalRoleLabel = "Dra. Mariana Gómez";
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (
          profile?.display_name?.toLowerCase().includes("dra") ||
          profile?.display_name?.toLowerCase().includes("mariana") ||
          profile?.display_name?.toLowerCase().includes("especialista")
        ) {
          isSpecialist = true;
          clinicalRoleLabel = "Dra. Mariana Gómez";
        }
      }
    }
  } catch (error) {
    console.warn("SiteHeader: Supabase unavailable, rendering guest header state:", error);
  }

  return (
    <header className="site-header">
      <div className="container">
        {/* Logo */}
        <Link href="/" className="site-logo" aria-label="AuraTips — Acompañamiento Clínico de Recuperación">
          <span
            className="site-logo-icon"
            aria-hidden="true"
            style={{
              background: "linear-gradient(135deg, #183C2C, #20503B)",
              color: "#FAF8F5",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(194, 155, 56, 0.4)",
              boxShadow: "0 2px 8px rgba(32, 80, 59, 0.15)",
            }}
          >
            <LeafIcon size={16} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text)", fontSize: "1.05rem" }}>
              AuraTips
            </span>
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                fontWeight: 600,
              }}
            >
              Acompañamiento Clínico
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="site-nav" aria-label="Navegación principal">
          <Link href="/">Procedimientos</Link>

          {user ? (
            <>
              <Link href="/dashboard/learning">Mis Cuidados</Link>
              <Link href="/dashboard/teaching">Dirección Clínica</Link>

              {/* Badge de Rol Clínico */}
              {isSpecialist ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(194, 155, 56, 0.14)",
                    color: "var(--color-gold-text, #997316)",
                    border: "1px solid rgba(194, 155, 56, 0.35)",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                  title="Dirección de Protocolos Clínicos"
                >
                  <StethoscopeIcon size={13} />
                  <span>{clinicalRoleLabel}</span>
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-brand-soft)",
                    color: "var(--color-brand)",
                    border: "1px solid var(--color-brand-border)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  title="Paciente en seguimiento clínico activo"
                >
                  <UserCheckIcon size={13} />
                  <span>{clinicalRoleLabel}</span>
                </span>
              )}

              <span className="site-nav-divider" aria-hidden="true" />
              <Link href="/dashboard/profile" className="btn-ghost btn btn-sm">
                Perfil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <span className="site-nav-divider" aria-hidden="true" />
              <Link href="/login" className="btn-ghost btn btn-sm">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn btn-sm">
                Registrarse
              </Link>
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
