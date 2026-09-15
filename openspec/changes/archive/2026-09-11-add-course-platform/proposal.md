## Why

A client needs an MVP of an online course platform where anyone can publish courses and anyone can enroll and learn. No such system exists yet — this change establishes the full first version: catalog, enrollment, course authoring, and reviews. The MVP must be thin: video is an embedded YouTube link (no upload or storage of media), courses are free, and there is no progress tracking.

## What Changes

- **New**: Email/password authentication and a user profile (display name, bio, avatar). Backed by Supabase Auth.
- **New**: Roles are capabilities, not a fixed field. Every authenticated user can both author courses and enroll in them. No admin role, no instructor approval — publishing is self-service.
- **New**: Course authoring — create a course (title, slug, description, cover image), organize content as modules containing lessons, where each lesson is Markdown text plus an optional YouTube URL. Draft/published status controlled by the owner.
- **New**: Public catalog of published courses with a course detail page. Drafts are visible only to their owner.
- **New**: Free enrollment — an authenticated user enrolls in a published course with a single action. Enrolled users get access to all lesson content.
- **New**: Reviews — an enrolled user leaves one review per course (rating 1–5 plus text), editable later. Aggregate rating shown on the course.
- **New**: Authorization enforced by Postgres Row Level Security (RLS) policies in Supabase, not application code. Next.js talks to Supabase directly; sensitive mutations run in Route Handlers server-side.
- **Deferred (modeled, not built)**: `courses.price` and `enrollments.status` columns exist so paid courses can be added in v2 without a schema migration. In this MVP price is always 0 and status is always `active`.
- **Out of scope**: progress tracking / "continue where I left off", certificates, quizzes, payments, notifications, search filters, instructor analytics, comments/forums, live sessions, moderation.

## Capabilities

### New Capabilities

- `user-accounts`: Registration, login, session, and the editable user profile.
- `course-authoring`: Creating and managing courses, modules, and lessons; draft/publish lifecycle; owner-only edit rights.
- `course-catalog`: Public listing of published courses and the course detail view, including aggregate rating.
- `enrollment`: Free enrollment of a user in a published course and the resulting access to lesson content.
- `course-reviews`: One editable rating-and-text review per enrolled user per course, and its aggregation onto the course.

### Modified Capabilities

None — greenfield.

## Impact

- **New project scaffolding**: Next.js app (App Router), `@supabase/supabase-js` and `@supabase/ssr` clients.
- **Supabase project**: Auth configured for email/password; Postgres schema for `profiles`, `courses`, `modules`, `lessons`, `enrollments`, `reviews`; RLS policies on every table; a SQL migration set.
- **Environment**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a server-only `SUPABASE_SERVICE_ROLE_KEY`.
- **No external code affected** — nothing exists yet.
