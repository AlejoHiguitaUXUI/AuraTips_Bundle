-- LÍNEA 1: "Instala la herramienta pgvector en mi base de datos"
create extension if not exists vector;

-- LÍNEA 2: "Agrega una nueva columna llamada 'embedding' a la tabla 'courses', 
-- capaz de guardar una lista de 384 números"
alter table public.courses 
  add column embedding vector(384);

-- LÍNEA 3: "Crea un índice (un atajo de búsqueda superrápido) para comparar 
-- estos vectores de forma matemática instantánea"
create index courses_embedding_idx 
  on public.courses using hnsw (embedding vector_cosine_ops);