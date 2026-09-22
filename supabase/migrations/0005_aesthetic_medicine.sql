-- Migración 0005: Extensión para Portal de Medicina Estética y Cuidados Post-Procedimiento

-- 1. Enriquecer la tabla courses (Procedimientos / Tratamientos)
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Inyectables',
  ADD COLUMN IF NOT EXISTS recovery_time text DEFAULT '24 a 48 horas',
  ADD COLUMN IF NOT EXISTS pain_level integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 45,
  ADD COLUMN IF NOT EXISTS results_duration text DEFAULT '6 a 12 meses',
  ADD COLUMN IF NOT EXISTS alarm_signs text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS anesthesia_type text DEFAULT 'Tópica';

-- 2. Enriquecer la tabla lessons (Pautas y Protocolos de Cuidado)
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS care_type text DEFAULT 'general', -- 'general', 'allowed', 'prohibited', 'alarm'
  ADD COLUMN IF NOT EXISTS timeline_tag text DEFAULT 'Día 0',
  ADD COLUMN IF NOT EXISTS is_alarm boolean DEFAULT false;

-- 3. Enriquecer la tabla lesson_contents (Detalles de protocolo interactivo)
ALTER TABLE public.lesson_contents 
  ADD COLUMN IF NOT EXISTS checklist_items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dos text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS donts text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS emergency_contacts text DEFAULT '';
