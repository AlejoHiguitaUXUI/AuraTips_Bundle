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

## 6. Microservicio de Voz AURA (LiveKit + ElevenLabs + Gemini)

- [x] 6.1 Migrar y desacoplar microservicio Python (`microservicio-voice`) con LiveKit Cloud WebRTC, ElevenLabs STT/TTS y Google Gemini 3.6 Flash.
- [x] 6.2 Implementar servidor FastAPI en puerto `:8000` con endpoints `/health`, `/voice/token` y worker de voz en segundo plano.
- [x] 6.3 Ejecutar suite de pruebas de validación técnica `verify_migration.py` (6/6 PASS).
- [x] 6.4 Integrar componente de cliente WebRTC `EdyVoiceWidget.tsx` con soporte para audio bidireccional en tiempo real.

## 7. Catálogo Oficial de 20 Procedimientos y Rebranding AURA

- [x] 7.1 Definir e indexar catálogo completo de 20 procedimientos (9 faciales, 9 corporales y 2 capilares) en `lib/clinical-procedures-extended.ts` y `lib/clinical-data.ts`.
- [x] 7.2 Configurar directrices institucionales de AuraMed Medellín en el System Prompt de AURA (sede con parqueadero, medios de pago con BRE-B, citas de control a 14 días).
- [x] 7.3 Implementar política de valoración médica personalizada presencial para presupuestos y triaje estricto ante isquemia vascular o anafilaxia.

## 8. Sincronización y Vectorización de Embeddings en Supabase Cloud

- [x] 8.1 Sincronizar los 20 procedimientos, 35 módulos y 36 lecciones en las tablas `courses`, `modules`, `lessons` y `lesson_contents` de Supabase.
- [x] 8.2 Crear endpoint administrativo `/api/admin/seed/route.ts` y script CLI `npm run seed` (`scripts/seed.mjs`).
- [x] 8.3 Generar vector embeddings de 384 dimensiones (`gte-small`) para el 100% de los procedimientos (0 campos NULL en `courses.embedding`).
- [x] 8.4 Habilitar búsqueda semántica vectorial con similitud coseno (`match_courses`) en `lib/embeddings.ts` y `/api/courses/search`.

## 9. Integración en Search Bar y Banco Fotográfico con IA

- [x] 9.1 Integrar fila responsiva `Search bar ------ Consúltalo con AURA` en `ClinicalSearchBar.tsx` con dot pulsante en vivo, icono y hover popover explicativo.
- [x] 9.2 Conectar botón de AURA con modal interactivo de llamada WebRTC en tiempo real.
- [x] 9.3 Generar fotografías clínicas médicas originales con IA mediante Gemini (`generate_image`) y alojarlas localmente en `public/images/`.
- [x] 9.4 Verificar respuesta HTTP 200 OK en el 100% de las portadas de los 20 procedimientos.
