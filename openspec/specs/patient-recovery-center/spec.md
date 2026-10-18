## Purpose

Ofrecer un centro digital interactivo y diario para que los pacientes monitoreen su evolución post-procedimiento, completen sus tareas de cuidado y verifiquen sus síntomas.

## Requirements

### Requirement: Monitor diario y contador de recuperación
El sistema SHALL mostrar al paciente autenticado su procedimiento activo, el día exacto de evolución transcurrido, y la descripción médica de la fase en curso.

#### Scenario: Visualización del panel de paciente
- **WHEN** un paciente en día 2 post-toxina botulínica accede a su panel de cuidados
- **THEN** el sistema presenta su tarjeta de procedimiento activo indicando "Día 2 post-procedimiento" y las pautas pertinentes

### Requirement: Lista interactiva de tareas de recuperación
El sistema SHALL proveer una lista interactiva de verificación (checklist) correspondiente al día actual, permitiendo al paciente marcar tareas cumplidas con persistencia local o remota.

#### Scenario: Marcado de tarea completada
- **WHEN** el paciente marca la tarea de aplicación de protector solar o frío local
- **THEN** la barra de progreso se actualiza reflejando el porcentaje de adherencia del día

### Requirement: Delegación controlada de protocolos por el especialista y caducidad de acceso
El sistema SHALL permitir exclusivamente a los especialistas de AuraMed delegar protocolos clínicos a pacientes existentes o nuevos definiendo su vigencia en días (7, 14, 21 o 30 días), impidiendo la auto-inscripción pública. Cuando el protocolo supera sus días de vigencia o es finalizado manualmente por el especialista, el sistema SHALL revocar el acceso al contenido instructivo propietario de AuraMed y conservar el procedimiento en el historial del paciente (`procedure_history`).

#### Scenario: Caducidad o cierre de protocolo activo
- **WHEN** un protocolo activo cumple su ciclo de vigencia o es finalizado manualmente por el especialista
- **THEN** se retira de `enrollments` activos, pasa a la sección "Mi Historial de Procedimientos en AuraMed" sin enlace a las lecciones internas y se emite el webhook `patient.protocol_completed` hacia AuraMed

### Requirement: Integración bidireccional M2M con Sistema Madre AuraMed / AuraLead
El sistema SHALL exponer los endpoints protegidos por Bearer token `POST /api/v1/followup/assign` (para recibir notificaciones de procedimientos realizados en AuraMed) y `GET /api/v1/followup/status/[externalPatientId]` (para consultar únicamente el estado del protocolo activo y el porcentaje de cumplimiento del checklist diario), además de emitir webhooks firmados con HMAC-SHA256 (`patient.protocol_completed` y `patient.emergency_alert_triggered`).

#### Scenario: Consulta de estado de protocolo activo desde AuraMed
- **WHEN** el Sistema Madre de AuraMed consulta `GET /api/v1/followup/status/:externalPatientId` con un token de servicio válido
- **THEN** AuraTips responde con los días transcurridos/restantes del protocolo activo y el porcentaje de cumplimiento del checklist diario sin exponer historia clínica general

