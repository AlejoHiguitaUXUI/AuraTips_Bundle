/**
 * Información médica y estética ampliada para el pop-up informativo de procedimientos.
 * Contenido netamente informativo para pacientes y visitantes de AuraMed.
 */

export interface ProcedureHighlight {
  summary: string;
  benefits: string[];
  targetAreas: string;
  candidateProfile: string;
}

export const PROCEDURE_HIGHLIGHTS: Record<string, ProcedureHighlight> = {
  "toxina-botulinica-botox-facial": {
    summary:
      "Tratamiento médico no quirúrgico de relajación neuromuscular selectiva. Mediante microinfiltraciones de alta precisión en puntos estratégicos del tercio superior facial, modula la contracción muscular excesiva, suavizando arrugas dinámicas y aportando un aspecto descansado, sereno y completamente natural sin restar expresividad.",
    benefits: [
      "Suaviza líneas de expresión en frente, entrecejo y patas de gallo.",
      "Previene la formación de surcos profundos y envejecimiento prematuro.",
      "Preserva la mímica y expresividad natural del rostro.",
      "Procedimiento ambulatorio rápido de 20 a 30 minutos sin incapacidad.",
    ],
    targetAreas: "Frente, entrecejo (glabela), patas de gallo (periorbitarias) y líneas perinasales.",
    candidateProfile: "Pacientes con líneas de expresión dinámicas marcadas o en prevención activa de arrugas estáticas.",
  },
  "acido-hialuronico-labios-russian-lips": {
    summary:
      "Técnica médica avanzada de armonización labial con ácido hialurónico reticulado de alta pureza. Enfocada en eversión sutil, definición anatómica del arco de cupido y proyección vertical elegante sin aportar volumen desmedido ni efecto artificial hacia adelante.",
    benefits: [
      "Perfilado y definición nítida del borde bermellón y arco de cupido.",
      "Eversión sutil y armoniosa para optimizar la proporción labial.",
      "Hidratación tisular profunda y corrección de asimetrías naturales.",
      "Resultados inmediatos, seguros y biocompatibles con ácido reabsorbible.",
    ],
    targetAreas: "Labio superior, labio inferior, arco de cupido y comisuras bucales.",
    candidateProfile: "Personas que buscan mayor definición, simetría, hidratación profunda o volumen armónico en sus labios.",
  },
  "rinomodelacion-sin-cirugia-acido-hialuronico": {
    summary:
      "Modelado nasal tridimensional no invasivo mediante infiltración precisa de ácido hialurónico estructural de alta cohesividad. Permite rectificar el dorso nasal, disimular pequeñas gibas y elevar la punta nasal de manera inmediata, logrando una silueta de perfil armónica y estilizada sin pasar por quirófano.",
    benefits: [
      "Armonización inmediata del perfil nasal sin intervención quirúrgica.",
      "Elevación y sustentación sutil de la punta nasal.",
      "Rectificación de pequeñas irregularidades o depresiones en el dorso.",
      "Procedimiento ambulatorio con incorporación inmediata a la vida cotidiana.",
    ],
    targetAreas: "Dorso nasal, radix y soporte de la punta nasal.",
    candidateProfile: "Pacientes con pequeñas irregularidades en el dorso o punta caída que desean mejorar su perfil sin cirugía.",
  },
  "peeling-quimico-medico-facial": {
    summary:
      "Exfoliación química controlada de grado médico utilizando combinaciones específicas de alfahidroxiácidos (AHA), ácido tricloroacético (TCA) o ácido retinoico. Promueve la descamación dérmica superficial a media para eliminar células desvitalizadas, atenuar manchas solares, homogeneizar el tono y estimular la síntesis de colágeno nuevo.",
    benefits: [
      "Renovación celular acelerada y luminosidad inmediata de la piel.",
      "Atenuación de manchas solares, melasma leve e hiperpigmentación.",
      "Mejora visible en la textura de la piel y reducción del tamaño de los poros.",
      "Estimulación de colágeno para mayor elasticidad y tersura dérmica.",
    ],
    targetAreas: "Rostro completo, cuello y escote.",
    candidateProfile: "Pieles con tono irregular, fotoenvejecimiento, manchas superficiales o textura apagada.",
  },
  "bioestimulacion-facial-colageno": {
    summary:
      "Tratamiento regenerativo avanzado enfocado en activar los fibroblastos de la dermis profunda mediante inductores de colágeno biocompatibles o polinucleótidos. Restaura la matriz extracelular, redensifica la dermis y mejora la firmeza y elasticidad cutánea a mediano y largo plazo.",
    benefits: [
      "Redensificación dérmica progresiva y duradera.",
      "Efecto tensor natural contra la flacidez facial leve a moderada.",
      "Estimulación biológica de colágeno tipo I y elastina propia.",
      "Rejuvenecimiento global sin alterar los volúmenes faciales.",
    ],
    targetAreas: "Tercio medio facial, mejillas, línea mandibular, cuello y escote.",
    candidateProfile: "Pacientes a partir de los 30 años que presentan pérdida de turgencia, flacidez inicial o piel adelgazada.",
  },
  "dermapen-microneedling": {
    summary:
      "Terapia de microinducción de colágeno mediante microagujas estériles a alta velocidad. Genera microcanales controlados en la dermis que facilitan la penetración de cócteles estériles de ácido hialurónico, péptidos y vitaminas, estimulando los mecanismos naturales de reparación y cicatrización cutánea.",
    benefits: [
      "Atenuación de cicatrices residuales de acné y líneas finas.",
      "Refinamiento de la textura de la piel y minimización de poros dilatados.",
      "Mayor firmeza, vitalidad y absorción de activos regeneradores.",
      "Excelente perfil de seguridad con rápida recuperación en 24 a 48 horas.",
    ],
    targetAreas: "Rostro completo, zonas peribucales y mejillas.",
    candidateProfile: "Personas con cicatrices de acné, poros dilatados, líneas finas o pérdida de luminosidad.",
  },
  "limpieza-facial-plasma-facial": {
    summary:
      "Protocolo combinado de higiene dérmica profunda médico-cosmética (desincrustación, extracción y purificación de impurezas) seguido de la infiltración o aplicación tópica de Plasma Rico en Plaquetas (PRP) autólogo, rico en factores de crecimiento que aceleran la reparación celular y devuelven luminosidad y frescura al rostro.",
    benefits: [
      "Limpieza y purificación profunda libre de impurezas y comedones.",
      "Aporte de factores de crecimiento autólogos 100% biocompatibles.",
      "Efecto revitalizante, cicatrizante y altamente regenerador.",
      "Piel suave, descansada, intensamente hidratada y uniforme.",
    ],
    targetAreas: "Rostro completo, zona T, cuello y escote.",
    candidateProfile: "Cualquier persona que requiera oxigenación dérmica profunda, preparación para eventos o revitalización facial.",
  },
  "radiofrecuencia-facial": {
    summary:
      "Tecnología térmica no invasiva que emite ondas electromagnéticas hacia las capas profundas de la dermis. La elevación térmica controlada genera contracción inmediata de las fibras de colágeno existentes y estimula la síntesis de neocitocinas tensoras a largo plazo, brindando un efecto de estiramiento y compactación cutánea.",
    benefits: [
      "Efecto lifting y reafirmante no quirúrgico progresivo.",
      "Definición del óvalo facial y reducción de flacidez en mejillas y papada.",
      "Tratamiento agradable, seguro y totalmente indoloro.",
      "Sin tiempo de baja médica: incorporación inmediata a actividades normales.",
    ],
    targetAreas: "Óvalo facial, mejillas, cuello, doble mentón (papada) y contorno ocular.",
    candidateProfile: "Pacientes con flacidez facial incipiente o moderada que desean compactar la piel sin agujas ni cirugía.",
  },
  "ultrasonido-facial": {
    summary:
      "Aplicación de ondas mecánicas ultrasónicas de alta frecuencia para microvibración celular y sonoforesis. Optimiza la permeabilidad cutánea, activa la microcirculación tisular y desinflama los tejidos faciales, favoreciendo la regeneración profunda tras tratamientos estéticos.",
    benefits: [
      "Penetración optimizada de principios activos hidratantes y antioxidantes.",
      "Descongestión linfática facial y atenuación de edemas periorbitarios.",
      "Sensación de calma, frescura y relajación dérmica inmediata.",
      "Cero molestias y sin enrojecimiento residual.",
    ],
    targetAreas: "Rostro completo, pómulos y contorno periocular.",
    candidateProfile: "Pieles sensibles, congestionadas o en recuperación que buscan hidratación profunda y drenaje suave.",
  },
  "mesoterapia-corporal": {
    summary:
      "Técnica médica de microinyecciones intradérmicas con activos lipolíticos, drenantes y reafirmantes (como alcachofa, carnitina, cafeína o silicio orgánico) directamente en depósitos de grasa localizada y zonas con celulitis, dinamizando el metabolismo lipídico y la microcirculación.",
    benefits: [
      "Reducción localizada de depósitos adiposos rebeldes.",
      "Mejora visible en el aspecto de la piel de naranja y celulitis.",
      "Activación de la microcirculación y drenaje venolinfático local.",
      "Tratamiento focalizado y complementario a un estilo de vida saludable.",
    ],
    targetAreas: "Abdomen, flancos, trocánteres (cartucheras), muslos internos y brazos.",
    candidateProfile: "Personas con grasa localizada resistente al ejercicio o celulitis de grado I a III.",
  },
  "hidrolipoclasia-ultrasonica": {
    summary:
      "Procedimiento médico no quirúrgico que combina la infiltración de una solución hipotónica estéril en el tejido adiposo seguida de la aplicación de ultrasonido médico de cavitación. La resonancia acústica fragmenta las membranas de los adipocitos, facilitando la liberación y eliminación natural de lípidos por el sistema linfático.",
    benefits: [
      "Disminución medible de medidas en zonas con grasa acumulada.",
      "Moldeamiento corporal ambulatorio sin incisiones ni anestesia general.",
      "Alternativa médica conservadora frente a procedimientos invasivos.",
      "Acompañamiento post-tratamiento con pautas de drenaje y faja de soporte.",
    ],
    targetAreas: "Abdomen superior e inferior, cintura, caderas y zona lumbar.",
    candidateProfile: "Pacientes con grasa localizada compacta que desean reducir contorno de forma focalizada.",
  },
  "radiofrecuencia-corporal": {
    summary:
      "Calentamiento dérmico y subdérmico focalizado que compacta las fibras de colágeno corporal y estimula la vascularización tisular. Acelera el metabolismo de los adipocitos y tensa los septos fibrosos dérmicos, alisando el relieve cutáneo y combatiendo la laxitud de la piel.",
    benefits: [
      "Reafirmación dérmica en zonas con flacidez post-parto o tras pérdida de peso.",
      "Suavizado de la celulitis y textura irregular de la piel.",
      "Sensación cálida, relajante y no invasiva.",
      "Seguro para todo tipo de piel y realizable en cualquier época del año.",
    ],
    targetAreas: "Abdomen, glúteos, muslos posteriores y brazos.",
    candidateProfile: "Personas con flacidez corporal, celulitis flácida o que buscan tonificar la piel de zonas específicas.",
  },
  "carboxiterapia-corporal": {
    summary:
      "Infiltración subcutánea controlada de dióxido de carbono medicinal (CO2). Genera un potente efecto Bohr local que incrementa la oxigenación celular, estimula la neovascularización, destruye adipocitos y reorganiza las fibras de colágeno dérmico.",
    benefits: [
      "Oxigenación tisular profunda y potente vasodilatación regenerativa.",
      "Atenuación visible de estrías recientes y celulitis compacta.",
      "Mejora sustancial en la tonicidad y apariencia de la piel corporal.",
      "Aporte lipolítico complementario en zonas rebeldes.",
    ],
    targetAreas: "Glúteos, muslos, abdomen, estrías y flancos.",
    candidateProfile: "Pacientes con estrías, celulitis rebelde, mala circulación periférica o flacidez dérmica.",
  },
  "ultrasonido-corporal": {
    summary:
      "Terapia física mediante emisión de ondas ultrasónicas que ejercen un micromasaje tisular profundo, generando acción antiedematosa, antiinflamatoria y defibrinolítica. Esencial en fases postoperatorias o de remodelación corporal.",
    benefits: [
      "Acelera la reabsorción de líquidos retenidos y micro-edemas.",
      "Alivia la tensión muscular y previene la formación de fibrosis.",
      "Procedimiento calmante, indoloro y sin período de recuperación.",
      "Sinergia ideal con técnicas de drenaje linfático manual.",
    ],
    targetAreas: "Zonas corporales en recuperación, abdomen, flancos y piernas.",
    candidateProfile: "Pacientes en recuperación de procedimientos corporales o con pesadez y retención de líquidos.",
  },
  "drenaje-linfatico-manual": {
    summary:
      "Técnica manual especializada con maniobras muy suaves, lentas y rítmicas orientadas a estimular el flujo del sistema linfático superficial. Moviliza la linfa acumulada hacia los ganglios linfáticos regionales para acelerar la evacuación de toxinas y líquidos.",
    benefits: [
      "Reducción rápida y notable de la hinchazón (edema) y pesadez.",
      "Acelera la cicatrización y regeneración tisular segura.",
      "Efecto profundamente relajante sobre el sistema nervioso autónomo.",
      "Indispensable en protocolos post-procedimientos médicos y estéticos.",
    ],
    targetAreas: "Cuerpo completo, abdomen, extremidades inferiores y rostro según indicación.",
    candidateProfile: "Pacientes en postoperatorio, con retención de líquidos, piernas cansadas o linfedema leve.",
  },
  "masaje-reductor": {
    summary:
      "Técnica de masaje vigoroso y enérgico que genera fricción mecánica e hiperemia térmica local en el tejido celular subcutáneo. Ayuda a dinamizar la grasa localizada, modelar los contornos corporales y favorecer la tonificación dérmica.",
    benefits: [
      "Modelado de la silueta corporal en cintura, abdomen y caderas.",
      "Activación de la microcirculación sanguínea y aumento del metabolismo local.",
      "Ayuda a compactar los tejidos y mejorar la definición de las curvas.",
      "Excelente complemento a planes nutricionales y actividad física.",
    ],
    targetAreas: "Cintura, abdomen, caderas y glúteos.",
    candidateProfile: "Personas que buscan estilizar y moldear el contorno de zonas específicas con grasa blanda.",
  },
  "masaje-relajante": {
    summary:
      "Terapia manual integral que combina maniobras de deslizamiento suave, presiones armónicas y estiramientos musculares delicados con aromaterapia clínica. Alivia el estrés psicofísico acumulado, disuelve tensiones miofasciales y promueve un descanso reparador.",
    benefits: [
      "Alivio profundo del estrés, ansiedad y fatiga mental acumulada.",
      "Relajación de contracturas y sobrecargas musculares posturales.",
      "Mejora en la calidad del sueño y equilibrio fisiológico global.",
      "Sensación inmediata de bienestar, ligereza y serenidad.",
    ],
    targetAreas: "Espalda completa, cuello, hombros, piernas y pies.",
    candidateProfile: "Cualquier persona expuesta a tensión, estrés laboral, dolor postural o fatiga acumulada.",
  },
  "sueroterapia-intravenosa": {
    summary:
      "Administración endovenosa personalizada de sueros con cócteles de oligoelementos, aminoácidos esenciales, vitaminas de alta biodisponibilidad y antioxidantes maestros (como la Vitamina C y Glutatión). Garantiza una absorción celular del 100% sin depender del tránsito digestivo.",
    benefits: [
      "Biodisponibilidad inmediata y nutrición celular al 100%.",
      "Potente efecto antioxidante, antienvejecimiento y dérmico luminoso.",
      "Refuerzo del sistema inmunitario y optimización de los niveles de energía.",
      "Hidratación sistémica profunda para recuperación rápida del organismo.",
    ],
    targetAreas: "Vía intravenosa periférica en ambiente médico controlado y seguro.",
    candidateProfile: "Personas con fatiga crónica, estrés, requerimiento de refuerzo inmune o búsqueda de longevidad dérmica.",
  },
  "terapia-capilar-plasma": {
    summary:
      "Tratamiento médico autólogo contra la miniaturización capilar y efluvio telógeno. Consiste en la obtención de Plasma Rico en Plaquetas del propio paciente para microinfiltrarlo en el cuero cabelludo, donde sus factores de crecimiento estimulan la vascularización del folículo piloso.",
    benefits: [
      "Frena la caída activa y progresiva del cabello.",
      "Fortalece el grosor, densidad y calibre de la fibra capilar existente.",
      "Estimula la fase anágena (crecimiento activo) folicular.",
      "100% natural, seguro y libre de reacciones alérgicas o rechazo.",
    ],
    targetAreas: "Cuero cabelludo (zona frontal, coronilla y vertex).",
    candidateProfile: "Hombres y mujeres con pérdida de densidad capilar, efluvio telógeno o alopecia androgénica incipiente.",
  },
  "mesoterapia-capilar": {
    summary:
      "Infiltración dérmica en el cuero cabelludo de una solución estéril enriquecida con aminoácidos, biotina, pantenol, zinc, péptidos biomiméticos e inhibidores locales de la 5-alfa reductasa. Nutre directamente la papila dérmica donde se genera el cabello.",
    benefits: [
      "Aporte nutricional directo y concentrado a la raíz folicular.",
      "Disminución gradual de la caída del cabello y mejora del brillo.",
      "Estimulación de la microcirculación sanguínea peri-folicular.",
      "Complemento ideal para potenciar terapias capilares de mantenimiento.",
    ],
    targetAreas: "Cuero cabelludo en zonas de debilitamiento y pérdida de volumen.",
    candidateProfile: "Pacientes con cabello fino, quebradizo o en fases iniciales de caída capilar.",
  },
};

export function getProcedureHighlight(slug: string, fallbackTitle?: string): ProcedureHighlight {
  if (PROCEDURE_HIGHLIGHTS[slug]) {
    return PROCEDURE_HIGHLIGHTS[slug];
  }

  // Fallback inteligente para procedimientos nuevos o no catalogados expresamente
  return {
    summary: `Tratamiento médico-estético especializado en AuraMed diseñado para ofrecer resultados visibles, seguros y armónicos bajo supervisión clínica directa. Emplea tecnología y principios de vanguardia para garantizar confort y satisfacción en cada sesión.`,
    benefits: [
      "Procedimiento seguro realizado bajo supervisión médica especializada.",
      "Resultados armónicos y naturales acordes a tus objetivos personales.",
      "Tiempos de recuperación óptimos con mínimas molestias.",
      "Atención personalizada con seguimiento clínico dedicado.",
    ],
    targetAreas: "Zonas anatómicas según valoración médica individualizada.",
    candidateProfile: "Pacientes que buscan mejorar su bienestar y estética con procedimientos de alta calidad médica.",
  };
}
