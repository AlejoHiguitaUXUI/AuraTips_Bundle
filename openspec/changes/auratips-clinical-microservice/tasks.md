## 1. Identidad Médica y Lenguaje en Español

- [x] 1.1 Reemplazar todas las referencias a Valeria Montes por la Dra. Mariana Gómez en `lib/clinical-data.ts`, `lib/rag/`, `app/dashboard/` y `scripts/seed.mjs`, verificando que la búsqueda no arroje resultados obsoletos.
- [x] 1.2 Sustituir terminología anglosajona 'Do y Donts' por 'Pautas recomendadas (Qué hacer)' y 'Acciones a evitar (Qué evitar)' en `DailyCareChecklist.tsx`, `app/courses/[slug]/lessons/`, `ClinicalAssistantDrawer.tsx` y `clinical-engine.ts`.

## 2. Personalidad y Tono Clínico de AuraTips

- [x] 2.1 Refinar la generación en `lib/rag/clinical-engine.ts` para que AuraTips hable con empatía, tranquilice al paciente sobre la inflamación esperada y brinde pautas estructuradas.
- [x] 2.2 Actualizar `ClinicalAssistantDrawer.tsx` con la marca AuraTips, bienvenida personalizada y enlaces de emergencia a la Dra. Mariana Gómez.

## 3. Fase 5B — Panel de la Especialista

- [x] 3.1 Actualizar el panel `/dashboard/teaching/page.tsx` para reflejar la perspectiva médica de la Dra. Mariana Gómez con métricas de protocolos y fases configuradas.
- [x] 3.2 Actualizar `components/LessonEditor.tsx` y `components/CourseEditor.tsx` para permitir la edición de fases de recuperación (Día 0, Días 1-3, Días 4-14), listas de verificación (checklists), pautas recomendadas y restricciones.

## 4. Contrato de Integración con Sistema Madre

- [x] 4.1 Crear el documento `docs/integration-contract.md` detallando los endpoints OpenAPI para enrolamiento y consulta de adherencia entre el sistema madre y AuraTips.

## 5. Verificación y Validación

- [x] 5.1 Ejecutar `npx tsc --noEmit` y `npm run lint` para garantizar 0 errores de tipos y sintaxis.
- [x] 5.2 Ejecutar `openspec validate` para confirmar la consistencia de los artefactos del framework.
