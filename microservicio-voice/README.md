# Agente EDY — Asistente Conversacional Omnicanal (Voz y Texto)

> **Especificación Técnica, Contratos de Integración y Arquitectura del Sistema**  
> Diseñado para ser completamente agnóstico e interpretable tanto por desarrolladores como por modelos de lenguaje (LLMs / Agentes de IA) para habilitar conexiones directas con frontends, backends y microservicios externos.

---

## 1. Resumen Ejecutivo y Propósito del Sistema

**EDY** es el asistente conversacional oficial de **Edu_platform_OS** (Datapath). Su objetivo principal es guiar a estudiantes y potenciales usuarios en la exploración del catálogo académico, responder dudas sobre oferta formativa y facilitar recomendaciones de cursos de forma interactiva y contextualizada.

El sistema está construido bajo un patrón **modular y omnicanal**, ofreciendo dos interfaces de interacción que comparten la misma lógica de negocio, identidad y herramientas:

1. **Canal de Texto (REST API)**: Microservicio en FastAPI que expone endpoints para mensajería asíncrona mediante llamadas de funciones (*function calling*) con Google Gemini, con soporte multi-turno (*conversation history*), CORS y sondas de salud (*health checks*).
2. **Canal de Voz en Tiempo Real (LiveKit WebRTC Worker)**: Agente autónomo de voz de ultrabaja latencia que orquestra detección de voz (VAD), transcripción (STT), razonamiento (LLM) y síntesis de voz (TTS) con despacho dinámico (*agent dispatch*).
3. **Módulo Compartido (`shared`)**: Fuente única de verdad (*Single Source of Truth*) para directrices de comportamiento, reglas de negocio (*system prompt*) y llamadas resilientes a APIs de la plataforma.

---

## 2. Diagrama de Arquitectura y Flujo de Integración

```mermaid
flowchart TB
    subgraph Clientes ["Servicios Externos y Clientes"]
        WebChat["Frontend Web (Chat Widget / Next.js / React)"]
        WebVoice["Frontend Web (Audio WebRTC / LiveKit SDK)"]
        ExternalBackend["Backend Externo / API Gateway / Bot"]
    end

    subgraph EdyService ["EDY Microservice (:8000)"]
        subgraph APIService ["api/main.py (FastAPI)"]
            HealthEndpoint["GET /health"]
            ChatEndpoint["POST /chat"]
            TokenEndpoint["GET / POST /voice/token"]
            CORS["CORSMiddleware"]
        end

        subgraph VoiceWorker ["voice/main.py (LiveKit Agent)"]
            VAD["Silero VAD (Local)"]
            STT["ElevenLabs Scribe v2 (STT)"]
            VoiceLLM["Google Gemini LLM"]
            TTS["ElevenLabs Turbo v2.5 (TTS)"]
        end

        subgraph SharedCore ["shared/"]
            SystemPrompt["system_prompt.py"]
            SharedTools["tools.py (search_courses)"]
        end
    end

    subgraph Infrastructure ["Infraestructura y Ecosistema"]
        LiveKitCloud["LiveKit Cloud / WebRTC Server"]
        GeminiAPI["Google Gemini API (gemini-3.6-flash)"]
        ElevenLabsAPI["ElevenLabs API"]
        EduPlatform["Edu_platform_OS (:3000 /api/courses/search)"]
    end

    %% Flujos de conexión de Clientes
    WebChat -->|HTTP POST JSON (con CORS)| ChatEndpoint
    ExternalBackend -->|HTTP GET| HealthEndpoint
    ExternalBackend -->|HTTP POST| ChatEndpoint
    WebVoice -->|Solicita Token WebRTC| TokenEndpoint

    %% Conexiones internas de API
    ChatEndpoint -->|Reglas de Identidad| SystemPrompt
    ChatEndpoint -->|Bucle Function Calling| GeminiAPI
    ChatEndpoint -->|search_courses| SharedTools
    TokenEndpoint -->|Crea Dispatch para 'edy-voice-agent'| LiveKitCloud

    %% Conexiones internas de Voz
    LiveKitCloud <-->|WebRTC Audio Stream Bidireccional| WebVoice
    LiveKitCloud <-->|Job Dispatch Request| VoiceWorker
    VoiceWorker --> VAD
    VoiceWorker --> STT
    STT --> ElevenLabsAPI
    VoiceWorker --> VoiceLLM
    VoiceLLM --> GeminiAPI
    VoiceWorker -->|Ejecuta Tool| SharedTools
    VoiceWorker --> TTS
    TTS --> ElevenLabsAPI

    %% Plataforma externa
    SharedTools -->|GET /api/courses/search?q=...| EduPlatform
```

---

## 3. Estructura de Directorios

```text
Agente EDY/
├── README.md                      # Especificación técnica y guía de integración completa
├── .gitignore                     # Protección de archivos sensibles y entornos
└── edy-service/                   # Directorio del microservicio
    ├── .env.example               # Plantilla de variables de entorno (con CORS y URLs)
    ├── .env                       # Variables locales activas (privado)
    ├── requirements.txt           # Dependencias de Python fijadas
    ├── mock_platform.py           # Servidor Mock de Edu_platform_OS para pruebas locales (:3000)
    │
    ├── shared/                    # Núcleo de lógica compartida
    │   ├── __init__.py
    │   ├── system_prompt.py       # Identidad de EDY, reglas de negocio y restricciones
    │   └── tools.py               # Función resiliente search_courses con timeouts y manejo de errores
    │
    ├── api/                       # Servicio REST API (FastAPI)
    │   └── main.py                # Endpoints /health, /chat, /voice/token y middleware CORS
    │
    ├── voice/                     # Worker de Voz en Tiempo Real
    │   └── main.py                # AgentSession LiveKit (VAD + STT + Gemini + ElevenLabs TTS)
    │
    ├── test_llm.py                # Verificación: inicialización de Gemini vía plugin
    ├── test_llm_call.py           # Verificación: streaming de texto con Gemini
    ├── test_google_stt.py         # Verificación: plugin STT
    ├── list_models.py             # Diagnóstico: modelos Gemini habilitados para la API Key
    └── create_dispatch_rule.py    # Utilidad de despacho manual en LiveKit
```

---

## 4. Contratos de APIs y Especificación de Endpoints

La API corre por defecto en `http://localhost:8000`. Incluye documentación interactiva Swagger en `/docs` y ReDoc en `/redoc`.

### 4.1. `GET /` — Índice del Servicio
Retorna metadatos y catálogo de endpoints disponibles.
```http
GET / HTTP/1.1
Host: localhost:8000
```
**Respuesta (200 OK):**
```json
{
  "service": "Edy Agent API",
  "version": "1.0.0",
  "status": "online",
  "docs_url": "/docs",
  "openapi_url": "/openapi.json",
  "endpoints": {
    "health": "GET /health",
    "chat": "POST /chat",
    "voice_token": "GET /voice/token | POST /voice/token"
  }
}
```

---

### 4.2. `GET /health` — Monitoreo y Verificación de Estado
Permite a orquestadores (Kubernetes, Docker), API Gateways o servicios frontend verificar si los proveedores y configuraciones están listos.
```http
GET /health HTTP/1.1
Host: localhost:8000
```
**Respuesta (200 OK):**
```json
{
  "status": "ready",
  "service": "edy-service",
  "version": "1.0.0",
  "checks": {
    "gemini_api_configured": true,
    "livekit_configured": true,
    "elevenlabs_configured": true,
    "platform_catalog_url": "http://localhost:3000"
  }
}
```
*Si faltase alguna clave de entorno crítica, `"status"` devolverá `"degraded"` indicando qué verificación falló.*

---

### 4.3. `POST /chat` — Canal de Texto (Soporte Simple y Multi-Turno)
Procesa un mensaje de usuario a través del bucle de *function calling* con Google Gemini. Puede recibir opcionalmente el historial previo para mantener memoria conversacional.

#### Caso A: Mensaje único simple
```http
POST /chat HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "message": "¿Tienen cursos de Machine Learning?"
}
```

#### Caso B: Conversación multi-turno con contexto acumulado
```http
POST /chat HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "message": "¿Cuánto cuesta el primero que mencionaste?",
  "history": [
    {
      "role": "user",
      "text": "Hola, ¿qué cursos de Python o Data Science tienen?"
    },
    {
      "role": "assistant",
      "text": "¡Hola! En Edu_platform_OS tenemos estas opciones: 1. Machine Learning para Data Science ($49.99), 2. Python Avanzado ($39.99)..."
    }
  ]
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "reply": "El curso de 'Machine Learning para Data Science' tiene un precio de $49.99 USD. Puedes inscribirte directamente desde la página del curso haciendo clic en el botón 'Inscribirme'."
}
```

**Errores Comunes:**
- `400 Bad Request`: `{ "detail": "El mensaje no puede estar vacío." }`
- `500 Internal Server Error`: Falta de `GEMINI_API_KEY` o error de comunicación no controlado.

---

### 4.4. `GET /voice/token` y `POST /voice/token` — Token WebRTC para Voz
Genera un token JWT firmado por LiveKit para que el navegador o dispositivo móvil se conecte a la sala de audio bidireccional. **Automáticamente despacha al agente `edy-voice-agent` a la sala solicitada.**

#### Vía GET (Query Parameters):
```http
GET /voice/token?room=edy-room-42&participant_name=estudiante-juan HTTP/1.1
Host: localhost:8000
```

#### Vía POST (JSON Body):
```http
POST /voice/token HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "room": "edy-room-42",
  "participant_name": "estudiante-juan"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "url": "wss://tu-proyecto.livekit.cloud",
  "room": "edy-room-42",
  "identity": "estudiante-juan-a1b2c3",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 5. Contrato con el Catálogo de Cursos (`Edu_platform_OS`)

Para que EDY pueda buscar cursos mediante su herramienta `search_courses`, el servicio backend de la plataforma debe exponer el siguiente endpoint en la URL configurada por `PLATFORM_URL` (por defecto `http://localhost:3000`):

### Especificación del Endpoint Upstream:
- **Ruta**: `GET /api/courses/search`
- **Query Param**: `q` (string con los términos de búsqueda o interés del estudiante).
- **Esquema de Respuesta Esperado (JSON)**:
```json
{
  "courses": [
    {
      "id": "ml-101",
      "title": "Machine Learning para Data Science",
      "description": "Aprende algoritmos supervisados, Scikit-Learn y despliegue.",
      "price": 49.99,
      "currency": "USD",
      "instructor": "Dra. Elena Ramos",
      "rating": 4.9,
      "level": "Intermedio",
      "url": "https://datapath.ai/cursos/machine-learning"
    }
  ],
  "total": 1
}
```
*Si la plataforma real aún no está lista durante el desarrollo, puedes ejecutar el servidor simulador incluido:*
```bash
python edy-service/mock_platform.py
```

---

## 6. Guía de Integración para Frontends y Otros Servicios

### 6.1. Integración de Voz en React / Next.js (LiveKit Components)

Instala el SDK oficial de LiveKit en tu proyecto frontend:
```bash
npm install @livekit/components-react livekit-client
```

Componente completo y funcional en React (`EdyVoiceAgent.tsx`):
```tsx
import React, { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
  useVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface VoiceSessionData {
  url: string;
  token: string;
}

export function EdyVoiceWidget() {
  const [session, setSession] = useState<VoiceSessionData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startVoiceSession = async () => {
    try {
      setIsConnecting(true);
      // Llamada al endpoint de EDY
      const response = await fetch('http://localhost:8000/voice/token?room=aula-demo&participant_name=estudiante', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('No se pudo obtener el token de voz');
      const data = await response.json();
      setSession({ url: data.url, token: data.token });
    } catch (err) {
      console.error('Error al conectar con EDY:', err);
      alert('Error al iniciar llamada con EDY');
    } finally {
      setIsConnecting(false);
    }
  };

  const endVoiceSession = () => {
    setSession(null);
  };

  if (!session) {
    return (
      <button 
        onClick={startVoiceSession} 
        disabled={isConnecting}
        style={{ padding: '12px 24px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {isConnecting ? 'Conectando con EDY...' : '🎙️ Hablar con EDY por Voz'}
      </button>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={session.url}
      token={session.token}
      audio={true}
      video={false}
      onDisconnected={endVoiceSession}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#1E293B', borderRadius: '12px', color: 'white' }}
    >
      <h3>Conversando con EDY (Voz en Vivo)</h3>
      <VoiceAssistantVisualizer />
      {/* Reproduce el audio entrante del agente */}
      <RoomAudioRenderer />
      {/* Barra de control con botón de silenciar micrófono y colgar */}
      <VoiceAssistantControlBar />
    </LiveKitRoom>
  );
}

function VoiceAssistantVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Estado del agente: <strong>{state}</strong></p>
      <BarVisualizer trackRef={audioTrack} style={{ height: '50px', width: '250px' }} />
    </div>
  );
}
```

---

### 6.2. Integración de Chat de Texto en TypeScript / JavaScript

Función reusable con historial conversacional:
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export async function sendMessageToEdy(
  message: string, 
  history: ChatMessage[] = []
): Promise<string> {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error en comunicación con EDY');
  }

  const data = await response.json();
  return data.reply;
}
```

---

### 6.3. Integración Backend-a-Backend en Python

```python
import httpx

EDY_API_URL = "http://localhost:8000"

async def ask_edy(message: str, history: list = None) -> str:
    async with httpx.AsyncClient() as client:
        payload = {"message": message}
        if history:
            payload["history"] = history
            
        res = await client.post(f"{EDY_API_URL}/chat", json=payload, timeout=60.0)
        res.raise_for_status()
        return res.json()["reply"]
```

---

### 6.4. Ejemplos Rápidos con cURL

```bash
# 1. Probar estado de salud
curl -X GET http://localhost:8000/health

# 2. Enviar mensaje de chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué cursos de Inteligencia Artificial tienen disponibles?"}'

# 3. Obtener token de voz (GET)
curl -X GET "http://localhost:8000/voice/token?room=sala-demo&participant_name=estudiante"

# 4. Obtener token de voz (POST)
curl -X POST http://localhost:8000/voice/token \
  -H "Content-Type: application/json" \
  -d '{"room": "sala-demo", "participant_name": "estudiante"}'
```

---

## 7. Variables de Entorno y Configuración de Red

Archivo `edy-service/.env`:

| Variable | Tipo | Requerida | Valor Predeterminado | Propósito |
| :--- | :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | `string` | **Sí** | - | Token de acceso a Google AI Studio para Gemini. |
| `GEMINI_MODEL` | `string` | No | `gemini-3.6-flash` | Identificador del modelo Gemini. |
| `LIVEKIT_URL` | `string` | **Sí** | - | Dirección WebSocket de LiveKit (`wss://...`). |
| `LIVEKIT_API_KEY` | `string` | **Sí** | - | Key para firmar tokens y despachar agentes. |
| `LIVEKIT_API_SECRET`| `string` | **Sí** | - | Secreto de LiveKit. |
| `ELEVEN_API_KEY` | `string` | **Sí** | - | Key de ElevenLabs para STT y TTS en tiempo real. |
| `ELEVEN_VOICE_ID` | `string` | No | `EXAVITQu4vr4xnSDxMaL` | Identificador de la voz de EDY en ElevenLabs. |
| `PLATFORM_URL` | `string` | No | `http://localhost:3000` | URL del catálogo de cursos de la plataforma. |
| `CORS_ORIGINS` | `string` | No | `*` | Orígenes permitidos separados por comas (ej. `http://localhost:3000`). |

---

## 8. Guía de Ejecución Local y Pruebas

Para un entorno de desarrollo completo con todas las piezas simuladas o reales:

```bash
# 1. Iniciar el entorno virtual
cd edy-service
source .venv/bin/activate

# 2. (Opcional) Si no tienes la plataforma real corriendo en :3000, inicia el mock:
python mock_platform.py &

# 3. Terminal 1: Iniciar API REST
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Terminal 2: Iniciar Agente de Voz LiveKit
python voice/main.py dev
```

---

## 9. Matriz de Solución de Problemas (Troubleshooting)

| Síntoma / Error | Causa Probable | Solución |
| :--- | :--- | :--- |
| **Error de CORS en navegador** (`blocked by CORS policy`) | El frontend corre en un puerto/dominio no listado en `CORS_ORIGINS`. | Añade la URL de tu frontend (ej. `http://localhost:3000`) a `CORS_ORIGINS` en `.env`. |
| **Timeout al consultar catálogo** | `PLATFORM_URL` no está encendido o responde con más de 10s de demora. | Verifica que el backend esté en ejecución o levanta `python mock_platform.py` en el puerto 3000. |
| **El agente de voz no responde ni entra a la sala** | El worker `voice/main.py` no está corriendo o las credenciales de LiveKit difieren. | Revisa que `python voice/main.py dev` esté activo y que `LIVEKIT_URL`, `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET` coincidan en ambos servicios. |
| **Error 500 en `/voice/token`** | Faltan variables de LiveKit en el `.env` de la API. | Verifica con `GET /health` que `livekit_configured` devuelva `true`. |
| **Audio de usuario no se transcribe en voz** | El navegador bloqueó el permiso de micrófono o el micrófono está silenciado. | Concede permisos de audio en el navegador y verifica que el track de audio esté habilitado en WebRTC. |
