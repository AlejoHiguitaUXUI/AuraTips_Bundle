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
        setError("You must be signed in to review.");
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
    if (!confirm("Delete your review?")) return;
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
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 16 }}>
      <h3>{existingReview ? "Edit your review" : "Leave a review"}</h3>
      {error && <div className="error">{error}</div>}

      <label htmlFor="rating">Rating</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} — {"★".repeat(n)}
            {"☆".repeat(5 - n)}
          </option>
        ))}
      </select>

      <label htmlFor="body">Review (optional)</label>
      <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} />

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : existingReview ? "Update review" : "Submit review"}
        </button>
        {existingReview && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleDelete}
            disabled={pending}
          >
            Delete review
          </button>
        )}
      </div>
    </form>
  );
}
