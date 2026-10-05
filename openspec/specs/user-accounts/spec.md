## Purpose

Provides registration, login, and session handling for the platform, plus an editable public profile that identifies a user as an author and reviewer across the product.

## Requirements

### Requirement: User registration

The system SHALL allow a visitor to create an account with an email address and a password. On successful registration the system SHALL create a profile record linked to the new user with an empty bio and avatar and a display name defaulted from the email local-part.

#### Scenario: Successful registration

- **WHEN** a visitor submits a valid, unused email and a password meeting the minimum length
- **THEN** an account and a linked profile are created and the user is signed in

#### Scenario: Email already registered

- **WHEN** a visitor submits an email that already has an account
- **THEN** registration is rejected with a message that the email is already in use, and no new profile is created

#### Scenario: Weak or missing password

- **WHEN** a visitor submits a password shorter than the minimum length or omits it
- **THEN** registration is rejected with a validation error and no account is created

### Requirement: User login

The system SHALL allow a registered user to sign in with their email and password and SHALL establish a session that persists across page reloads until sign-out or expiry.

#### Scenario: Successful login

- **WHEN** a registered user submits their correct email and password
- **THEN** a session is established and the user is redirected to their dashboard

#### Scenario: Invalid credentials

- **WHEN** a user submits an email/password pair that does not match an account
- **THEN** login is rejected with a generic "invalid credentials" message that does not reveal whether the email exists

### Requirement: Sign out

The system SHALL allow a signed-in user to end their session, after which protected pages are no longer accessible without signing in again.

#### Scenario: User signs out

- **WHEN** a signed-in user chooses sign out
- **THEN** the session is cleared and the user is returned to the public catalog

### Requirement: Profile viewing and editing

The system SHALL expose each user's profile with display name, bio, and avatar. A user SHALL be able to edit their own profile fields and SHALL NOT be able to edit another user's profile.

#### Scenario: User edits own profile

- **WHEN** a signed-in user updates their display name, bio, or avatar URL
- **THEN** the changes are saved and reflected wherever their profile is shown

#### Scenario: User attempts to edit another profile

- **WHEN** a signed-in user submits an update targeting a profile that is not their own
- **THEN** the update is rejected by the authorization layer and no data changes

#### Scenario: Public sees author profile

- **WHEN** anyone views a course detail page
- **THEN** the course author's display name and avatar are visible without requiring sign-in

### Requirement: Control de Acceso Basado en Roles Clínicos (RBAC) — v1.4.0

El sistema SHALL implementar una arquitectura de roles clínicos diferenciados (`patient`, `specialist`, `admin`) respaldada por RLS en Supabase Postgres y funciones de seguridad (`is_specialist()`, `get_my_role()`). La tabla `profiles` SHALL extenderse con `role`, `phone`, `notification_preferences` (jsonb con flags WhatsApp/Email), `medical_license` e `invited_by`.

#### Scenario: Especialista accede a gestión de protocolos
- **WHEN** un usuario con rol `specialist` ingresa a `/dashboard/teaching` o invoca rutas de creación/edición de protocolos
- **THEN** el sistema concede acceso completo al editor de protocolos, asignación de tratamientos y métricas clínicas

#### Scenario: Paciente intenta acceder a gestión clínica
- **WHEN** un usuario con rol `patient` intenta navegar a `/dashboard/teaching`
- **THEN** el sistema deniega el acceso y lo redirige automáticamente a su portal de cuidados (`/dashboard/learning` o `/`)

#### Scenario: Actualización de perfil clínico con preferencias WhatsApp
- **WHEN** un paciente o especialista actualiza su teléfono y preferencias de notificación en `/dashboard/profile`
- **THEN** el sistema persiste el número telefónico y el objeto de preferencias para alertas de desinflamación y seguimiento clínico sin permitir la auto-escalación del rol
