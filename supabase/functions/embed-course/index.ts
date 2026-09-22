import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Recibimos los datos del procedimiento desde el Trigger o llamada manual
    const { record } = await req.json()
    const courseId = record?.id

    if (!courseId) {
      return new Response(JSON.stringify({ error: "No se proporcionó el ID del procedimiento" }), { status: 400 })
    }

    // 2. Conectamos a Supabase con permisos de administrador (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Obtenemos todo el contenido clínico del procedimiento (Procedimiento -> Módulos -> Lecciones)
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('title, description, modules(title, lessons(title))')
      .eq('id', courseId)
      .single()

    if (fetchError || !course) {
      return new Response(JSON.stringify({ error: "Procedimiento no encontrado" }), { status: 404 })
    }

    // 4. Armamos la cadena clínica optimizada para RAG semántico
    let textToEmbed = `Procedimiento de Medicina Estética: ${course.title}. `
    if (course.description) {
      textToEmbed += `Descripción y objetivos clínicos: ${course.description}. `
    }

    if (course.modules && course.modules.length > 0) {
      textToEmbed += `Fases de recuperación y cuidados: `
      course.modules.forEach((m: any) => {
        textToEmbed += `[Fase: ${m.title}]. `
        if (m.lessons && m.lessons.length > 0) {
          m.lessons.forEach((l: any) => { 
            textToEmbed += `Pauta: ${l.title}. ` 
          })
        }
      })
    }

    // 5. Generamos el embedding de 384 dimensiones usando el modelo integrado de Supabase
    // @ts-ignore (Supabase.ai está disponible en las Edge Functions de Supabase Deno)
    const session = new Supabase.ai.Session('gte-small')
    const embedding = await session.run(textToEmbed, { mean_pool: true, normalize: true })

    // 6. Guardamos los 384 números en la columna embedding de la tabla courses
    const { error: updateError } = await supabaseAdmin
      .from('courses')
      .update({ embedding })
      .eq('id', courseId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ message: "Embedding clínico generado y guardado con éxito", courseId }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    )
  }
})