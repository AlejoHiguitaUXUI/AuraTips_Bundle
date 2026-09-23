"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setPending(false);

    if (signUpError) {
      if (
        signUpError.message.toLowerCase().includes("already registered") ||
        signUpError.message.toLowerCase().includes("already exists") ||
        signUpError.status === 422
      ) {
        setError("Este correo electrónico ya está registrado.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    router.push("/dashboard/learning");
    router.refresh();
  }

  return (
    <section style={{ maxWidth: 400, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "8px" }}>
        Crear Cuenta Clínica
      </h1>
      <p className="muted" style={{ fontSize: "var(--text-sm)", marginBottom: "20px" }}>
        Crea tu cuenta para acceder a tus pautas de cuidado post-tratamiento, seguimiento diario y contacto clínico con la especialista.
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
        <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" type="submit" disabled={pending} style={{ width: "100%", marginTop: "8px" }}>
          {pending ? "Creando cuenta…" : "Registrarme"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "16px", textAlign: "center" }}>
        ¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>
    </section>
  );
}
