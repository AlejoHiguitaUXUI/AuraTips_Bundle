"use client";

import { useState } from "react";
import FocusTrap from "focus-trap-react";
import { PhoneIcon, SparklesIcon, ShieldCheckIcon } from "@/components/icons";
import { EdyVoiceWidget } from "@/components/voice/EdyVoiceWidget";

export function AuraVoiceSection() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Feature Flag: Ocultar el componente si no está habilitado explícitamente
  if (process.env.NEXT_PUBLIC_ENABLE_AURA_VOICE !== "true") {
    return null;
  }

  return (
    <section
      className="aura-voice-section"
      aria-labelledby="aura-voice-section-title"
    >
      <div className="aura-voice-section-content">
        <div className="aura-voice-badge">
          <span className="aura-call-pulse-dot" aria-hidden="true" />
          <span>Asistencia Médica por Voz en Vivo</span>
        </div>

        <h2 id="aura-voice-section-title" className="aura-voice-title">
          ¿Dudas sobre algún procedimiento o recuperación?
        </h2>

        <p className="aura-voice-desc">
          Conversa en tiempo real con <strong>AURA</strong>, nuestra asistente clínica interactiva con voz humana. Te asesora sobre tiempos de reposo esperados, cuidados post-tratamiento o te guía antes de tu valoración médica presencial en AuraMed Medellín.
        </p>

        <div className="aura-voice-meta">
          <span className="aura-voice-meta-item">
            <SparklesIcon size={13} />
            <span>Voz en tiempo real con IA</span>
          </span>
          <span className="aura-voice-meta-dot">•</span>
          <span className="aura-voice-meta-item">
            <ShieldCheckIcon size={13} />
            <span>Sin costo ni registro previo</span>
          </span>
        </div>
      </div>

      <div className="aura-voice-action">
        <button
          type="button"
          data-testid="edy-voice-button"
          className="aura-voice-btn"
          onClick={() => setIsVoiceOpen(true)}
          aria-label="Hablar en vivo con la asistente clínica AURA"
        >
          <span className="aura-call-pulse-dot" aria-hidden="true" />
          <PhoneIcon size={15} />
          <span>Hablar con AURA</span>
        </button>
        <span className="aura-voice-hint">Micrófono seguro y privado</span>
      </div>

      {/* Modal accesible con FocusTrap para llamada de voz */}
      {isVoiceOpen && (
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
            aria-label="Llamada de voz con AURA"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsVoiceOpen(false);
            }}
            className="aura-voice-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsVoiceOpen(false);
            }}
          >
            <div className="aura-voice-modal-container">
              <EdyVoiceWidget onClose={() => setIsVoiceOpen(false)} />
            </div>
          </div>
        </FocusTrap>
      )}
    </section>
  );
}
