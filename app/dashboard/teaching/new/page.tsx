"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        cover_url: coverUrl,
      }),
    });
    const json = await res.json();
    setPending(false);

    if (!res.ok) {
      setError(json.error ?? "Could not create the course.");
      return;
    }

    router.push(`/dashboard/teaching/${json.course.slug}`);
  }

  return (
    <section style={{ maxWidth: 480 }}>
      <h1>New course</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="cover_url">Cover image URL</label>
        <input
          id="cover_url"
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />

        <button className="btn" type="submit" disabled={pending || !title}>
          {pending ? "Creating…" : "Create course (draft)"}
        </button>
      </form>
    </section>
  );
}
