# n8n Workflows

This folder contains the workflow suite for SyncCore RevOps Engine.

The initial files are documented placeholders. For Phase 3, the dashboard route is the first ingestion bridge and n8n can call it directly before direct Postgres writes are introduced.

## Workflow suite

1. `00_event_intake_router.json` — receives billing events, normalizes them, forwards them to the dashboard ingest route or a future direct Postgres insert, and routes by event type.
2. `01_subscription_lifecycle_sync.json` — updates account/subscription lifecycle state and CRM mapping.
3. `02_failed_payment_churn_defuser.json` — classifies failed payments by account value and routes high-value churn risk.
4. `03_dead_letter_retry_worker.json` — retries failed external operations and escalates after max retries.
5. `04_reconciler_job.json` — scans billing and CRM state for discrepancies.

## Demo principle

The workflows should always support mock/demo mode before requiring Stripe, HubSpot, or Slack credentials.

## Phase 3 routing note

For now:

- the Next.js API route acts as the ingestion bridge
- n8n can call `POST /api/events/ingest` from a Webhook workflow or HTTP Request node
- `event_log` remains the source of truth
- idempotency is based on `provider_event_id`
- later, n8n can write directly to Postgres if that becomes the preferred architecture
