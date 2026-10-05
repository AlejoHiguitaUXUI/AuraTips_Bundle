-- Migración 0008: Arquitectura de Usuarios Clínicos, Roles (RBAC) y Asignación de Procedimientos
-- Transforma la plataforma para soportar Especialistas (Dirección Clínica) y Pacientes en Cuidados.

-- ===========================================================================
-- 1. Ampliar tabla profiles con roles y datos de contacto clínico mínimo
-- ===========================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'patient' 
    CHECK (role IN ('patient', 'specialist', 'admin')),
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb 
    DEFAULT '{"whatsapp": true, "email": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS medical_license text,
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ===========================================================================
-- 2. Actualizar función handle_new_user para capturar rol si viene en metadata
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_name text;
BEGIN
  -- Extraer rol de raw_user_meta_data si existe, sino paciente por defecto
  v_role := coalesce(new.raw_user_meta_data->>'role', 'patient');
  IF v_role NOT IN ('patient', 'specialist', 'admin') THEN
    v_role := 'patient';
  END IF;

  v_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.profiles (id, display_name, role, phone)
  VALUES (
    new.id,
    v_name,
    v_role,
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    role = coalesce(excluded.role, public.profiles.role);

  RETURN new;
END;
$$;

-- ===========================================================================
-- 3. Funciones helper de seguridad (RBAC)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.is_specialist(target_user uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = target_user AND p.role IN ('specialist', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'patient'
  );
$$;

-- ===========================================================================
-- 4. Ampliar tabla enrollments (Asignación Clínica de Procedimientos a Paciente)
-- ===========================================================================
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS procedure_date timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS personal_notes text,
  ADD COLUMN IF NOT EXISTS current_day_cache integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS enrollments_assigned_by_idx ON public.enrollments(assigned_by);

-- ===========================================================================
-- 5. Actualizar Políticas de Seguridad RLS
-- ===========================================================================

-- 5.1 Solo especialistas pueden crear procedimientos
DROP POLICY IF EXISTS "users create their own courses" ON public.courses;
CREATE POLICY "specialists create procedures"
  ON public.courses FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND
    public.is_specialist(auth.uid())
  );

-- 5.2 Solo especialistas dueños pueden actualizar sus procedimientos
DROP POLICY IF EXISTS "owners update their courses" ON public.courses;
CREATE POLICY "specialists update their procedures"
  ON public.courses FOR UPDATE
  USING (
    owner_id = auth.uid() AND
    public.is_specialist(auth.uid())
  )
  WITH CHECK (
    owner_id = auth.uid() AND
    public.is_specialist(auth.uid())
  );

-- 5.3 Solo especialistas dueños pueden eliminar sus procedimientos
DROP POLICY IF EXISTS "owners delete their courses" ON public.courses;
CREATE POLICY "specialists delete their procedures"
  ON public.courses FOR DELETE
  USING (
    owner_id = auth.uid() AND
    public.is_specialist(auth.uid())
  );

-- 5.4 Asignación de tratamientos (enrollments)
DROP POLICY IF EXISTS "users enroll themselves" ON public.enrollments;
CREATE POLICY "specialists or users can enroll"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    (public.is_specialist(auth.uid()) AND assigned_by = auth.uid()) OR
    (user_id = auth.uid())
  );

-- Especialistas pueden ver las asignaciones que realizaron
DROP POLICY IF EXISTS "specialists view assigned enrollments" ON public.enrollments;
CREATE POLICY "specialists view assigned enrollments"
  ON public.enrollments FOR SELECT
  USING (
    user_id = auth.uid() OR
    assigned_by = auth.uid() OR
    public.owns_course(course_id)
  );

-- 5.5 Prevenir que usuarios comunes escalen su propio rol
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.role <> old.role THEN
    IF NOT public.is_specialist(auth.uid()) THEN
      RAISE EXCEPTION 'No tienes permisos para modificar tu rol clínico.';
    END IF;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_profile_role_update ON public.profiles;
CREATE TRIGGER tr_check_profile_role_update
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_role_update();

-- ===========================================================================
-- 6. Actualizar usuarios existentes conocidos como Especialistas
-- ===========================================================================
UPDATE public.profiles
SET role = 'specialist',
    medical_license = 'RM-482910-ANT'
WHERE display_name ILIKE '%Mariana%'
   OR display_name ILIKE '%Dra%'
   OR display_name ILIKE '%Especialista%';
