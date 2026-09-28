"use client";

import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";

interface EdyVoiceWidgetProps {
  participantName?: string;
  roomName?: string;
  onClose?: () => void;
}

interface VoiceSessionData {
  url: string;
  room: string;
  identity: string;
  token: string;
}

export function EdyVoiceWidget({
  participantName = "estudiante",
  roomName = "edy-room",
  onClose,
}: EdyVoiceWidgetProps) {
  const [session, setSession] = useState<VoiceSessionData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceServiceUrl =
    process.env.NEXT_PUBLIC_VOICE_SERVICE_URL || "http://localhost:8000";

  const startVoiceSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const dynamicRoom = `${roomName}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch(
        `${voiceServiceUrl}/voice/token?room=${encodeURIComponent(
          dynamicRoom
        )}&participant_name=${encodeURIComponent(participantName)}`
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Error ${res.status}: ${errorText || "No se pudo obtener el token de voz"}`
        );
      }

      const data: VoiceSessionData = await res.json();
      setSession(data);
    } catch (err: any) {
      console.error("[EdyVoiceWidget] Error conectando:", err);
      setError(
        err.message ||
          "No se pudo conectar con el microservicio de voz. Verifica que esté en ejecución en " +
            voiceServiceUrl
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const endVoiceSession = () => {
    setSession(null);
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        backgroundColor: "var(--color-surface, #18221D)",
        border: "1px solid var(--color-gold-border, rgba(194, 155, 56, 0.35))",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "#FAF8F5",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(194, 155, 56, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(194, 155, 56, 0.4)",
            }}
          >
            {/* NIT A6: SVG decorativo — aria-hidden */}
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
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#FAF8F5" }}>
              Asesora Virtual AURA
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.85 }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: session ? "#22C55E" : "#EAB308",
                }}
              />
              <span>{session ? "Canal de Voz en Vivo" : "AuraMed & AuraTips"}</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar modal de voz"
            style={{
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
              opacity: 0.8,
            }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {/* Contenido / Estado */}
      <div style={{ padding: "20px 16px", textAlign: "center" }}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "10px",
              color: "#FCA5A5",
              fontSize: "12px",
              marginBottom: "14px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {!session ? (
          <div>
            <p
              style={{
                fontSize: "13px",
                color: "#E2E8F0",
                lineHeight: 1.5,
                margin: "0 0 16px 0",
              }}
            >
              Conversa en tiempo real con <strong>AURA</strong>, tu asesora médica y estética en AuraMed y AuraTips, para resolver dudas sobre procedimientos, tiempos de recuperación y agendar tu valoración.
            </p>
            <button
              onClick={startVoiceSession}
              disabled={isConnecting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
                border: "1.5px solid var(--color-gold, #C29B38)",
                borderRadius: "9999px",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                cursor: isConnecting ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                transition: "all 0.2s ease",
                opacity: isConnecting ? 0.7 : 1,
              }}
            >
              {/* NIT A6: SVG decorativo — aria-hidden */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span>{isConnecting ? "Conectando con AURA..." : "Iniciar Llamada con AURA"}</span>
            </button>
          </div>
        ) : (
          <LiveKitRoom
            serverUrl={session.url}
            token={session.token}
            audio={true}
            video={false}
            onDisconnected={endVoiceSession}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "100%",
            }}
          >
            {/* Reproductor de audio del asistente */}
            <RoomAudioRenderer />

            {/* Visualizador y Estado del Asistente */}
            <VoiceAssistantVisualizer />

            {/* Controles de Llamada */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                marginTop: "10px",
              }}
            >
              <button
                onClick={endVoiceSession}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* NIT A6: SVG decorativo — aria-hidden */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                  <line x1="22" x2="2" y1="2" y2="22" />
                </svg>
                <span>Finalizar Llamada</span>
              </button>
            </div>
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function VoiceAssistantVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();

  const stateLabels: Record<string, { text: string; color: string }> = {
    idle: { text: "Listo para hablar", color: "#94A3B8" },
    listening: { text: "Escuchándote...", color: "#22C55E" },
    thinking: { text: "AURA está pensando...", color: "#EAB308" },
    speaking: { text: "AURA está hablando...", color: "#38BDF8" },
  };

  const currentStatus = stateLabels[state] || {
    text: state || "Conectado",
    color: "#22C55E",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
          color: currentStatus.color,
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: currentStatus.color,
            boxShadow: `0 0 8px ${currentStatus.color}`,
          }}
        />
        <span>{currentStatus.text}</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "64px",
          width: "100%",
          maxWidth: "280px",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          borderRadius: "12px",
          padding: "8px",
        }}
      >
        {audioTrack ? (
          <BarVisualizer
            trackRef={audioTrack}
            style={{ height: "48px", width: "100%" }}
            barCount={15}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "11px",
            }}
          >
            <span>Esperando canal de audio...</span>
          </div>
        )}
      </div>
    </div>
  );
}
