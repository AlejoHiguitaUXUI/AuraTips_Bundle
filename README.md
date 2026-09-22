# 🌿 AuraTips — Microservicio Clínico de Acompañamiento Post-Procedimiento

> **Especificación Técnica, Contratos de Integración y Arquitectura del Sistema**  
> Diseñado para ser completamente agnóstico e interpretable tanto por desarrolladores como por modelos de lenguaje (LLMs / Agentes de IA) para habilitar conexiones directas con frontends, backends y microservicios externos.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector_&_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenSpec](https://img.shields.io/badge/OpenSpec-Validated_Spec--Driven-8B5CF6?style=flat-square)](./openspec/)

---

## 📑 Tabla de Contenidos

1. [Visión General del Sistema y Alcance](#1-visión-general-del-sistema-y-alcance)
2. [Arquitectura y Diagrama de Flujo](#2-arquitectura-y-diagrama-de-flujo)
3. [Modelo de Datos y pgvector (Supabase)](#3-modelo-de-datos-y-pgvector-supabase)
4. [Motor RAG y Búsqueda Semántica](#4-motor-rag-y-búsqueda-semántica)
5. [Protocolo de Seguridad: Triaje y Regla de los 3 Criterios](#5-protocolo-de-seguridad-triaje-y-regla-de-los-3-criterios)
6. [Personalidad y Tono Clínico (Few-Shot Engine)](#6-personalidad-y-tono-clínico-few-shot-engine)
7. [Contratos de Integración API & Webhooks (OpenAPI / M2M)](#7-contratos-de-integración-api--webhooks-openapi--m2m)
8. [Estructura de Directorios del Código](#8-estructura-de-directorios-del-código)
9. [Usuarios Preconfigurados y Credenciales de Prueba](#9-usuarios-preconfigurados-y-credenciales-de-prueba)
10. [Instalación y Despliegue Local](#10-instalación-y-despliegue-local)

---

## 1. Visión General del Sistema y Alcance

**AuraTips** es un microservicio desacoplado de soporte y acompañamiento post-tratamiento en medicina estética (inyectables, bioestimuladores, peelings y armonización facial). 

### Objetivos Clave de Negocio
- **Acompañamiento guiado día a día:** El paciente cuenta con un portal interactivo que calcula dinámicamente su día de evolución (*Día 0 a Día 30*) y le entrega checklists y pautas de cuidado temporalizadas.
- **Reducción de ansiedad post-operatoria:** Mediante un asistente conversacional RAG que tranquiliza con calidez y rigor médico respecto a síntomas habituales (edema, hematomas temporales, asimetría transitoria).
- **Triaje preventivo automatizado:** Detección de patrones de riesgo clínico para activar contacto directo con la especialista médica (**Dra. Mariana Gómez**), sin emitir diagnósticos alarmistas ni lenguaje fatalista.
- **Independencia arquitectónica (Non-EMR):** No compite ni duplica el expediente legal, consentimientos o facturación del sistema principal de la clínica (Sistema Madre), sino que se conecta mediante webhooks y APIs seguras.

---

## 2. Arquitectura y Diagrama de Flujo

El sistema se compone de una arquitectura en capas diseñada para alta disponibilidad, baja latencia (<200 ms) y desacoplamiento limpio:

```mermaid
graph TD
    subgraph "Sistemas Externos (Clínica Principal)"
        EMR[Sistema Madre EMR / CRM] -->|POST /api/v1/followup/assign| AssignAPI[API de Asignación AuraTips]
        AlarmWebhook[Receptor de Alertas EMR] <--|POST /api/webhooks/emergency-alert| WebhookEmitter[Emisor de Alertas AuraTips]
    end

    subgraph "AuraTips Microservice (Next.js 14 + Edge Functions)"
        AssignAPI --> CarePortal[Centro del Paciente: /dashboard/learning]
        DocPortal[Portal Especialista: /dashboard/teaching] -->|Edita Protocolos y Pautas| CourseEditor[Editor Clínico Dra. Mariana Gómez]
        CourseEditor -->|Trigger| EdgeFunc[Edge Function: embed-course en Deno]
        
        CarePortal -->|Consulta del Paciente| ChatAPI[Endpoint: POST /api/chat]
        ChatAPI --> Guardrails[1. Triaje de Seguridad: lib/rag/guardrails.ts]
        Guardrails -->|¿>= 3 criterios de alarma?| PanicButton[Botón de Atención Prioritaria WhatsApp]
        PanicButton -.-> WebhookEmitter
        
        ChatAPI --> Retriever[2. Retriever Semántico: lib/rag/retriever.ts]
        Retriever -->|Búsqueda Coseno gte-small| DBVector[(Supabase pgvector: match_courses HNSW)]
        Retriever --> Engine[3. Clinical Engine + Few-Shot Examples]
        Engine -->|Respuesta Empática Híbrida + Do's & Don'ts en Español| UI[Widget de Chat: ClinicalAssistantDrawer]
    end
```

---

## 3. Modelo de Datos y pgvector (Supabase)

La base de datos PostgreSQL en Supabase gestiona tanto las relaciones relacionales de cuidados como el espacio latente de vectores:

### 3.1. Tablas Principales

* **`courses` (Procedimientos Clínicos):**
  * `id` (UUID, PK)
  * `title` (TEXT): Nombre comercial del tratamiento (ej. *Toxina Botulínica Facial Integral*).
  * `slug` (TEXT, UNIQUE): Identificador URI amigable.
  * `description` (TEXT): Resumen fisiológico y objetivos.
  * `category` (TEXT): *Inyectables*, *Armonización Facial*, *Dermoestética*, *Bioestimulación*.
  * `recovery_time` (TEXT): Tiempos estimados (ej. *24 a 48 horas*).
  * `pain_level` (INTEGER, 1-5): Escala visual analógica de molestia.
  * `duration_minutes` (INTEGER): Tiempo en cabina médica.
  * `results_duration` (TEXT): Duración estética esperada (ej. *4 a 6 meses*).
  * `anesthesia_type` (TEXT): *Crioterapia / Tópica / Infiltrativa*.
  * `alarm_signs` (TEXT[]): Criterios de observación y signos de alerta médica.
  * `status` (TEXT): `'published'` | `'draft'`.
  * `embedding` (`vector(384)`): Vector denso generado por el modelo `gte-small`.

* **`modules` (Etapas de Recuperación):**
  * `id` (UUID, PK), `course_id` (FK), `title` (ej. *Fase Inmediata: Primeras 4 Horas*), `position` (INT).

* **`lessons` (Pautas de Cuidado):**
  * `id` (UUID, PK), `module_id` (FK), `title` (TEXT).
  * `timeline_tag` (TEXT): *Día 0*, *Días 1–3*, *Días 4–14*, *Día 15+*.
  * `care_type` (TEXT): *general*, *higiene*, *medicacion*, *alarma*.
  * `is_alarm` (BOOLEAN): Bandera de criterio de alarma médica.

* **`lesson_contents` (Detalle de Protocolo Clínico):**
  * `lesson_id` (UUID, PK, FK).
  * `dos` (TEXT[]): **Pautas recomendadas (Qué hacer)**.
  * `donts` (TEXT[]): **Acciones a evitar (Qué evitar)**.
  * `checklist_items` (JSONB): Lista de tareas del paciente `[{"id": "chk-1", "label": "...", "required": true}]`.
  * `emergency_contacts` (TEXT): Línea telefónica prioritaria de la Dra. Mariana Gómez.
  * `body_md` (TEXT): Explicación médica en Markdown.
  * `youtube_url` (TEXT): Video demostrativo de la técnica de cuidado.

* **`enrollments` (Seguimiento Activo de Pacientes):**
  * `id` (UUID, PK), `user_id` (FK a auth.users), `course_id` (FK a courses), `enrolled_at` (TIMESTAMPTZ).

### 3.2. Vectorización e Índice HNSW
La migración [`0007_rag_vector_search.sql`](./supabase/migrations/0007_rag_vector_search.sql) habilita la indexación ultra-rápida mediante grafos HNSW:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS courses_embedding_idx 
  ON public.courses USING hnsw (embedding vector_cosine_ops);
```

---

## 4. Motor RAG y Búsqueda Semántica

### 4.1. Generación de Embeddings
* **Modelo:** `Supabase/gte-small` (General Text Embeddings).
* **Dimensión del espacio vectorial:** 384 dimensiones flotantes normalizadas.
* **Pipeline:**
  - En la base de datos: Ejecutado mediante la Edge Function en Deno [`embed-course`](./supabase/functions/embed-course/index.ts).
  - En el runtime de consulta: Ejecutado en Node.js mediante `@xenova/transformers` en [`lib/rag/retriever.ts`](./lib/rag/retriever.ts).

### 4.2. Función RPC: `match_courses`
Permite calcular la distancia coseno invertida (`1 - (embedding <=> query_embedding)`) directamente en la GPU/CPU del motor Postgres:

```sql
CREATE OR REPLACE FUNCTION public.match_courses (
  query_embedding vector(384),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  description text,
  category text,
  recovery_time text,
  pain_level int,
  results_duration text,
  alarm_signs text[],
  cover_url text,
  price numeric,
  similarity float
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT courses.id, courses.title, courses.slug, courses.description,
         courses.category, courses.recovery_time, courses.pain_level,
         courses.results_duration, courses.alarm_signs, courses.cover_url,
         courses.price, (1 - (courses.embedding <=> query_embedding))::float AS similarity
  FROM courses
  WHERE courses.status = 'published' AND courses.embedding IS NOT NULL
    AND 1 - (courses.embedding <=> query_embedding) > match_threshold
  ORDER BY courses.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 5. Protocolo de Seguridad: Triaje y Regla de los 3 Criterios

Para garantizar máxima seguridad y evitar generar angustia o pánico en el paciente, **AuraTips no utiliza diagnósticos alarmistas** (*"posible riesgo de isquemia"*, *"necrosis"*, *"hemorragia"*). En su lugar, opera bajo una **regla clínica de 3 criterios objetivos**:

### 5.1. Grupos de Criterios Clínicos Evaluados
1. **Coloración y Temperatura:** Sensación de frialdad al tacto, palidez marcada o cambios de tono no habituales.
2. **Dolor Persistente:** Molestia pulsátil que no cede con el medicamento indicado en fórmula.
3. **Movilidad Palpebral / Ocular:** Dificultad para abrir el párpado o visión borrosa transitoria.
4. **Signos Dérmicos Vesiculares:** Presencia de pequeñas vesículas agrupadas o temperatura local elevada.
5. **Reacción Sistémica / Respiratoria:** Sensación de dificultad respiratoria o ahogo.

### 5.2. Lógica de Activación del Botón de Atención Prioritaria

| Criterios Detectados | Acción de AuraTips | Estado de Alerta |
| :---: | :--- | :---: |
| **0 Criterios** | Acompañamiento ordinario, validación empática, pautas recomendadas y acciones a evitar. | Normal |
| **1 a 2 Criterios** | Tranquiliza con calidez, explica el proceso inflamatorio natural, recuerda no manipular y ofrece pautas preventivas sin alarmismo. | Observación Serena |
| **3 o Más Criterios (o Sistémico)** | Activa inmediatamente el **Botón de Atención Médica Prioritaria** con enlace directo a WhatsApp hacia la **Dra. Mariana Gómez**. | 🚨 Prioritaria |

---

## 6. Personalidad y Tono Clínico (Few-Shot Engine)

AuraTips se rige por una biblioteca de ejemplos calibrados en [`lib/rag/few-shot-examples.ts`](./lib/rag/few-shot-examples.ts):

* **Identidad:** *"¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación..."*
* **Tratamiento cercano con tuteo:** Reduce la barrera clínica tradicional para acoger emocionalmente al paciente (*"Te comprendo perfectamente; es muy natural que al mirarte al espejo sientas inquietud..."*).
* **Tono Híbrido:**
  1. *Empatía y validación:* Primero se valida la emoción o molestia visual.
  2. *Explicación biológica concisa:* Se explica sin rodeos ni tecnicismos el por qué del síntoma (ej. drenaje asimétrico, retención de líquidos en las primeras 48h).
  3. *Pautas en español pulcro:* Estructura de **🟢 Pautas recomendadas (Qué hacer)** y **🔴 Acciones a evitar (Qué evitar)**, erradicando anglicismos como 'Do y Donts'.

### 6.1. Casos Maestros Calibrados
* **Caso 1 (Asimetría en Día 1-3):** Explica que cada lado drena a su propio ritmo. Recuerda que la simetría final se juzga en el **Día 14**. Indica realizar **únicamente los masajes suaves previamente pautados por la Dra. Mariana Gómez** (sin presiones improvisadas).
* **Caso 2 (Nódulo / Sensación de "Bolita"):** Explica la ventana de adaptación del ácido hialurónico (14 a 21 días) e impone la directriz estricta de **NO MANIPULACIÓN** (no pellizcar, no apretar).
* **Caso 3 (Vida Social y Eventos):** Firmeza médica con **48 horas de restricción absoluta de alcohol, tabaco y maquillaje** sobre los puntos de punción para prevenir vasodilatación e infecciones.
* **Caso 4 (Dolor y Analgesia):** Indica **revisar en primer lugar la fórmula médica entregada** y comunicarse con la Dra. Mariana si el dolor persiste, evitando AINEs por riesgo de hematomas.

---

## 7. Contratos de Integración API & Webhooks (OpenAPI / M2M)

AuraTips expone interfaces RESTful con autenticación Bearer para conexión directa con el sistema principal de la clínica:

### 7.1. Asignación de Tratamiento al Paciente (Sistema Madre $\rightarrow$ AuraTips)
* **Endpoint:** `POST /api/v1/followup/assign`
* **Headers:**
  ```http
  Authorization: Bearer <AURATIPS_SERVICE_SECRET>
  Content-Type: application/json
  ```
* **Request Payload (JSON):**
  ```json
  {
    "patient": {
      "external_id": "emr-pac-84920",
      "full_name": "Ana Gómez",
      "email": "paciente@auratips.io",
      "phone": "+573001234567"
    },
    "procedure": {
      "slug": "toxina-botulinica-botox-facial",
      "application_date": "2026-09-22T14:30:00Z",
      "doctor_name": "Dra. Mariana Gómez",
      "batch_number": "BTX-2026-09A",
      "treatment_notes": "Aplicación tercio superior 50 UI"
    },
    "initial_day": 0
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "followup_id": "fol_8293bd4",
    "access_url": "https://auratips.aestheticacare.com/dashboard/learning?token=...",
    "current_day": 0,
    "phase_tag": "Día 0"
  }
  ```

### 7.2. Consulta de Estado y Adherencia (Sistema Madre $\rightarrow$ AuraTips)
* **Endpoint:** `GET /api/v1/followup/status/:externalPatientId`
* **Response (200 OK):**
  ```json
  {
    "external_id": "emr-pac-84920",
    "current_day": 2,
    "checklist_compliance_rate": "100%",
    "emergency_alerts_triggered": 0,
    "next_control_date": "2026-10-06"
  }
  ```

### 7.3. Webhook de Alerta Prioritaria (AuraTips $\rightarrow$ Sistema Madre)
* **Endpoint:** `POST https://emr.clinicaprincipal.com/api/webhooks/auratips-alert`
* **Headers:** `X-Auratips-Signature: sha256=...`
* **Payload emitido:**
  ```json
  {
    "event": "patient.priority_alert_triggered",
    "timestamp": "2026-09-22T17:30:00Z",
    "patient": {
      "external_id": "emr-pac-84920",
      "name": "Ana Gómez"
    },
    "matched_criteria_count": 3,
    "doctor": "Dra. Mariana Gómez"
  }
  ```

### 7.4. Endpoint Interno de Chat con Memoria Multi-Turn
* **Endpoint:** `POST /api/chat`
* **Payload:**
  ```json
  {
    "message": "¿Puedo ponerme hielo hoy?",
    "procedureSlug": "acido-hialuronico-labios-russian-lips",
    "recoveryDay": 2,
    "history": [
      { "role": "user", "content": "Siento el labio hinchado" },
      { "role": "assistant", "content": "Te entiendo perfectamente..." }
    ]
  }
  ```

---

## 8. Estructura de Directorios del Código

```text
.
├── app/
│   ├── api/
│   │   ├── chat/route.ts                    # Endpoint central de AuraTips RAG y Guardrails
│   │   └── courses/search/route.ts          # Búsqueda semántica por síntomas
│   ├── dashboard/
│   │   ├── learning/page.tsx                # Centro del Paciente: "Mis Cuidados Activos"
│   │   ├── teaching/page.tsx                # Portal de la Dra. Mariana Gómez (Fase 5B)
│   │   ├── teaching/[slug]/page.tsx         # Editor de Procedimientos y Etapas Clínicas
│   │   └── _components/
│   │       ├── ClinicalAssistantDrawer.tsx  # Widget / Drawer de Chat AuraTips
│   │       ├── DailyCareChecklist.tsx       # Checklist interactivo de tareas diarias
│   │       ├── DoctorFollowUpCard.tsx       # Tarjeta de seguimiento y cita Día 14
│   │       ├── ActiveProcedureCard.tsx      # Contador de días y procedimiento activo
│   │       └── SymptomSafetyWidget.tsx      # Monitor de síntomas esperados vs alarma
├── components/
│   ├── CourseEditor.tsx                     # Editor maestro de parámetros médicos
│   ├── ModuleEditor.tsx                     # Editor de etapas temporales
│   └── LessonEditor.tsx                     # Editor clínico de pautas y checklists
├── lib/
│   ├── clinical-data.ts                     # Dataset clínico y fotografía médica HD
│   ├── database.types.ts                    # Tipos TypeScript de Supabase
│   └── rag/
│       ├── guardrails.ts                    # Triaje preventivo y regla de los 3 criterios
│       ├── few-shot-examples.ts             # Biblioteca de casos maestros calibrados
│       ├── clinical-engine.ts               # Síntesis clínica híbrida con memoria
│       └── retriever.ts                     # Pipeline de embeddings (gte-small) y HNSW
├── supabase/
│   ├── functions/embed-course/index.ts      # Edge Function Deno de vectorización
│   └── migrations/
│       ├── 0005_aesthetic_medicine.sql      # Tablas y metadatos clínicos
│       ├── 0006_seed_aesthetic_data.sql     # Seed inicial de procedimientos estéticos
│       └── 0007_rag_vector_search.sql       # pgvector, índice HNSW y RPC match_courses
├── docs/
│   └── integration-contract.md              # Especificación técnica del contrato de integración
├── openspec/                                # Especificaciones bajo el framework OpenSpec
│   └── changes/auratips-clinical-microservice/
├── CHANGELOG.md                             # Historial formal de versiones (v1.0.0)
└── README.md                                # Este documento de especificación
```

---

## 9. Usuarios Preconfigurados y Credenciales de Prueba

| Rol | Correo Electrónico | Contraseña | Identidad | Panel de Acceso |
| :--- | :--- | :--- | :--- | :--- |
| **Especialista Médica** | `especialista@auratips.io` | `Password123!` | Dra. Mariana Gómez | [`/dashboard/teaching`](http://localhost:3000/dashboard/teaching) |
| **Paciente en Seguimiento** | `paciente@auratips.io` | `Password123!` | Ana Gómez | [`/dashboard/learning`](http://localhost:3000/dashboard/learning) |

---

## 10. Instalación y Despliegue Local

### Requisitos Previos
* **Node.js**: v18+ o v20+ LTS.
* **Supabase**: Proyecto con extensión `pgvector` activada.

### Pasos de Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/AlejoHiguitaUXUI/AuraTips_Bundle.git
   cd AuraTips_Bundle
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   # Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Aplicar la migración SQL en Supabase:**
   Copia y ejecuta en el *SQL Editor* de Supabase el archivo:
   [`supabase/migrations/0007_rag_vector_search.sql`](./supabase/migrations/0007_rag_vector_search.sql)

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible de forma interactiva en **`http://localhost:3000`**.

6. **Verificación de tipos y linter:**
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
