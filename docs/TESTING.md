# Guía Completa de Pruebas (Testing Strategy & Execution) en AuraTips

Esta guía documenta la estrategia de pruebas unitarias e integradas del proyecto **AuraTips**, su estructura por capas, y cómo ejecutarlas de forma asíncrona y automatizada.

---

## 1. Arquitectura de Pruebas

El proyecto implementa una arquitectura de pruebas dividida en dos categorías principales:

| Tipo de Prueba | Extensión de Archivo | Propósito | Conexión Externa | Ejemplo |
| :--- | :--- | :--- | :--- | :--- |
| **Prueba Unitaria** | `*.test.ts` | Probar funciones puras, utilidades, algoritmos y reglas clínicas aisladas. | ❌ No (Mocks en memoria) | `lib/slug.test.ts` |
| **Prueba Integrada** | `*.integration.test.ts` | Validar interactividad entre el código, Supabase, Row Level Security (RLS) y APIs. | ⚠️ Sí (Supabase Test Env) | `lib/queries/getPublishedCourses.integration.test.ts` |
| **Prueba E2E (End-to-End)** | `e2e/*.spec.ts` | Validar flujos de usuario completos en navegador real (Visitante, Instructor, Estudiante). | 🌐 Sí (Frontend + Backend + DB) | `e2e/eduplatform-flujo.spec.ts` |

---

## 2. Comandos CLI para Ejecución

Todos los comandos están disponibles en [package.json](file:///Users/hoyestudia/Proyectos%20AI/DATAPATH/AuraTips_Bundle/package.json):

### ⚡ Pruebas Unitarias (Súper rápidas)
Para validar únicamente las funciones puras y lógica interna sin requerir base de datos:
```bash
npm run test:unit
```

### 🔗 Pruebas Integradas (Supabase / RLS)
Para verificar consultas reales a la base de datos y políticas de seguridad:
```bash
npm run test:integration
```

### 🚀 Toda la Suite Completa
Para ejecutar tanto pruebas unitarias como integradas:
```bash
npm run test
```

### 🔄 Modo Desarrollo Continuo (Watch)
Para reactivar automáticamente las pruebas tras cada cambio en el código:
```bash
npm run test:watch
```

### 🎭 Pruebas End-to-End (E2E con Playwright)
Para ejecutar los flujos de usuario simulados en Chromium con autenticación por rol:
```bash
npm run test:e2e
```
*Las sesiones autenticadas se almacenan automáticamente de forma aislada en `e2e/.auth/` (ignorado en git) y no ensucian la raíz del repositorio.*

Para ejecutar y abrir automáticamente el **reporte interactivo visual de Playwright** en el navegador:
```bash
npm run test:e2e:report
```

---

## 3. Ejecución Asíncrona en Background

Si estás trabajando en segundo plano o deseas lanzar la suite de pruebas mientras continúas con otras tareas, puedes ejecutarlas asíncronamente:

### En Antigravity AI / CLI
Puedes lanzar la ejecución en segundo plano usando `run_command`:
```bash
npm run test:unit
```
*(El sistema notificará automáticamente al finalizar los resultados sin bloquear tu flujo).*

### En Integración Continua (CI / GitHub Actions)
Puedes configurar la ejecución automatizada en cada Pull Request o Commit:
```yaml
name: Suite de Pruebas AuraTips
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:unit
```

---

## 4. Integración con el Flujo de Trabajo OpenSpec

Cuando implementes o propongas una nueva funcionalidad (*feature*) utilizando la metodología **OpenSpec**:

1. **Definir la estrategia en la propuesta:**
   Al crear un cambio en `openspec/changes/...`, incluye una sección de escenarios de prueba (Criterios de Aceptación).
2. **Escribir el Test ANTES o DURANTE la implementación (TDD/BDD):**
   - Si creas una nueva utilidad o función pura en `lib/`, añade `lib/[mi-modulo].test.ts`.
   - Si creas una nueva consulta de Supabase o endpoint de API, añade `lib/queries/[mi-query].integration.test.ts`.
3. **Validación:**
   Asegúrate de que `npm run test` pase al 100% antes de sincronizar o archivar el cambio.

---

## 5. Mocks y Fixtures Reutilizables

Para escribir pruebas integradas y unitarias limpias y consistentes, utiliza los creadores de datos sintéticos centralizados en [lib/testing/fixtures.ts](file:///Users/hoyestudia/Proyectos%20AI/DATAPATH/AuraTips_Bundle/lib/testing/fixtures.ts):

```typescript
import { createMockCourseData, createMockProfileData } from "@/lib/testing/fixtures";

// Generar un curso de prueba con precio personalizado
const mockCourse = createMockCourseData({ price: 250, status: "published" });
```
