"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon } from "@/components/icons";

export function EnrollButton({
  courseId,
  courseSlug,
  isSignedIn,
  isOwner,
  isEnrolled,
}: {
  courseId: string;
  courseSlug: string;
  isSignedIn: boolean;
  isOwner: boolean;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  if (isOwner) {
    return <p className="muted">Eres el especialista médico a cargo de este protocolo.</p>;
  }

  if (!isSignedIn) {
    return (
      <p>
        <Link href={`/login?next=/courses/${courseSlug}`} className="btn">
          Iniciar sesión para activar
        </Link>
      </p>
    );
  }

  if (enrolled) {
    return (
      <p style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-brand)", fontWeight: 700 }}>
        <CheckCircle2Icon size={16} />
        <span>Protocolo activo en tu seguimiento</span>
      </p>
    );
  }

  async function enroll() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
      method: "POST",
    });
    setPending(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "No se pudo activar el protocolo.");
      return;
    }
    setEnrolled(true);
    router.refresh();
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button className="btn" onClick={enroll} disabled={pending}>
        {pending ? "Activando…" : "Activar Acompañamiento Clínico"}
      </button>
    </div>
  );
}
