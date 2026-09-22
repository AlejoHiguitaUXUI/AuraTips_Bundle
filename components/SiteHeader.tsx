import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <div className="container">
        {/* Logo */}
        <Link href="/" className="site-logo" aria-label="Aesthetica Care home">
          <span className="site-logo-icon" aria-hidden="true" style={{ background: "linear-gradient(135deg, #20503B, #3B6E57)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            🌿
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>Aesthetica</span>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-muted)" }}>Clinical Care</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/">Procedimientos</Link>

          {user ? (
            <>
              <Link href="/dashboard/learning">Mis Cuidados</Link>
              <Link href="/dashboard/teaching">Panel Clínico</Link>
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
