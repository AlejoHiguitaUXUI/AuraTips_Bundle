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
        <Link href="/" className="site-logo" aria-label="Course Platform home">
          <span className="site-logo-icon" aria-hidden="true">
            C
          </span>
          <span>LearnFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/">Catalog</Link>

          {user ? (
            <>
              <Link href="/dashboard/learning">My learning</Link>
              <Link href="/dashboard/teaching">Teaching</Link>
              <span className="site-nav-divider" aria-hidden="true" />
              <Link href="/dashboard/profile" className="btn-ghost btn btn-sm">
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <span className="site-nav-divider" aria-hidden="true" />
              <Link href="/login" className="btn-ghost btn btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-sm">
                Sign up
              </Link>
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
