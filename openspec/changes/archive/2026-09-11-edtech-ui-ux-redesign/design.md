## Context

Plataforma educativa basada en Next.js (App Router), React y Tailwind/Vanilla CSS Variables. La versión previa carecía de un dashboard estructurado y de funcionalidades de interacción en video y gamificación.

## Goals / Non-Goals

**Goals:**
- Implementar maquetación Bento Grid en `app/dashboard/learning/page.tsx` con soporte responsivo (12 columnas a 1 columna).
- Crear tarjetas modulares en `app/dashboard/_components/`: `ResumeCard`, `StreakWidget`, `AiRecommendation`, `FriendStreaks`, y `ProgressGrid`.
- Desarrollar reproductor de video en `components/VideoPlayer/` con notas dinámicas (`TimestampedNotes`), quizzes en pantalla (`QuizOverlay`) y control de estado (`useVideoPlayer`).
- Desarrollar componentes de gamificación en `components/Gamification/`: `XPBurst` y `StreakProtectionModal`.
- Configurar tokens CSS en `app/globals.css` para Light/Dark Mode, fuentes Google `Plus Jakarta Sans`, radios fluidos, elevación con sombras y `prefers-reduced-motion`.

**Non-Goals:**
- Modificación de esquemas de base de datos relacional Supabase en esta etapa.

## Decisions

- **Decision 1: CSS Custom Properties vs Tailwind purista**: Se utilizaron tokens CSS nativos en `:root` y `[data-theme="dark"]` en `app/globals.css` para permitir transiciones de tema suaves y control total de los estilos Bento Grid.
- **Decision 2: Hook unificado para Video Player (`useVideoPlayer`)**: Se desacopló la lógica de tiempo del reproductor (segundos, pausas, triggers de quiz) en un custom hook React para facilitar su reutilización.
- **Decision 3: Bento Grid responsivo con CSS Grid**: Se definió un grid de 12 columnas con breakpoints a 768px que cambian las columnas a 1fr en móviles para óptimo rendimiento sin bibliotecas pesadas.

## Risks / Trade-offs

- **[Riesgo]** Desempeño en móviles al renderizar múltiples tarjetas de animación simultáneamente.
  - *Mitigación*: Uso de `prefers-reduced-motion` y transformaciones GPU-accelerated (`transform`, `opacity`).
