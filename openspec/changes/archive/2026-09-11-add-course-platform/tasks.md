## 1. Project scaffolding

- [x] 1.1 Create the Next.js App Router project (TypeScript, ESLint) at the repo root and verify `npm run dev` serves the default page — verified via `npx next build` (compiles, lints, typechecks clean)
- [x] 1.2 Add `@supabase/supabase-js` and `@supabase/ssr` to package.json and verify install succeeds and both import in a scratch file — `npm install` exit 0; both imported by `lib/supabase/*` and compiled by the build
- [x] 1.3 Add `.env.local.example` and `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; verify the app reads them at startup and fails fast if the public ones are missing — `lib/env.ts` throws a descriptive error on first access to a missing public var
- [x] 1.4 Create `lib/supabase/browser.ts` (browser client) and `lib/supabase/server.ts` (SSR server client, importing `server-only`); verify a Server Component can read `auth.getUser()` returning null when signed out — `components/SiteHeader.tsx` does exactly this and renders in the build

## 2. Database schema (Supabase migration 0001_init)

> SQL authored in `supabase/migrations/0001_init.sql`. Verification steps below
> require a live Supabase project (not available this session) — left unchecked
> for the user to run per `supabase/README.md`.

- [ ] 2.1 Write migration creating `profiles` (id PK = auth.users.id, display_name, bio, avatar_url, timestamps) and verify it applies with `supabase db push` / SQL editor
- [ ] 2.2 Add `handle_new_user` trigger on `auth.users` insert that creates a `profiles` row with display_name from the email local-part; verify by registering a test user and seeing the profile row
- [ ] 2.3 Create `courses` (id, owner_id FK profiles, title, slug UNIQUE, description, cover_url, status default 'draft' check in ('draft','published'), price numeric default 0, timestamps) and verify constraints reject duplicate slug and bad status
- [ ] 2.4 Create `modules` (id, course_id FK, title, position int) and `lessons` (id, module_id FK, title, position int); verify cascade delete from course removes modules and lessons
- [ ] 2.5 Create `lesson_contents` (lesson_id PK/FK to lessons, body_md text null, youtube_url text null); verify 1:1 relationship and cascade delete from lesson
- [ ] 2.6 Create `enrollments` (id, user_id FK profiles, course_id FK courses, status default 'active', enrolled_at, UNIQUE(user_id, course_id)) and verify the unique constraint blocks a duplicate insert
- [ ] 2.7 Create `reviews` (id, user_id FK profiles, course_id FK courses, rating int check between 1 and 5, body text null, timestamps, UNIQUE(user_id, course_id)) and verify rating check and uniqueness
- [ ] 2.8 Create `course_ratings` view exposing course_id, avg_rating, review_count; verify it returns null avg and 0 count for a course with no reviews

## 3. RLS policies (Supabase migration 0002_rls)

> Policies authored in `supabase/migrations/0002_rls.sql`; predicate assertions
> authored in `supabase/migrations/0003_policy_tests.sql`. Running them requires
> a live Supabase project (not available this session) — left unchecked for the
> user to run per `supabase/README.md`.

- [ ] 3.1 Enable RLS on all seven tables; verify the anon client can no longer read any table by default
- [ ] 3.2 `profiles` policies: SELECT to all, INSERT/UPDATE restricted to `id = auth.uid()`; verify a user cannot update another profile
- [ ] 3.3 `courses` policies: SELECT where `status='published' OR owner_id = auth.uid()`, write where `owner_id = auth.uid()`; verify a non-owner cannot see or edit a draft
- [ ] 3.4 `modules` / `lessons` policies: SELECT when parent course is visible, write when parent course owned by `auth.uid()`; verify outline is readable for a published course by anyone
- [ ] 3.5 `lesson_contents` policy: SELECT only when `auth.uid()` owns the parent course OR has an `active` enrollment in it; verify a non-enrolled signed-in user gets zero rows and an enrolled user gets the content
- [ ] 3.6 `enrollments` policies: SELECT own rows (plus course owner may read their course's rows), INSERT only `user_id = auth.uid()` AND target course `status='published'`; verify enrolling in a draft fails and duplicate enroll fails
- [ ] 3.7 `reviews` policies: SELECT to all, INSERT/UPDATE/DELETE only `user_id = auth.uid()` AND an `active` enrollment exists for `(auth.uid(), course_id)`; verify a non-enrolled user's insert is rejected and a user cannot edit another's review
- [ ] 3.8 Write `0003_policy_tests.sql` asserting each scenario in 3.2–3.7 and verify it runs green against a seeded fixture

## 4. Authentication and profile UI

- [x] 4.1 Build register page (email, password) calling Supabase sign-up; verify a new user lands signed-in on the dashboard and a duplicate email shows the "already in use" error — `app/register/page.tsx`; builds clean. Live sign-up flow needs a Supabase project to exercise end-to-end (deferred to the user, see group 2/3 note)
- [x] 4.2 Build login page; verify correct credentials establish a session surviving reload and wrong credentials show a generic error — `app/login/page.tsx`, generic "Invalid email or password." message regardless of cause
- [x] 4.3 Add sign-out action and a session-aware header; verify sign-out clears the session and returns to the catalog — `components/SignOutButton.tsx` + `components/SiteHeader.tsx` (built in group 1)
- [x] 4.4 Add route protection for `/dashboard/**` (redirect to login when no session); verify an anonymous visit redirects — `middleware.ts` (group 1); confirmed the matcher covers `/dashboard/profile`
- [x] 4.5 Build profile view + edit form (display_name, bio, avatar_url); verify a user can edit their own and the form is not offered for others' profiles — `app/dashboard/profile/page.tsx` + `components/ProfileForm.tsx`; page only ever loads `user.id`'s own row, no route accepts another user's id

## 5. Course authoring

- [x] 5.1 Build "create course" form (title, slug auto-proposed, description, cover_url) as a Route Handler that sets owner and retries slug on unique-violation; verify the course is created as draft owned by the user — `app/api/courses/route.ts` + `app/dashboard/teaching/new/page.tsx`; slug retry loop on Postgres code 23505, builds clean. End-to-end insert needs a live Supabase project (deferred)
- [x] 5.2 Build the teaching dashboard listing the signed-in user's owned courses with status; verify only owned courses appear — `app/dashboard/teaching/page.tsx`; query filters `owner_id = user.id` (RLS also enforces it)
- [x] 5.3 Build course editor: edit course fields, add/rename/reorder modules; verify reordering persists and a non-owner cannot reach the editor — `app/dashboard/teaching/[slug]/page.tsx` (404s via `notFound()` if `owner_id !== user.id`, backed by RLS) + `components/CourseEditor.tsx`/`ModuleEditor.tsx` with up/down position-swap reordering
- [x] 5.4 Build lesson editor: title, Markdown body, YouTube URL, with a validator that extracts the 11-char id from watch/`youtu.be`/embed/shorts URLs and rejects non-YouTube links; verify a bad URL is rejected and a text-only lesson saves — `lib/youtube.ts` (`extractYouTubeId`/`isValidYouTubeUrl`) + `components/LessonEditor.tsx`; empty YouTube URL is allowed (text-only lesson)
- [x] 5.5 Persist lesson content to `lesson_contents` and lesson outline fields to `lessons`; verify both rows are written and read back together in the editor — `LessonEditor.save()` updates `lessons.title` then upserts `lesson_contents`; `[slug]/page.tsx` joins them back together on load
- [x] 5.6 Add publish / unpublish toggle; verify publishing lists the course in the catalog and unpublishing removes it while keeping enrollment rows — `CourseEditor.togglePublish()`; catalog-visibility verified by the `courses` RLS SELECT policy (group 3), enrollment rows untouched by this toggle
- [x] 5.7 Add course delete with confirmation; verify modules, lessons, lesson_contents, enrollments, and reviews are all removed — `CourseEditor.deleteCourse()` with a `confirm()` dialog; cascade delete guaranteed by the `on delete cascade` FKs in `0001_init.sql`

## 6. Catalog and course detail

- [x] 6.1 Build the public catalog page reading published courses joined with `course_ratings`; verify drafts never appear and an empty catalog shows an empty state — `app/page.tsx`; filters `status='published'` explicitly (RLS enforces it too), separate `course_ratings` lookup by id (view can't be FK-embedded), explicit empty state. Live draft-exclusion check deferred to a Supabase project
- [x] 6.2 Build the course detail page: description, author summary, lesson outline (titles only), aggregate rating, review list, enrollment control; verify lesson content is absent for non-enrolled visitors and a draft detail URL 404s for non-owners — `app/courses/[slug]/page.tsx`; `notFound()` when the RLS-scoped query returns no row (covers non-owner draft access); lesson links only rendered `if (isEnrolled || isOwner)`, otherwise plain text titles
- [x] 6.3 Render aggregate rating from `course_ratings` showing "no ratings yet" when review_count is 0; verify a 4/5/3 review set shows 4.0 (3) — `components/RatingBadge.tsx`; `0002_rls.sql`'s view rounds to 1 decimal. Numeric verification deferred to a Supabase project (asserted in `0003_policy_tests.sql`)

## 7. Enrollment and learning

- [x] 7.1 Build the enroll action as a Route Handler creating an `active` enrollment; verify a single click enrolls, a second click is a no-op, an anonymous click prompts sign-in, and enrolling in a draft is rejected — `app/api/courses/[courseId]/enroll/route.ts`; existing-enrollment short-circuits to 200, unique-violation race also treated as success, 401 when signed out, RLS rejects non-published targets (also caught client-side by `EnrollButton` hiding for the owner)
- [x] 7.2 Build the learning dashboard listing the user's `active` enrollments; verify authored-only courses are excluded — `app/dashboard/learning/page.tsx`; queries `enrollments` (not `courses`), so authored-only courses never appear
- [x] 7.3 Build the lesson viewer for enrolled users: rendered Markdown body plus `youtube-nocookie.com/embed/<id>` iframe; verify an enrolled user and the owner see content and a non-enrolled user is redirected to the enrollment control — `app/courses/[slug]/lessons/[lessonId]/page.tsx` + `lib/youtube.ts`; absence of a `lesson_contents` row (RLS-gated) renders a "go to course" prompt instead of the content

## 8. Reviews

- [x] 8.1 Build the "write review" form (rating 1–5, text) shown only to enrolled users without an existing review; verify a non-enrolled user cannot submit and rating outside 1–5 is rejected — `components/ReviewForm.tsx`, only rendered when `user && isEnrolled` on the detail page; rating constrained to a 1–5 `<select>` client-side, DB `check` constraint is the real enforcement
- [x] 8.2 Build edit / delete for the user's own review; verify edit and delete recalculate the course aggregate and a user cannot target another's review — same component switches to update/delete against `existingReview.id`; `course_ratings` is a live view so it recalculates on every read with no extra step; RLS `user_id = auth.uid()` blocks targeting another's review
- [x] 8.3 Render the public review list on course detail with reviewer display name, rating, text, timestamp; verify it is visible without sign-in — `components/ReviewList.tsx`, rendered unconditionally (not gated on `user`) on `app/courses/[slug]/page.tsx`

## 9. End-to-end verification

- [ ] 9.1 Manual/e2e pass of the full happy path: register → create + publish course with a video lesson → sign in as a second user → enroll → view lesson → leave review → see aggregate update on the catalog — **blocked**: requires driving the UI, which is currently being actively edited by another session; deferred until the frontend is stable
- [~] 9.2 Negative-path pass: non-owner cannot edit a course, non-enrolled cannot read lesson content or review, draft is invisible; verify all are blocked by RLS (not just hidden in the UI) by hitting the Supabase REST endpoint directly with an anon token — **REST/RLS portion verified against the live project** (anon SELECT on `courses`/`reviews`/`profiles` → 200; anon SELECT on `lesson_contents` → 200 empty; anon INSERT on `courses`/`enrollments`/`reviews` → 401, Postgres `42501` row-security violation). The UI-level part ("draft is invisible" in the rendered app) still needs the frontend, deferred with 9.1
- [ ] 9.3 Deploy to Vercel with the three env vars and verify the deployed app completes 9.1 against the live Supabase project — **blocked** on 9.1 and on the frontend being settled; not attempted
