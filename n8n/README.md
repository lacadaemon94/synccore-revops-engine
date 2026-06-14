# n8n Workflows

This folder contains the workflow suite for SyncCore RevOps Engine.

The initial files are documented placeholders. For Phase 3, the dashboard route is the first ingestion bridge and n8n can call it directly before direct Postgres writes are introduced.

## Workflow suite

1. `00_event_intake_router.json` - receives billing events, normalizes them, forwards them to the dashboard ingest route or a future direct Postgres insert, and routes by event type.
2. `01_subscription_lifecycle_sync.json` - updates account/subscription lifecycle state and CRM mapping.
3. `02_failed_payment_churn_defuser.json` - classifies failed payments by account value and routes high-value churn risk.
4. `03_dead_letter_retry_worker.json` - loads due DLQ items, replays the blocked operation, and either resolves, re-queues, or escalates the item.
5. `04_reconciler_job.json` - scans billing and CRM state for discrepancies.

## Demo principle

The workflows should always support mock/demo mode before requiring Stripe, HubSpot, or Slack credentials.

## Phase 3 routing note

For now:

- the Next.js API route acts as the ingestion bridge
- n8n can call `POST /api/events/ingest` from a Webhook workflow or HTTP Request node
- `event_log` remains the source of truth
- idempotency is based on `provider_event_id`
- later, n8n can write directly to Postgres if that becomes the preferred architecture

## Phase 4B DLQ note

For now:

- the dashboard owns the retry policy: retry 1 after 15 minutes, retry 2 after 30 minutes, retry 3 after 60 minutes
- demo mode can create a simulated DLQ item when `metadata.simulate_downstream_failure=true`
- Supabase mode persists the queue row in `dead_letter_queue`
- the future n8n retry worker should load items where `status in ('pending', 'retrying')` and `next_retry_at <= now()`
- each due item can later call a retry endpoint or worker-specific route in the dashboard rather than reaching real providers directly
