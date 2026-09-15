-- 0003_policy_tests: assertions for the RLS policies in 0002_rls.
--
-- Run against a throwaway database (e.g. `supabase db reset` then psql -f this).
-- NOT a migration to apply in production — it seeds fixture rows and raises
-- an exception on any failed assertion. Wrap in a transaction and roll back.
--
--   begin;
--   \i supabase/migrations/0003_policy_tests.sql
--   rollback;

begin;

-- ---------------------------------------------------------------------------
-- Fixture users. We cannot create reaal auth.users here without the auth
-- schema helpers, so we simulate auth.uid() with a settable GUC and test the
-- helper predicates + policy USING/WITH CHECK expressions directly.
-- For full end-to-end policy tests, use the Supabase test harness with real
-- JWTs; this file checks the predicate logic that the policies depend on.
-- ---------------------------------------------------------------------------

-- Seed two profiles by inserting auth.users rows (service role context).
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', '', now(), now(), now(), 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com',   '', now(), now(), now(), 'authenticated', 'authenticated')
on conflict do nothing;

-- handle_new_user trigger created the profiles. Confirm.
do $$
begin
  assert (select count(*) from public.profiles
          where id in ('11111111-1111-1111-1111-111111111111',
                       '22222222-2222-2222-2222-222222222222')) = 2,
    'expected 2 profiles from handle_new_user trigger';
  assert (select display_name from public.profiles
          where id = '11111111-1111-1111-1111-111111111111') = 'alice',
    'display_name should default to email local-part';
end $$;

-- Alice owns a draft course and a published course.
insert into public.courses (id, owner_id, title, slug, status)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Draft Course', 'draft-course', 'draft'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Live Course',  'live-course',  'published');

insert into public.modules (id, course_id, title, position)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'M1', 0);

insert into public.lessons (id, module_id, title, position)
values ('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'L1', 0);

insert into public.lesson_contents (lesson_id, body_md, youtube_url)
values ('cccccccc-0000-0000-0000-000000000001', 'hello', 'https://youtu.be/dQw4w9WgXcQ');

-- ---------------------------------------------------------------------------
-- Simulate "current user = Bob" and check the helper predicates.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

do $$
begin
  -- Bob does not own Alice's live course.
  assert public.owns_course('aaaaaaaa-0000-0000-0000-000000000002') = false,
    'bob should not own alice course';

  -- Bob is not enrolled yet.
  assert public.is_enrolled('aaaaaaaa-0000-0000-0000-000000000002') = false,
    'bob not enrolled yet';

  -- Published course is visible to Bob; draft is not.
  assert public.course_visible('aaaaaaaa-0000-0000-0000-000000000002') = true,
    'published course visible to bob';
  assert public.course_visible('aaaaaaaa-0000-0000-0000-000000000001') = false,
    'draft course NOT visible to bob';
end $$;

-- Bob cannot SELECT the draft course (courses SELECT policy).
do $$
declare n int;
begin
  select count(*) into n from public.courses
    where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  assert n = 0, 'bob must not see alice draft course';

  select count(*) into n from public.courses
    where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  assert n = 1, 'bob must see alice published course';
end $$;

-- Bob cannot read lesson_contents before enrolling.
do $$
declare n int;
begin
  select count(*) into n from public.lesson_contents
    where lesson_id = 'cccccccc-0000-0000-0000-000000000001';
  assert n = 0, 'non-enrolled bob must not read lesson_contents';
end $$;

-- Bob cannot insert a review without enrollment.
do $$
begin
  begin
    insert into public.reviews (user_id, course_id, rating)
    values ('22222222-2222-2222-2222-222222222222',
            'aaaaaaaa-0000-0000-0000-000000000002', 4);
    raise exception 'non-enrolled review insert should have been blocked';
  exception when others then
    -- expected: RLS violation
    null;
  end;
end $$;

-- Bob enrolls (allowed: published course, own user_id).
insert into public.enrollments (user_id, course_id)
values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000002');

-- Now Bob can read the lesson content and leave one review.
do $$
declare n int;
begin
  select count(*) into n from public.lesson_contents
    where lesson_id = 'cccccccc-0000-0000-0000-000000000001';
  assert n = 1, 'enrolled bob must read lesson_contents';
end $$;

insert into public.reviews (user_id, course_id, rating, body)
values ('22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-0000-0000-0000-000000000002', 5, 'great');

-- Second review by Bob for the same course is rejected by the UNIQUE constraint.
do $$
begin
  begin
    insert into public.reviews (user_id, course_id, rating)
    values ('22222222-2222-2222-2222-222222222222',
            'aaaaaaaa-0000-0000-0000-000000000002', 3);
    raise exception 'second review should have been blocked';
  exception when unique_violation then
    null;
  end;
end $$;

-- course_ratings reflects the one review.
do $$
begin
  assert (select avg_rating from public.course_ratings
          where course_id = 'aaaaaaaa-0000-0000-0000-000000000002') = 5.0,
    'avg_rating should be 5.0';
  assert (select review_count from public.course_ratings
          where course_id = 'aaaaaaaa-0000-0000-0000-000000000002') = 1,
    'review_count should be 1';
  -- Course with no reviews: null avg, 0 count.
  assert (select avg_rating from public.course_ratings
          where course_id = 'aaaaaaaa-0000-0000-0000-000000000001') is null,
    'no-review course avg_rating should be null';
end $$;

rollback;
