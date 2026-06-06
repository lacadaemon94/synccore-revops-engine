# Supabase Setup

This phase adds a read-only Supabase/Postgres persistence path for the dashboard.

SyncCore still defaults to:

```env
DEMO_MODE=true
```

When demo mode is enabled, the dashboard reads from local demo data only.

## What Phase 2 does

- Keeps demo mode as the default developer experience
- Reads from Supabase only when `DEMO_MODE=false`
- Falls back to demo data if Supabase env vars are missing or a read fails
- Uses the existing shared database tables without altering them

This is important for the shared `tests-n-stuff` database: Phase 2 is intentionally read-only from the app side and does not require migrations.

## Create a Supabase project

1. Create a new project in the Supabase dashboard.
2. Open the SQL editor for that project.
3. Paste the contents of [database/schema.sql](/home/zjavier/projectx/synccore-revops-engine/database/schema.sql:1) and run it.
4. Paste the contents of [database/seed.sql](/home/zjavier/projectx/synccore-revops-engine/database/seed.sql:1) and run it.

If you are pointing at the shared `tests-n-stuff` database instead of a fresh project, do not modify the existing tables outside the SQL already present in this repository unless you explicitly choose that later.

## Environment variables

Add these values to your local `.env` or `.env.local`:

```env
DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are enough for Phase 2 read-only dashboard queries.
- `SUPABASE_SERVICE_ROLE_KEY` is not required for this phase and is intentionally not used by the dashboard data layer.
- `.env` is already ignored by git and should never be committed.

## Switch to persistence mode

To make the dashboard read from Supabase/Postgres:

```env
DEMO_MODE=false
```

Behavior:

- `DEMO_MODE=true`: always uses local demo data
- `DEMO_MODE=false` with Supabase env vars present: reads from Supabase
- `DEMO_MODE=false` without usable Supabase config: falls back to demo data

## Expected data shape

Phase 2 reads from the existing tables in [database/schema.sql](/home/zjavier/projectx/synccore-revops-engine/database/schema.sql:1):

- `accounts`
- `subscriptions`
- `event_log`
- `dead_letter_queue`
- `discrepancies`

Some UI fields from the polished dashboard are not yet stored directly in the database. In persistence mode, SyncCore derives them safely in the app layer for now:

- account segment
- owner
- usage density
- revenue risk level
- discrepancy scenario copy
- event summary copy

That abstraction is intentional and keeps the shared schema stable until the project is ready for dedicated SyncCore-only persistence extensions.
