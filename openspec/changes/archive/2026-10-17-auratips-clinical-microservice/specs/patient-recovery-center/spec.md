## Purpose

Ofrecer un centro digital interactivo y diario para que los pacientes monitoreen su evolución post-procedimiento, completen sus tareas de cuidado y verifiquen sus síntomas.

## ADDED Requirements

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
