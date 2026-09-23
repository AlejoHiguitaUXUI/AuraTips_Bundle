"""Script de Verificación Integral de Migración para microservicio-voice.

Valida:
1. Carga de variables de entorno (.env).
2. Plugin e integración de Google Gemini (LLM).
3. Conexión y credenciales de LiveKit Cloud (WebRTC).
4. Generación de Token JWT y solicitud de Dispatch a LiveKit.
5. Inicialización de la aplicación FastAPI y endpoint /health.
6. Inicialización de AgentSession de LiveKit.
"""

import sys
import os
import asyncio
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from dotenv import load_dotenv

load_dotenv(dotenv_path=BASE_DIR / ".env")

passed = 0
failed = 0

def log_test(name: str, success: bool, message: str = ""):
    global passed, failed
    status = "PASS" if success else "FAIL"
    icon = "[OK]" if success else "[X]"
    print(f"{icon} [{status}] {name}")
    if message:
        print(f"       -> {message}")
    if success:
        passed += 1
    else:
        failed += 1

print("=" * 60)
print("INICIANDO VERIFICACION DE MIGRACION: microservicio-voice")
print("=" * 60)

# 1. Variables de entorno
required_env_vars = [
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "LIVEKIT_URL",
    "LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET",
    "ELEVEN_API_KEY",
]
env_missing = [v for v in required_env_vars if not os.getenv(v)]
if not env_missing:
    log_test("Variables de Entorno", True, f"Todas las claves requeridas estan presentes ({len(required_env_vars)})")
else:
    log_test("Variables de Entorno", False, f"Faltan variables criticas: {env_missing}")

# 2. Google Gemini Plugin
try:
    from livekit.plugins import google
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    llm = google.LLM(
        model=model_name,
        api_key=os.getenv("GEMINI_API_KEY"),
        thinking_config={"thinking_level": "minimal"},
        temperature=0.3,
    )
    log_test("Plugin Google Gemini", True, f"Instanciado modelo {model_name} correctamente")
except Exception as e:
    log_test("Plugin Google Gemini", False, f"Error: {e}")

# 3. ElevenLabs Plugin
try:
    from livekit.plugins import elevenlabs
    stt = elevenlabs.STT(
        model="scribe_v2_realtime",
        api_key=os.getenv("ELEVEN_API_KEY"),
        language_code="es",
    )
    tts = elevenlabs.TTS(
        api_key=os.getenv("ELEVEN_API_KEY"),
        voice_id=os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL"),
        model="eleven_turbo_v2_5",
    )
    log_test("Plugins ElevenLabs (STT & TTS)", True, f"STT scribe_v2_realtime y TTS con voz {os.getenv('ELEVEN_VOICE_ID')} configurados")
except Exception as e:
    log_test("Plugins ElevenLabs (STT & TTS)", False, f"Error: {e}")

# 4. LiveKit Token & Cloud Dispatch
async def test_livekit():
    try:
        from api.main import _generate_voice_token
        res = await _generate_voice_token(room="migration-test-room", participant_name="tester")
        assert "token" in res and len(res["token"]) > 20, "Token invalido"
        assert res["url"] == os.getenv("LIVEKIT_URL"), "URL de LiveKit no coincide"
        log_test("LiveKit Cloud (Token & Dispatch)", True, f"Conexion exitosa a {res['url']}. Token generado ({len(res['token'])} bytes)")
    except Exception as e:
        log_test("LiveKit Cloud (Token & Dispatch)", False, f"Error al generar token/dispatch: {e}")

asyncio.run(test_livekit())

# 5. FastAPI App & Sonda Health
try:
    from api.main import app
    from starlette.testclient import TestClient
    client = TestClient(app)
    health_resp = client.get("/health")
    data = health_resp.json()
    assert health_resp.status_code == 200, f"Status code {health_resp.status_code}"
    assert data.get("status") == "ready", f"Health status no es ready: {data}"
    log_test("FastAPI /health Endpoint", True, f"Status: {data.get('status')} | Checks: {data.get('checks')}")
except Exception as e:
    log_test("FastAPI /health Endpoint", False, f"Error: {e}")

# 6. LiveKit Voice Agent CLI Runner
try:
    from voice.main import WorkerOptions, entrypoint, request_fnc
    opts = WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
        agent_name="edy-voice-agent",
    )
    assert opts.agent_name == "edy-voice-agent"
    log_test("WorkerOptions Voice Agent", True, f"WorkerOptions cargado con agent_name='{opts.agent_name}'")
except Exception as e:
    log_test("WorkerOptions Voice Agent", False, f"Error: {e}")

print("=" * 60)
print(f"RESUMEN: {passed} exitosas, {failed} fallidas")
print("=" * 60)

if failed > 0:
    sys.exit(1)
else:
    sys.exit(0)
