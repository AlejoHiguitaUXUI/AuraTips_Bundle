# Supabase setup

## 1. Create the project

Create a project at [supabase.com](https://supabase.com). In **Project Settings → API** copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

Put them in `.env.local` (see `.env.local.example`).

In **Authentication → Providers → Email**, enable email/password. For a demo you
may disable "Confirm email".

## 2. Apply the migrations

In order, via the SQL editor or the Supabase CLI:

| File | Purpose |
| --- | --- |
| `migrations/0001_init.sql` | Tables, triggers, `handle_new_user`, `course_ratings` view |
| `migrations/0002_rls.sql` | Enable RLS, helper functions, all policies |

`migrations/0003_policy_tests.sql` is **not** applied — it seeds fixtures and
asserts the policy predicates inside a transaction it rolls back. Run it against
a scratch database:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0003_policy_tests.sql
```

A clean run ends with `ROLLBACK` and no `ERROR`. Any assertion failure raises an
exception and aborts.

## 3. Verify

- Register a user in the app → a row appears in `public.profiles`.
- The checklist in `openspec/changes/add-course-platform/tasks.md` groups 2 and 3
  lists the specific "verify" steps.
