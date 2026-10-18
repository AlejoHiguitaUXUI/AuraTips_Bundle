## Purpose

Proporcionar asistencia conversacional inmediata, empática y médicamente fundamentada a pacientes durante su proceso de recuperación post-tratamiento estético, con triaje estricto de emergencias y soporte de voz en tiempo real.

## Requirements

### Requirement: Triaje preventivo de emergencias médicas
El sistema SHALL analizar cada consulta del paciente en busca de signos de alarma clínicos estructurados en 5 categorías (coloración/frialdad, molestia pulsátil, afectación palpebral, vesículas/fiebre y reacción respiratoria). Si se detectan 3 o más criterios simultáneos (o compromiso respiratorio/sistémico), el sistema SHALL activar de inmediato el Botón de Atención Médica Prioritaria hacia la Dra. Mariana Gómez sin utilizar lenguaje fatalista ni diagnósticos aterradores.

#### Scenario: Detección de 3 o más criterios coincidentes
- **WHEN** el paciente envía un mensaje indicando dolor persistente que no cede, piel blanquecina y fría, y ampollitas
- **THEN** el sistema responde con tono sereno y empático, indicando suspender frío o masajes, y despliega el botón directo de contacto prioritario a WhatsApp con la Dra. Mariana Gómez

#### Scenario: Consulta de síntoma habitual aislado (1 o 2 signos leves)
- **WHEN** el paciente consulta por hinchazón normal o ligero moretón en su día 2
- **THEN** el sistema responde tranquilizando al paciente con validación emocional, explicando la fase inflamatoria normal y entregando pautas recomendadas y acciones a evitar

### Requirement: Asistente virtual de voz en tiempo real con WebRTC (AURA)
El sistema SHALL proveer una asesora virtual interactiva por voz y texto denominada AURA, respaldada por un microservicio desacoplado (`microservicio-voice`) con LiveKit Cloud WebRTC, reconocimiento de voz (STT) y síntesis natural (TTS) de ElevenLabs, y Google Gemini LLM. AURA SHALL orientar a pacientes sobre los 20 procedimientos estéticos faciales, corporales y capilares, responder dudas post-operatorias y guiar hacia la reserva de citas de valoración médica presencial en Medellín.

#### Scenario: Paciente inicia llamada de voz con AURA
- **WHEN** el usuario hace clic en el botón "Consúltalo con AURA" en la barra de búsqueda o activa el modal de voz
- **THEN** el sistema solicita un token efímero a `/voice/token`, establece una conexión WebRTC bidireccional con LiveKit Cloud y permite una conversación oral en tiempo real de baja latencia con síntesis de voz humana.

### Requirement: Integración de acceso directo a AURA en la barra de búsqueda clínica
El sistema SHALL presentar en el componente principal de búsqueda (`ClinicalSearchBar`) una fila responsiva compuesta por la barra de búsqueda tradicional y un botón destacado "Consúltalo con AURA", provisto de un indicador luminoso pulsante verde esmeralda (`.aura-call-pulse-dot`), icono de teléfono y un popover informativo que describe las capacidades de la asesora virtual al pasar el cursor (*hover*).

#### Scenario: Interacción con el popover de AURA en la barra de búsqueda
- **WHEN** el usuario pasa el cursor sobre el botón "Consúltalo con AURA"
- **THEN** el sistema despliega un popover informativo explicando que AURA cuenta con voz humana en tiempo real, asesora en los 20 procedimientos y facilita la coordinación de valoración médica presencial.

### Requirement: Búsqueda semántica de cuidados con RAG y HNSW sobre 20 procedimientos
El sistema SHALL vectorizar las dudas de los pacientes y los 20 procedimientos médicos en embeddings densos de 384 dimensiones (`gte-small`) y ejecutar búsqueda vectorial con similitud coseno (`match_courses`) optimizada con índices HNSW en Supabase Postgres.

#### Scenario: Búsqueda semántica de tratamientos corporales o capilares
- **WHEN** el paciente busca términos como "grasa localizada celulitis" o "caída de cabello"
- **THEN** el sistema calcula la distancia coseno y devuelve con máxima prioridad los procedimientos específicos (Mesoterapia/Hidrolipoclasia o Terapia Capilar/PRP) con sus pautas clínicas inmediatas.

### Requirement: Políticas institucionales y comerciales de AuraMed Medellín
El sistema SHALL estructurar las respuestas de AURA y del asistente RAG bajo las directrices oficiales: sede física en Medellín con servicio de parqueaderos, medios de pago habilitados (tarjetas, efectivo y transferencias inmediatas BRE-B), citas de control médico a los 14 días y estricta política de fijación de precios y planes de tratamiento bajo valoración médica presencial con el especialista.

#### Scenario: Paciente solicita presupuesto o precio cerrado
- **WHEN** el usuario pregunta a AURA cuánto cuesta exactamente un procedimiento
- **THEN** AURA explica con calidez que cada anatomía y objetivo es único, por lo que el presupuesto definitivo se establece durante la valoración médica presencial, y ofrece coordinar la cita en la sede Medellín.
