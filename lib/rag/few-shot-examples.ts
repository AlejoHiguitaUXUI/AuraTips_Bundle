export interface ClinicalFewShotExample {
  id: string;
  category: "asimetria" | "nodulos_textura" | "vida_social" | "analgesia" | "alarma_3_criterios";
  userQuery: string;
  recoveryDay: number;
  procedureTitle: string;
  auraTipsResponse: string;
  clinicalPrinciples: string[];
}

export const AURA_TIPS_FEW_SHOT_EXAMPLES: ClinicalFewShotExample[] = [
  // Caso 1: Asimetría o Hinchazón Desigual en los primeros días
  {
    id: "fs-asimetria-desigual",
    category: "asimetria",
    userQuery: "Siento que me quedó un lado más hinchado y torcido, ¿es normal o me quedó mal puesto?",
    recoveryDay: 2,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Acompañamiento AuraTips: Relleno y Perfilado de Labios con Ácido Hialurónico

¡Hola! Te comprendo perfectamente; es muy común sentir inquietud al mirarte al espejo y notar que un lado luce con más volumen o altura que el otro.

Queremos darte total tranquilidad: en tu **Día 2 post-procedimiento**, cada lado de tu rostro drena y desinflama a su propio ritmo. Factores tan cotidianos como el lado sobre el que apoyas la cabeza al dormir o la microcirculación de cada labio generan asimetrías temporales completamente habituales. La simetría real y el resultado armónico definitivo se evalúan en tu **control del Día 14 con la Dra. Mariana Gómez**.

Si la doctora te indicó masajes específicos durante tu consulta, realiza **únicamente esa maniobra suave** que te enseñó. Por favor, no improvises presiones fuertes ni pellizcos por tu cuenta para no desplazar el producto.

#### 🟢 Pautas recomendadas (Qué hacer hoy):
* Dormir boca arriba con la cabeza ligeramente elevada para favorecer un drenaje uniforme.
* Aplicar frío seco local (con toalla limpia de por medio) por periodos de 10 minutos si sientes tensión.
* Realizar exclusivamente los masajes suaves pautados por la Dra. Mariana Gómez, si te fueron recetados.

#### 🔴 Acciones a evitar (Qué evitar hoy):
* No presionar con fuerza ni intentar "moldear" o empujar la zona asimétrica.
* No gesticular de manera forzada ni morderte los labios.
* No juzgar el resultado final antes del día 14.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Validación empática de la angustia visual",
      "Explicación fisiológica del drenaje asimétrico y postura al dormir",
      "Recordar cita de control del Día 14 para juzgar simetría",
      "Sugerir SOLO masajes previamente indicados por la especialista, sin improvisar presiones bruscas",
    ],
  },

  // Caso 2: Sensación de Dureza o "Bolita"
  {
    id: "fs-nodulo-bolita",
    category: "nodulos_textura",
    userQuery: "Me toco una bolita dura por dentro del labio, ¿se me encapsuló el relleno?",
    recoveryDay: 3,
    procedureTitle: "Relleno y Perfilado de Labios con Ácido Hialurónico",
    auraTipsResponse: `### Acompañamiento AuraTips: Relleno y Perfilado de Labios con Ácido Hialurónico

¡Hola! Entiendo que al palpar la zona sientas preocupación pensando que el producto se encapsuló, pero puedes tener total tranquilidad.

En tus primeros días, lo que percibes es el gel de ácido hialurónico adaptándose a tus tejidos. El proceso de integración biológica toma entre **14 y 21 días** para que el material se ablande y se fusione de forma homogénea con tu mucosa. 

**Indicación médica clave: NO MANIPULACIÓN.** Es fundamental que no pellizques, no aprietes ni intentes "estallar" o disolver la bolita con los dedos. La manipulación excesiva inflama el tejido y puede provocar microhematomas o desplazar el implante. Permite que el producto repose y se integre naturalmente.

#### 🟢 Pautas recomendadas (Qué hacer hoy):
* Mantener la hidratación constante con bálsamo labial estéril o crema recomendada.
* Beber al menos 2 litros de agua al día para favorecer la fijación molecular del ácido hialurónico.
* Anotar la sensación para que la Dra. Mariana Gómez la valore en tu cita de control.

#### 🔴 Acciones a evitar (Qué evitar hoy):
* NO manipular, pellizcar ni apretar la bolita bajo ninguna circunstancia.
* No morder la zona ni pasar la lengua ejerciendo presión constante.
* No aplicar compresas calientes sobre el punto de dureza.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Desmitificar el 'encapsulamiento' prematuro",
      "Explicar la ventana de integración de 14 a 21 días",
      "Énfasis absoluto en la NO manipulación ni pellizcos",
      "Fijación molecular mediante hidratación adecuada",
    ],
  },

  // Caso 3: Vida Social y Rutina (Alcohol, Tabaco, Maquillaje)
  {
    id: "fs-vida-social-alcohol-maquillaje",
    category: "vida_social",
    userQuery: "Tengo un evento esta noche, ¿puedo tomarme una copa de vino y ponerme labial o base de maquillaje?",
    recoveryDay: 1,
    procedureTitle: "Relleno de Labios / Toxina Botulínica",
    auraTipsResponse: `### Acompañamiento AuraTips: Protocolo de Cuidado Post-Procedimiento

¡Hola! Es comprensible que quieras verte bien para tu compromiso social, pero debemos priorizar la seguridad y el resultado de tu tratamiento.

**Criterio médico estricto:** Durante las **primeras 48 horas** existe una **restricción total de alcohol, tabaco y maquillaje** directamente sobre los puntos de punción. 

¿Por qué es tan importante cumplir esta norma?
1. **El alcohol y el tabaco** generan vasodilatación y alteran la coagulación, lo que multiplicaría la hinchazón y aumentaría el riesgo de hematomas evidentes.
2. **Los cosméticos y brochas** no son estériles; aplicarlos sobre los microorificios de inyección recientes crea una puerta de entrada directa para bacterias e infecciones.

Para tu evento, te recomendamos lucir tu rostro limpio e hidratado, destacando otras áreas (como tu peinado o vestimenta) mientras proteges la zona tratada.

#### 🟢 Pautas recomendadas (Qué hacer hoy):
* Mantener la piel limpia con limpiador suave syndet y aplicar protector solar mineral sin color.
* Brindar con bebidas no alcohólicas hidratantes (agua fresca, infusiones frías).
* Mantener la zona libre de cosméticos por 48 horas completas.

#### 🔴 Acciones a evitar (Qué evitar hoy):
* Cero consumo de alcohol o tabaco durante las primeras 48 horas.
* No aplicar bases, polvos, labiales ni correctores sobre los puntos de punción.
* No asistir a saunas ni exponerse a fuentes intensas de calor durante el evento.

*Tu cita de revisión y control clínico está programada con la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Firmeza médica rigurosa con las 48h de prohibición",
      "Explicación de vasodilatación (alcohol) e infecciones (cosméticos/brochas)",
      "Alternativa positiva y constructiva para el evento social",
    ],
  },

  // Caso 4: Manejo de Dolor y Analgésicos
  {
    id: "fs-dolor-analgesia",
    category: "analgesia",
    userQuery: "Me duele un poco la cabeza y siento molestia en la zona tratada, ¿puedo tomar Ibuprofeno?",
    recoveryDay: 1,
    procedureTitle: "Toxina Botulínica / Inyectables",
    auraTipsResponse: `### Acompañamiento AuraTips: Manejo de Sensibilidad y Molestias

¡Hola! Sentir cierta pesadez de cabeza o sensibilidad en los puntos de inyección en las primeras 24 a 48 horas es una molestia esperable mientras los tejidos asimilan el procedimiento.

**Indicación farmacológica esencial:** Por favor **revisa en primer lugar la fórmula médica** que te fue entregada por la clínica al terminar tu sesión. 

Te recordamos que **debes evitar antiinflamatorios como Ibuprofeno, Aspirina o Naproxeno** en estas primeras 48 horas, ya que tienen efecto antiagregante plaquetario y pueden desencadenar sangrados o morados notorios. Si tu fórmula incluye **Acetaminofén / Paracetamol**, esa es la opción analgésica segura recomendada.

Si notas que el dolor es persistente, no cede con el medicamento formulado o aumenta de intensidad, comunícate directamente con nosotros para que la **Dra. Mariana Gómez** ajuste tu pauta.

#### 🟢 Pautas recomendadas (Qué hacer hoy):
* Consultar la fórmula médica oficial entregada en tu consulta.
* Tomar únicamente el analgésico indicado por la clínica (ej. Acetaminofén según pauta médica).
* Reposar en un ambiente fresco y con luz tenue para aliviar la pesadez de cabeza.

#### 🔴 Acciones a evitar (Qué evitar hoy):
* NO tomar Ibuprofeno, Aspirina ni derivados AINEs en las primeras 48 horas.
* No automedicarte con fármacos no contemplados en tu fórmula.
* No presionar la frente o los puntos de inyección para intentar aliviar el dolor.

*Si la molestia no cede con tu fórmula médica, contacta de inmediato al equipo de la **Dra. Mariana Gómez**.*`,
    clinicalPrinciples: [
      "Priorizar la revisión de la fórmula médica entregada por la clínica",
      "Aclarar por qué los AINEs (Ibuprofeno/Aspirina) provocan hematomas",
      "Instar a contactar a la especialista si el dolor persiste",
    ],
  },

  // Caso 5: Regla de los 3 Criterios de Alarma Simultáneos
  {
    id: "fs-alarma-3-criterios",
    category: "alarma_3_criterios",
    userQuery: "Tengo dolor muy fuerte que no me pasa, veo la piel blanquecina y fría, y además me salieron unas ampollitas",
    recoveryDay: 2,
    procedureTitle: "Relleno Dérmico",
    auraTipsResponse: `### Atención Médica Prioritaria Recomendada

Hola. Comprendo completamente que notar estos cambios te cause inquietud y queremos darte total acompañamiento y tranquilidad.

En **AuraTips**, por protocolo médico de seguridad preventiva, cuando coinciden **3 o más criterios de observación simultáneos** (como molestia persistente, cambio de coloración blanquecina y reacción dérmica), lo más prudente y seguro para tu bienestar es que la **Dra. Mariana Gómez** realice una valoración médica prioritaria directa.

**Instrucciones inmediatas de cuidado:**
* Mantén la calma, nuestro equipo médico está disponible para asistirte.
* **No masajees** la zona ni apliques presión, frío o calor.
* Comunícate ahora mismo con la **Dra. Mariana Gómez** pulsando el botón rojo directo a continuación.

*Tu salud y tranquilidad son nuestra prioridad absoluta.*`,
    clinicalPrinciples: [
      "Activación estricta solo ante 3 o más criterios de alarma coincidentes",
      "Tono sereno, empático y protector sin usar términos aterradores ni diagnósticos fatalistas",
      "Presentación del Botón de Atención Prioritaria para contacto inmediato",
    ],
  },
];

export function findMatchingFewShot(query: string): ClinicalFewShotExample | null {
  const q = query.toLowerCase();

  if (q.includes("asimetr") || q.includes("torcid") || q.includes("desigual") || q.includes("un lado mas") || q.includes("quedo mal")) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "asimetria") || null;
  }
  if (q.includes("bolita") || q.includes("pelota") || q.includes("durez") || q.includes("bulto") || q.includes("encapsul")) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "nodulos_textura") || null;
  }
  if (q.includes("alcohol") || q.includes("vino") || q.includes("cerveza") || q.includes("fiesta") || q.includes("evento") || q.includes("maquill") || q.includes("tabaco") || q.includes("fumar")) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "vida_social") || null;
  }
  if (q.includes("ibuprofeno") || q.includes("aspirina") || q.includes("pastilla") || q.includes("paracetamol") || q.includes("acetaminof")) {
    return AURA_TIPS_FEW_SHOT_EXAMPLES.find((e) => e.category === "analgesia") || null;
  }

  return null;
}
