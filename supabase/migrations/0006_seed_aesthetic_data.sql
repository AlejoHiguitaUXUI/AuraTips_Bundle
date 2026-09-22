-- 0006_seed_aesthetic_data.sql
-- Datos iniciales de procedimientos estéticos y cuidados post-tratamiento
-- Ejecuta este script desde el SQL Editor de Supabase cuando tengas al menos un usuario registrado en profiles

DO $$
DECLARE
  v_owner_id uuid;
  v_course_botox uuid;
  v_course_lips uuid;
  v_course_peeling uuid;
  v_mod_botox_1 uuid;
  v_mod_botox_2 uuid;
  v_les_botox_1 uuid;
  v_les_botox_2 uuid;
BEGIN
  -- 1. Tomamos el primer perfil existente como especialista
  SELECT id INTO v_owner_id FROM public.profiles LIMIT 1;
  
  IF v_owner_id IS NULL THEN
    RAISE NOTICE 'No hay usuarios en profiles. Regístrate en la app antes de correr este seed.';
    RETURN;
  END IF;

  -- 2. Insertar Toxina Botulínica
  INSERT INTO public.courses (
    owner_id, title, slug, category, recovery_time, pain_level, duration_minutes,
    results_duration, alarm_signs, description, cover_url, status, price
  ) VALUES (
    v_owner_id,
    'Toxina Botulínica Facial (Botox)',
    'toxina-botulinica-botox-facial',
    'Inyectables',
    '4 a 24 horas',
    1,
    30,
    '4 a 6 meses',
    ARRAY[
      'Caída del párpado superior o ceja (ptosis palpebral)',
      'Visión doble o visión borrosa persistente',
      'Asimetría facial marcada e involuntaria',
      'Dificultad para tragar o hablar'
    ],
    'Protocolo médico integral de relajación neuromuscular selectiva para líneas de expresión frontales, glabelares y patas de gallo.',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    'published',
    0
  ) RETURNING id INTO v_course_botox;

  -- Módulo 1 Botox
  INSERT INTO public.modules (course_id, title, position)
  VALUES (v_course_botox, 'Fase Inmediata: Primeras 4 Horas Críticas', 1)
  RETURNING id INTO v_mod_botox_1;

  -- Lección 1 Botox
  INSERT INTO public.lessons (module_id, title, position, care_type, timeline_tag)
  VALUES (v_mod_botox_1, 'Postura erguida y gesticulación guiada', 1, 'allowed', '0-4h')
  RETURNING id INTO v_les_botox_1;

  INSERT INTO public.lesson_contents (lesson_id, body_md, dos, donts, checklist_items)
  VALUES (
    v_les_botox_1,
    'Durante las primeras 4 horas, la toxina se fija al receptor neuromuscular. Mantén la cabeza erguida y evita presiones.',
    ARRAY['Mantener postura vertical 4 horas', 'Gesticular suavemente cada 15 min', 'Beber agua fresca'],
    ARRAY['No acostarse ni tomar siestas', 'No frotar los puntos de inyección', 'No usar cascos ni gorras ajustadas'],
    '["Permanecí 4 horas con postura vertical", "Evité frotar los puntos de aplicación"]'::jsonb
  );

  -- 3. Insertar Relleno de Labios
  INSERT INTO public.courses (
    owner_id, title, slug, category, recovery_time, pain_level, duration_minutes,
    results_duration, alarm_signs, description, cover_url, status, price
  ) VALUES (
    v_owner_id,
    'Relleno y Perfilado de Labios con Ácido Hialurónico',
    'acido-hialuronico-labios-russian-lips',
    'Inyectables',
    '48 a 72 horas',
    2,
    45,
    '9 a 12 meses',
    ARRAY[
      'Palidez, moteado blanco o azul violáceo (Signo de isquemia urgente)',
      'Dolor pulsátil desproporcionado no controlado con analgesia',
      'Ampollas herpéticas en racimo'
    ],
    'Protocolo clínico para aumento, eversión sutil e hidratación profunda con ácido hialurónico reticulado. Manejo de edema y hematomas.',
    'https://images.unsplash.com/photo-1588515724527-074a7a56616c?auto=format&fit=crop&w=1200&q=80',
    'published',
    0
  ) RETURNING id INTO v_course_lips;

  RAISE NOTICE 'Seed clínico ejecutado con éxito para los procedimientos principales.';
END $$;
