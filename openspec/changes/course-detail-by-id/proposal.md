# Propuesta: Página de Detalle de Procedimiento por UUID

**Change ID:** course-detail-by-id  
**Versión:** 1.3.0  
**Fecha:** 2026-09-28  
**Estado:** ✅ Done  
**Autor:** Antigravity (Tech Lead auditado)  
**Spec afectada:** `openspec/specs/course-catalog/spec.md`

---

## Problema

La plataforma AuraTips disponía únicamente de la ruta `/courses/[slug]` para acceder al detalle de un procedimiento. Esto limita las integraciones que entregan UUIDs directamente (emails transaccionales, payloads de API, webhooks de Supabase). Se necesita una ruta `/courses/[id]` que resuelva por UUID de Supabase con el mismo nivel de detalle clínico.

## Solución

Crear `app/courses/[id]/page.tsx` como Server Component asíncrono del App Router de Next.js 14, con:

- Resolución por UUID en Supabase (`eq("id", id)`)
- Fallback al dataset clínico local `CLINICAL_PROCEDURES` cuando Supabase está offline
- `generateMetadata` dinámica con validación de calidad SEO (mín. 50 chars en description, OG completo, canonical al slug)
- JSON-LD `MedicalProcedure` con `procedureType` estándar de schema.org
- Accesibilidad WCAG 2.1 AA validada por auditoría Tech Lead integrada

## Archivos impactados

| Archivo | Cambio |
|---|---|
| `app/courses/[id]/page.tsx` | **Creado** — Página completa de detalle por UUID |
| `app/globals.css` | **Modificado** — `:focus-visible` para `.stage-lesson-link` + `.procedure-hero-title` |
| `openspec/specs/course-catalog/spec.md` | **Actualizado** — Nuevos requirements para ruta [id], a11y y structured data |
| `CHANGELOG.md` | **Actualizado** — Entrada v1.3.0 |

## Decisiones de diseño

1. **Sin duplicar lógica de negocio:** `fetchCourse(id)` encapsula Supabase + fallback local en una sola función privada, reutilizable.
2. **`<h1>` fuera del condicional de imagen:** Cumple S5 (jerarquía de headings) sin romper el diseño visual del hero. El h1 está en el DOM siempre; se oculta visualmente con `sr-only` cuando hay portada.
3. **`alternates.canonical`:** Apunta al slug canónico para evitar contenido duplicado entre `[id]` y `[slug]`.
4. **`aria-hidden` en el hero duplicado:** El título decorativo dentro del hero es `aria-hidden="true"` para que los lectores de pantalla no anuncien el título dos veces.
