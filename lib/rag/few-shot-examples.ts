export interface ClinicalFewShotExample {
  id: string;
  category:
    | "agendamiento"
    | "llamada_humana"
    | "pregunta_concisa"
    | "panico_estetico"
    | "asimetria"
    | "nodulos_textura"
    | "vida_social"
    | "analgesia"
    | "hematomas"
    | "alarma_3_criterios";
  userQuery: string;
  recoveryDay: number;
  procedureTitle: string;
  auraTipsResponse: string;
  clinicalPrinciples: string[];
}

export const AURA_TIPS_FEW_SHOT_EXAMPLES: ClinicalFewShotExample[] = [
  // Caso 1: Agendamiento y Cita de Control
  {
    id: "fs-agendamiento-citas",
    category: "agendamiento",
    userQuery: "¿Puedo adelantar mi cita de control? No quiero esperar hasta el día 14",
    recoveryDay: 3,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Gestión de Cita de Control • AuraTips

¡Hola! Bienvenido(a) a AuraTips. Tu cita de revisión y control clínico está programada para el **Día 14 con la Dra. Mariana Gómez**.

En tu Día 3, no es clínicamente aconsejable adelantar la cita antes del Día 14 porque los tejidos aún se encuentran en pleno proceso de desinflamación y el ácido hialurónico tarda dos semanas en estabilizarse e integrarse de forma definitiva. Sin embargo, si experimentas alguna molestia imprevista o inquietud puntual, podemos coordinar una revisión prioritaria.

Para consultar disponibilidad o solicitar un cambio en tu agenda, comunícate directamente con recepción médica aquí: [Contactar a Recepción Médica](https://wa.me/573009123456?text=Hola,%20deseo%20consultar%20sobre%20mi%20cita%20de%20control%20Dra%20Mariana%20Gomez) o llamando al [+57 300 912 3456](tel:+573009123456).`,
    clinicalPrinciples: [
      "Reconocer la cita oficial programada del Día 14 con la Dra. Mariana Gómez",
      "Explicar en 1 frase la razón biológica de no adelantar el control (desinflamación y biointegración)",
      "Proporcionar enlace y teléfono directo con recepción para reprogramar",
      "Regla estricta: NO incluir listas de pautas recomendadas ni qué evitar",
    ],
  },

  // Caso 2: Handoff a Humano / Deseo de Llamada Telefónica
  {
    id: "fs-llamada-handoff",
    category: "llamada_humana",
    userQuery: "No me gusta este chat, prefiero que me llame una persona real de la clínica",
    recoveryDay: 2,
    procedureTitle: "Atención Médica y Acompañamiento",
    auraTipsResponse: `¡Hola! Comprendo totalmente que prefieras hablar directamente por teléfono con nuestro equipo humano en lugar de interactuar por chat.

Puedes comunicarte ahora mismo de forma directa haciendo clic aquí: [Llamar a Recepción Médica (+57 300 912 3456)](tel:+573009123456) o escribirnos a nuestro [WhatsApp de Recepción](https://wa.me/573009123456?text=Hola,%20solicito%20atenci%C3%B3n%20telef%C3%B3nica%20directa%20por%20favor) para devolverte la llamada a la brevedad.`,
    clinicalPrinciples: [
      "Cero justificaciones ni disculpas artificiales sobre el asistente",
      "Máxima empatía en 2 líneas directas",
      "Enlace telefónico tel: y WhatsApp directo de recepción",
      "Regla estricta: Cero pautas clínicas o bloques de qué hacer/evitar",
    ],
  },

  // Caso 3: Pregunta Concisa (Maquillaje temprano)
  {
    id: "fs-pregunta-concisa-maquillaje",
    category: "pregunta_concisa",
    userQuery: "¿Hoy me puedo maquillar?",
    recoveryDay: 1,
    procedureTitle: "Relleno Facial / Toxina Botulínica",
    auraTipsResponse: `### Pauta de Maquillaje Facial • AuraTips

¡Hola! Bienvenido(a) a AuraTips. Durante las primeras 24 a 48 horas rige una pausa de cosméticos sobre los puntos de punción, ya que los microorificios de la piel tardan ese lapso en completar su sellado y aplicar bases o correctores puede introducir bacterias en las capas profundas.

#### Pautas recomendadas (Qué hacer):
* Puedes maquillar con total libertad ojos, cejas y pestañas para resaltar tu mirada.
* Mantén la piel tratada limpia e hidratada solo con bálsamo estéril o protector solar mineral en toques suaves.
* Cumplidas las 48 horas podrás reanudar tu base o labial habitual utilizando brochas o esponjas limpias.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Explicación fisiológica concisa (2-3 líneas) del sellado de microorificios",
      "2-3 pautas recomendadas directas y aplicables sin texto superfluo",
      "Alternativa práctica positiva (maquillaje de ojos)",
    ],
  },

  // Caso 4: Pánico o Arrepentimiento Estético Inmediato
  {
    id: "fs-panico-arrepentimiento",
    category: "panico_estetico",
    userQuery: "Siento la boca deforme y me veo horrible, me arrepiento muchísimo de haberme hecho esto...",
    recoveryDay: 1,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Acompañamiento AuraTips: Relleno y Perfilado de Labios

¡Hola! Bienvenido(a) a AuraTips. Comprendo profundamente lo angustiante que resulta mirarte y sentir que no te reconoces. Por favor ten total serenidad: no estás solo(a) y te acompañamos paso a paso.

En tus primeras 24 a 48 horas, los labios presentan un **edema inflamatorio agudo** defensivo sumado a la **alta capacidad hidrófila del ácido hialurónico**, que retiene agua para asentarse. Esto produce una **sobredimensión temporal de hasta un 30%** que no corresponde al resultado final. Juzgar el tratamiento hoy genera alarma innecesaria porque los tejidos aún no han drenado.

#### Pautas recomendadas (Qué hacer):
* Aplica frío seco local (hielo envuelto en toalla limpia) 10 minutos cada 2 horas para desinflamar.
* Descansa con la cabeza elevada para facilitar el drenaje linfático por gravedad.
* Haz una pausa activa del espejo y fotos de primer plano durante estas 48 horas.

#### Acciones a evitar (Qué evitar):
* No aprietes, pellizques ni intentes amoldar los labios con los dedos.
* No evalúes el resultado final durante el pico inflamatorio inicial.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Validación empática de la angustia visual",
      "Explicación concisa del edema reactivo y retención hidrófila (+30% temporal)",
      "Pausa de espejos y prohibición de manipulación",
    ],
  },

  // Caso 5: Asimetría y Regla del Día 14
  {
    id: "fs-asimetria-desigual",
    category: "asimetria",
    userQuery: "Me veo un lado más hinchado que el otro, siento que me quedó torcido",
    recoveryDay: 2,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Acompañamiento AuraTips: Simetría y Evolución

¡Hola! Bienvenido(a) a AuraTips. Comprendo perfectamente tu inquietud; es muy común percibir que un lado luce con más volumen o altura que el otro en los primeros días.

Cada mitad del rostro tiene su propia red independiente de microcirculación y drenaje linfático, por lo que un lado desinflama más rápido que el otro. Además, la postura al dormir hace que el lado apoyado retenga más líquido por gravedad. El ácido hialurónico requiere **14 días para integrarse y estabilizarse**: la simetría real se evalúa en tu control del Día 14 con la Dra. Mariana Gómez.

#### Pautas recomendadas (Qué hacer):
* Aplica frío seco local intermitente (10 minutos con paño limpio) en el lado de mayor tensión.
* Duerme boca arriba con dos almohadas para favorecer un drenaje simétrico.
* Mantén la calma: permite que el producto complete su asentamiento natural.

#### Acciones a evitar (Qué evitar):
* Cero manipulación: no empujes, pellizques ni intentes masajear la zona por tu cuenta.
* No saques conclusiones definitivas antes de cumplir las dos semanas de evolución.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Validación empática de la asimetría temprana",
      "Explicación anatómica de drenaje linfático asimétrico y efecto gravitacional al dormir",
      "Pacto del Día 14 y Cero Manipulación mecánica",
    ],
  },

  // Caso 6: Nódulos o Sensación de Bolita
  {
    id: "fs-nodulo-bolita",
    category: "nodulos_textura",
    userQuery: "Me toco una bolita dura por dentro del labio, ¿se me encapsuló el relleno?",
    recoveryDay: 3,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Acompañamiento AuraTips: Textura y Biointegración

¡Hola! Bienvenido(a) a AuraTips. Entiendo la preocupación que produce tocar una pequeña dureza y pensar en un encapsulamiento. Puedes tener absoluta tranquilidad médica.

El ácido hialurónico **no se encapsula en pocos días**. En este momento inicial se encuentra en un depósito concentrado en el plano donde fue colocado. El proceso normal se llama **biointegración tisular** (tarda entre 14 y 21 días en ablandarse y entretejerse con tus propios tejidos).

#### Pautas recomendadas (Qué hacer):
* Mantén una buena hidratación bebiendo al menos 2 litros de agua al día para facilitar la biointegración.
* Aplica bálsamo hidratante en toques suaves superficiales, sin frotar.
* Si persiste al Día 14, la Dra. Mariana Gómez la evaluará en tu cita de control.

#### Acciones a evitar (Qué evitar):
* CERO MANIPULACIÓN: no pellizques, aprietes ni intentes aplastar la bolita (la fricción inflama el tejido y puede desplazar el producto).
* No pases la lengua ejerciendo presión constante sobre el bulto.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Desmitificar el encapsulamiento temprano",
      "Explicar biointegración tisular (14-21 días) del depósito concentrado",
      "Firmeza en regla de CERO manipulación para evitar desplazamiento",
    ],
  },

  // Caso 7: Hematomas / Moretones
  {
    id: "fs-hematomas-morados",
    category: "hematomas",
    userQuery: "Me salió un morado oscuro en el punto donde me pincharon y se ve muy feo, ¿es peligroso y qué me puedo aplicar?",
    recoveryDay: 2,
    procedureTitle: "Relleno Facial / Inyectables",
    auraTipsResponse: `### Manejo de Hematomas • AuraTips

¡Hola! Bienvenido(a) a AuraTips. Comprendo tu inquietud visual; los moretones son una reacción habitual e inofensiva en los tratamientos inyectables.

Ocurren cuando la aguja roza un capilar diminuto, produciendo una micro-salida de sangre bajo la piel (**extravasación capilar**). El cuerpo la reabsorbe de forma natural en un lapso de 5 a 10 días, pasando de un tono violáceo a verdoso y amarillo hasta desaparecer.

#### Pautas recomendadas (Qué hacer):
* Aplica crema de árnica o vitamina K tópica en toquecitos suaves, sin frotar ni masajear.
* Usa protector solar mineral FPS 50+ continuo para evitar que la luz pigmente la zona.
* Aplica frío seco local las primeras 48 horas para calmar los capilares.

#### Acciones a evitar (Qué evitar):
* No frotes ni masajees con fuerza sobre el hematoma.
* No tomes Aspirina o Ibuprofeno (favorecen el sangrado; consulta tu fórmula de Acetaminofén).
* Evita la exposición a fuentes de calor directo como saunas o sol intenso.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Normalización y desmitificación médica de la extravasación capilar",
      "Ciclo cromático de reabsorción (5 a 10 días)",
      "Aplicación en toques suaves y fotoprotección estricta",
    ],
  },

  // Caso 8: Analgésicos y Manejo de Molestias
  {
    id: "fs-dolor-analgesia",
    category: "analgesia",
    userQuery: "Me duele un poco la cabeza y siento molestia en la zona tratada, ¿puedo tomar Ibuprofeno?",
    recoveryDay: 1,
    procedureTitle: "Toxina Botulínica / Rellenos Dérmicos",
    auraTipsResponse: `### Manejo de Molestias y Analgesia • AuraTips

¡Hola! Bienvenido(a) a AuraTips. Experimentar cierta pesadez o sensibilidad en las primeras 24 a 48 horas es esperable mientras los tejidos asimilan el tratamiento.

Por favor **revisa en primer lugar la fórmula médica entregada en tu consulta**. Evita automedicarte con Ibuprofeno, Aspirina o Naproxeno: estos fármacos tienen efecto **antiagregante plaquetario**, lo que dificulta la coagulación en los microvasos intervenidos y aumenta el riesgo de moretones. El **Acetaminofén** es la alternativa segura pautada por la clínica para aliviar el dolor sin alterar la coagulación.

#### Pautas recomendadas (Qué hacer):
* Toma únicamente el analgésico prescrito en tu fórmula médica oficial (Acetaminofén).
* Reposa en un ambiente fresco, con luz tenue y buena hidratación.
* Si el dolor persiste o es intenso, comunícate directamente con la clínica.

#### Acciones a evitar (Qué evitar):
* NO tomar Ibuprofeno, Aspirina ni derivados AINEs en las primeras 48 horas.
* No presionar los puntos de inyección para aliviar la molestia.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Priorizar la fórmula médica de la clínica",
      "Explicación médica concisa del efecto antiagregante de AINEs y riesgo de hematomas",
      "Seguridad del Acetaminofén y reposo",
    ],
  },

  // Caso 9: Eventos Sociales, Alcohol y Salidas
  {
    id: "fs-vida-social-alcohol",
    category: "vida_social",
    userQuery: "Hoy tengo una cena/boda, ¿puedo tomarme una copa de vino?",
    recoveryDay: 1,
    procedureTitle: "Relleno Facial / Toxina Botulínica",
    auraTipsResponse: `### Recomendación Social y Cuidados • AuraTips

¡Hola! Bienvenido(a) a AuraTips. Comprendo que desees disfrutar de tu compromiso, pero durante las **primeras 48 horas** rige una restricción de bebidas alcohólicas.

El alcohol produce **vasodilatación capilar inmediata** (dilata los vasos sanguíneos y acelera el flujo circulatorio en el rostro), lo que reactiva la inflamación y puede detonar la aparición de morados notorios en zonas recién tratadas.

#### Pautas recomendadas (Qué hacer):
* Disfruta de tu evento brindando con mocktails frescos o agua con gas y menta.
* Mantén una hidratación abundante durante toda la velada.
* Cumplidas las 48 horas podrás retomar el consumo moderado de alcohol.

#### Acciones a evitar (Qué evitar):
* Cero consumo de vino, cerveza o licores durante las primeras 48 horas.
* Evita acercarte a fuentes de calor intenso (calentadores o fogones).

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Explicación fisiológica concisa de la vasodilatación capilar inducida por alcohol",
      "Restricción estricta durante 48 horas",
      "Alternativa positiva: mocktails hidratantes",
    ],
  },

  // Caso 10: Alarma de 3 Criterios de Triaje
  {
    id: "fs-alarma-3-criterios",
    category: "alarma_3_criterios",
    userQuery: "Siento la piel muy pálida y fría, ampollitas y me duele mucho",
    recoveryDay: 2,
    procedureTitle: "Atención Médica Prioritaria",
    auraTipsResponse: `### Atención Médica Prioritaria Recomendada

¡Hola! Bienvenido(a) a AuraTips. Comprendo plenamente que notar estos cambios te cause inquietud y queremos brindarte total acompañamiento y soporte médico directo.

En **AuraTips**, por protocolo clínico preventivo, cuando coinciden **3 o más criterios de observación simultáneos** (como cambio marcado de coloración o temperatura dérmica, molestia persistente y reacción vesicular), lo más prudente y seguro para tu bienestar es que la **Dra. Mariana Gómez** realice una valoración médica prioritaria directa.

#### Instrucciones inmediatas:
* Mantén la calma: nuestro equipo médico está listo para asistirte.
* **No masajees** la zona ni apliques compresas calientes, frío extremo o ungüentos.
* Comunícate ahora mismo con la **Dra. Mariana Gómez** pulsando el botón de atención médica prioritaria a continuación.

*Tu salud, tranquilidad y cuidado son nuestra prioridad absoluta.*`,
    clinicalPrinciples: [
      "Activación estricta solo ante 3 o más criterios de alarma coincidentes",
      "Tono sereno, empático y protector sin diagnósticos fatalistas ni términos alarmistas",
      "Presentación clara del Botón de Atención Prioritaria para contacto médico directo",
    ],
  },
];

export function findMatchingFewShot(query: string): ClinicalFewShotExample | null {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Agendamiento y Citas
  if (
    q.includes("adelantar mi cita") ||
    q.includes("adelantar la cita") ||
    q.includes("adelantar cita") ||
    q.includes("cambiar fecha") ||
    q.includes("cambiar la fecha") ||
    q.includes("cambiar mi cita") ||
    q.includes("cambiar el dia") ||
    q.includes("puedo ir antes") ||
    q.includes("podria ir antes") ||
    q.includes("es posible ir antes") ||
    q.includes("reprogramar") ||
    q.includes("mover mi cita") ||
    q.includes("pasar antes") ||
    q.includes("no quiero esperar hasta el dia 14") ||
    q.includes("no quiero esperar al dia 14") ||
    (q.includes("cita") && (q.includes("adelantar") || q.includes("cambiar") || q.includes("antes")))
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "agendamiento") || null;
  }

  // 2. Handoff a Humano / Deseo de Llamada
  if (
    q.includes("no me gusta este chat") ||
    q.includes("persona real") ||
    q.includes("hablar con un humano") ||
    q.includes("hablar con una persona") ||
    q.includes("llamenme") ||
    q.includes("que me llamen") ||
    q.includes("prefiero llamada") ||
    q.includes("prefiero una llamada") ||
    q.includes("no quiero chatear") ||
    q.includes("hablar por telefono") ||
    q.includes("llamada telefonica") ||
    q.includes("comunicarme con alguien") ||
    q.includes("atencion telefonica")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "llamada_humana") || null;
  }

  // 3. Pregunta concisa: Maquillaje
  if (
    q.includes("hoy me puedo maquillar") ||
    q.includes("me puedo maquillar hoy") ||
    q.includes("me puedo maquillar") ||
    q.includes("puedo maquillarme") ||
    q.includes("usar maquillaje") ||
    q.includes("base de maquillaje") ||
    q.includes("me maquillo")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "pregunta_concisa") || null;
  }

  // 4. Pánico / arrepentimiento estético inmediato
  if (
    q.includes("deforme") ||
    q.includes("horrible") ||
    q.includes("me arrepiento") ||
    q.includes("arrepentid") ||
    q.includes("me veo mal") ||
    q.includes("odio como") ||
    q.includes("quedo fatal") ||
    q.includes("espantos") ||
    q.includes("desastre") ||
    q.includes("sacar el relleno")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "panico_estetico") || null;
  }

  // 5. Asimetría / torcido / desigual
  if (
    q.includes("asimetr") ||
    q.includes("torcid") ||
    q.includes("desigual") ||
    q.includes("un lado mas") ||
    q.includes("chuec") ||
    q.includes("quedo mal") ||
    q.includes("un lado hinchado") ||
    q.includes("lado mas hinchado")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "asimetria") || null;
  }

  // 6. Nódulos, durezas, bolitas
  if (
    q.includes("bolita") ||
    q.includes("pelota") ||
    q.includes("durez") ||
    q.includes("bulto") ||
    q.includes("encapsul") ||
    q.includes("grumo")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "nodulos_textura") || null;
  }

  // 7. Hematomas / morados
  if (
    q.includes("morad") ||
    q.includes("hematoma") ||
    q.includes("moret") ||
    q.includes("cardenal") ||
    q.includes("mancha morada") ||
    q.includes("mancha oscura")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "hematomas") || null;
  }

  // 8. Analgesia, dolor de cabeza, medicamentos
  if (
    q.includes("ibuprofeno") ||
    q.includes("aspirina") ||
    q.includes("pastilla") ||
    q.includes("paracetamol") ||
    q.includes("acetaminof") ||
    q.includes("naproxeno")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "analgesia") || null;
  }

  // 9. Vida social, eventos, alcohol
  if (
    q.includes("alcohol") ||
    q.includes("vino") ||
    q.includes("cerveza") ||
    q.includes("fiesta") ||
    q.includes("evento") ||
    q.includes("boda") ||
    q.includes("cena") ||
    q.includes("tabaco") ||
    q.includes("fumar")
  ) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "vida_social") || null;
  }

  return null;
}
