"""Agente de voz Edy — LiveKit AgentSession.

Ejecución:
    python voice/main.py dev          # modo desarrollo local
    python voice/main.py start        # modo producción (LiveKit Cloud)
"""

import os
import sys
import logging

# Agregar la ruta raíz (edy-service) al path para que Python encuentre la carpeta shared
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Cargar .env ANTES de importar cualquier plugin que lea variables de entorno
load_dotenv()

# Configurar logging a nivel DEBUG
logging.basicConfig(level=logging.DEBUG)
import livekit.agents
logging.getLogger("livekit").setLevel(logging.DEBUG)
logger = logging.getLogger("voice-agent")

# Verificación de variables críticas (DEBUG)
print("=" * 60)
print("🔍 DEBUG: Verificando carga de variables de entorno desde .env")
print(f"LIVEKIT_URL: {os.getenv('LIVEKIT_URL')}")
print(f"LIVEKIT_API_KEY: {'[OK Cargado]' if os.getenv('LIVEKIT_API_KEY') else '[FALTA]'} ({len(os.getenv('LIVEKIT_API_KEY', ''))} chars)")
print(f"ELEVEN_API_KEY: {'[OK Cargado]' if os.getenv('ELEVEN_API_KEY') else '[FALTA]'} ({len(os.getenv('ELEVEN_API_KEY', ''))} chars)")
print(f"ELEVEN_VOICE_ID: {os.getenv('ELEVEN_VOICE_ID', 'EXAVITQu4vr4xnSDxMaL')}")
print(f"GEMINI_API_KEY: {'[OK Cargado]' if os.getenv('GEMINI_API_KEY') else '[FALTA]'} ({len(os.getenv('GEMINI_API_KEY', ''))} chars)")
print(f"GEMINI_MODEL: {os.getenv('GEMINI_MODEL', 'gemini-3.6-flash')}")
print(f"PLATFORM_URL: {os.getenv('PLATFORM_URL')}")
print("=" * 60)

from livekit.agents import AgentSession, Agent, JobContext, JobRequest, WorkerOptions, cli, AutoSubscribe
from livekit.plugins import elevenlabs, silero

# LLM: usar el plugin de Google (Gemini) si está disponible,
# con fallback a Anthropic si solo está instalado ese plugin.
try:
    from livekit.plugins import google as google_plugin  # livekit-plugins-google

    def _make_llm():
        return google_plugin.LLM(
            model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            api_key=os.getenv("GEMINI_API_KEY"),
            thinking_config={"thinking_level": "minimal"},
            temperature=0.3,
        )

    _LLM_BACKEND = "google"
except ImportError:
    from livekit.plugins import anthropic as anthropic_plugin  # fallback

    def _make_llm():
        return anthropic_plugin.LLM(
            model="claude-sonnet-4-6",
            api_key=os.getenv("ANTHROPIC_API_KEY"),
        )

    _LLM_BACKEND = "anthropic (fallback — instala livekit-plugins-google)"

from shared.tools import TOOLS_LIVEKIT
from shared.system_prompt import SYSTEM_PROMPT

# Nota de estilo exclusiva para el canal de voz: frases cortas, sin markdown
VOICE_STYLE_NOTE = (
    "\n\nIMPORTANTE (modo voz): Responde con frases cortas y naturales. "
    "NO uses markdown, listas con viñetas, asteriscos ni encabezados. "
    "Habla como lo harías en una conversación telefónica amigable."
)


# Se agrega request_fnc para despachar explícitamente las llamadas entrantes
async def request_fnc(req: JobRequest) -> None:
    logger.debug("📥 Recibido JobRequest. Aceptando el trabajo...")
    await req.accept(
        name="edy-voice-agent",
    )


async def entrypoint(ctx: JobContext):
    logger.info(f"🚀 Iniciando sesión de voz. LLM backend: {_LLM_BACKEND}")
    print(f"[edy-voice] Iniciando sesión de voz. LLM backend: {_LLM_BACKEND}")

    try:
        session = AgentSession(
            stt=elevenlabs.STT(
                model="scribe_v2_realtime",
                api_key=os.getenv("ELEVEN_API_KEY"),
                language_code="es",
                server_vad={
                    "vad_silence_threshold_secs": 0.5,
                    "min_silence_duration_ms": 300,
                },
            ),
            llm=_make_llm(),
            tts=elevenlabs.TTS(
                api_key=os.getenv("ELEVEN_API_KEY"),
                voice_id=os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL"),
                model="eleven_turbo_v2_5",
            ),
            vad=silero.VAD.load(),
            turn_handling={
                "endpointing": {
                    "min_delay": 0.3,
                    "max_delay": 1.0,
                },
                "preemptive_generation": {
                    "enabled": True,
                },
            },
        )

        agent = Agent(
            instructions=SYSTEM_PROMPT + VOICE_STYLE_NOTE,
            tools=TOOLS_LIVEKIT,
        )

        # Monitoreo de eventos clave para visibilidad en consola
        session.on("user_input_transcribed", lambda ev: logger.info(f"🗣️ Transcripción ({'final' if ev.is_final else 'parcial'}): {ev.transcript}"))
        session.on("agent_state_changed", lambda ev: logger.info(f"🔄 Estado agente: {ev.old_state} -> {ev.new_state}"))
        session.on("speech_created", lambda ev: logger.info(f"🔊 Generando audio de respuesta (id={ev.speech_handle.id})"))
        session.on("error", lambda ev: logger.error(f"❌ Error en sesión ({ev.source}): {ev.error}"))

        logger.debug("⏳ Iniciando session.start()...")
        await session.start(agent=agent, room=ctx.room)
        logger.info("✅ AgentSession iniciada correctamente. Esperando interacciones...")

        # Saludo inicial al conectarse para confirmar audio de inmediato
        session.say(
            "¡Hola! Soy Aura, tu asesora médica y estética en AuraTips y AuraMed. ¿En qué procedimiento o cuidado te puedo orientar hoy?",
            allow_interruptions=True,
        )
    except Exception as e:
        logger.error(f"❌ Error crítico al iniciar AgentSession: {e}", exc_info=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
        agent_name="edy-voice-agent",
    ))
