import { createClient } from '@supabase/supabase-js';

// Creamos la función que arma el texto clínico del procedimiento para el embedding
export async function buildCourseEmbeddingText(courseId: string, supabaseAdmin: any): Promise<string> {
    // 1. Buscamos el procedimiento y "pegamos" sus fases (módulos) y pautas (lecciones)
    const { data: course, error } = await supabaseAdmin
        .from('courses')
        .select(`
      title,
      description,
      category,
      recovery_time,
      pain_level,
      results_duration,
      alarm_signs,
      modules (
        title,
        lessons (
          title,
          care_type,
          timeline_tag
        )
      )
    `)
        .eq('id', courseId)
        .single();

    if (error || !course) {
        throw new Error(`No se encontró el procedimiento: ${error?.message}`);
    }

    // 2. Armamos el texto clínico estructurado para el embedding semántico
    let fullText = `Procedimiento: ${course.title}\n`;
    if (course.category) fullText += `Categoría: ${course.category}\n`;
    if (course.recovery_time) fullText += `Tiempo de recuperación estimado: ${course.recovery_time}\n`;
    if (course.pain_level) fullText += `Nivel de molestia: ${course.pain_level} de 5\n`;
    if (course.results_duration) fullText += `Duración esperada de resultados: ${course.results_duration}\n`;
    if (course.alarm_signs && Array.isArray(course.alarm_signs) && course.alarm_signs.length > 0) {
        fullText += `Signos de alarma / Cuándo acudir al médico: ${course.alarm_signs.join(', ')}\n`;
    }
    if (course.description) fullText += `Descripción clínica: ${course.description}\n`;

    // 3. Agregamos las fases temporales y pautas de cuidado
    if (course.modules && course.modules.length > 0) {
        fullText += `\nProtocolos y fases de cuidado post-procedimiento:\n`;

        course.modules.forEach((mod: any) => {
            fullText += `- Fase: ${mod.title}\n`;
            if (mod.lessons && mod.lessons.length > 0) {
                mod.lessons.forEach((les: any) => {
                    const tag = les.timeline_tag ? ` [${les.timeline_tag}]` : '';
                    const care = les.care_type ? ` (${les.care_type})` : '';
                    fullText += `  * Pauta${tag}${care}: ${les.title}\n`;
                });
            }
        });
    }

    // Devuelve un texto clínico limpio optimizado para búsqueda semántica / RAG
    return fullText.trim();
}

// Búsqueda de procedimientos por similitud semántica o relevante
export async function searchCoursesBySimilarity(
    query: string,
    limit: number = 5,
    supabaseClient?: any
) {
    if (!query || !query.trim()) {
        return [];
    }

    let client = supabaseClient;
    if (!client) {
        try {
            const { createClient: createServerClient } = await import('@/lib/supabase/server');
            client = await createServerClient();
        } catch {
            const { createAdminClient } = await import('@/lib/supabase/admin');
            client = createAdminClient();
        }
    }

    try {
        const { data, error } = await client.rpc('match_courses', {
            query_text: query,
            match_count: limit,
        });
        if (!error && data && Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch {
        // RPC fallback
    }

    const { data: courses, error } = await client
        .from('courses')
        .select('id, title, slug, description, price, category, recovery_time, pain_level, results_duration, alarm_signs, cover_url')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

    if (!error && courses && courses.length > 0) {
        return courses;
    }

    const { data: fallback } = await client
        .from('courses')
        .select('id, title, slug, description, price, category, recovery_time, pain_level, results_duration, alarm_signs, cover_url')
        .eq('status', 'published')
        .limit(limit);

    return fallback || [];
}