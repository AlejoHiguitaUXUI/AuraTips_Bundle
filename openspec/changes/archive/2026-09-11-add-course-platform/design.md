## Context

Greenfield MVP for a client. See `proposal.md - Why`. No existing code. The client wants a web course platform where authoring and learning are open to any registered user, video is a YouTube link, courses are free, and there is no progress tracking. Constraint agreed during exploration: Next.js talks to Supabase directly (no separate API service), and authorization is enforced by Postgres RLS rather than application middleware.

## Goals / Non-Goals

**Goals:**

- One deployable: a Next.js App Router app plus a Supabase project. No standalone API server to operate.
- Authorization lives in the database as RLS policies, so a missed check in a component cannot leak data.
- Data model leaves a no-migration path to paid courses (`courses.price`, `enrollments.status`).
- Sensitive multi-row or privileged writes (publish, enroll, review) go through Next.js Route Handlers using a server-only key, not the browser client.

**Non-Goals (design-level):**

- No caching layer, no full-text search infrastructure, no background jobs.
- No file/media storage — cover images are URLs, videos are YouTube URLs.
- No multi-tenant / organization concept.
- No real-time subscriptions.

## Decisions

### D1: Next.js ↔ Supabase directly, no separate API

**Choice:** The frontend uses `@supabase/ssr` to create a server client (in Server Components and Route Handlers) and a browser client. Reads generally happen in Server Components; writes happen in Route Handlers or Server Actions.

**Why over a separate Nest/Hono API:** For a thin MVP the separate API is pure overhead — another deploy target, another auth hop, duplicated types. Supabase already is the API (PostgREST + Auth). "Separation of concerns" is preserved by keeping business logic in Route Handlers rather than in UI components.

**Alternative considered:** Dedicated API service — rejected for MVP; revisit if the client later needs a mobile app or third-party API consumers.

### D2: Authorization = RLS policies, not app checks

**Choice:** Every table has RLS enabled. Policies express the rules. The browser client uses the anon key and is always subject to RLS. Route Handlers that need to bypass RLS (rare) use the service role key and must re-implement the check explicitly.

Policy summary:

| Table | SELECT | INSERT / UPDATE / DELETE |
| --- | --- | --- |
| `profiles` | anyone | only `id = auth.uid()` |
| `courses` | `status='published'` OR `owner_id = auth.uid()` | only `owner_id = auth.uid()` |
| `modules`, `lessons` | parent course is published OR owned by `auth.uid()`; **content columns** of `lessons` further gated by enrollment (see D3) | only when parent course `owner_id = auth.uid()` |
| `enrollments` | `user_id = auth.uid()` (own only); course owner MAY read enrollments of their course | INSERT only `user_id = auth.uid()` AND target course `status='published'`; no UPDATE/DELETE from client in MVP |
| `reviews` | anyone (for published courses) | INSERT/UPDATE/DELETE only `user_id = auth.uid()` AND an `active` enrollment row exists for `(auth.uid(), course_id)` |

**Why:** A forgotten `where owner_id = ...` in a query then cannot expose drafts or other users' data — the database refuses it. Trade-off: policy logic is SQL and less obvious to a JS developer; mitigated by keeping policies simple and documented in the migration.

**Alternative considered:** Enforce in Next.js middleware / a data-access layer — rejected because a single missed call leaks data and there is no defense in depth.

### D3: Gating lesson *content* (not just lesson existence) by enrollment

The catalog must show the lesson outline (titles) to everyone, but body text and video only to enrolled users or the owner. Row-level policies act on whole rows, not columns.

**Choice:** Split lesson data across two access paths:

- `lessons` table holds `id, module_id, title, position` — readable whenever the course is visible.
- `lesson_contents` table holds `lesson_id (PK/FK), body_md, youtube_url` — RLS policy: readable only if `auth.uid()` owns the parent course OR has an `active` enrollment in it.

**Alternative considered:** One `lessons` table with a Postgres `SECURITY DEFINER` view or column privileges — rejected as more fragile and harder to reason about than a second table with its own simple policy. Keeping it one table and filtering content in a Route Handler was also rejected (violates D2 — content would be reachable via the raw PostgREST endpoint).

### D4: YouTube URL handling

**Choice:** Store the raw URL the instructor pastes. On save, a validator extracts the 11-char video id from the common URL shapes (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`); reject if no id is found. Render via a privacy-friendly `youtube-nocookie.com/embed/<id>` iframe. Store only the URL; derive the id at render time.

**Why:** No API key, no quota, no oEmbed call needed for the MVP. Instructors already have unlisted/public videos.

### D5: Aggregate rating

**Choice:** A `course_ratings` Postgres view (or a `SELECT` with `avg(rating)`, `count(*)` grouped by `course_id`) that the catalog and detail pages read. No denormalized column on `courses` in the MVP — review volume is low and recomputing is cheap.

**Alternative considered:** Trigger-maintained `courses.rating_avg` / `rating_count` — deferred; add only if the catalog query gets slow.

### D6: Slug uniqueness and generation

`courses.slug` is `UNIQUE`. On create, the client proposes a slug from the title (kebab-case, transliterated); the create Route Handler retries with a `-2`, `-3` suffix on unique-violation, or surfaces the conflict for the user to edit.

## Risks / Trade-offs

- **RLS policy bugs are silent** → Ship a SQL test file (pgTAP or plain assertions run in CI / Supabase migration checks) covering each policy: draft not visible to non-owner, non-enrolled cannot read `lesson_contents`, non-enrolled cannot insert `reviews`, user cannot edit another's review/profile.
- **Two-table lesson split adds a join and a write path** → Acceptable; the content table is 1:1 and always fetched together with its lesson when authorized.
- **Service role key in Route Handlers** → Keep its use to a minimum (ideally zero in MVP — most writes work under RLS with the user's session). Never import the server-only module into a client component; keep it in a file that imports `server-only`.
- **YouTube as the only video host** → If the client later wants access control on video, the whole video story changes. Documented as a v2 concern; `lesson_contents.youtube_url` can become a nullable generic `video_ref` later.
- **No progress tracking** → Client accepted this. "Continue where I left off" and completion UI are explicitly deferred; adding `lesson_completions` later is additive (new table, new policy, no change to existing ones).
- **Free-only enrollment** → `courses.price` and `enrollments.status` exist but are inert. Risk that they drift from real payment needs; mitigated by keeping them minimal (`price numeric default 0`, `status text default 'active'`) and revisiting in the payments change.

## Migration Plan

1. Create the Supabase project; enable email/password auth, disable email confirmation for the MVP demo (or keep it on if the client prefers).
2. Apply migration `0001_init`: tables, foreign keys, `updated_at` triggers, the `handle_new_user` trigger that inserts a `profiles` row on `auth.users` insert.
3. Apply migration `0002_rls`: enable RLS on every table, create all policies, create the `course_ratings` view.
4. Apply migration `0003_policy_tests` (or run the test file in CI) to assert the policies.
5. Deploy the Next.js app (Vercel) with the three env vars.

**Rollback:** Migrations are additive and the project is pre-launch; rollback is dropping the schema and redeploying. No data to preserve.

## Open Questions

- Email confirmation on or off for the client's launch — does not affect specs, approach, or tasks; a Supabase toggle set at deploy time.
- Whether cover images should later move to Supabase Storage — deferred; current specs say "URL" and nothing depends on the answer now.
