# Changelog

Todas las modificaciones notables realizadas en este proyecto están documentadas en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.4.1] - 2026-10-09

### 🔧 Corregido y Optimizado (Fixed & Optimized)

- **Feature Flag para AURA Voice Assistant (`NEXT_PUBLIC_ENABLE_AURA_VOICE`):**
  - Se implementó un "interruptor" (Feature Flag) para ocultar temporalmente el botón y sección de asistencia por voz en vivo (`AuraVoiceSection`) en producción, debido a limitaciones severas de memoria (OOM) al cargar PyTorch/Silero VAD en el plan gratuito de Render.
  - El componente regresará de forma predeterminada un valor nulo a menos que la variable de entorno se establezca explícitamente en `"true"`. Esto permite mantener el código intacto en la rama principal y probarlo localmente mientras se tramita la escalabilidad del servidor.

---

## [1.4.0] - 2026-10-04

### 🚀 Añadido (Added)

- **Hero Editorial de Alta Gama y Carrusel Orgánico de 5 Arcos (`components/EditorialHero.tsx`):**
  - Rediseño editorial centrado en el titular "Cuidado & Recuperación" con tipografía serif y balance visual sin elementos distractores.
  - Carrusel continuo de 5 arcos visibles en pantalla con geometría fija (`border-radius: 140px 140px 32px 32px !important`), aceleración por hardware mediante `translateZ(0)` y `transform-origin: bottom center`.
  - Sistema de profundidad visual con desenfoque progresivo (`filter: blur(0px)` en tarjeta central, `1.8px` en laterales inmediatos y `3.5px` en extremos).
  - Transiciones continuas e infinitas con curva `cubic-bezier(0.4, 0, 0.2, 1)`, rotación automática cada 3.8s, navegación bidireccional por vectores SVG, indicadores interactivos y soporte de gestos táctiles (touch swipe).
  - Estrategia de carga anticipada (`loading="eager"` / `priority`) para la totalidad de las 12 imágenes del carrusel, eliminando retrasos y arcos oscuros durante la rotación.

- **Fondo Atmosférico Procedural Shader (`components/Aurora.tsx` & `components/GlobalAurora.tsx`):**
  - Renderizado procedural WebGL continuo con paleta adaptativa para modos claro y oscuro, aportando profundidad luminosa a la interfaz general.

- **Catálogo Comercial y Editorial Público (`app/courses/page.tsx`):**
  - Nueva ruta `/courses` ("Conoce otros procedimientos") accesible desde la cabecera y el panel de paciente, presentando el catálogo oficial de tratamientos de AuraMed.
  - Filtrado dinámico en cliente por categorías médicas (Facial, Corporal y Reducción, Capilar).
  - Fichas informativas con tiempos de recuperación estimados, escala de molestia y enlaces a protocolos y agendamiento.

- **Arquitectura de Roles Clínicos (RBAC) y Persistencia Supabase (`supabase/migrations/0008_...sql`):**
  - Implementación de roles en base de datos: `patient` (Paciente en Cuidados), `specialist` (Dirección Clínica) y `admin`.
  - Extensión de la tabla `profiles` con `role`, `phone`, `notification_preferences` (jsonb con flags WhatsApp/Email), `medical_license` e `invited_by`.
  - Ampliación de la tabla `enrollments` con fecha de intervención (`procedure_date`), especialista asignador (`assigned_by`), notas médicas personalizadas y caché de día actual de recuperación.
  - Políticas RLS y funciones de seguridad PostgreSQL (`is_specialist()`, `get_my_role()`, prevención de escalación de privilegios).
  - Helper universal de resolución de roles clínicos `lib/auth-role.ts`.

- **Editor Clínico en 3 Pasos (Wizard Guiado) y Gestor de Portadas:**
  - Transformación del editor de cursos en un wizard médico secuencial en `components/CourseEditor.tsx`, `components/ModuleEditor.tsx` y `components/LessonEditor.tsx`:
    - **Paso 1: Ficha Médica y Portada** (categoría, tiempos de reposo, escala de molestia, tipo de anestesia y selección de fotografía médica).
    - **Paso 2: Cronograma Timeline de Fases** (definición y reordenamiento de etapas temporales).
    - **Paso 3: Pautas Clínicas, Checklists y Alarmas** (pautas Do's / Don'ts, signos de alarma, contactos de emergencia y lista de verificación).
  - Componente `components/CoverImageUploader.tsx` con tres modos: galería predefinida de procedimientos, subida de fotografía clínica directa y enlace URL.
  - Endpoint seguro `POST /api/upload` con validación estricta de permisos de especialista, cuota máxima de 5 MB y tipos MIME admitidos (JPEG, PNG, WEBP, GIF, AVIF).

- **Perfil Clínico y Preferencias de Notificación (`components/ProfileForm.tsx` & `app/dashboard/profile/page.tsx`):**
  - Formulario de perfil con soporte para número telefónico y activación de notificaciones de desinflamación y cuidados vía WhatsApp.
  - Badges semánticos de rol clínico en el dashboard ("Dirección Clínica" vs "Paciente en Cuidados").

- **Nuevos Íconos SVG para Flujos Clínicos (`components/icons/index.tsx`):**
  - Incorporación de `BellIcon`, `PlusIcon`, `PencilIcon`, `ImageIcon`, `UploadCloudIcon` y `SaveIcon`.

### 🔧 Corregido y Optimizado (Fixed & Optimized)

- **Accesibilidad y Contraste de Color Clínico WCAG AAA (`app/globals.css`, `components/PatientChecklist.tsx`):**
  - Tokens específicos para Alertas SOS (`--color-clinical-alarm-*`), Acciones Recomendadas (`--color-clinical-do-*`) y Acciones Prohibidas (`--color-clinical-dont-*`), alcanzando ratios de contraste superiores a 7:1 y 9:1 tanto en modo claro como oscuro.
- **Rendimiento y Suavidad de Arcos en Carrusel:**
  - Erradicación de transiciones bruscas de border-radius al hacer hover mediante `isolation: isolate` y clipping permanente con máscara radial.
- **Estabilidad del Servidor de Desarrollo:**
  - Eliminación de bloqueos y errores 500 derivados de colisiones concurrentes en la caché `.next`.

---

## [1.3.1] - 2026-09-28

### 🔧 Corregido (Fixed)

- **Conflicto de enrutamiento dinámico en Next.js App Router (`/courses/[slug]` vs `/courses/[id]`):**
  - Se resolvió el error crítico `[Error: You cannot use different slug names for the same dynamic path ('id' !== 'slug')]` unificando la resolución por slug semántico y por UUID dentro de `app/courses/[slug]/page.tsx`.
  - Se eliminó la carpeta duplicada en conflicto `app/courses/[id]`.
  - Se solucionó la falla de compilación de estilos (HTTP 404 en `layout.css` y `page.css`) y el efecto FOUC en el frontend.
- **Configuración de Supabase CLI (`supabase/config.toml`):**
  - Se inicializó la configuración completa de Supabase CLI v2.118 preservando la configuración de la Edge Function `[functions.embed-course]`.
  - Se agregó `supabase/.gitignore`.

## [1.3.0] - 2026-09-28

### 🚀 Añadido (Added)

- **Página de detalle de procedimiento por UUID (`app/courses/[id]/page.tsx`):**
  - Nueva ruta `/courses/[id]` que resuelve un procedimiento por su **UUID de Supabase** (complementa la ruta existente por slug `/courses/[slug]`).
  - `generateMetadata` dinámica con `title`, `description` (mínimo 50 caracteres garantizado), Open Graph completo (`og:title`, `og:description`, `og:image`) y `alternates.canonical` apuntando al slug canónico.
  - JSON-LD `MedicalProcedure` (schema.org) con `procedureType: "https://schema.org/TherapeuticProcedure"`, `additionalType` con la categoría del procedimiento, `performer` (Physician) y `publisher` (Organization AuraTips).
  - Fallback total al dataset clínico local (`lib/clinical-data.ts`) cuando Supabase está offline — sin degradación de UX.
  - Arquitectura de datos unificada: función `fetchCourse(id)` abstrae Supabase + dataset local en un único objeto `UnifiedCourse`.
  - Breadcrumb semántico con `<ol>` + `aria-label="Migas de pan"` y `aria-current="page"`.
  - Hero con `next/image` (prop `fill`, `priority`, `sizes`, `objectFit: "cover"`) y `alt` descriptivo.
  - Ribbon de métricas clínicas con `role="region"` + `aria-label` y `aria-label` en el indicador de escala de molestia.
  - Sección de signos de alarma con `aria-labelledby` y listado semántico `<ul>/<li>`.
  - Bloque de inscripción `EnrollButton` condicional a datos en Supabase.
  - Línea de tiempo de fases con links `aria-label` descriptivos por lección.
  - Sección de experiencias/reseñas con `ReviewForm` + `ReviewList`.

### 🔧 Corregido (Fixed) — Auditoría Tech Lead

- **[S5 — important] `<h1>` siempre presente:**
  - El `<h1>` fue desacoplado del bloque condicional de `cover_url`. Ahora se renderiza siempre: visualmente oculto (`sr-only`) cuando hay imagen (el hero lo muestra decorativamente como `<p class="procedure-hero-title" aria-hidden>`), y visible con tipografía completa cuando no hay portada.
  - CSS añadido en `globals.css`: `.procedure-hero-card .procedure-hero-title` replica el aspecto visual del `h1` original.

- **[S3 — important] Description mínima de 50 caracteres:**
  - En `generateMetadata`, la descripción de Supabase se valida contra `rawDesc.length >= 50`; si es más corta, se usa el fallback explícito de 107 caracteres en lugar del texto corto.

- **[S7 — nit] `procedureType` con URL estándar de schema.org:**
  - El JSON-LD ahora usa `procedureType: "https://schema.org/TherapeuticProcedure"` y `additionalType` con la categoría libre (`encodeURIComponent(course.category)`), maximizando la elegibilidad para rich snippets médicos de Google.

- **[A6 — nit] `:focus-visible` en `.stage-lesson-link`:**
  - Añadido en `app/globals.css`: `outline: 2px solid var(--color-brand)` con `outline-offset: 3px` y supresión limpia del outline en interacción con ratón (`:focus:not(:focus-visible)`). Cumple WCAG 2.1 criterio 2.4.11.

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
