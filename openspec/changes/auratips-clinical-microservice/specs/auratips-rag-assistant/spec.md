## Purpose

Proporcionar asistencia conversacional inmediata, empática y médicamente fundamentada a pacientes durante su proceso de recuperación post-tratamiento estético, con triaje preventivo estructurado.

## ADDED Requirements

### Requirement: Triaje preventivo de emergencias médicas
El sistema SHALL analizar cada consulta del paciente en busca de signos de alarma clínicos estructurados en 5 categorías de observación (coloración/frialdad, molestia pulsátil no controlada, afectación palpebral, vesículas/fiebre y reacción respiratoria). Si se detectan 3 o más criterios simultáneos (o compromiso respiratorio/sistémico), el sistema SHALL activar de inmediato el Botón de Atención Médica Prioritaria hacia la Dra. Mariana Gómez sin utilizar lenguaje fatalista ni diagnósticos aterradores.

#### Scenario: Detección de 3 o más criterios coincidentes
- **WHEN** el paciente envía un mensaje indicando dolor persistente que no cede, piel blanquecina y fría, y ampollitas
- **THEN** el sistema responde con tono sereno y empático, indicando suspender frío o masajes, y despliega el botón directo de contacto prioritario a WhatsApp con la Dra. Mariana Gómez

#### Scenario: Consulta de síntoma habitual aislado (1 o 2 signos leves)
- **WHEN** el paciente consulta por hinchazón normal o ligero moretón en su día 2
- **THEN** el sistema responde tranquilizando al paciente con validación emocional, explicando la fase inflamatoria normal y entregando pautas recomendadas y acciones a evitar

### Requirement: Búsqueda semántica de cuidados con RAG
El sistema SHALL vectorizar la duda del paciente usando embeddings de 384 dimensiones y buscar mediante similitud coseno (función match_courses e índice HNSW) en los protocolos clínicos de la clínica para recuperar pautas específicas del procedimiento y fase de recuperación.

#### Scenario: Consulta de evolución normal
- **WHEN** el paciente pregunta si es normal presentar inflamación o edema en el día 2 de recuperación
- **THEN** el sistema recupera las pautas del procedimiento activo y responde explicando con tono empático y sereno la fase inflamatoria normal, indicando qué hacer y qué evitar

### Requirement: Biblioteca de casos maestros Few-Shot y memoria conversacional
El sistema SHALL calibrar sus respuestas mediante una biblioteca de casos modelo para asimetrías (recordando los masajes indicados previamente y la revisión del día 14), durezas (indicando la no manipulación durante 14-21 días), vida social (restricción de 48h de alcohol/maquillaje) y analgesia (revisión de la fórmula médica). Asimismo, el sistema SHALL soportar memoria multi-turn para mantener coherencia con las preguntas previas del paciente.

#### Scenario: Consulta de asimetría en días 1 a 3
- **WHEN** el paciente manifiesta preocupación por notar un lado más hinchado o torcido
- **THEN** el sistema explica el drenaje asimétrico natural, recuerda que el resultado armónico final se evalúa el día 14 con la Dra. Mariana Gómez, e instruye realizar únicamente los masajes previamente recomendados por la especialista

