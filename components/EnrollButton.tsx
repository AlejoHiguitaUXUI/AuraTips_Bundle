"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    return <p className="muted">This is your course — you can preview all lessons.</p>;
  }

  if (!isSignedIn) {
    return (
      <p>
        <Link href={`/login?next=/courses/${courseSlug}`} className="btn">
          Sign in to enroll
        </Link>
      </p>
    );
  }

  if (enrolled) {
    return <p><strong>✓ You&apos;re enrolled</strong></p>;
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
      setError(json.error ?? "Could not enroll.");
      return;
    }
    setEnrolled(true);
    router.refresh();
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button className="btn" onClick={enroll} disabled={pending}>
        {pending ? "Enrolling…" : "Enroll for free"}
      </button>
    </div>
  );
}
