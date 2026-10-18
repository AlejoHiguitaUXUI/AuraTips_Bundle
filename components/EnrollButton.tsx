"use client";

import Link from "next/link";
import {
  CheckCircle2Icon,
  MessageCircleIcon,
  ArrowRightIcon,
  ClipboardCheckIcon,
} from "@/components/icons";

export function EnrollButton({
  courseId: _courseId,
  courseSlug,
  courseTitle,
  isSignedIn: _isSignedIn,
  isOwner,
  isEnrolled,
  isCompletedInHistory = false,
}: {
  courseId: string;
  courseSlug: string;
  courseTitle?: string;
  isSignedIn: boolean;
  isOwner: boolean;
  isEnrolled: boolean;
  isCompletedInHistory?: boolean;
}) {
  if (isOwner) {
    return (
      <Link
        href={`/dashboard/protocolos/${courseSlug}`}
        className="btn secondary btn-sm"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      >
        <span>Editar protocolo clínico</span>
        <ArrowRightIcon size={13} />
      </Link>
    );
  }

  if (isEnrolled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <p
          data-testid="enrolled-status"
          style={{
            margin: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-brand)",
            fontWeight: 700,
            fontSize: "13.5px",
          }}
        >
          <CheckCircle2Icon size={16} />
          <span>Protocolo activo en tu seguimiento</span>
        </p>
        <Link
          href="/dashboard/learning"
          className="btn btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <span>Ir a mis cuidados</span>
          <ArrowRightIcon size={13} />
        </Link>
      </div>
    );
  }

  const procedureLabel = courseTitle || courseSlug.replace(/-/g, " ");
  const waText = encodeURIComponent(
    `Hola equipo de AuraMed, quisiera consultar sobre el procedimiento ${procedureLabel} y agendar una valoración médica.`
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
      }}
    >
      {isCompletedInHistory && (
        <span
          data-testid="completed-history-status"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--color-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ClipboardCheckIcon size={14} />
          <span>Procedimiento registrado en tu historial · Ciclo finalizado</span>
        </span>
      )}
      <a
        href={`https://wa.me/573001234567?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-consultation-link"
        className="btn-whatsapp-direct"
        style={{
          padding: "9px 16px",
          fontSize: "13px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}
      >
        <MessageCircleIcon size={15} />
        <span>Consultar con la clínica / Agendar valoración por WhatsApp</span>
      </a>
    </div>
  );
}
