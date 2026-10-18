"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FocusTrap from "focus-trap-react";
import {
  UserCheckIcon,
  PlusIcon,
  XIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  BanIcon,
} from "@/components/icons";
import {
  isRecentlyCreatedProtocol,
  type PendingAuraMedDelegation,
} from "@/lib/patient-protocols";

interface PatientOption {
  id: string;
  external_id?: string | null;
  email: string;
  display_name: string;
  phone: string;
  history_count: number;
  pending_delegations?: PendingAuraMedDelegation[];
}

interface ProtocolOption {
  id: string;
  title: string;
  slug: string;
  category?: string;
  status?: string;
  created_at?: string;
}

interface AssignmentResult {
  enrollment_id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  password: string | null;
  course_id: string;
  course_title: string;
  course_slug: string;
  expires_after_days: number;
  enrolled_at: string;
}

export function NewProtocolBadge({ createdAt }: { createdAt?: string | null }) {
  if (!isRecentlyCreatedProtocol(createdAt)) return null;

  return (
    <span
      data-testid="new-protocol-badge"
      style={{
        fontSize: "10px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        background: "rgba(194, 155, 56, 0.16)",
        color: "var(--color-gold-text, #997316)",
        border: "1px solid rgba(194, 155, 56, 0.45)",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#C29B38",
        }}
      />
      <span>Nuevo</span>
    </span>
  );
}

export function DeactivateProtocolButton({
  enrollmentId,
  userId,
  courseId,
  patientName,
  procedureTitle,
}: {
  enrollmentId?: string;
  userId?: string;
  courseId?: string;
  patientName: string;
  procedureTitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDeactivate() {
    setPending(true);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          userId,
          courseId,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error deactivating protocol:", err);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      data-testid="deactivate-protocol-button"
      onClick={handleDeactivate}
      disabled={pending}
      title={`Finalizar acceso de ${patientName} al protocolo ${procedureTitle} y conservar en su récord clínico`}
      style={{
        fontSize: "11.5px",
        fontWeight: 600,
        padding: "5px 10px",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        color: "var(--color-muted)",
        border: "1px solid var(--color-border)",
        cursor: pending ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        transition: "all var(--dur-fast)",
      }}
    >
      <BanIcon size={12} />
      <span>{pending ? "Finalizando…" : "Finalizar protocolo"}</span>
    </button>
  );
}

export function AssignPatientProtocolModal({
  defaultCourseId,
  buttonLabel = "Asignar Protocolo a Paciente",
  buttonVariant = "secondary",
}: {
  defaultCourseId?: string;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [protocols, setProtocols] = useState<ProtocolOption[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form fields
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+57 300 ");
  const [password, setPassword] = useState("AuraMed2026!");
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId || "");
  const [expiresAfterDays, setExpiresAfterDays] = useState<number>(14);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoadingDirectory(true);
    setError(null);

    fetch("/api/admin/patients")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const patientList: PatientOption[] = data.patients || [];
        const protocolList: ProtocolOption[] = data.protocols || [];
        setPatients(patientList);
        setProtocols(protocolList);

        if (patientList.length > 0) {
          setSelectedPatientId((prev) => prev || patientList[0].id);
        } else {
          setMode("new");
        }

        if (defaultCourseId) {
          setSelectedCourseId(defaultCourseId);
        } else if (protocolList.length > 0) {
          setSelectedCourseId((prev) => prev || protocolList[0].id);
        }
      })
      .catch(() => {
        if (active) setError("No se pudo cargar el directorio de pacientes.");
      })
      .finally(() => {
        if (active) setLoadingDirectory(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, defaultCourseId]);

  const filteredPatients = patients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.display_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q)
    );
  });

  function generateCleanPassword() {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPassword(`AuraMed${num}!`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          patientId: mode === "existing" ? selectedPatientId : undefined,
          fullName: mode === "new" ? fullName : undefined,
          email: mode === "new" ? email : undefined,
          phone: mode === "new" ? phone : undefined,
          password: password.trim() || undefined,
          courseId: selectedCourseId,
          expiresAfterDays,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo asignar el protocolo.");
        setSubmitting(false);
        return;
      }

      setResult(data.assignment);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Error de red al asignar el protocolo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setResult(null);
    setError(null);
    setCopied(false);
  }

  async function handleCopyCredentials() {
    if (!result) return;
    const text = [
      `Portal Clínico AuraTips — AuraMed`,
      `Paciente: ${result.patient_name}`,
      `Protocolo asignado: ${result.course_title}`,
      `Vigencia del protocolo: ${result.expires_after_days} días`,
      `Correo de acceso: ${result.patient_email}`,
      result.password ? `Contraseña: ${result.password}` : null,
      `Ingreso: ${window.location.origin}/login`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        data-testid="open-assign-protocol-modal"
        onClick={() => setIsOpen(true)}
        className={
          buttonVariant === "primary"
            ? "btn-clinical-primary"
            : "btn-clinical-secondary"
        }
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <UserCheckIcon size={16} />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <FocusTrap
          focusTrapOptions={{
            returnFocusOnDeactivate: true,
            allowOutsideClick: true,
            escapeDeactivates: false,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClose();
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10, 25, 18, 0.68)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div
              data-testid="assign-protocol-modal"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                maxWidth: "560px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "var(--space-6)",
                boxShadow: "0 24px 48px rgba(0, 0, 0, 0.28)",
              }}
            >
              {/* Cabecera */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-4)",
                  paddingBottom: "var(--space-3)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-brand)",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    Pedagogía y Seguimiento · AuraMed
                  </span>
                  <h2
                    id="assign-modal-title"
                    style={{
                      fontSize: "var(--text-xl)",
                      fontWeight: 800,
                      margin: 0,
                      color: "var(--color-text)",
                    }}
                  >
                    Asignar Protocolo y Credenciales
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Cerrar ventana"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-muted)",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <XIcon size={18} />
                </button>
              </div>

              {result ? (
                <div data-testid="assignment-confirmation-card">
                  <div
                    style={{
                      padding: "var(--space-4)",
                      borderRadius: "var(--radius-lg)",
                      background: "rgba(34, 197, 94, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#16a34a",
                        fontWeight: 700,
                        fontSize: "14px",
                        marginBottom: "6px",
                      }}
                    >
                      <CheckCircle2Icon size={18} />
                      <span>Protocolo asignado y activado correctamente</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--color-text-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      El protocolo estará activo durante{" "}
                      <strong>{result.expires_after_days} días</strong>. Al
                      finalizar este periodo se desactivará automáticamente el
                      acceso a las pautas detalladas y el procedimiento quedará
                      en el historial clínico del paciente.
                    </p>
                  </div>

                  {/* Tarjeta de Credenciales */}
                  <div
                    style={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-4)",
                      marginBottom: "var(--space-5)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-muted)",
                          display: "block",
                        }}
                      >
                        Paciente
                      </span>
                      <strong style={{ fontSize: "14px", color: "var(--color-text)" }}>
                        {result.patient_name}
                      </strong>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-muted)",
                          display: "block",
                        }}
                      >
                        Protocolo delegado
                      </span>
                      <strong
                        style={{ fontSize: "14px", color: "var(--color-brand)" }}
                      >
                        {result.course_title}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        paddingTop: "8px",
                        borderTop: "1px dashed var(--color-border)",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--color-muted)",
                            display: "block",
                          }}
                        >
                          Usuario (Correo)
                        </span>
                        <code
                          data-testid="assigned-patient-email"
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          {result.patient_email}
                        </code>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--color-muted)",
                            display: "block",
                          }}
                        >
                          Contraseña de acceso
                        </span>
                        <code
                          data-testid="assigned-patient-password"
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          {result.password || "Mantiene su clave actual"}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="btn secondary btn-sm"
                      >
                        {copied ? "Credenciales copiadas" : "Copiar credenciales"}
                      </button>

                      <a
                        href={`https://wa.me/${result.patient_phone.replace(
                          /[^0-9]/g,
                          ""
                        )}?text=${encodeURIComponent(
                          `Hola ${result.patient_name}, desde AuraMed hemos activado tu protocolo de cuidados para ${result.course_title} (vigente por ${result.expires_after_days} días). Ingresa con tu correo ${result.patient_email}${
                            result.password
                              ? ` y clave ${result.password}`
                              : ""
                          }.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-direct"
                      >
                        <MessageCircleIcon size={14} />
                        <span>Enviar por WhatsApp</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      data-testid="close-assign-modal-button"
                      onClick={handleClose}
                      className="btn btn-sm"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Selector de modo: Paciente existente vs Paciente nuevo */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      background: "var(--color-bg)",
                      padding: "4px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border)",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    <button
                      type="button"
                      data-testid="mode-existing-patient"
                      onClick={() => setMode("existing")}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        background:
                          mode === "existing"
                            ? "var(--color-brand)"
                            : "transparent",
                        color:
                          mode === "existing" ? "#FAF8F5" : "var(--color-muted)",
                      }}
                    >
                      Seleccionar Paciente ({patients.length})
                    </button>
                    <button
                      type="button"
                      data-testid="mode-new-patient"
                      onClick={() => setMode("new")}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background:
                          mode === "new" ? "var(--color-brand)" : "transparent",
                        color: mode === "new" ? "#FAF8F5" : "var(--color-muted)",
                      }}
                    >
                      <PlusIcon size={14} />
                      <span>Agregar Nuevo Paciente</span>
                    </button>
                  </div>

                  {error && (
                    <div className="error" style={{ marginBottom: "12px" }}>
                      {error}
                    </div>
                  )}

                  {loadingDirectory ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--color-muted)",
                        padding: "16px 0",
                      }}
                    >
                      Cargando lista compartida de pacientes y protocolos…
                    </p>
                  ) : mode === "existing" ? (
                    <div style={{ marginBottom: "var(--space-4)" }}>
                      <label htmlFor="patient-select">
                        Paciente registrado en AuraMed
                      </label>
                      {patients.length > 4 && (
                        <input
                          type="text"
                          placeholder="Filtrar por nombre o correo…"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ marginBottom: "8px" }}
                        />
                      )}
                      <select
                        id="patient-select"
                        data-testid="assign-patient-select"
                        value={selectedPatientId}
                        onChange={(e) => {
                          const newId = e.target.value;
                          setSelectedPatientId(newId);
                          const pat = patients.find((item) => item.id === newId);
                          const firstPending = pat?.pending_delegations?.[0];
                          if (firstPending && !defaultCourseId) {
                            setSelectedCourseId(firstPending.course_id);
                            if (firstPending.notes) {
                              setNotes(firstPending.notes);
                            }
                          }
                        }}
                        required
                      >
                        {filteredPatients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.display_name} ({p.email})
                            {p.pending_delegations &&
                            p.pending_delegations.length > 0
                              ? ` · Notificación AuraMed pendiente`
                              : p.history_count > 0
                              ? ` · ${p.history_count} en historial`
                              : ""}
                          </option>
                        ))}
                      </select>

                      {(() => {
                        const selectedPat = patients.find(
                          (item) => item.id === selectedPatientId
                        );
                        const pendingList =
                          selectedPat?.pending_delegations || [];
                        if (pendingList.length === 0) return null;
                        const latestPending = pendingList[0];
                        return (
                          <div
                            data-testid="auramed-pending-delegation-notice"
                            style={{
                              marginTop: "10px",
                              padding: "10px 12px",
                              borderRadius: "var(--radius-md)",
                              background: "rgba(194, 155, 56, 0.1)",
                              border: "1px solid rgba(194, 155, 56, 0.35)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "10.5px",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: "#997316",
                                }}
                              >
                                Notificación recibida desde AuraMed
                              </span>
                              <span
                                style={{
                                  fontSize: "12.5px",
                                  color: "var(--color-text)",
                                  fontWeight: 600,
                                }}
                              >
                                Procedimiento realizado: {latestPending.title}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseId(latestPending.course_id);
                                if (latestPending.notes) {
                                  setNotes(latestPending.notes);
                                }
                              }}
                              className="btn secondary btn-sm"
                              style={{ fontSize: "11.5px", padding: "4px 10px" }}
                            >
                              Seleccionar protocolo
                            </button>
                          </div>
                        );
                      })()}

                      <div style={{ marginTop: "10px" }}>
                        <label
                          htmlFor="existing-password"
                          style={{ fontSize: "12px", color: "var(--color-muted)" }}
                        >
                          Actualizar contraseña de acceso (opcional, dejar vacío
                          para conservar la actual)
                        </label>
                        <input
                          id="existing-password"
                          type="text"
                          placeholder="Conservar contraseña actual del paciente"
                          value={mode === "existing" ? "" : password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginBottom: "var(--space-4)",
                      }}
                    >
                      <div>
                        <label htmlFor="new-patient-name">
                          Nombre completo del paciente
                        </label>
                        <input
                          id="new-patient-name"
                          data-testid="new-patient-name-input"
                          type="text"
                          required
                          placeholder="Ej. Laura Restrepo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <label htmlFor="new-patient-email">
                            Correo electrónico (Usuario)
                          </label>
                          <input
                            id="new-patient-email"
                            data-testid="new-patient-email-input"
                            type="email"
                            required
                            placeholder="paciente@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="new-patient-phone">
                            Teléfono / WhatsApp
                          </label>
                          <input
                            id="new-patient-phone"
                            data-testid="new-patient-phone-input"
                            type="text"
                            placeholder="+57 300 123 4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <label htmlFor="new-patient-password">
                            Contraseña entregada en consultorio
                          </label>
                          <button
                            type="button"
                            onClick={generateCleanPassword}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-brand)",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Generar nueva clave
                          </button>
                        </div>
                        <input
                          id="new-patient-password"
                          data-testid="new-patient-password-input"
                          type="text"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Selección de Protocolo Clínico */}
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <label htmlFor="protocol-select">
                      Protocolo clínico realizado
                    </label>
                    <select
                      id="protocol-select"
                      data-testid="assign-protocol-select"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      required
                    >
                      {protocols.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isRecentlyCreatedProtocol(c.created_at)
                            ? `[Nuevo] ${c.title}`
                            : c.title}{" "}
                          ({c.category || "Dermoestética"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vigencia automática del protocolo */}
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <label
                      htmlFor="duration-select"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ClockIcon size={14} />
                      <span>
                        Vigencia del protocolo activo (desactivación automática)
                      </span>
                    </label>
                    <select
                      id="duration-select"
                      data-testid="assign-duration-select"
                      value={expiresAfterDays}
                      onChange={(e) =>
                        setExpiresAfterDays(Number(e.target.value))
                      }
                    >
                      <option value={7}>7 días de acompañamiento activo</option>
                      <option value={14}>
                        14 días (Ciclo estándar hasta control médico)
                      </option>
                      <option value={21}>21 días de acompañamiento activo</option>
                      <option value={30}>30 días de acompañamiento activo</option>
                    </select>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "11.5px",
                        color: "var(--color-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      Pasados estos días, el protocolo se retirará automáticamente
                      de la vista del paciente y el procedimiento quedará
                      registrado en su historial clínico.
                    </p>
                  </div>

                  {/* Notas opcionales */}
                  <div style={{ marginBottom: "var(--space-5)" }}>
                    <label htmlFor="clinical-notes">
                      Recomendación específica de la sesión (opcional)
                    </label>
                    <input
                      id="clinical-notes"
                      type="text"
                      placeholder="Ej. Control presencial en 14 días en sede Medellín"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      data-testid="confirm-assign-protocol-button"
                      className="btn"
                      disabled={submitting || loadingDirectory}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ShieldCheckIcon size={16} />
                      <span>
                        {submitting
                          ? "Delegando protocolo…"
                          : "Asignar Protocolo"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FocusTrap>
      )}
    </>
  );
}
