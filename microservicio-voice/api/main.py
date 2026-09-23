import os
import json
import inspect
import traceback
import httpx
import uuid
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Cargar variables de entorno (.env) ANTES de cualquier otra lectura
load_dotenv()

from livekit import api as livekit_api
from shared.tools import search_courses
from shared.system_prompt import SYSTEM_PROMPT

app = FastAPI(
    title="Aura Agent API",
    version="1.0.0",
    description="API para la Asistente Virtual Médica y Estética AURA (AuraMed / AuraTips). Proporciona endpoints para chat de texto con function calling y generación de tokens WebRTC para voz en tiempo real con LiveKit.",
)

# ---------------------------------------------------------------------------
# Configuración de CORS para integración con servicios frontend o externos
# ---------------------------------------------------------------------------
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_TURNS = 4

# ---------------------------------------------------------------------------
# Definición de herramientas para la API de Gemini (function calling)
# ---------------------------------------------------------------------------
GEMINI_FUNCTION_DECLARATIONS = [
    {
        "name": "search_courses",
        "description": "Busca procedimientos médicos y estéticos, cuidados y protocolos en el catálogo de AuraTips y AuraMed por similitud semántica.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {
                    "type": "STRING",
                    "description": "Término de búsqueda, tratamiento estético, zona anatómica o inquietud (ej. toxina botulínica, relleno de labios, rinomodelación, etc.).",
                }
            },
            "required": ["query"],
        },
    }
]

# Mapa nombre → función real
TOOL_IMPLEMENTATIONS = {
    "search_courses": search_courses,
}


# ---------------------------------------------------------------------------
# Modelos Pydantic para Request / Response
# ---------------------------------------------------------------------------
class ChatHistoryItem(BaseModel):
    role: str = Field(
        ...,
        description="Rol del emisor: 'user' o 'assistant' / 'model'.",
        examples=["user", "assistant"],
    )
    text: str = Field(
        ...,
        description="Contenido del mensaje previo en la conversación.",
        examples=["Hola, busco cursos de desarrollo web"],
    )


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        description="Mensaje actual del usuario.",
        examples=["¿Cuáles son los 3 mejores cursos de Python?"],
    )
    history: Optional[List[ChatHistoryItem]] = Field(
        default=None,
        description="Historial previo de la conversación para mantener contexto multi-turno.",
    )


class VoiceTokenRequest(BaseModel):
    room: Optional[str] = Field(
        default="edy-room",
        description="Nombre de la sala en LiveKit.",
        examples=["edy-room"],
    )
    participant_name: Optional[str] = Field(
        default="user",
        description="Nombre o identificador visible del participante.",
        examples=["estudiante-123"],
    )


# ---------------------------------------------------------------------------
# Endpoints Informativos y de Salud
# ---------------------------------------------------------------------------
@app.get("/", tags=["Información"])
async def root():
    """Retorna información general del servicio y enlaces a la documentación."""
    return {
        "service": "Edy Agent API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "endpoints": {
            "health": "GET /health",
            "chat": "POST /chat",
            "voice_token": "GET /voice/token | POST /voice/token",
        },
    }


@app.get("/health", tags=["Salud y Monitoreo"])
async def health_check():
    """
    Verifica el estado del servicio y la presencia de variables de entorno críticas.
    Ideal para readiness/liveness probes en orquestadores o integraciones externas.
    """
    gemini_key = bool(os.getenv("GEMINI_API_KEY"))
    livekit_url = bool(os.getenv("LIVEKIT_URL"))
    livekit_key = bool(os.getenv("LIVEKIT_API_KEY"))
    livekit_secret = bool(os.getenv("LIVEKIT_API_SECRET"))
    eleven_key = bool(os.getenv("ELEVEN_API_KEY"))
    platform_url = os.getenv("PLATFORM_URL", "http://localhost:3000")

    all_ready = gemini_key and livekit_url and livekit_key and livekit_secret

    return {
        "status": "ready" if all_ready else "degraded",
        "service": "edy-service",
        "version": "1.0.0",
        "checks": {
            "gemini_api_configured": gemini_key,
            "livekit_configured": livekit_url and livekit_key and livekit_secret,
            "elevenlabs_configured": eleven_key,
            "platform_catalog_url": platform_url,
        },
    }


# ---------------------------------------------------------------------------
# Endpoint de Chat (Texto)
# ---------------------------------------------------------------------------
@app.post("/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Endpoint principal para interacción por texto.
    Soporta mensajes individuales o conversaciones multi-turno mediante el campo opcional 'history'.
    Ejecuta llamadas de herramientas contra Edu_platform_OS y aplica las reglas de negocio de EDY.
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400, detail="El mensaje no puede estar vacío."
            )

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY no está configurada en el entorno.",
            )

        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model_name}:generateContent?key={api_key}"
        )

        # Reconstruir contenidos con historial si se proporcionó
        contents = []
        if request.history:
            for item in request.history:
                # Normalizar rol para Gemini: 'assistant' -> 'model'
                norm_role = "model" if item.role in ("assistant", "model") else "user"
                contents.append(
                    {
                        "role": norm_role,
                        "parts": [{"text": item.text}],
                    }
                )

        # Mensaje actual del usuario
        contents.append(
            {
                "role": "user",
                "parts": [{"text": request.message}],
            }
        )

        async with httpx.AsyncClient() as http_client:
            for turn in range(MAX_TURNS):
                payload = {
                    "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                    "tools": [
                        {"function_declarations": GEMINI_FUNCTION_DECLARATIONS}
                    ],
                    "contents": contents,
                }

                print(f"[turn {turn}] Enviando request a Gemini…")
                res = await http_client.post(url, json=payload, timeout=60.0)

                if res.status_code != 200:
                    error_body = res.text
                    print(f"[turn {turn}] Gemini respondió {res.status_code}: {error_body}")
                    raise HTTPException(
                        status_code=res.status_code,
                        detail=f"Error en Gemini API: {error_body}",
                    )

                data = res.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    print(f"[turn {turn}] Sin candidates en la respuesta de Gemini")
                    return {"reply": "No recibí respuesta del modelo."}

                candidate_content = candidates[0].get("content", {})
                parts = candidate_content.get("parts", [])

                # Agregar la respuesta del modelo al historial de la llamada
                contents.append(candidate_content)

                # ¿Hay llamadas a funciones?
                function_calls = [p for p in parts if "functionCall" in p]

                if not function_calls:
                    text = "".join(
                        p.get("text", "") for p in parts if "text" in p
                    )
                    print(f"[turn {turn}] Respuesta final: {text[:120]}…")
                    return {"reply": text}

                # Ejecutar cada herramienta solicitada
                function_responses = []
                for p in function_calls:
                    call_info = p["functionCall"]
                    func_name = call_info.get("name")
                    args = call_info.get("args", {})
                    print(f"[turn {turn}] Tool call: {func_name}({args})")

                    tool_func = TOOL_IMPLEMENTATIONS.get(func_name)
                    if tool_func is None:
                        result = {
                            "error": f"Herramienta '{func_name}' no implementada."
                        }
                    else:
                        try:
                            if inspect.iscoroutinefunction(tool_func):
                                result = await tool_func(**args)
                            else:
                                result = tool_func(**args)
                        except Exception as tool_err:
                            print(f"[turn {turn}] Error ejecutando {func_name}: {tool_err}")
                            traceback.print_exc()
                            result = {"error": str(tool_err)}

                    # Gemini espera que response sea un dict
                    if not isinstance(result, dict):
                        result = {"result": result}

                    function_responses.append(
                        {
                            "functionResponse": {
                                "name": func_name,
                                "response": result,
                            }
                        }
                    )

                contents.append(
                    {
                        "role": "user",
                        "parts": function_responses,
                    }
                )

        return {"reply": "No pude completar la respuesta tras múltiples iteraciones de herramientas."}

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "traceback": traceback.format_exc(),
            },
        )


# ---------------------------------------------------------------------------
# Endpoint de Token de Voz (LiveKit WebRTC)
# ---------------------------------------------------------------------------
async def _generate_voice_token(room: str, participant_name: str) -> dict:
    """Función compartida para generar token LiveKit y convocar al agente."""
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_url = os.getenv("LIVEKIT_URL")

    if not api_key or not api_secret:
        raise HTTPException(
            status_code=500,
            detail="LIVEKIT_API_KEY o LIVEKIT_API_SECRET no están configurados.",
        )

    # Despachar al agente 'edy-voice-agent' a la sala si aún no está despachado
    try:
        lk = livekit_api.LiveKitAPI(livekit_url, api_key, api_secret)
        await lk.agent_dispatch.create_dispatch(
            livekit_api.CreateAgentDispatchRequest(
                agent_name="edy-voice-agent",
                room=room,
            )
        )
        await lk.aclose()
    except Exception:
        # Si el dispatch ya fue creado o está activo, continuamos normalmente
        pass

    # Crear el token para el usuario
    identity = f"{participant_name}-{uuid.uuid4().hex[:6]}"
    token = (
        livekit_api.AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(participant_name)
        .with_grants(
            livekit_api.VideoGrants(
                room_join=True,
                room=room,
                can_publish=True,
                can_subscribe=True,
            )
        )
    )

    return {
        "url": livekit_url,
        "room": room,
        "identity": identity,
        "token": token.to_jwt(),
    }


@app.get("/voice/token", tags=["Voz"])
async def get_voice_token_get(
    room: str = Query(default="edy-room", description="Nombre de la sala LiveKit"),
    participant_name: str = Query(default="user", description="Nombre identificador del participante"),
):
    """
    Genera un Access Token vía GET para que el frontend se conecte a la sala LiveKit por WebRTC.
    Despacha automáticamente al agente de voz a la sala.
    """
    return await _generate_voice_token(room=room, participant_name=participant_name)


@app.post("/voice/token", tags=["Voz"])
async def get_voice_token_post(request: VoiceTokenRequest):
    """
    Genera un Access Token vía POST (JSON body) para clientes que prefieren payload estructurado.
    Despacha automáticamente al agente de voz a la sala.
    """
    room = request.room or "edy-room"
    participant_name = request.participant_name or "user"
    return await _generate_voice_token(room=room, participant_name=participant_name)
