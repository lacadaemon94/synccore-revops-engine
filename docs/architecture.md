# Architecture

SyncCore uses a demo-first event-driven architecture with a staged persistence model.

## Core flow

```txt
Billing event or demo event
  -> n8n Event Intake Router
  -> dashboard ingest API bridge (Phase 3)
  -> Postgres event_log
  -> specialized workflow
  -> Postgres operational tables
  -> dashboard, CRM adapter, notification outbox
```

## Operating modes

### Demo data mode

This is the default experience:

```env
DEMO_MODE=true
```

In demo mode, the dashboard reads from local TypeScript demo fixtures and does not require Supabase credentials.

### Supabase persistence mode

When:

```env
DEMO_MODE=false
```

and Supabase env vars are present, the dashboard reads from Supabase/Postgres through a server-side data access layer.

If Supabase is not configured correctly, the dashboard gracefully falls back to demo data instead of failing closed.

## Why the data access layer exists now

Before adding real Stripe, HubSpot, or Slack integrations, SyncCore now abstracts reads behind dedicated modules:

```txt
lib/data/accounts.ts
lib/data/events.ts
lib/data/queue.ts
lib/data/discrepancies.ts
lib/data/metrics.ts
```

That gives the project a stable application contract first:

1. UI code does not need to know whether data came from demo fixtures or Supabase.
2. Shared database tables can be read safely without forcing schema churn immediately.
3. Future provider integrations can write into Postgres while the dashboard continues to read through the same typed interface.
4. Derived UI-only fields can live in mappers until SyncCore is ready for isolated schema extensions.

## Phase 3 ingestion bridge

Phase 3 introduces the first real event ingestion path:

```txt
Stripe-like demo event
  -> POST /api/events/ingest
  -> validation
  -> normalization
  -> idempotent event_log insert
  -> dashboard visibility
```

For now:

1. The Next.js API route acts as the ingestion bridge.
2. n8n can call that route from a Webhook workflow or HTTP Request node.
3. `event_log` remains the source of truth before downstream side effects.
4. Idempotency is enforced with `provider_event_id`.
5. Later, n8n can write directly to Postgres if that becomes the preferred operating model.

## Design rules

1. Store every incoming event before side effects.
2. Use `provider_event_id` as the idempotency key.
3. Normalize payloads before routing.
4. Treat external API failures as retryable when possible.
5. Store failures in `dead_letter_queue`.
6. Keep a dashboard-level view of discrepancies and revenue risk.
7. Preserve demo mode as the default path until the persistence workflow is solid.

## Current persistence scope

Phase 2 and Phase 3 read from the existing operational tables only:

- `accounts`
- `subscriptions`
- `event_log`
- `dead_letter_queue`
- `discrepancies`

For the shared `tests-n-stuff` database, this phase is intentionally read-only from the dashboard side and does not modify existing tables or business logic.

## Default systems

- Workflow engine: n8n
- Database: Supabase/Postgres
- Dashboard: Next.js App Router
- Billing source: demo Stripe-like events first
- CRM: mock adapter first, HubSpot later
- Notifications: mock Slack-style outbox first, Slack later
