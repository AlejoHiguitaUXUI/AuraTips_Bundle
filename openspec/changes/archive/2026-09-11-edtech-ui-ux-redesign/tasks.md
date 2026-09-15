## 1. Design System & Style Infrastructure

- [x] 1.1 Configuración de Design Tokens (Plus Jakarta Sans, paleta Calm UI, spacing scale, elevaciones) y temas Light/Dark en `app/globals.css`
- [x] 1.2 Implementación de reglas responsivas de Bento Grid y soporte para `prefers-reduced-motion`

## 2. Bento Grid Dashboard

- [x] 2.1 Crear tarjeta de héroe `ResumeCard.tsx` en `app/dashboard/_components/`
- [x] 2.2 Crear widgets `StreakWidget.tsx`, `AiRecommendation.tsx`, `FriendStreaks.tsx` y `ProgressGrid.tsx`
- [x] 2.3 Ensamblar la vista principal del dashboard en `app/dashboard/learning/page.tsx` con soporte de streaming skeleton

## 3. Video Player e Interacción

- [x] 3.1 Crear `VideoPlayer.tsx` con integración YouTube/HTML5 y custom hook `useVideoPlayer.ts`
- [x] 3.2 Implementar sistema de notas por timestamp `TimestampedNotes.tsx`
- [x] 3.3 Implementar modal superpuesto de quiz en video `QuizOverlay.tsx`

## 4. Componentes de Gamificación

- [x] 4.1 Implementar animaciones de recompensa XP en `components/Gamification/XPBurst.tsx`
- [x] 4.2 Crear modal de congelador/protección de racha `StreakProtectionModal.tsx`
