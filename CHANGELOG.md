# Changelog

Todas las modificaciones notables realizadas en este proyecto están documentadas en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.2.0] - 2026-09-23

### 🚀 Añadido (Added)
- **Microservicio de Voz y Texto en Tiempo Real AURA (`microservicio-voice`):**
  - Desacoplamiento e integración técnica del microservicio Python con LiveKit Cloud WebRTC (`wss://edyagent-kd6idx85.livekit.cloud`).
  - Reconocimiento de voz (STT Scribe v2 realtime) y síntesis natural (TTS voz humana) provistos por ElevenLabs.
  - Orquestación y razonamiento médico-comercial con Google Gemini 3.6 Flash.
  - Servidor FastAPI en puerto `:8000` con endpoints `/health`, `/voice/token` y worker de voz en segundo plano (`voice/main.py dev`).
  - Suite de validación técnica automatizada `verify_migration.py` con 6/6 pruebas aprobadas (100% PASS).
  - Rebranding a **AURA**: Asesora virtual médica y comercial de **AuraMed Grupo Estético (Sede Medellín)**.
  - Directrices institucionales y comerciales de Medellín: sede física con parqueadero, medios de pago inmediatos con llaves **BRE-B**, citas de control a los 14 días y estricta política de valoración médica presencial obligatoria para cotizaciones y diagnósticos definitivos.
  - Triaje preventivo de urgencias: detección inmediata de sospecha de isquemia vascular (palidez/frialdad + dolor agudo), ptosis palpebral o anafilaxia con interrupción de IA y derivación prioritaria al especialista de guardia.

- **Catálogo Oficial Completo de 20 Procedimientos Clínicos:**
  - **Área Facial (9 tratamientos):** Toxina Botulínica Facial (Botox), Ácido Hialurónico en Labios (Russian Lips), Rinomodelación sin Cirugía, Peeling Químico Médico Facial, Bioestimuladores de Colágeno (Radiesse / Sculptra), Limpieza Facial Profunda + Plasma Rico en Plaquetas (PRP), Dermapen (Microneedling Facial), Radiofrecuencia Facial y Ultrasonido Facial con Sonoforesis.
  - **Área Corporal y Reducción (9 tratamientos):** Mesoterapia Corporal (Lipoescultura sin Cirugía), Hidrolipoclasia Ultrasónica (Cavitación Médica), Carboxiterapia Médica Corporal, Radiofrecuencia Corporal (Tensado y Anticelulitis), Ultrasonido Corporal y Drenaje Mecánico, Masaje Reductor y Moldeador, Drenaje Linfático Manual Médico (DLM), Masaje Relajante y Descontracturante, y Sueroterapia Intravenosa (Wellness & Detox).
  - **Área Capilar (2 tratamientos):** Terapia Capilar con Mesoterapia (Bioestimulación Folicular) y Terapia Capilar con Plasma Rico en Plaquetas (PRP Capilar).
  - Módulo clínico desacoplado en `lib/clinical-procedures-extended.ts` y catálogo unificado en `lib/clinical-data.ts`.

- **Botón CTA de AURA en la Barra de Búsqueda Principal (`ClinicalSearchBar.tsx`):**
  - Disposición fluida `Search bar ------ Consúltalo con AURA`.
  - Botón prominente `.aura-call-cta-btn` con degradado verde bosque de lujo, ribete dorado, icono telefónico (`PhoneIcon`) y halo pulsante verde esmeralda animado (`.aura-call-pulse-dot`).
  - Popover explicativo al pasar el cursor (*hover*) detallando las capacidades de AURA con IA y voz en vivo.
  - Modal interactivo de llamada WebRTC en tiempo real con visualizador de audio integrado (`EdyVoiceWidget.tsx`).

- **Sincronización Total en Supabase Cloud:**
  - Persistencia de los **20 procedimientos** en la tabla `courses` con metadatos médicos completos (`category`, `recovery_time`, `pain_level`, `duration_minutes`, `results_duration`, `anesthesia_type`, `alarm_signs`).
  - Estructuración de **35 módulos** en `modules`, **36 lecciones clínicas** en `lessons` y **36 contenidos paso a paso** en `lesson_contents`.
  - Endpoint de sincronización seguro `app/api/admin/seed/route.ts` y script CLI `npm run seed` (`scripts/seed.mjs`) respaldado por `scripts/clinical-procedures-dataset.json`.

- **Generación de Vector Embeddings al 100%:**
  - **20 de 20 procedimientos vectorizados** en vectores densos de 384 dimensiones (`gte-small`) en Supabase (0 campos NULL en `courses.embedding`).
  - Optimización de `searchCoursesBySimilarity` en `lib/embeddings.ts` para conectar con la función RPC `match_courses` y vector query embeddings.
  - Ranking semántico de alta precisión ante dudas corporales, faciales y capilares en `/api/courses/search`.

- **Banco Fotográfico Clínico Original con IA (Gemini):**
  - Generación de 15 fotografías clínicas originales con Gemini (`generate_image`), ambientadas en una clínica médico-estética premium en Medellín con personal médico, aparatología y camillas de lujo.
  - Alojamiento local en `public/images/` y verificación HTTP de respuesta exitosa (`200 OK`) en las 20 portadas, eliminando enlaces rotos y dependencias de Unsplash.

---

## [1.1.0] - 2026-09-22

### 🚀 Añadido (Added)
- **Enrutador de Intenciones Inteligente (`lib/rag/clinical-engine.ts`):**
  - Clasificación de intenciones del paciente en 4 vertientes: `scheduling` (Citas y Agendamiento), `human_handoff` (Atención telefónica / Humana), `clinical_query` (Consulta clínica concisa) y `alert_triage` (Triaje preventivo de alerta).
  - **Regla estricta para citas y llamadas:** Erradicación de respuestas genéricas de "Pautas recomendadas / Qué evitar" ante preguntas administrativas o solicitudes de llamada; respuesta empática en 2 líneas y enlaces directos (`tel:+573009123456` y WhatsApp de recepción).
  - Pedagogía médica del Día 14: reconocimiento de la cita programada con la **Dra. Mariana Gómez** y fundamentación biológica de estabilización del producto.
- **Calibración de Sensibilidad en Criterios de Triaje (`lib/rag/guardrails.ts`):**
  - Ampliación de expresiones regulares en `CLINICAL_ALARM_CRITERIA` para reconocer diminutivos y expresiones cotidianas (*ampollitas*, *pálida*, *fría*, *me duele mucho*).
- **Suite de Pruebas de Estrés Automatizada (`scripts/test_chat_scenarios.mjs`):**
  - Batería de validación que simula 5 interacciones clínicas reales contra `POST /api/chat`, verificando latencia, pertinencia, ausencia de tecnicismos alarmistas y concisión.
- **Componentes de Audio y Voz (`components/voice/EdyVoiceWidget.tsx`):**
  - Soporte de estilos `@livekit/components-styles` para renderizado fluido del visualizador de audio en el asistente.

### 🔄 Modificado (Changed)
- **Control de Extensión y Concisión (Anti-Biblias):**
  - Calibración de todos los casos Few-Shot (`lib/rag/few-shot-examples.ts`) y respuestas dinámicas para limitarlas a 2 o 3 párrafos cortos en tuteo respetuoso y cercano.

---

## [1.0.0] - 2026-09-22

### 🚀 Añadido (Added)
- **Transformación a Microservicio Clínico (AuraTips):**
  - Desacoplamiento total de plataformas educativas y reorientación como microservicio especializado en el acompañamiento y recuperación post-procedimiento en medicina estética.
  - Identidad médica oficial asignada a la **Dra. Mariana Gómez** (Dirección de Protocolos Clínicos & AuraTips).
  - Usuarios y roles clínicos preconfigurados: `especialista@auratips.io` y `paciente@auratips.io`.

- **Motor RAG y Vectorización Semántica:**
  - Integración de la extensión `pgvector` en Supabase con vectores densos de 384 dimensiones generados mediante el modelo `gte-small`.
  - Índice `HNSW` (Hierarchical Navigable Small World) sobre `courses.embedding` optimizado con `vector_cosine_ops`.
  - Función RPC `match_courses` con permisos `SECURITY DEFINER` para búsqueda rápida por similitud coseno cruzando metadatos clínicos.
  - Edge Function en Deno (`embed-course`) para vectorización continua de protocolos en tiempo de guardado.

- **Asistente Clínico Inteligente AuraTips (`/api/chat`):**
  - Widget / Drawer flotante interactivo (`ClinicalAssistantDrawer.tsx`) con diseño *Luxury Clinical* (paleta Forest & Gold).
  - Saludo oficial: *"¡Hola! Bienvenido(a) a AuraTips, tu asistente clínico de recuperación..."*.
  - Tono híbrido empático: Validación emocional con tuteo para reducir la ansiedad visual del paciente, seguido de explicación fisiológica concisa del proceso inflamatorio habitual.
  - Biblioteca de ejemplos maestros Few-Shot (`lib/rag/few-shot-examples.ts`) que instruye al asistente en 5 escenarios críticos: asimetría en días 1–3 y masajes pautados, nódulos temporales y no manipulación, restricciones de vida social (48h sin alcohol/maquillaje), manejo farmacológico según fórmula médica y protocolo de alerta.
  - Memoria conversacional multi-turn: soporte para arrastre de historial de mensajes en `/api/chat`.

- **Triaje Preventivo de Seguridad y Regla de 3 Criterios de Alarma (`lib/rag/guardrails.ts`):**
  - Evaluación de 5 grupos de criterios clínicos de observación (cambio de coloración/frialdad, dolor pulsátil no controlado, afectación palpebral/ocular, vesículas/fiebre y compromiso respiratorio).
  - Umbral de seguridad estricto: Únicamente si coinciden **al menos 3 criterios simultáneos** se activa el **Botón de Atención Médica Prioritaria** hacia la Dra. Mariana Gómez.
  - Erradicación total de lenguaje fatalista o diagnósticos aterradores (*isquemia, necrosis, hemorragia*).

- **Fase 5B — Portal de Gestión de la Especialista (`/dashboard/teaching`):**
  - Dashboard de la Dra. Mariana Gómez con métricas de procedimientos activos en el motor RAG.
  - Editor de Parámetros Médicos (`CourseEditor.tsx`): tiempo de recuperación, escala de molestia (1 a 5), anestesia, duración de resultados y criterios de alarma.
  - Editor de Etapas y Protocolos Diarios (`ModuleEditor.tsx` y `LessonEditor.tsx`): configuración de fases temporales (`Día 0`, `Días 1–3`, `Días 4–14`), listas interactivas de tareas (checklists) y pautas médicas.

- **Centro del Paciente ("Mis Cuidados Activos" en `/dashboard/learning`):**
  - Contador dinámico de días de evolución y fase clínica activa.
  - Checklist diario con persistencia en `localStorage` y barra de progreso.
  - Monitor preventivo de síntomas esperados vs signos de observación médica.
  - Tarjeta de seguimiento con cuenta regresiva para la cita de control de los 14 días.

- **Especificaciones e Integración:**
  - Especificación formal del contrato de integración OpenAPI con el sistema madre de la clínica (`docs/integration-contract.md`).
  - Registro, especificaciones y validación completa bajo el framework **OpenSpec** (`openspec/changes/auratips-clinical-microservice/`).

### 🔄 Modificado (Changed)
- Erradicación definitiva de anglicismos ('Do y Donts') en toda la plataforma, reemplazados por **"🟢 Pautas recomendadas (Qué hacer)"** y **"🔴 Acciones a evitar (Qué evitar)"**.
- Actualización de esquema SQL maestro (`0007_rag_vector_search.sql`) que consolida pgvector, columnas clínicas y función RPC.

### 🗑️ Eliminado (Removed)
- Eliminación de módulos antiguos de prueba sobre software (Snowflake, dbt, PyTorch).
- Eliminación de componentes obsoletos de gamificación (`StreakProtectionModal`, `XPBurst`) y reproductor de video con cuestionarios interactivos.
- Descarte de la Fase 7 (Ficha médica / EMR) para evitar duplicidad de datos con el software principal de la clínica.
