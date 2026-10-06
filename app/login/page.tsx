"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);

    if (signInError) {
      // Generic message regardless of cause — do not reveal whether the
      // email exists.
      setError("Correo electrónico o contraseña incorrectos.");
      return;
    }

    let next = searchParams.get("next");
    if (!next) {
      const authUser = signInData?.user;
      let isSpecialistUser = false;
      const emailLower = (email || authUser?.email || "").toLowerCase();
      if (
        authUser?.user_metadata?.role === "specialist" ||
        authUser?.user_metadata?.role === "admin" ||
        emailLower.includes("especialista") ||
        emailLower.includes("doctor") ||
        emailLower.includes("mariana")
      ) {
        isSpecialistUser = true;
      } else if (authUser?.id) {
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authUser.id)
            .maybeSingle();
          if (prof?.role === "specialist" || prof?.role === "admin") {
            isSpecialistUser = true;
          }
        } catch {
          // fallback
        }
      }

      next = isSpecialistUser ? "/dashboard/teaching" : "/dashboard/learning";
    }

    router.push(next);
    router.refresh();
  }

  return (
    <section style={{ maxWidth: 400, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
        Iniciar Sesión
      </h1>
      <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", marginBottom: "20px" }}>
        Accede a tus protocolos de recuperación y cuidados clínicos en AuraTips.
      </p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" type="submit" disabled={pending} style={{ width: "100%", marginTop: "8px" }}>
          {pending ? "Iniciando sesión…" : "Ingresar"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "16px", textAlign: "center" }}>
        ¿Aún no tienes cuenta? <Link href="/register">Regístrate aquí</Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
