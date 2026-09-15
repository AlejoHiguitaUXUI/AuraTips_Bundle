-- 0001_init: core schema for the course platform MVP.
-- Tables: profiles, courses, modules, lessons, lesson_contents, enrollments, reviews.
-- RLS is enabled in 0002_rls.

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when a new auth user is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  cover_url   text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  price       numeric not null default 0 check (price >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index courses_owner_id_idx on public.courses (owner_id);
create index courses_status_idx on public.courses (status);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------------
create table public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title      text not null check (length(trim(title)) > 0),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index modules_course_id_idx on public.modules (course_id);

-- ---------------------------------------------------------------------------
-- lessons: outline only (title + order). Content lives in lesson_contents.
-- ---------------------------------------------------------------------------
create table public.lessons (
  id         uuid primary key default gen_random_uuid(),
  module_id  uuid not null references public.modules (id) on delete cascade,
  title      text not null check (length(trim(title)) > 0),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index lessons_module_id_idx on public.lessons (module_id);

-- ---------------------------------------------------------------------------
-- lesson_contents: gated by enrollment via RLS (see 0002_rls).
-- ---------------------------------------------------------------------------
create table public.lesson_contents (
  lesson_id   uuid primary key references public.lessons (id) on delete cascade,
  body_md     text,
  youtube_url text,
  updated_at  timestamptz not null default now()
);

create trigger lesson_contents_set_updated_at
  before update on public.lesson_contents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  course_id   uuid not null references public.courses (id) on delete cascade,
  status      text not null default 'active' check (status in ('active')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_course_id_idx on public.enrollments (course_id);

-- ---------------------------------------------------------------------------
-- reviews: one per (user, course)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index reviews_course_id_idx on public.reviews (course_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- course_ratings: aggregate view. Null avg + 0 count when no reviews.
-- ---------------------------------------------------------------------------
create view public.course_ratings as
select
  c.id                                   as course_id,
  round(avg(r.rating)::numeric, 1)       as avg_rating,
  count(r.id)                            as review_count
from public.courses c
left join public.reviews r on r.course_id = c.id
group by c.id;
