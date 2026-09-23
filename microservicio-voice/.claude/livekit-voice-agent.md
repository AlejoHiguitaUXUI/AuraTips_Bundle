---
activation: model-decision
description: Aplicar cuando se cree o modifique un agente de voz con LiveKit Agents (Python), usando ElevenLabs para ASR y TTS y Claude como LLM via livekit-plugins-anthropic, como parte del mismo microservicio que ya expone un canal de texto. Cubre el patron tecnico del AgentSession; quien invoca esta skill solo debe indicar que tools necesita y las reglas de negocio del asistente.
---

# LiveKit Voice Agent (patron tecnico, mismo microservicio que el canal de texto)

## Cuando aplica

Cada vez que se pida un agente de voz en tiempo real orquestado por
LiveKit, con ElevenLabs como proveedor de voz (ASR y TTS) y Claude como
LLM, dentro del MISMO microservicio que ya tiene (o tendra) un canal de
texto construido con la skill `claude-chat-endpoint`.

## El patron (siempre igual)

1. El agente de voz vive en `voice/main.py`, dentro del mismo
   microservicio que `api/main.py` (el canal de texto) -no en un
   proyecto aparte.
2. Ambos canales IMPORTAN el mismo `shared/tools.py` y
   `shared/system_prompt.py`. El agente de voz no redefine sus propias
   tools ni su propio texto de reglas.
3. Las tools llaman POR HTTP a la plataforma -el microservicio nunca
   toca la base de datos de la plataforma directamente.
4. El `AgentSession` combina: `stt=elevenlabs.STT(...)`,
   `llm=anthropic.LLM(...)`, `tts=elevenlabs.TTS(...)`, y VAD.
5. El texto de `shared/system_prompt.py` puede recibir un pequeno ajuste
   de ESTILO para voz (frases cortas, sin markdown) sin cambiar ninguna
   regla de negocio -esa parte se anexa, no se reescribe.

## Estructura de referencia

```python
# voice/main.py
from livekit.agents import AgentSession, Agent, JobContext, WorkerOptions, cli
from livekit.plugins import elevenlabs, anthropic, silero
from shared.tools import TOOLS_LIVEKIT           # las mismas tools que api/main.py, envueltas para LiveKit
from shared.system_prompt import SYSTEM_PROMPT   # el mismo texto que api/main.py

VOICE_STYLE_NOTE = "\nComo es voz: frases cortas, sin markdown, sin listas largas."

async def entrypoint(ctx: JobContext):
    session = AgentSession(
        stt=elevenlabs.STT(model="scribe_v2_realtime"),
        llm=anthropic.LLM(model="claude-sonnet-4-6"),
        tts=elevenlabs.TTS(),
        vad=silero.VAD.load(),
    )
    agent = Agent(
        instructions=SYSTEM_PROMPT + VOICE_STYLE_NOTE,
        tools=TOOLS_LIVEKIT,
    )
    await session.start(agent=agent, room=ctx.room)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

```python
# shared/tools.py (una tool, compartida por ambos canales)
import httpx, os
from livekit.agents import function_tool

PLATFORM_URL = os.environ["PLATFORM_URL"]  # la URL de la plataforma a la que este microservicio sirve

@function_tool
async def search_courses(query: str) -> dict:
    """Busca cursos en el catalogo real por similitud semantica."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{PLATFORM_URL}/api/courses/search", params={"q": query})
        return r.json()

TOOLS_LIVEKIT = [search_courses]
# api/main.py reutiliza la misma funcion (sin el decorador de LiveKit) para su propio loop de tool use
```

## Variables de entorno esperadas

```env
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
ANTHROPIC_API_KEY=...
ELEVEN_API_KEY=...
PLATFORM_URL=http://localhost:3000   # la plataforma externa a la que este microservicio sirve
```

## Reglas duras

- El agente nunca importa un cliente de base de datos de la plataforma:
  toda lectura/escritura pasa por HTTP a `PLATFORM_URL`.
- El modelo por defecto es `claude-sonnet-4-6`.
- `shared/tools.py` y `shared/system_prompt.py` son de UN SOLO lugar
  -si necesitas cambiar una tool o una regla, se cambia ahi, y ambos
  canales (texto y voz) lo heredan automaticamente en su proximo deploy.
- Ajustes de estilo de voz (frases cortas, sin markdown) se anexan al
  prompt compartido, nunca reemplazan las reglas de negocio que ya trae.

## Que debe traer quien invoca esta skill

Al pedir el agente de voz con esta skill, hay que indicar:
1. Que el canal de texto (`api/main.py`, skill `claude-chat-endpoint`)
   ya exista o se cree en el mismo microservicio.
2. Las reglas de negocio (normalmente ya documentadas en una skill de
   dominio aparte, como `edy-edu-platform-os`), que `shared/` debe
   reflejar para ambos canales.

La skill se encarga del MECANISMO (el AgentSession, el pipeline
ASR/LLM/TTS, como se comparte codigo con el canal de texto); quien la
invoca se encarga del DOMINIO.
