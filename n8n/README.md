# n8n Workflow Suite v1

This folder contains the local orchestration layer for SyncCore RevOps Engine.

The suite is intentionally demo-first: each workflow is kept `active: false`, uses placeholder URLs or environment expressions, and routes through the Next.js app instead of calling real Stripe, HubSpot, or Slack APIs.

## Import order

Import the workflow files in this order:

1. `00_event_intake_router.json`
2. `01_subscription_lifecycle_sync.json`
3. `02_failed_payment_churn_defuser.json`
4. `03_dead_letter_retry_worker.json`
5. `04_reconciler_job.json`

Import order matters because the earlier workflows explain the event envelope and the later ones build on the same ingest and retry conventions.

## How the suite maps to the app

1. `00_event_intake_router.json`
   Receives a webhook-style billing payload or a manual test payload, normalizes the envelope, and posts it to `POST /api/events/ingest`.
2. `01_subscription_lifecycle_sync.json`
   Models subscription lifecycle updates and shows where future CRM synchronization or direct persistence branches would live.
3. `02_failed_payment_churn_defuser.json`
   Replays a high-value failed payment through the ingest route and summarizes churn risk, suggested owner, outbox behavior, and optional DLQ creation.
4. `03_dead_letter_retry_worker.json`
   Demonstrates the scheduled retry loop by loading due queue items and posting them to `POST /api/queue/force-retry`.
5. `04_reconciler_job.json`
   Sketches a scheduled reconciliation job that compares billing and CRM/account state and flags discrepancy follow-up work.

## Architecture contract

The workflows depend on the dashboard as an HTTP bridge:

- `POST /api/events/ingest` handles normalization, idempotent event logging, churn classification, mock action creation, and DLQ creation.
- `POST /api/queue/force-retry` handles deterministic queue replay and returns structured retry results for the worker.
- Supabase persistence stays behind the dashboard data layer so the workflows remain lightweight and provider-agnostic.

## Demo mode

The suite is designed to work with:

```env
DEMO_MODE=true
```

In demo mode:

- ingest requests return simulated persistence and action payloads
- `metadata.simulate_downstream_failure=true` creates deterministic DLQ behavior for the failed-payment flow
- the retry worker can exercise force-retry without touching any real downstream system
- no Stripe, HubSpot, Slack, or paid connectors are required

## Supabase persistence mode

When `DEMO_MODE=false` and the dashboard has valid Supabase environment variables:

- ingest requests can persist `event_log`, `dead_letter_queue`, `notification_outbox`, and related operational records
- the retry worker can update queue state through the dashboard retry route
- workflows can optionally add direct Postgres nodes later, but the base suite keeps HTTP calls as the primary integration pattern

## Local testing

Run the dashboard locally first:

```bash
pnpm dev
```

Then either:

1. Run n8n manually and import the workflow files, or
2. Start the optional Docker Compose n8n service and import the same files

Useful local assets:

- `n8n/.env.example`
- `n8n/payloads/subscription-updated.http.json`
- `n8n/payloads/invoice-payment-failed-high-value.http.json`
- `n8n/payloads/invoice-payment-failed-dlq.http.json`
- `docs/setup-n8n.md`

## What is still mocked

- Stripe event delivery
- HubSpot task creation and account writes
- Slack or chat notifications
- direct CRM reconciliation against a live provider
- any paid connector or production credential flow

## Compatibility note

The JSON files are written as credible n8n workflow templates, but import compatibility was not verified against a running local n8n editor during this phase. Validate each file after import and adjust node versions or metadata if your local n8n build expects a slightly different export shape.
