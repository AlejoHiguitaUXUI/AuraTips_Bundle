## Purpose

Permitir a la especialista médica responsable (Dra. Mariana Gómez) administrar protocolos clínicos, etapas temporales de recuperación, listas de tareas y pautas recomendadas.

## Requirements

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

### Requirement: Catálogo Oficial de 20 Procedimientos y Taxonomía Médica
El sistema SHALL estructurar y servir un catálogo oficial de 20 procedimientos médicos agrupados en 3 macro-categorías: Facial (9 tratamientos: Botox, Labios, Rinomodelación, Peeling, Bioestimuladores, Limpieza+Plasma, Dermapen, Radiofrecuencia, Ultrasonido), Corporal y Reducción (9 tratamientos: Mesoterapia, Hidrolipoclasia, Carboxiterapia, Radiofrecuencia, Ultrasonido, Masaje Reductor, Drenaje Linfático, Masaje Relajante, Sueroterapia IV) y Capilar (2 tratamientos: Mesoterapia Capilar, PRP Capilar).

#### Scenario: Visualización del catálogo oficial
- **WHEN** un paciente o visitante ingresa al portal o navega por los filtros de categoría
- **THEN** el sistema presenta los procedimientos correspondientes con sus métricas clínicas de reposo estimado, molestia esperada y pautas de cuidado

### Requirement: Sincronización y Persistencia en Supabase Cloud con Automatización Seed
El sistema SHALL mantener la totalidad de los 20 procedimientos, 35 módulos y 36 lecciones clínicas persistidos de forma íntegra en la base de datos Supabase Postgres (`courses`, `modules`, `lessons`, `lesson_contents`). El sistema SHALL proveer automatización reproducible mediante `npm run seed` y el endpoint administrativo `/api/admin/seed`.

#### Scenario: Ejecución de seed de base de datos
- **WHEN** se ejecuta el comando `npm run seed` o se consulta `/api/admin/seed`
- **THEN** el sistema sincroniza y actualiza todos los registros en Supabase garantizando integridad referencial y disponibilidad en tiempo real

### Requirement: Banco Fotográfico Clínico Original Generado con IA
El sistema SHALL servir portadas fotográficas clínicas de alta resolución generadas con IA y ambientadas en una clínica médico-estética de lujo en Medellín, alojadas localmente en `public/images/` para garantizar tiempos de carga ultrarrápidos y eliminar dependencias de servicios externos como Unsplash.

#### Scenario: Carga de portada de procedimiento
- **WHEN** se visualiza la tarjeta de un procedimiento o su página de protocolo
- **THEN** la imagen local responde con código HTTP 200 sin enlaces rotos ni dependencias de CDNs externas
