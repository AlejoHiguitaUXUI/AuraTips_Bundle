"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

interface ExistingReview {
  id: string;
  rating: number;
  body: string | null;
}

export function ReviewForm({
  courseId,
  existingReview,
}: {
  courseId: string;
  existingReview: ExistingReview | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();

    let saveError;
    if (existingReview) {
      ({ error: saveError } = await supabase
        .from("reviews")
        .update({ rating, body: body || null })
        .eq("id", existingReview.id));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPending(false);
        setError("Debes iniciar sesión para compartir tu testimonio.");
        return;
      }
      ({ error: saveError } = await supabase
        .from("reviews")
        .insert({ user_id: user.id, course_id: courseId, rating, body: body || null }));
    }

    setPending(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!existingReview) return;
    if (!confirm("¿Deseas eliminar tu testimonio?")) return;
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", existingReview.id);
    setPending(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDeleted(true);
    router.refresh();
  }

  if (deleted) return null;

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24, padding: "20px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0" }}>
        {existingReview ? "Editar tu experiencia de recuperación" : "Compartir tu experiencia clínica"}
      </h3>
      {error && <div className="error">{error}</div>}

      <label htmlFor="rating">Calificación de la recuperación</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        <option value={5}>5 estrellas — Excelente acompañamiento</option>
        <option value={4}>4 estrellas — Muy buen acompañamiento</option>
        <option value={3}>3 estrellas — Acompañamiento adecuado</option>
        <option value={2}>2 estrellas — Regular</option>
        <option value={1}>1 estrella — Insatisfecho</option>
      </select>

      <label htmlFor="body">Testimonio o comentario sobre tu proceso (opcional)</label>
      <textarea
        id="body"
        value={body}
        placeholder="Cuéntanos cómo fue tu evolución, inflamación y atención de la Dra. Mariana Gómez..."
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : existingReview ? "Actualizar testimonio" : "Publicar testimonio"}
        </button>
        {existingReview && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleDelete}
            disabled={pending}
          >
            Eliminar testimonio
          </button>
        )}
      </div>
    </form>
  );
}
