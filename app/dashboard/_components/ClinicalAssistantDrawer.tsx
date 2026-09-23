"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageCircleIcon,
  ShieldAlertIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@/components/icons";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
  recommendedDos?: string[];
  recommendedDonts?: string[];
  contactDoctorUrl?: string;
  timestamp: string;
}

interface ClinicalAssistantDrawerProps {
  procedureSlug?: string;
  procedureTitle?: string;
  recoveryDay?: number;
}

export function ClinicalAssistantDrawer({
  procedureSlug,
  procedureTitle,
  recoveryDay = 2,
}: ClinicalAssistantDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCallout, setShowCallout] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación. Estoy aquí para acompañarte paso a paso con los protocolos de la **Dra. Mariana Gómez** en tu **Día ${recoveryDay}** de ${
        procedureTitle ? `*${procedureTitle}*` : "tu procedimiento"
      }.\n\n¿Tienes alguna inquietud sobre cómo evoluciona tu recuperación o las pautas recomendadas para hoy?`,
      timestamp: "Ahora",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    const startTime = Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          procedureSlug: procedureSlug || "toxina-botulinica-botox-facial",
          recoveryDay,
          history: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      // Cadencia y pausa humana realista: emula el tiempo de lectura y redacción médica
      const elapsed = Date.now() - startTime;
      const naturalDelay = Math.min(Math.max((data.reply?.length || 100) * 3, 1400), 2200);
      if (elapsed < naturalDelay) {
        await new Promise((resolve) => setTimeout(resolve, naturalDelay - elapsed));
      }

      if (data.success) {
        const assistantMessage: Message = {
          id: "asst-" + Date.now(),
          role: "assistant",
          content: data.reply,
          isEmergency: data.isEmergency,
          recommendedDos: data.recommendedDos,
          recommendedDonts: data.recommendedDonts,
          contactDoctorUrl: data.contactDoctorUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "No se pudo procesar la respuesta.");
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Hubo una dificultad de conexión con los protocolos: ${err.message || "Inténtalo de nuevo."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_QUESTIONS = [
    "¿Es normal el edema o hinchazón hoy?",
    "¿Puedo usar protector solar o maquillarme?",
    "¿Qué analgésico puedo tomar para la molestia?",
    "¿Puedo hacer ejercicio o ir al gimnasio?",
  ];

  return (
    <>
      {/* Botón flotante y Callout en la esquina inferior */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 990,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          {/* Globo de Invitación Proactivo (Callout) */}
          {showCallout && (
            <div
              onClick={() => setIsOpen(true)}
              style={{
                position: "relative",
                width: "min(320px, calc(100vw - 48px))",
                padding: "12px 14px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "16px 16px 4px 16px",
                border: "1px solid var(--color-gold-border, rgba(194, 155, 56, 0.4))",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0, 0, 0, 0.12)",
                cursor: "pointer",
                animation: "calloutFloat 4s ease-in-out infinite",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0, 0, 0, 0.12)";
              }}
            >
              {/* Puntero / colita de bocadillo de chat */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "36px",
                  width: "11px",
                  height: "11px",
                  backgroundColor: "var(--color-surface)",
                  borderRight: "1px solid var(--color-gold-border, rgba(194, 155, 56, 0.4))",
                  borderBottom: "1px solid var(--color-gold-border, rgba(194, 155, 56, 0.4))",
                  transform: "rotate(45deg)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                      animation: "pulseHalo 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--color-brand)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Dra. Mariana Gómez · Chat Clínico
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCallout(false);
                  }}
                  aria-label="Cerrar sugerencia de chat"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-muted)",
                    fontSize: "14px",
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: "2px 4px",
                    borderRadius: "4px",
                  }}
                  title="Cerrar invitación"
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "var(--color-text)",
                  fontWeight: 400,
                }}
              >
                {procedureTitle
                  ? `¿Tienes dudas sobre inflamación, cuidados o medicamentos en tu Día ${recoveryDay} de ${procedureTitle}?`
                  : `¿Tienes dudas sobre inflamación o analgésicos en tu Día ${recoveryDay}? Escríbeme aquí.`}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--color-brand)",
                }}
              >
                <MessageCircleIcon size={13} />
                <span>Haz tu consulta clínica ahora</span>
                <ArrowRightIcon size={12} />
              </div>
            </div>
          )}

          {/* Botón flotante de Chat (Launcher Window Trigger) */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir ventana de chat clínico con Dra. Mariana Gómez"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 18px 10px 12px",
              backgroundColor: "var(--color-primary, #20503B)",
              backgroundImage: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
              color: "#FFFFFF",
              borderRadius: "9999px",
              border: "1.5px solid var(--color-gold, #C29B38)",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 14px 34px rgba(0, 0, 0, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.35)";
            }}
          >
            {/* Avatar médico con indicador pulsante y SVG de alto contraste */}
            <div
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--color-gold, #C29B38)",
                flexShrink: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAF8F5"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
                <path d="M9 12.5v2.5a4 4 0 0 0 4 4h1" />
                <circle cx="18" cy="19" r="3" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  border: "2px solid #183C2C",
                  boxShadow: "0 0 8px #22C55E",
                  animation: "pulseHalo 2s infinite",
                }}
              />
            </div>

            {/* Identidad y texto invitante */}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.25 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                  Chat de Recuperación
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(194, 155, 56, 0.25)",
                    color: "var(--color-gold, #FDE68A)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "1px solid var(--color-gold-border, rgba(194, 155, 56, 0.4))",
                  }}
                >
                  En vivo
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.95)", marginTop: "2px" }}>
                ¿Dudas hoy? Habla con la Dra. Mariana
              </span>
            </div>

            {/* Ícono explícito de burbuja de chat SVG */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                marginLeft: "4px",
                flexShrink: 0,
              }}
              title="Abrir chat"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Ventana / Drawer de Chat */}
      {isOpen && (
        <aside
          aria-label="Asistente de recuperación clínica"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "min(440px, calc(100vw - 32px))",
            height: "min(620px, calc(100vh - 48px))",
            zIndex: 1000,
            backgroundColor: "var(--color-surface, #FFFFFF)",
            borderRadius: "20px",
            border: "1px solid var(--color-border, #E5E7EB)",
            boxShadow: "0 20px 48px rgba(12, 18, 15, 0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          {/* Header Luxury Forest */}
          <header
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
              color: "#FAF8F5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(194, 155, 56, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(194, 155, 56, 0.5)",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FAF8F5"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
                  <path d="M9 12.5v2.5a4 4 0 0 0 4 4h1" />
                  <circle cx="18" cy="19" r="3" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FAF8F5" }}>
                  AuraTips • Dra. Mariana Gómez
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", opacity: 0.9 }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#34D399",
                    }}
                  />
                  <span>Protocolos Clínicos • Día {recoveryDay}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              style={{
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "8px",
                opacity: 0.8,
              }}
            >
              ✕
            </button>
          </header>

          {/* Procedimiento de contexto */}
          {procedureTitle && (
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-brand-soft)",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "12px",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Tratamiento activo: <strong>{procedureTitle}</strong></span>
              <span
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "var(--color-inverse)",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Fase Día {recoveryDay}
              </span>
            </div>
          )}

          {/* Cuerpo de Mensajes */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "var(--color-base)",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor:
                      m.role === "user"
                        ? "var(--color-brand)"
                        : m.isEmergency
                        ? "var(--color-error-soft)"
                        : "var(--color-surface)",
                    color:
                      m.role === "user"
                        ? "var(--color-inverse)"
                        : "var(--color-text)",
                    border: m.isEmergency
                      ? "1px solid var(--color-error)"
                      : m.role === "assistant"
                      ? "1px solid var(--color-border)"
                      : "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    fontSize: "13.5px",
                    lineHeight: 1.55,
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: "0 0 8px 0", color: "inherit" }}>{children}</p>,
                      h3: ({ children }) => (
                        <h3
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: m.isEmergency ? "var(--color-error)" : "var(--color-text)",
                          }}
                        >
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4
                          style={{
                            margin: "8px 0 4px 0",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--color-text)",
                          }}
                        >
                          {children}
                        </h4>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ margin: "0 0 8px 0", paddingLeft: "18px", color: "inherit" }}>{children}</ul>
                      ),
                      li: ({ children }) => <li style={{ marginBottom: "3px", color: "inherit" }}>{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote
                          style={{
                            margin: "8px 0",
                            padding: "6px 10px",
                            backgroundColor: "var(--color-gold-soft)",
                            borderLeft: "3px solid var(--color-gold)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "var(--color-text)",
                          }}
                        >
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>

                  {/* Botón de atención médica prioritaria (3 o más criterios) */}
                  {m.isEmergency && m.contactDoctorUrl && (
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={m.contactDoctorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 16px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          borderRadius: "10px",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 700,
                          boxShadow: "0 6px 16px rgba(220, 38, 38, 0.35)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ShieldAlertIcon size={14} color="#FFFFFF" />
                        <span>Contactar a la Dra. Mariana Gómez (Atención Prioritaria)</span>
                      </a>
                      <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
                        Atención prioritaria activada por coincidencia de 3 o más criterios de valoración médica.
                      </p>
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--color-muted, #9CA3AF)",
                    marginTop: "4px",
                    padding: "0 4px",
                  }}
                >
                  {m.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "4px 0",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {/* Mini avatar clínico de la Dra. Mariana Gómez */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
                    color: "#FAF8F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(194, 155, 56, 0.5)",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FAF8F5"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
                    <path d="M9 12.5v2.5a4 4 0 0 0 4 4h1" />
                    <circle cx="18" cy="19" r="3" />
                  </svg>
                </div>

                {/* Burbuja de respuesta humana en redacción */}
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <span style={{ fontSize: "12.5px", color: "var(--color-text)", fontWeight: 600 }}>
                      Dra. Mariana Gómez está escribiendo
                    </span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginLeft: "2px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-brand)",
                          animation: "typingDot 1.4s infinite ease-in-out",
                          animationDelay: "0ms",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-brand)",
                          animation: "typingDot 1.4s infinite ease-in-out",
                          animationDelay: "200ms",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-brand)",
                          animation: "typingDot 1.4s infinite ease-in-out",
                          animationDelay: "400ms",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "var(--color-muted)",
                      marginTop: "4px",
                      paddingLeft: "4px",
                    }}
                  >
                    Revisando protocolos de tu Día {recoveryDay}...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas sugeridas en carrusel */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "var(--color-surface)",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                style={{
                  flexShrink: 0,
                  fontSize: "12px",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-brand-soft)",
                  color: "var(--color-brand)",
                  border: "1px solid var(--color-brand-border)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "12px",
              backgroundColor: "var(--color-surface)",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Pregunta sobre inflamación, cuidados o síntomas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "0 18px",
                backgroundColor: "var(--color-brand)",
                color: "var(--color-inverse)",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              Enviar
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
