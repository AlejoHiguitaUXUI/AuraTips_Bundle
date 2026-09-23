export interface GuardrailCheckResult {
  isEmergency: boolean;
  urgencyLevel: "emergency" | "warning" | "normal";
  matchedCriteriaCount: number;
  matchedCriteria: string[];
  actionTitle?: string;
  actionInstructions?: string;
  emergencyContactPhone?: string;
}

// Criterios clínicos de valoración post-tratamiento
export const CLINICAL_ALARM_CRITERIA = [
  {
    id: "color_temp",
    name: "Cambio inusual de coloración o temperatura",
    regex: /(palidez|p[aá]lid[ao]|piel blanca|mancha blanca|piel fr[ií]a|fr[ií][ao] al tacto|azul viol[aá]ceo|moteado|fr[ií][ao])/i,
    description: "Tono blanquecino o frialdad marcada en la zona",
  },
  {
    id: "severe_pain",
    name: "Molestia pulsátil persistente",
    regex: /(dolor (insoportable|extremo|desproporcionado|puls[aá]til intenso|fuerte|intenso)|no aguanto el dolor|dolor que no cede|me duele mucho|mucho dolor)/i,
    description: "Dolor intenso que no se alivia con la analgesia habitual",
  },
  {
    id: "ocular_motor",
    name: "Afectación periorbitaria o palpebral",
    regex: /(ojo ca[ií]do|p[aá]rpado ca[ií]do|no puedo abrir el ojo|visi[oó]n doble|visi[oó]n borrosa)/i,
    description: "Dificultad para abrir el párpado o alteración visual",
  },
  {
    id: "vesicles_fever",
    name: "Reacción vesicular o febrícula",
    regex: /(ampoll(as|itas)|racimo de ves[ií]culas|ves[ií]culas|secreci[oó]n amarillenta|fiebre alta|calor excesivo localizado)/i,
    description: "Aparición de pequeñas vesículas o temperatura elevada",
  },
  {
    id: "systemic",
    name: "Reacción respiratoria o sistémica",
    regex: /(dificultad para respirar|garganta cerrada|ahogo|hinchaz[oó]n de lengua|asfixia)/i,
    description: "Sensación de dificultad respiratoria o inflamación en garganta",
  },
];

export function checkClinicalGuardrails(message: string): GuardrailCheckResult {
  const normalized = message.trim();
  const matchedCriteria: string[] = [];

  for (const criterion of CLINICAL_ALARM_CRITERIA) {
    if (criterion.regex.test(normalized)) {
      matchedCriteria.push(criterion.name);
    }
  }

  // Regla médica: Urgencia directa ante sospecha de isquemia vascular (palidez + dolor)
  // o compromiso respiratorio/anafiláctico, o 2+ criterios de alarma simultáneos
  const isVascularCrisis =
    /(piel blanca|palidez|p[aá]lid[ao]|fr[ií][ao]|gris[aá]ceo|moteado)/i.test(normalized) &&
    /(dolor|fuerte|intenso|insoportable|puls[aá]til|duele)/i.test(normalized);
  const isSystemicOrAnaphylaxis =
    /(dificultad para respirar|garganta cerrada|ahogo|asfixia|hinchaz[oó]n de lengua|angioedema)/i.test(normalized);
  const meetsThreshold = matchedCriteria.length >= 2 || isSystemicOrAnaphylaxis || isVascularCrisis;

  if (meetsThreshold) {
    return {
      isEmergency: true,
      urgencyLevel: "emergency",
      matchedCriteriaCount: matchedCriteria.length,
      matchedCriteria,
      actionTitle: "Atención Médica Prioritaria Recomendada",
      actionInstructions:
        "Comprendemos que notar estos cambios te genere inquietud. Al coincidir varias manifestaciones de forma simultánea, lo más prudente y seguro para tu bienestar es que la especialista realice una valoración prioritaria directa. Por favor mantén la calma, suspende la aplicación de frío o masajes, y comunícate con nosotros mediante el botón directo a continuación.",
      emergencyContactPhone: "+57 300 912 3456",
    };
  }

  return {
    isEmergency: false,
    urgencyLevel: matchedCriteria.length > 0 ? "warning" : "normal",
    matchedCriteriaCount: matchedCriteria.length,
    matchedCriteria,
  };
}
