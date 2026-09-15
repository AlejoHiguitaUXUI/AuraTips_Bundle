## Why

Rediseñar la interfaz de la plataforma educativa EdTech para maximizar el engagement de los estudiantes, reducir la fatiga cognitiva y mejorar la retención mediante pilares modernos de UX/UI (Calm UI, Bento Grid, Video Player enriquecido, Gamificación Adaptativa con Racha & XP, y Design System unificado).

## What Changes

- **Dashboard Principal Bento Grid**: Layout responsivo de 12 columnas con tarjetas independientes para "Reanudar Aprendizaje" (1-click resume), "Racha Adaptativa" (congelador de racha y micro-lección de 2 min), "Recomendaciones de IA", "Comunidad/Racha de Amigos" y "Ruta de Aprendizaje Segmentada por Módulos".
- **Reproductor de Video Calm UI**: Integración de video sin distracciones con marcadores de tiempo dinámicos para tomar notas (`TimestampedNotes`), quizzes interactivos superpuestos (`QuizOverlay`) y control mediante `useVideoPlayer`.
- **Gamificación Adaptativa & Micro-Momentum**: Sistema de recompensas visuales de XP (`XPBurst`), modal de protección de racha (`StreakProtectionModal`) y micro-lecciones de 2 minutos para evitar la pérdida de racha.
- **Design System & Calm Tech**: Tokens CSS unificados en `app/globals.css`, soporte completo de Modo Oscuro (`[data-theme="dark"]`), animaciones sutiles, accesibilidad WCAG 2.1 AA y tipografía `Plus Jakarta Sans`.

## Capabilities

### New Capabilities
- `edtech-ui-ux`: Especificación de interfaz de usuario, Bento Grid, reproductor de video interactivo, gamificación adaptativa y tokens de diseño.

### Modified Capabilities
(Ninguna capacidad existente requiere cambio de requisitos de datos).

## Impact

- `app/globals.css`: Sistema de tokens CSS, Bento Grid, componentes de video, botones y temas.
- `app/dashboard/learning/page.tsx`: Vista principal Bento Grid de aprendizaje.
- `app/dashboard/_components/*`: Tarjetas de dashboard (`ResumeCard`, `StreakWidget`, `AiRecommendation`, `FriendStreaks`, `ProgressGrid`).
- `components/VideoPlayer/*`: Componentes de video interactivo (`VideoPlayer`, `TimestampedNotes`, `QuizOverlay`, `useVideoPlayer`).
- `components/Gamification/*`: Componentes de gamificación (`XPBurst`, `StreakProtectionModal`).
