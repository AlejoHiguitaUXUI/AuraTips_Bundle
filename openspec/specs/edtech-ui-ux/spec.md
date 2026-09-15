# edtech-ui-ux Specification

## Purpose

Proporciona la especificación de interfaz de usuario (UI/UX), maquetación Bento Grid, reproductor de video interactivo con notas y quizzes, sistema de gamificación adaptativa (racha y XP) y tokens de diseño visual Calm UI para la plataforma educativa EdTech.

## Requirements

### Requirement: Bento Grid Learning Dashboard
The system SHALL display the student dashboard using a responsive 12-column Bento Grid layout containing Resume Learning, Adaptive Streak, AI Recommendation, Friend Streaks, and Module Progress cards.

#### Scenario: User opens dashboard
- **WHEN** an authenticated user navigates to `/dashboard/learning`
- **THEN** the system renders the 12-column Bento Grid layout with active enrollment progress, streak metrics, AI suggestions, and module progression.

#### Scenario: Mobile viewport responsiveness
- **WHEN** the dashboard is viewed on a screen width smaller than 768px
- **THEN** the Bento Grid automatically collapses to a single-column stacked layout.

### Requirement: Distraction-Free Video Player with Notes and Quizzes
The system SHALL provide a video player component capable of rendering YouTube/HTML5 media with timestamped notes and timestamped quiz overlays.

#### Scenario: User saves timestamped note
- **WHEN** a user types a note during video playback and clicks save
- **THEN** the system attaches the current playback position in seconds to the note and displays it in the notes list.

#### Scenario: User clicks timestamped note
- **WHEN** a user clicks on a saved note's timestamp link
- **THEN** the video player jumps directly to that timestamp in seconds.

#### Scenario: Triggering interactive quiz overlay
- **WHEN** video playback reaches a designated quiz timestamp marker
- **THEN** the player displays an overlay modal pausing playback until the student answers the question.

### Requirement: Adaptive Gamification and Streak Protection
The system SHALL track consecutive daily study streaks, award XP upon lesson completion, and offer streak freeze protection and 2-minute micro-lessons.

#### Scenario: Completing a lesson awards XP
- **WHEN** a user completes a lesson or quiz
- **THEN** the system triggers a visual XP burst animation (`XPBurst`) celebrating the completion.

#### Scenario: Activating streak protection
- **WHEN** a user risks losing their streak due to an inactive day
- **THEN** the system displays the `StreakProtectionModal` offering to use an available streak freeze shield.

### Requirement: Design Tokens and Dark Mode Theme Support
The system SHALL enforce a unified Calm UI design system using CSS variables for typography, spacing, border radii, shadows, and dark mode theme switching (`[data-theme="dark"]`).

#### Scenario: Toggling dark mode
- **WHEN** the user toggles the theme switcher control
- **THEN** the application smoothly transitions CSS custom properties across all surfaces between light and dark themes.

#### Scenario: Respecting reduced motion preferences
- **WHEN** the user's OS has `prefers-reduced-motion: reduce` enabled
- **THEN** the application forces transition and animation durations to 0.01ms.
