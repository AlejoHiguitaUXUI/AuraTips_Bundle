## Context

AuraTips opera como un microservicio satélite de acompañamiento post-procedimiento. La arquitectura existente cuenta con Next.js 14, Supabase (pgvector), y modelos clínicos enriquecidos. El diseño debe proporcionar a la Dra. Mariana Gómez herramientas intuitivas de gestión de cuidados post-tratamiento y al paciente un acompañamiento empático y seguro.

## Goals / Non-Goals

**Goals:**
- Proporcionar a la Dra. Mariana Gómez una interfaz especializada en `/dashboard/teaching` para editar pautas de cuidado, fases temporales (Día 0, 1-3, 4-14), checklists y restricciones.
- Establecer un tono de comunicación en español cálido, profesional y tranquilizador para AuraTips.
- Reemplazar completamente términos anglosajones ('Do y Donts') por terminología médica en español: "Pautas recomendadas (Qué hacer)" y "Acciones a evitar (Qué evitar)".
- Diseñar la especificación del contrato de integración final con el sistema madre.

**Non-Goals:**
- No implementar gestión de historias clínicas, expedientes dermatológicos completos ni consentimientos legales (alcance exclusivo del sistema madre).
- No gestionar pasarelas de pago ni facturación.

## Decisions

### 1. Mapeo Semántico sobre el Esquema Existente
- **Decisión:** Mantener las tablas subyacentes `courses`, `lessons` y `lesson_contents` para preservar compatibilidad con Supabase Auth y RLS, pero abstraer completamente la capa visual y de negocio hacia terminología clínica:
  - Course -> Procedimiento Médico.
  - Lesson -> Fase Temporal de Recuperación (`Día 0`, `Días 1-3`, `Días 4-14`).
  - Lesson Contents -> Protocolos de la Fase (`checklist_items`, `dos` como Pautas Recomendadas, `donts` como Acciones a Evitar).

### 2. Triaje Clínico en Dos Niveles
- **Decisión:** Filtro regex / semántico de alta prioridad en `lib/rag/guardrails.ts` previo a la consulta vectorial. Si se detecta isquemia, ptosis o dolor refractario, se bloquea la respuesta genérica y se canaliza de inmediato a la Dra. Mariana Gómez.

### 3. Tono Empático y Estructurado
- **Decisión:** AuraTips estructura sus respuestas en tres secciones legibles:
  1. *Explicación empática y tranquilizadora* del síntoma o proceso natural.
  2. *Pautas recomendadas (Qué hacer)*.
  3. *Acciones a evitar (Qué evitar)*.

## Risks / Trade-offs

- **[Riesgo] Ansiedad del paciente ante síntomas post-inyección:**
  → *Mitigación:* AuraTips valida las sensaciones normales de las primeras 48-72h (edema, tirantez, asimetría transitoria) evitando diagnósticos alarmistas, pero manteniendo un umbral bajo para activar contacto de emergencia si hay signos reales de isquemia.
