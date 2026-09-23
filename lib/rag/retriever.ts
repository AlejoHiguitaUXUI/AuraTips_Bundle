import { createClient } from "@supabase/supabase-js";
import { getProcedureBySlug, CLINICAL_PROCEDURES } from "@/lib/clinical-data";

let extractorInstance: any = null;
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (extractorInstance) return extractorInstance;
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      extractorInstance = await pipeline("feature-extraction", "Supabase/gte-small");
      return extractorInstance;
    })();
  }
  return extractorPromise;
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating query embedding:", error);
    return [];
  }
}

export interface RetrievedClinicalContext {
  procedureTitle: string;
  procedureSlug: string;
  category: string;
  recoveryTime: string;
  painLevel: number;
  alarmSigns: string[];
  similarity: number;
  currentPhaseTitle?: string;
  timelineTag?: string;
  dos: string[];
  donts: string[];
  checklist: string[];
  protocolOverview: string;
}

export async function retrieveClinicalContext(
  query: string,
  preferredSlug?: string,
  recoveryDay?: number
): Promise<RetrievedClinicalContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  let supabase: any = null;
  if (supabaseUrl && serviceKey) {
    try {
      supabase = createClient(supabaseUrl, serviceKey);
    } catch {
      supabase = null;
    }
  }

  let bestMatchCourse: any = null;
  let matchSimilarity = 0.85;

  // 1. Si el paciente ya tiene un procedimiento activo específico (ej. Botox o Labios)
  if (preferredSlug) {
    const localProc = getProcedureBySlug(preferredSlug);
    if (localProc) {
      bestMatchCourse = {
        title: localProc.title,
        slug: localProc.slug,
        category: localProc.category,
        recovery_time: localProc.recovery_time,
        pain_level: localProc.pain_level,
        alarm_signs: localProc.alarm_signs,
        description: localProc.description,
      };
      matchSimilarity = 1.0;
    }
  }

  // 2. Si no se especificó o queremos comprobar coincidencia semántica con el query
  if (!bestMatchCourse) {
    try {
      const queryEmbedding = await generateQueryEmbedding(query);
      if (supabase && queryEmbedding.length === 384) {
        const { data: matches, error } = await supabase.rpc("match_courses", {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 1,
        });

        if (!error && matches && matches.length > 0) {
          bestMatchCourse = matches[0];
          matchSimilarity = bestMatchCourse.similarity;
        }
      }
    } catch (e) {
      console.warn("Vector search fallback triggered:", e);
    }
  }

  // 3. Fallback de búsqueda de texto si el vector no devolvió nada
  if (!bestMatchCourse) {
    const cleanQuery = query.toLowerCase();
    const fallback = CLINICAL_PROCEDURES.find(
      (p) =>
        cleanQuery.includes(p.slug.split("-")[0]) ||
        cleanQuery.includes(p.title.toLowerCase().slice(0, 8)) ||
        p.alarm_signs.some((sign) => cleanQuery.includes(sign.toLowerCase().slice(0, 10)))
    );
    if (fallback) {
      bestMatchCourse = fallback;
      matchSimilarity = 0.75;
    } else {
      // Tomamos el procedimiento de toxina botulínica como contexto por defecto
      bestMatchCourse = CLINICAL_PROCEDURES[0];
      matchSimilarity = 0.6;
    }
  }

  // 4. Extraer pautas, fases temporales, dos y donts correspondientes al procedimiento
  const clinicalProc = getProcedureBySlug(bestMatchCourse.slug) || CLINICAL_PROCEDURES[0];
  const day = recoveryDay ?? 1;

  // Determinar la fase temporal según el día de recuperación
  let currentPhase = clinicalProc.modules[0];
  if (day >= 4 && clinicalProc.modules.length > 2) {
    currentPhase = clinicalProc.modules[2];
  } else if (day >= 2 && clinicalProc.modules.length > 1) {
    currentPhase = clinicalProc.modules[1];
  }

  const allDos = currentPhase.lessons.flatMap((l) => l.dos);
  const allDonts = currentPhase.lessons.flatMap((l) => l.donts);
  const allChecklist = currentPhase.lessons.flatMap((l) => l.checklist);
  const activeLesson = currentPhase.lessons[0];

  return {
    procedureTitle: clinicalProc.title,
    procedureSlug: clinicalProc.slug,
    category: clinicalProc.category,
    recoveryTime: clinicalProc.recovery_time,
    painLevel: clinicalProc.pain_level,
    alarmSigns: clinicalProc.alarm_signs,
    similarity: matchSimilarity,
    currentPhaseTitle: currentPhase.title,
    timelineTag: activeLesson?.timeline_tag || `Día ${day}`,
    dos: allDos,
    donts: allDonts,
    checklist: allChecklist,
    protocolOverview: clinicalProc.description,
  };
}
