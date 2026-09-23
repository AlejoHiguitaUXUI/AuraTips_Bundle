---
activation: model-decision
description: Aplicar cuando se cree o modifique un endpoint de chat/conversacion que use la API de Claude (Messages API) con tool use, dentro de un microservicio Python (FastAPI) separado de la plataforma a la que sirve. Cubre el patron tecnico del loop; quien invoca esta skill solo debe indicar que tools necesita y las reglas de negocio del system prompt.
---

# Claude Chat Endpoint (patron tecnico, microservicio Python)

## Cuando aplica

Cada vez que se pida un endpoint conversacional respaldado por Claude con
tool use, dentro de un microservicio Python separado (no un Route Handler
de la plataforma misma). Este patron asume que el microservicio consume
los datos de la plataforma por HTTP, nunca tocando su base de datos
directamente.

## El patron (siempre igual)

1. Un endpoint `POST /chat` recibe `{ "message": string }`.
2. Arma la llamada a la Messages API con `system`, el historial de
   mensajes, y la lista de `tools` que se le haya indicado.
3. Si `stop_reason == "tool_use"`: ejecuta la funcion real que
   corresponde a cada bloque `tool_use` (que a su vez llama por HTTP a la
   plataforma), arma el `tool_result`, y vuelve a llamar a la API con ese
   resultado agregado a los mensajes.
4. Repite el paso 3 hasta que `stop_reason` sea distinto de `tool_use`, o
   hasta un limite de turnos (default: 4).
5. Devuelve `{ "reply": string }` con el texto final.

## Estructura de referencia

```python
# api/main.py
from fastapi import FastAPI
from anthropic import Anthropic
from shared.tools import TOOLS, TOOL_IMPLEMENTATIONS   # lo define quien invoca la skill
from shared.system_prompt import SYSTEM_PROMPT          # lo define quien invoca la skill

app = FastAPI()
client = Anthropic()  # lee ANTHROPIC_API_KEY del entorno, nunca hardcodear
MAX_TURNS = 4

@app.post("/chat")
async def chat(body: dict):
    messages = [{"role": "user", "content": body["message"]}]

    for _ in range(MAX_TURNS):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            text = next((b.text for b in response.content if b.type == "text"), "")
            return {"reply": text}

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = await TOOL_IMPLEMENTATIONS[block.name](**block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })
        messages.append({"role": "user", "content": tool_results})

    return {"reply": "No pude completar la respuesta."}
```

## Reglas duras

- El modelo por defecto es `claude-sonnet-4-6`, salvo que quien invoque la
  skill pida uno distinto por costo/latencia.
- `ANTHROPIC_API_KEY` se lee del entorno del servidor. Nunca se expone al
  cliente ni se hardcodea.
- Fija un `MAX_TURNS` explicito (default 4) para evitar loops infinitos.
- Las tools viven en `shared/tools.py` y llaman POR HTTP a la plataforma
  (nunca a su base de datos directamente) -el microservicio no tiene
  credenciales de esa base de datos.
- `shared/tools.py` y `shared/system_prompt.py` deben ser el MISMO
  modulo que use el canal de voz (si existe), para que ambos canales
  compartan exactamente el mismo comportamiento -no una copia paralela.

## Que debe traer quien invoca esta skill

Al pedir un endpoint con esta skill, hay que indicar:
1. **Las tools**: nombre, que hacen, y a que endpoint HTTP de la
   plataforma llaman.
2. **El system prompt / reglas de negocio**: que puede y no puede decir
   el asistente (normalmente ya documentado en una skill de dominio
   aparte, como `edy-edu-platform-os`).

La skill se encarga del MECANISMO (el loop, el manejo de turnos, la forma
de la respuesta); quien la invoca se encarga del DOMINIO (que tools, que
reglas).
