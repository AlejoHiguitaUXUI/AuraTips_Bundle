## Purpose

Permitir a la especialista médica responsable (Dra. Mariana Gómez) administrar protocolos clínicos, etapas temporales de recuperación, listas de tareas y pautas recomendadas.

## ADDED Requirements

### Requirement: Gestión de Fases Temporales y Pautas Médicas
El sistema SHALL permitir a la especialista médica editar los procedimientos estéticos definiendo sus fases de recuperación (Día 0, Días 1-3, Días 4-14), listas de verificación del paciente (checklists), pautas recomendadas (qué hacer) y acciones a evitar (qué evitar).

#### Scenario: Edición de pautas recomendadas y restricciones
- **WHEN** la especialista modifica las pautas de cuidado de una fase temporal en el editor
- **THEN** el sistema guarda las listas de acciones recomendadas y prohibidas y las actualiza para los pacientes que se encuentren en dicha etapa

### Requirement: Configuración de Parámetros Clínicos de Procedimiento
El sistema SHALL permitir configurar nivel de molestia o dolor (escala 1 a 5), tiempo de recuperación esperado, tipo de anestesia y signos de alarma específicos del procedimiento.

#### Scenario: Guardado de parámetros clínicos
- **WHEN** la especialista actualiza los signos de alarma o la categoría del procedimiento
- **THEN** los nuevos parámetros quedan registrados en la base de datos y alimentan el motor de búsqueda y triaje
