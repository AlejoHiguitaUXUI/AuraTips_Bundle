"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import { LogOutIcon } from "@/components/icons";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      className="btn secondary btn-sm"
      onClick={signOut}
      disabled={pending}
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      <LogOutIcon size={14} />
      <span>{pending ? "Saliendo…" : "Cerrar Sesión"}</span>
    </button>
  );
}
