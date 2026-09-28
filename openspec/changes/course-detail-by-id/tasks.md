## 1. Página de Detalle por UUID

- [x] 1.1 Crear `app/courses/[id]/page.tsx` como Server Component asíncrono con `params: Promise<{ id: string }>`.
- [x] 1.2 Implementar `fetchCourse(id)` con consulta Supabase `.eq("id", id)` y fallback a `CLINICAL_PROCEDURES.find(p => p.id === id)`.
- [x] 1.3 Unificar datos de Supabase y dataset local en la interfaz `UnifiedCourse`.
- [x] 1.4 Implementar `generateMetadata` dinámica con título, descripción (≥ 50 chars), Open Graph completo y `alternates.canonical` al slug.
- [x] 1.5 Añadir `<ProcedureJsonLd>` con schema.org `MedicalProcedure`.
- [x] 1.6 Implementar breadcrumb semántico con `<ol>`, `aria-label="Migas de pan"` y `aria-current="page"`.
- [x] 1.7 Usar `next/image` con `fill`, `priority`, `sizes` y `alt` descriptivo en el hero.
- [x] 1.8 Añadir `role="region"` + `aria-label` al ribbon de métricas clínicas.
- [x] 1.9 Añadir `aria-label` individual a cada link de lección en la línea de tiempo.
- [x] 1.10 Implementar sección de reseñas con `ReviewForm` (si usuario inscrito) y `ReviewList`.
- [x] 1.11 Llamar `notFound()` si el id no existe en ninguna fuente.

## 2. Auditoría Tech Lead y Parches

- [x] 2.1 **[S5 — important]** Desacoplar `<h1>` del bloque condicional `cover_url`: renderizarlo siempre fuera del hero con clase `sr-only` cuando hay imagen.
- [x] 2.2 **[S5 — importante]** Añadir `.procedure-hero-card .procedure-hero-title` en `globals.css` replicando el aspecto visual del `h1` original para el título decorativo del hero (`aria-hidden`).
- [x] 2.3 **[S3 — important]** Validar `rawDesc.length >= 50` en `generateMetadata` antes de usar la descripción de Supabase; usar fallback si es más corta.
- [x] 2.4 **[S7 — nit]** Cambiar `procedureType: course.category` por `procedureType: "https://schema.org/TherapeuticProcedure"` + `additionalType` en el JSON-LD.
- [x] 2.5 **[A6 — nit]** Añadir `:focus-visible` y `:focus:not(:focus-visible)` para `.stage-lesson-link` en `globals.css`.

## 3. Documentación y Trazabilidad

- [x] 3.1 Actualizar `openspec/specs/course-catalog/spec.md` con requirements para ruta [id], a11y y structured data.
- [x] 3.2 Crear `openspec/changes/course-detail-by-id/` con `proposal.md`, `tasks.md` y `.openspec.yaml`.
- [x] 3.3 Actualizar `CHANGELOG.md` con entrada v1.3.0 documentando la feature y los 4 parches de auditoría.

## 4. Verificación

- [x] 4.1 Ejecutar `npx tsc --noEmit` → 0 errores de TypeScript.
