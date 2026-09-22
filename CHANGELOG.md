# Changelog

Todas las modificaciones notables realizadas en este proyecto están documentadas en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
