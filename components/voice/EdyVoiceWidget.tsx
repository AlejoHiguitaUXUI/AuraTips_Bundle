"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";

export interface EdyVoiceWidgetProps {
  participantName?: string;
  roomName?: string;
  onClose?: () => void;
  previewState?: "idle" | "listening" | "thinking" | "speaking";
}

export interface VoiceSessionData {
  url: string;
  room: string;
  identity: string;
  token: string;
}

export const SUGGESTED_TOPICS = [
  { id: "recovery", text: "¿Cuánto dura la recuperación de Botox o Rinomodelación?", tag: "Recuperación" },
  { id: "difference", text: "¿Qué diferencia hay entre Ácido Hialurónico y Bioestimulación?", tag: "Tratamientos" },
  { id: "care", text: "¿Qué cuidados debo tener antes y después de mi procedimiento?", tag: "Cuidados" },
  { id: "booking", text: "¿Cómo puedo agendar mi valoración médica presencial?", tag: "Agendamiento" },
];

export function EdyVoiceWidget({
  participantName = "estudiante",
  roomName = "edy-room",
  onClose,
  previewState,
}: EdyVoiceWidgetProps) {
  const [session, setSession] = useState<VoiceSessionData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  // Estados para modo preview
  const [previewDuration, setPreviewDuration] = useState(24);
  const [previewMicActive, setPreviewMicActive] = useState(true);
  const [previewSpeakerMuted, setPreviewSpeakerMuted] = useState(false);
  const [previewShowTopics, setPreviewShowTopics] = useState(false);
  const [previewActiveTopic, setPreviewActiveTopic] = useState<string | null>(null);

  const endpointBase = process.env.NEXT_PUBLIC_VOICE_SERVICE_URL
    ? `${process.env.NEXT_PUBLIC_VOICE_SERVICE_URL}/voice/token`
    : "/api/voice/token";

  const startVoiceSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const dynamicRoom = `${roomName}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch(
        `${endpointBase}?room=${encodeURIComponent(
          dynamicRoom
        )}&participant_name=${encodeURIComponent(participantName)}`
      );

      if (!res.ok) {
        let msg = "No se pudo obtener el token de voz";
        try {
          const errorJson = await res.json();
          msg = errorJson.error || errorJson.detail || msg;
        } catch {
          const errorText = await res.text();
          if (errorText) msg = errorText;
        }
        throw new Error(`Error ${res.status}: ${msg}`);
      }

      const data: VoiceSessionData = await res.json();
      setSession(data);
    } catch (err: any) {
      console.error("[EdyVoiceWidget] Error conectando:", err);
      setError(
        err.message ||
          "No se pudo conectar con el servicio de voz. Revisa la configuración de LiveKit."
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
      data-testid="edy-voice-widget"
      className="aura-voice-phone-card"
      style={{
        position: "relative",
        borderRadius: "28px",
        background: "linear-gradient(180deg, #10241B 0%, #091510 100%)",
        border: "1px solid rgba(194, 155, 56, 0.35)",
        boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "#FAF8F5",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        maxWidth: "460px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes auraSpeakingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7), 0 0 25px rgba(194, 155, 56, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 16px rgba(56, 189, 248, 0), 0 0 40px rgba(56, 189, 248, 0.5);
            transform: scale(1.025);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0), 0 0 25px rgba(194, 155, 56, 0.4);
            transform: scale(1);
          }
        }
        @keyframes auraListeningPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7), 0 0 20px rgba(34, 197, 94, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 16px rgba(34, 197, 94, 0), 0 0 35px rgba(34, 197, 94, 0.6);
            transform: scale(1.025);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0), 0 0 20px rgba(34, 197, 94, 0.4);
            transform: scale(1);
          }
        }
        @keyframes auraThinkingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.6);
            opacity: 0.95;
          }
          50% {
            box-shadow: 0 0 0 12px rgba(234, 179, 8, 0);
            opacity: 1;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0);
            opacity: 0.95;
          }
        }
        @keyframes auraIdlePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(194, 155, 56, 0.25);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(194, 155, 56, 0.08);
          }
        }
        @keyframes soundwaveAnim {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        @keyframes badgeGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .aura-phone-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0;
          color: #FAF8F5;
        }
        .aura-phone-btn:hover {
          transform: translateY(-2px);
        }
        .aura-phone-btn:active {
          transform: translateY(1px);
        }
        .aura-phone-btn-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
        }
        .aura-phone-btn-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(250, 248, 245, 0.8);
          transition: color 0.2s ease;
        }
        .lk-audio-bar {
          background: linear-gradient(180deg, #38BDF8 0%, #22C55E 100%) !important;
          border-radius: 9999px !important;
        }
      `}</style>

      {/* Barra Superior Estilo Llamada Telefónica */}
      <div
        style={{
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(194, 155, 56, 0.18)",
              border: "1px solid rgba(194, 155, 56, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Escudo confidencial */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AuraMed • Voz HD
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar modal de voz"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFFFFF",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {/* Cuerpo Principal */}
      <div style={{ padding: "24px 20px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {error && (
          <div
            role="alert"
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "rgba(220, 38, 38, 0.18)",
              border: "1px solid rgba(239, 68, 68, 0.45)",
              borderRadius: "14px",
              color: "#FCA5A5",
              fontSize: "12px",
              marginBottom: "18px",
              lineHeight: 1.45,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        {previewState ? (
          /* Renderizado Especial para Previsualización / Tests */
          <CallScreenUI
            state={previewState}
            callDuration={previewDuration}
            isMicActive={previewMicActive}
            isSpeakerMuted={previewSpeakerMuted}
            showTopics={previewShowTopics}
            activeTopic={previewActiveTopic}
            onToggleMic={() => setPreviewMicActive((prev) => !prev)}
            onToggleSpeaker={() => setPreviewSpeakerMuted((prev) => !prev)}
            onToggleTopics={() => setPreviewShowTopics((prev) => !prev)}
            onSelectTopic={(t) => setPreviewActiveTopic(t)}
            onEndCall={endVoiceSession}
          />
        ) : !session ? (
          /* Pantalla Previa a la Llamada */
          <div style={{ textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Avatar Humano de Aura */}
            <div style={{ position: "relative", marginBottom: "18px" }}>
              <div
                style={{
                  width: "124px",
                  height: "124px",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "linear-gradient(135deg, #C29B38 0%, #20503B 100%)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#183C2C",
                  }}
                >
                  <Image
                    src="/images/aura-avatar.jpg"
                    alt="AURA - Asesora Virtual en Procedimientos y Cuidados Estéticos"
                    fill
                    sizes="124px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              </div>

              {/* Indicador de Disponibilidad */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                  background: "#166534",
                  border: "2px solid #091510",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#4ADE80",
                    boxShadow: "0 0 6px #4ADE80",
                    animation: "badgeGlow 1.5s infinite ease-in-out",
                  }}
                />
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#DCFCE7", letterSpacing: "0.03em" }}>
                  En Línea
                </span>
              </div>
            </div>

            {/* Identidad de la Asesora */}
            <h3 style={{ margin: "0 0 4px 0", fontSize: "19px", fontWeight: 800, color: "#FAF8F5", letterSpacing: "-0.01em" }}>
              AURA
            </h3>
            <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "#D4AF37", fontWeight: 600 }}>
              Asesora Virtual AuraMed & AuraTips
            </p>

            <p
              style={{
                fontSize: "13px",
                color: "#CBD5E1",
                lineHeight: 1.55,
                margin: "0 0 22px 0",
                maxWidth: "340px",
              }}
            >
              Conversa en tiempo real por voz. Pregúntame sobre procedimientos, tiempos de recuperación y cómo agendar tu valoración con nuestros médicos especialistas.
            </p>

            {/* Botón Principal: Iniciar Llamada Estilo Teléfono */}
            <button
              onClick={startVoiceSession}
              disabled={isConnecting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "14px 32px",
                background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
                border: "1.5px solid var(--color-gold, #C29B38)",
                borderRadius: "9999px",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isConnecting ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px rgba(24, 60, 44, 0.5), 0 0 15px rgba(194, 155, 56, 0.3)",
                transition: "all 0.25s ease",
                opacity: isConnecting ? 0.75 : 1,
                width: "100%",
                maxWidth: "320px",
              }}
            >
              {/* Icono Teléfono */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span>{isConnecting ? "Conectando con AURA..." : "Iniciar Llamada con AURA"}</span>
            </button>

            {/* Badges de Confianza */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                marginTop: "18px",
                fontSize: "11px",
                color: "rgba(250, 248, 245, 0.6)",
              }}
            >
              <span>🔒 100% Confidencial</span>
              <span>•</span>
              <span>🎙️ Micrófono en vivo</span>
              <span>•</span>
              <span>⚡ Respuesta inmediata</span>
            </div>
          </div>
        ) : (
          /* Pantalla de Llamada Activa con LiveKit */
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
              width: "100%",
            }}
          >
            {/* Receptor y reproductor de audio del asistente */}
            <RoomAudioRenderer muted={isSpeakerMuted} volume={isSpeakerMuted ? 0 : 1} />

            {/* Conexión con Hooks de LiveKit */}
            <ActiveCallLiveContent
              onEndCall={endVoiceSession}
              isSpeakerMuted={isSpeakerMuted}
              onToggleSpeaker={() => setIsSpeakerMuted((prev) => !prev)}
            />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function ActiveCallLiveContent({
  onEndCall,
  isSpeakerMuted,
  onToggleSpeaker,
}: {
  onEndCall: () => void;
  isSpeakerMuted: boolean;
  onToggleSpeaker: () => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const [callDuration, setCallDuration] = useState(0);
  const [showTopics, setShowTopics] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [isTogglingMic, setIsTogglingMic] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isMicActive = isMicrophoneEnabled ?? true;

  const handleToggleMic = async () => {
    if (!localParticipant || isTogglingMic) return;
    setIsTogglingMic(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicActive);
    } catch (err) {
      console.error("[EdyVoiceWidget] Error cambiando estado del micrófono:", err);
    } finally {
      setIsTogglingMic(false);
    }
  };

  return (
    <CallScreenUI
      state={state}
      audioTrack={audioTrack}
      callDuration={callDuration}
      isMicActive={isMicActive}
      isSpeakerMuted={isSpeakerMuted}
      showTopics={showTopics}
      activeTopic={activeTopic}
      onToggleMic={handleToggleMic}
      onToggleSpeaker={onToggleSpeaker}
      onToggleTopics={() => setShowTopics((prev) => !prev)}
      onSelectTopic={(t) => setActiveTopic(t)}
      onEndCall={onEndCall}
      isMicDisabled={!localParticipant || isTogglingMic}
    />
  );
}

export interface CallScreenUIProps {
  state: "idle" | "listening" | "thinking" | "speaking" | string;
  audioTrack?: any;
  callDuration: number;
  isMicActive: boolean;
  isSpeakerMuted: boolean;
  showTopics: boolean;
  activeTopic: string | null;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onToggleTopics: () => void;
  onSelectTopic: (topicText: string) => void;
  onEndCall: () => void;
  isMicDisabled?: boolean;
}

export function CallScreenUI({
  state,
  audioTrack,
  callDuration,
  isMicActive,
  isSpeakerMuted,
  showTopics,
  activeTopic,
  onToggleMic,
  onToggleSpeaker,
  onToggleTopics,
  onSelectTopic,
  onEndCall,
  isMicDisabled = false,
}: CallScreenUIProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Configuración de Estados Humanos de AURA
  const stateConfigs: Record<
    string,
    {
      title: string;
      desc: string;
      color: string;
      glowColor: string;
      animation: string;
      dotColor: string;
    }
  > = {
    speaking: {
      title: "AURA está hablando...",
      desc: "Escuchando orientación en vivo",
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.6)",
      animation: "auraSpeakingPulse 1.8s infinite ease-in-out",
      dotColor: "#38BDF8",
    },
    listening: {
      title: "Te estoy escuchando...",
      desc: "Habla con confianza a tu micrófono",
      color: "#22C55E",
      glowColor: "rgba(34, 197, 94, 0.6)",
      animation: "auraListeningPulse 1.6s infinite ease-in-out",
      dotColor: "#22C55E",
    },
    thinking: {
      title: "AURA está pensando...",
      desc: "Consultando información clínica y estética...",
      color: "#EAB308",
      glowColor: "rgba(234, 179, 8, 0.5)",
      animation: "auraThinkingPulse 2s infinite ease-in-out",
      dotColor: "#EAB308",
    },
    idle: {
      title: "Llamada conectada",
      desc: "Lista para resolver tus dudas",
      color: "#C29B38",
      glowColor: "rgba(194, 155, 56, 0.3)",
      animation: "auraIdlePulse 3s infinite ease-in-out",
      dotColor: "#22C55E",
    },
  };

  const currentConfig = stateConfigs[state] || stateConfigs.idle;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Temporizador y Calidad de Señal */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 14px",
          borderRadius: "9999px",
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "#22C55E",
            boxShadow: "0 0 6px #22C55E",
          }}
        />
        <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: "#FAF8F5" }}>
          {formatTime(callDuration)}
        </span>
        <span style={{ fontSize: "11px", color: "rgba(250, 248, 245, 0.5)", marginLeft: "4px" }}>
          • Llamada Activa
        </span>
      </div>

      {/* Avatar Central Dinámico de AURA con Halo Reactivo */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            padding: "4px",
            background: `linear-gradient(135deg, ${currentConfig.color} 0%, #183C2C 100%)`,
            animation: currentConfig.animation,
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#183C2C",
            }}
          >
            <Image
              src="/images/aura-avatar.jpg"
              alt="AURA hablando"
              fill
              sizes="130px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        {/* Micro-badge de Estado Sobre el Avatar */}
        <div
          style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#0D1D16",
            border: `2px solid ${currentConfig.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 10px rgba(0, 0, 0, 0.5)`,
          }}
        >
          {state === "speaking" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : state === "listening" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          ) : state === "thinking" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E" }} />
          )}
        </div>
      </div>

      {/* Nombre y Rol */}
      <h4 style={{ margin: "0 0 2px 0", fontSize: "17px", fontWeight: 800, color: "#FAF8F5" }}>
        AURA
      </h4>
      <p style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#D4AF37", fontWeight: 600 }}>
        Asesora Virtual AuraMed & AuraTips
      </p>

      {/* Indicador de Estado Reactivo */}
      <div
        role="status"
        aria-live="polite"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: `1px solid ${currentConfig.color}40`,
          fontSize: "12px",
          fontWeight: 700,
          color: currentConfig.color,
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: currentConfig.dotColor,
            boxShadow: `0 0 8px ${currentConfig.dotColor}`,
          }}
        />
        <span>{currentConfig.title}</span>
      </div>

      {/* Visualizador de Ondas de Sonido Dinámicas */}
      <div
        style={{
          width: "100%",
          maxWidth: "320px",
          height: "46px",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          borderRadius: "14px",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        {audioTrack ? (
          <BarVisualizer
            trackRef={audioTrack}
            style={{ height: "32px", width: "100%" }}
            barCount={19}
          />
        ) : (
          /* Ondas Orgánicas en Espera / Actividad */
          <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "32px" }}>
            {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 1.4, 0.9, 0.3, 1.1, 0.7, 0.4].map((delay, idx) => (
              <span
                key={idx}
                style={{
                  width: "3px",
                  height: state === "speaking" ? "20px" : state === "listening" ? "12px" : "6px",
                  backgroundColor: currentConfig.color,
                  borderRadius: "9999px",
                  opacity: 0.8,
                  animation:
                    state === "speaking" || state === "listening"
                      ? `soundwaveAnim 1.2s infinite ease-in-out ${delay * 0.2}s`
                      : "none",
                  transition: "height 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer Desplegable de Temas / Sugerencias de Preguntas */}
      {showTopics && (
        <div
          style={{
            width: "100%",
            backgroundColor: "rgba(16, 36, 27, 0.95)",
            border: "1px solid rgba(194, 155, 56, 0.3)",
            borderRadius: "16px",
            padding: "14px",
            marginBottom: "20px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              💡 Preguntas sugeridas para hablarle a Aura
            </span>
            <button
              onClick={onToggleTopics}
              aria-label="Ocultar temas sugeridos"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(250, 248, 245, 0.6)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "2px 6px",
              }}
            >
              Cerrar
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.text)}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  backgroundColor: activeTopic === topic.text ? "rgba(194, 155, 56, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${activeTopic === topic.text ? "rgba(194, 155, 56, 0.6)" : "rgba(255, 255, 255, 0.08)"}`,
                  color: "#FAF8F5",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span>{topic.text}</span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#D4AF37",
                    flexShrink: 0,
                  }}
                >
                  {topic.tag}
                </span>
              </button>
            ))}
          </div>

          {activeTopic && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#86EFAC",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🗣️ Di ahora en voz alta:</span>
              <strong style={{ color: "#FAF8F5" }}>&ldquo;{activeTopic}&rdquo;</strong>
            </div>
          )}
        </div>
      )}

      {/* CONTROLES CLÁSICOS DE CELULAR (Phone In-Call Dock) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          width: "100%",
          paddingTop: "6px",
        }}
      >
        {/* 1. Botón Silenciar Micrófono (Mute) */}
        <button
          onClick={onToggleMic}
          disabled={isMicDisabled}
          aria-label={isMicActive ? "Silenciar mi micrófono" : "Reactivar mi micrófono"}
          className="aura-phone-btn"
          title={isMicActive ? "Silenciar micrófono" : "Reactivar micrófono"}
        >
          <div
            className="aura-phone-btn-circle"
            style={{
              backgroundColor: isMicActive ? "rgba(255, 255, 255, 0.08)" : "#BE123C",
              borderColor: isMicActive ? "rgba(255, 255, 255, 0.18)" : "#E11D48",
              boxShadow: isMicActive ? "0 6px 16px rgba(0, 0, 0, 0.25)" : "0 0 18px rgba(190, 18, 60, 0.6)",
            }}
          >
            {isMicActive ? (
              /* Micrófono Activo */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            ) : (
              /* Micrófono Silenciado (Mic Off) */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </div>
          <span
            className="aura-phone-btn-label"
            style={{ color: isMicActive ? "rgba(250, 248, 245, 0.85)" : "#FCA5A5", fontWeight: 700 }}
          >
            {isMicActive ? "Silenciar" : "Silenciado"}
          </span>
        </button>

        {/* 2. Botón Altavoz (Mute/Unmute Asistente) */}
        <button
          onClick={onToggleSpeaker}
          aria-label={isSpeakerMuted ? "Activar audio de Aura" : "Silenciar audio de Aura"}
          className="aura-phone-btn"
          title={isSpeakerMuted ? "Activar voz de Aura" : "Silenciar voz de Aura"}
        >
          <div
            className="aura-phone-btn-circle"
            style={{
              backgroundColor: isSpeakerMuted ? "rgba(234, 179, 8, 0.25)" : "rgba(255, 255, 255, 0.08)",
              borderColor: isSpeakerMuted ? "rgba(234, 179, 8, 0.5)" : "rgba(255, 255, 255, 0.18)",
            }}
          >
            {isSpeakerMuted ? (
              /* Altavoz Silenciado */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            ) : (
              /* Altavoz Activo */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </div>
          <span
            className="aura-phone-btn-label"
            style={{ color: isSpeakerMuted ? "#FDE047" : "rgba(250, 248, 245, 0.85)" }}
          >
            {isSpeakerMuted ? "Sin Audio" : "Altavoz"}
          </span>
        </button>

        {/* 3. Botón Temas / Sugerencias (Quick Prompts) */}
        <button
          onClick={onToggleTopics}
          aria-label={showTopics ? "Ocultar temas sugeridos" : "Mostrar temas sugeridos"}
          className="aura-phone-btn"
          title="Ver preguntas recomendadas para hacerle a Aura"
        >
          <div
            className="aura-phone-btn-circle"
            style={{
              backgroundColor: showTopics ? "rgba(194, 155, 56, 0.3)" : "rgba(255, 255, 255, 0.08)",
              borderColor: showTopics ? "rgba(194, 155, 56, 0.7)" : "rgba(255, 255, 255, 0.18)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showTopics ? "#D4AF37" : "#FAF8F5"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="3" />
              <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="3" />
              <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="3" />
            </svg>
          </div>
          <span
            className="aura-phone-btn-label"
            style={{ color: showTopics ? "#D4AF37" : "rgba(250, 248, 245, 0.85)" }}
          >
            Temas
          </span>
        </button>

        {/* 4. Botón Clásico de Colgar (Finalizar Llamada) */}
        <button
          onClick={onEndCall}
          aria-label="Finalizar llamada de voz"
          className="aura-phone-btn"
          title="Finalizar llamada"
        >
          <div
            className="aura-phone-btn-circle"
            style={{
              width: "58px",
              height: "58px",
              backgroundColor: "#DC2626",
              backgroundImage: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              borderColor: "rgba(255, 255, 255, 0.25)",
              boxShadow: "0 8px 24px rgba(220, 38, 38, 0.5)",
            }}
          >
            {/* Teléfono Colgado */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="22" y1="2" x2="2" y2="22" />
            </svg>
          </div>
          <span className="aura-phone-btn-label" style={{ color: "#FCA5A5", fontWeight: 700 }}>
            Colgar
          </span>
        </button>
      </div>
    </div>
  );
}
