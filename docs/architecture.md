# Architecture

SyncCore uses a demo-first event-driven architecture with a staged persistence model.

## Core flow

```txt
Billing event or demo event
  -> n8n Event Intake Router
  -> dashboard ingest API bridge (Phase 3)
  -> Postgres event_log
  -> churn defuser classifier (Phase 4A for failed payments)
  -> specialized workflow
  -> dead-letter queue retry engine (Phase 4B when needed)
  -> ops action center and notification outbox (Phase 4C)
  -> Postgres operational tables
  -> dashboard, mock CRM tasks, notification outbox
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

## Phase 4A failed payment churn defuser

When the ingest route receives `invoice.payment_failed`, SyncCore now does one more pass before any real external integration exists:

```txt
failed payment event
  -> normalization
  -> event_log insert
  -> churn-risk classification
  -> mock operational response
  -> notification_outbox write (Supabase mode only)
  -> optional discrepancy write for high-risk lifecycle drift
```

Current behavior:

1. Demo mode still skips database writes and returns a simulated classification payload.
2. Supabase mode writes the failed-payment event to `event_log` first.
3. The churn defuser then stages a mock notification in `notification_outbox`.
4. For high or critical failed payments, SyncCore can also create a discrepancy when billing is effectively `past_due` while the account lifecycle is still customer-like in CRM.
5. No real Slack, HubSpot, or Stripe side effects are triggered yet.

## Phase 4B dead-letter queue retry engine

Phase 4B turns the DLQ into a first-class recovery loop instead of a passive table.

```txt
retryable downstream failure
  -> dead_letter_queue row
  -> retry schedule (15m, 30m, 60m)
  -> manual force retry or future n8n worker replay
  -> resolved, pending again, failed, or escalated
```

Current behavior:

1. `metadata.simulate_downstream_failure=true` on a failed-payment demo event deterministically creates a DLQ item.
2. Demo mode returns a simulated queue payload instead of writing to Supabase.
3. Supabase mode persists the `dead_letter_queue` row and updates the linked `event_log` status to `routed_to_dlq`.
4. Retry timing is fixed at 15 minutes for retry 1, 30 minutes for retry 2, and 60 minutes for retry 3.
5. Once `retry_count >= max_retries`, SyncCore marks the item for escalation instead of scheduling another automatic replay.
6. Force Retry still runs inside the dashboard-only demo engine for this phase, so no paid integrations are required.

## Phase 4C ops action center and notification outbox

Phase 4C gives operators a dedicated action surface on top of the failed-payment and DLQ work completed earlier.

```txt
failed payment or DLQ escalation
  -> churn-defuser recommendation
  -> notification_outbox payload
  -> mock CRM task recommendation
  -> /actions operator view
```

Current behavior:

1. `notification_outbox` acts as the mock Slack and task-routing layer for SyncCore.
2. High and critical failed-payment flows include a suggested owner, next action, and a mock CRM task payload.
3. The `/actions` page surfaces outbox items, churn alerts, mock CRM tasks, and DLQ escalations together.
4. Demo mode returns action-center fixtures locally without requiring any external service.
5. Supabase mode reads `notification_outbox` rows back into typed dashboard actions when configured.
6. Real Slack and HubSpot adapters remain optional future phases, not base requirements for the demo.

## Design rules

1. Store every incoming event before side effects.
2. Use `provider_event_id` as the idempotency key.
3. Normalize payloads before routing.
4. Treat external API failures as retryable when possible.
5. Store failures in `dead_letter_queue`.
6. Keep a dashboard-level view of discrepancies and revenue risk.
7. Preserve demo mode as the default path until the persistence workflow is solid.

## Current persistence scope

The dashboard and ingestion workflow now use these existing operational tables:

- `accounts`
- `subscriptions`
- `event_log`
- `dead_letter_queue`
- `discrepancies`
- `notification_outbox`

For the shared `tests-n-stuff` database, this phase does not apply migrations automatically or alter existing table logic. The only opt-in writes are event ingestion records plus mock outbox and discrepancy rows when `DEMO_MODE=false` and the operator explicitly replays events.

## Default systems

- Workflow engine: n8n
- Database: Supabase/Postgres
- Dashboard: Next.js App Router
- Billing source: demo Stripe-like events first
- CRM: mock adapter first, HubSpot later
- Notifications: mock Slack-style outbox first, Slack later
