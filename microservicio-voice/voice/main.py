"""Agente de voz Edy — LiveKit AgentSession.

Ejecución:
    python voice/main.py dev          # modo desarrollo local
    python voice/main.py start        # modo producción (LiveKit Cloud)
"""

import os
import sys

# Optimización de memoria RAM para Render (Limitar hilos de ONNX y librerías C)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import asyncio
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
print(f"GEMINI_MODEL: {os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite')}")
print(f"PLATFORM_URL: {os.getenv('PLATFORM_URL')}")
print("=" * 60)

from livekit.agents import AgentSession, Agent, JobContext, JobRequest, WorkerOptions, cli, AutoSubscribe
from livekit.plugins import elevenlabs, silero
from livekit.plugins.google.beta import gemini_stt, gemini_tts

# LLM: usar el plugin de Google (Gemini) si está disponible,
# con fallback a Anthropic si solo está instalado ese plugin.
try:
    from livekit.plugins import google as google_plugin  # livekit-plugins-google

    def _make_llm():
        return google_plugin.LLM(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
            api_key=os.getenv("GEMINI_API_KEY"),
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

def _make_stt():
    voice_backend = os.getenv("VOICE_BACKEND", "gemini").lower()
    if voice_backend == "elevenlabs" and os.getenv("ELEVEN_API_KEY"):
        logger.info("🎙️ Usando ElevenLabs STT")
        return elevenlabs.STT(
            model="scribe_v2_realtime",
            api_key=os.getenv("ELEVEN_API_KEY"),
            language_code="es",
            server_vad={
                "vad_silence_threshold_secs": 0.3,
                "min_silence_duration_ms": 250,
            },
        )
    logger.info("🎙️ Usando Google Gemini Live STT (español nativo)")
    return gemini_stt.STT(
        api_key=os.getenv("GEMINI_API_KEY"),
        language="es",
    )

def _make_tts():
    voice_backend = os.getenv("VOICE_BACKEND", "gemini").lower()
    if voice_backend == "elevenlabs" and os.getenv("ELEVEN_API_KEY"):
        logger.info("🔊 Usando ElevenLabs TTS")
        return elevenlabs.TTS(
            api_key=os.getenv("ELEVEN_API_KEY"),
            voice_id=os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL"),
            model="eleven_flash_v2_5",
            streaming_latency=3,
            chunk_length_schedule=[50, 90, 140, 200],
        )
    voice_name = os.getenv("GEMINI_VOICE", "Aoede")
    logger.info(f"🔊 Usando Google Gemini TTS (voz: {voice_name})")
    return gemini_tts.TTS(
        api_key=os.getenv("GEMINI_API_KEY"),
        voice_name=voice_name,
    )

from shared.tools import TOOLS_LIVEKIT
from shared.system_prompt import SYSTEM_PROMPT

# Directivas de estilo optimizadas para canal de voz en tiempo real: respuestas ágiles y concisas
VOICE_STYLE_NOTE = (
    "\n\nDIRECTRICES DE VOZ ULTRA-RÁPIDA EN TIEMPO REAL:"
    "\n1. SÉ CONCISA: Responde en 1 o máximo 2 oraciones breves (máximo 25 a 30 palabras). Nunca des parrafadas largas."
    "\n2. RESPUESTA INMEDIATA: Ya conoces los 20 procedimientos de AuraMed. Responde directamente con tu conocimiento sin titubear."
    "\n3. CERO MARKDOWN: Prohibido usar asteriscos, viñetas o listas. Habla como en una conversación telefónica fluida y natural."
    "\n4. DIÁLOGO ACTIVO: Termina con una pregunta corta para guiar al paciente (ej: '¿Quieres saber los tiempos de reposo?', '¿Te gustaría agendar valoración?')."
)


# Se agrega request_fnc para aceptar las llamadas entrantes a la sala
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📥 Recibido JobRequest para sala: {req.job.room.name}. Aceptando como 'edy-voice-agent'...")
    await req.accept(
        name="edy-voice-agent",
        identity="aura-voice-assistant",
    )


async def entrypoint(ctx: JobContext):
    logger.info(f"🚀 Iniciando sesión de voz en sala {ctx.room.name}. LLM backend: {_LLM_BACKEND}")
    print(f"[aura-voice] Iniciando sesión de voz en sala {ctx.room.name}. LLM backend: {_LLM_BACKEND}")

    try:
        session = AgentSession(
            stt=_make_stt(),
            llm=_make_llm(),
            tts=_make_tts(),
            vad=silero.VAD.load(
                min_silence_duration=0.3,
                min_speech_duration=0.05,
                prefix_padding_duration=0.2,
            ),
            turn_handling={
                "endpointing": {
                    "min_delay": 0.1,
                    "max_delay": 0.5,
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
        session.on("conversation_item_added", lambda ev: logger.info(f"💬 Conversación item: {getattr(ev, 'item', ev)}"))

        logger.debug("⏳ Conectando agente a la sala LiveKit...")
        await session.start(agent=agent, room=ctx.room)
        logger.info("✅ AURA conectada a la sala WebRTC. Esperando interacciones...")

        # Pausa para sincronización WebRTC de audio en el navegador
        await asyncio.sleep(0.5)

        # Saludo inicial al conectarse para confirmar audio de inmediato
        session.say(
            "¡Hola! Soy Aura, tu asesora médica y estética en AuraMed. ¿En qué procedimiento te puedo orientar hoy?",
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
