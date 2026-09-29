/**
 * AuraTips · Consultorio Clínico Dra. Mariana Gómez
 * Consulta tipada para obtener los procedimientos y cursos publicados desde Supabase.
 */
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type PublishedCourse = Database["public"]["Tables"]["courses"]["Row"] & {
  profiles?: { display_name: string } | { display_name: string }[] | null;
};

/**
 * Obtiene los cursos o procedimientos cuyo estado sea "published".
 * Utiliza el cliente de Supabase suministrado (anon o server).
 *
 * Bajo las políticas de RLS de AuraTips, los visitantes anónimos solo pueden
 * leer cursos con status = 'published'.
 *
 * @param supabase Cliente de Supabase (anon, server o admin).
 * @returns Lista de cursos publicados.
 */
export async function getPublishedCourses(
  supabase: SupabaseClient<Database>
): Promise<PublishedCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, owner_id, title, slug, cover_url, description, category, recovery_time, pain_level, results_duration, status, price, created_at, updated_at, profiles ( display_name )"
    )
    .eq("status", "published");

  if (error) {
    throw error;
  }

  return (data as PublishedCourse[]) ?? [];
}
