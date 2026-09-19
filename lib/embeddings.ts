import { createClient } from '@supabase/supabase-js';

// Creamos la función que arma el texto del curso
export async function buildCourseEmbeddingText(courseId: string, supabaseAdmin: any): Promise<string> {
    // 1. Buscamos el curso y "pegamos" sus módulos y lecciones (Join)
    const { data: course, error } = await supabaseAdmin
        .from('courses')
        .select(`
      title,
      description,
      modules (
        title,
        lessons (
          title
        )
      )
    `)
        .eq('id', courseId)
        .single();

    if (error || !course) {
        throw new Error(`No se encontró el curso: ${error?.message}`);
    }

    // 2. Empezamos a armar el texto con el título y la descripción
    let fullText = `Curso: ${course.title}\nDescripción: ${course.description || ''}\n`;

    // 3. Le pegamos los títulos de los módulos y lecciones
    if (course.modules && course.modules.length > 0) {
        fullText += `\nContenido del curso:\n`;

        course.modules.forEach((mod: any) => {
            fullText += `- Módulo: ${mod.title}\n`;
            if (mod.lessons && mod.lessons.length > 0) {
                mod.lessons.forEach((les: any) => {
                    fullText += `  * Lección: ${les.title}\n`;
                });
            }
        });
    }

    // Devuelve un texto limpio listo para enviar a la IA
    return fullText.trim();
}