## Why

El proyecto evoluciona formalmente hacia **AuraTips**, un microservicio especializado y desacoplado para el acompañamiento y recuperación post-procedimiento en medicina estética. Los pacientes post-tratamiento experimentan dudas recurrentes e incertidumbre sobre inflamación normal versus signos de alarma. AuraTips resuelve esto proactivamente mediante recuperación semántica aumentada (RAG), triaje médico estricto y seguimiento guiado día a día, complementando al sistema principal de la clínica sin competir con su historia clínica o expediente EMR.

## What Changes

- **Identidad de Marca y Especialista**: Establecimiento oficial de **AuraTips** y asignación de la **Dra. Mariana Gómez** como especialista médico a cargo.
- **Tono y Lenguaje Clínico Empático**: Refinamiento del tono conversacional (sereno, empático, tranquilizador y con rigor médico) y erradicación definitiva de términos anglosajones como 'Do y Donts' en favor de **"Pautas recomendadas (Qué hacer)"** y **"Acciones a evitar (Qué evitar)"**.
- **Fase 5B — Gestión de Protocolos de la Especialista**: Transformación del panel `/dashboard/teaching` para permitir a la Dra. Mariana Gómez administrar las fases de recuperación (`Día 0`, `Días 1–3`, `Días 4–14`), listas de verificación diarias, pautas a seguir y restricciones de cada procedimiento.
- **Asistente RAG & Triaje de Urgencia**: Endpoint `/api/chat` con búsqueda vectorial HNSW sobre embeddings de 384 dimensiones (`gte-small`) y filtro preventivo ante isquemia vascular, necrosis o ptosis palpebral.
- **Contrato de Integración con Sistema Madre**: Documentación formal del endpoint seguro para la sincronización y asignación automática de pacientes.

## Capabilities

### New Capabilities
- `auratips-rag-assistant`: Asistente conversacional de recuperación post-procedimiento con triaje de urgencias médicas, vectorización semántica de consultas y respuestas empáticas contextualizadas por día de evolución.
- `clinical-protocol-management`: Portal de administración para la especialista (Dra. Mariana Gómez) que permite configurar fases de recuperación, pautas recomendadas (qué hacer), acciones a evitar (qué evitar) y listas de verificación.
- `patient-recovery-center`: Panel interactivo del paciente con contador de días de evolución, checklist dinámico y canalización médica directa.

### Modified Capabilities
<!-- No modified capabilities from old edtech specs as the domain has fully shifted to clinical care -->

## Impact

- **Modelos de datos**: Tabla `courses` con vector embeddings y campos clínicos (`recovery_time`, `pain_level`, `alarm_signs`, etc.), tabla `lessons` con `timeline_tag`, y `lesson_contents` con `checklist_items`, `dos`, `donts`.
- **Rutas y UI**: `/dashboard/teaching` y `/dashboard/teaching/[slug]` adaptados al flujo clínico; `/dashboard/learning` enriquecido con el drawer de AuraTips; endpoint `POST /api/chat`.
- **Seguridad médica**: Reglas de triaje preventivo y enlace de urgencias hacia la Dra. Mariana Gómez.
