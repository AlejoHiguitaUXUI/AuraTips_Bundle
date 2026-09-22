-- ==============================================================================
-- 0007_rag_vector_search.sql
-- Migración Maestra: Vectorización RAG, Índice HNSW, Columnas Clínicas y RPC de Búsqueda
-- Ejecuta este script completo en el "SQL Editor" de tu panel de Supabase
-- ==============================================================================

-- 1. Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Asegurar la columna de embeddings (384 dimensiones - modelo gte-small de Supabase)
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Crear índice HNSW para búsqueda coseno ultra-rápida
CREATE INDEX IF NOT EXISTS courses_embedding_idx 
  ON public.courses USING hnsw (embedding vector_cosine_ops);

-- 4. Extensión de columnas clínicas en courses (si aún no se ejecutó 0005)
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Inyectables',
  ADD COLUMN IF NOT EXISTS recovery_time text DEFAULT '24 a 48 horas',
  ADD COLUMN IF NOT EXISTS pain_level integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 45,
  ADD COLUMN IF NOT EXISTS results_duration text DEFAULT '6 a 12 meses',
  ADD COLUMN IF NOT EXISTS alarm_signs text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS anesthesia_type text DEFAULT 'Tópica';

-- 5. Extensión de columnas clínicas en lessons y lesson_contents
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS care_type text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS timeline_tag text DEFAULT 'Día 0',
  ADD COLUMN IF NOT EXISTS is_alarm boolean DEFAULT false;

ALTER TABLE public.lesson_contents 
  ADD COLUMN IF NOT EXISTS checklist_items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dos text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS donts text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS emergency_contacts text DEFAULT '';

-- 6. Función RPC para búsqueda por similitud vectorial (RAG)
-- Se elimina primero la versión previa para permitir cambiar el tipo de retorno (RETURNS TABLE)
DROP FUNCTION IF EXISTS public.match_courses(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.match_courses(vector, float, int);
DROP FUNCTION IF EXISTS public.match_courses;

CREATE OR REPLACE FUNCTION public.match_courses (
  query_embedding vector(384),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  description text,
  category text,
  recovery_time text,
  pain_level int,
  results_duration text,
  alarm_signs text[],
  cover_url text,
  price numeric,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    courses.id,
    courses.title,
    courses.slug,
    courses.description,
    COALESCE(courses.category, 'Inyectables') AS category,
    COALESCE(courses.recovery_time, '24 a 48 horas') AS recovery_time,
    COALESCE(courses.pain_level, 2) AS pain_level,
    COALESCE(courses.results_duration, '6 a 12 meses') AS results_duration,
    COALESCE(courses.alarm_signs, ARRAY[]::text[]) AS alarm_signs,
    courses.cover_url,
    courses.price,
    (1 - (courses.embedding <=> query_embedding))::float AS similarity
  FROM courses
  WHERE courses.status = 'published'
    AND courses.embedding IS NOT NULL
    AND 1 - (courses.embedding <=> query_embedding) > match_threshold
  ORDER BY courses.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Permisos de ejecución de la función para usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION public.match_courses TO anon, authenticated, service_role;
