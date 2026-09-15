-- 0002_rls: Row Level Security. Authorization lives here, not in app code.

-- ===========================================================================
-- Enable RLS on every table. With RLS on and no policy, access is denied.
-- ===========================================================================
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.enrollments     enable row level security;
alter table public.reviews         enable row level security;

-- ===========================================================================
-- Helper: is the current user enrolled (active) in a course?
-- ===========================================================================
create or replace function public.is_enrolled(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_id = target_course
      and e.user_id = auth.uid()
      and e.status = 'active'
  );
$$;

create or replace function public.owns_course(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.courses c
    where c.id = target_course and c.owner_id = auth.uid()
  );
$$;

-- Course visible to the current viewer? (published, or owned)
create or replace function public.course_visible(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.courses c
    where c.id = target_course
      and (c.status = 'published' or c.owner_id = auth.uid())
  );
$$;

-- ===========================================================================
-- profiles
-- ===========================================================================
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "users update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ===========================================================================
-- courses
-- ===========================================================================
create policy "published or own courses are readable"
  on public.courses for select
  using (status = 'published' or owner_id = auth.uid());

create policy "users create their own courses"
  on public.courses for insert
  with check (owner_id = auth.uid());

create policy "owners update their courses"
  on public.courses for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners delete their courses"
  on public.courses for delete
  using (owner_id = auth.uid());

-- ===========================================================================
-- modules  (visible when parent course visible; writable by course owner)
-- ===========================================================================
create policy "modules readable when course visible"
  on public.modules for select
  using (public.course_visible(course_id));

create policy "owners insert modules"
  on public.modules for insert
  with check (public.owns_course(course_id));

create policy "owners update modules"
  on public.modules for update
  using (public.owns_course(course_id))
  with check (public.owns_course(course_id));

create policy "owners delete modules"
  on public.modules for delete
  using (public.owns_course(course_id));

-- ===========================================================================
-- lessons  (outline; same visibility as modules via the module's course)
-- ===========================================================================
create policy "lessons readable when course visible"
  on public.lessons for select
  using (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id
        and public.course_visible(m.course_id)
    )
  );

create policy "owners insert lessons"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id and public.owns_course(m.course_id)
    )
  );

create policy "owners update lessons"
  on public.lessons for update
  using (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id and public.owns_course(m.course_id)
    )
  )
  with check (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id and public.owns_course(m.course_id)
    )
  );

create policy "owners delete lessons"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id and public.owns_course(m.course_id)
    )
  );

-- ===========================================================================
-- lesson_contents  (the enrollment gate)
-- readable only if the current user OWNS the course or is ACTIVELY ENROLLED.
-- ===========================================================================
create policy "lesson content for enrolled or owner"
  on public.lesson_contents for select
  using (
    exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_contents.lesson_id
        and (public.owns_course(m.course_id) or public.is_enrolled(m.course_id))
    )
  );

create policy "owners insert lesson content"
  on public.lesson_contents for insert
  with check (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_contents.lesson_id and public.owns_course(m.course_id)
    )
  );

create policy "owners update lesson content"
  on public.lesson_contents for update
  using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_contents.lesson_id and public.owns_course(m.course_id)
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_contents.lesson_id and public.owns_course(m.course_id)
    )
  );

create policy "owners delete lesson content"
  on public.lesson_contents for delete
  using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_contents.lesson_id and public.owns_course(m.course_id)
    )
  );

-- ===========================================================================
-- enrollments
-- ===========================================================================
create policy "users read their own enrollments"
  on public.enrollments for select
  using (user_id = auth.uid());

create policy "course owners read their course enrollments"
  on public.enrollments for select
  using (public.owns_course(course_id));

create policy "users enroll themselves in published courses"
  on public.enrollments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'published'
    )
  );

-- No client UPDATE/DELETE on enrollments in the MVP.

-- ===========================================================================
-- reviews
-- ===========================================================================
create policy "reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "enrolled users create their own review"
  on public.reviews for insert
  with check (user_id = auth.uid() and public.is_enrolled(course_id));

create policy "users update their own review"
  on public.reviews for update
  using (user_id = auth.uid() and public.is_enrolled(course_id))
  with check (user_id = auth.uid() and public.is_enrolled(course_id));

create policy "users delete their own review"
  on public.reviews for delete
  using (user_id = auth.uid());
