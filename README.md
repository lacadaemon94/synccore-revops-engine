# SyncCore RevOps Engine

SyncCore is an open-source, demo-first RevOps infrastructure case study built with **Next.js**, **Supabase/Postgres**, and an **n8n workflow suite**.

It demonstrates a practical event-driven operating model for SaaS teams: billing events arrive, the system logs and classifies them, routes operational work, stages mock notifications and CRM follow-up, retries blocked workflows through a dead-letter queue, and surfaces operator-visible actions in a dashboard.

## Phase 4D snapshot

SyncCore now includes four working layers:

- Next.js dashboard for operational visibility
- Supabase/Postgres as the operational store when configured
- n8n workflow suite v1 for intake, lifecycle sync, churn defuser, DLQ retry, and reconciliation orchestration
- Demo-first event infrastructure that works without Stripe, HubSpot, Slack, or paid services

## What this proves

- Event-driven webhook architecture
- Idempotent event logging before side effects
- Dead-letter queue and retry scheduling design
- Ops action center and notification outbox design
- Mock CRM task generation and operator workflows
- Reconciliation patterns between billing and CRM state
- n8n as a credible orchestration layer alongside a typed Next.js dashboard

## Demo-first design

SyncCore runs without real Stripe, HubSpot, or Slack accounts.

```env
DEMO_MODE=true
```

When demo mode is enabled, the system uses mock billing events, simulated downstream failures, mock CRM tasks, and a local notification outbox instead of external APIs. Optional adapters can be added later without changing the base demo path.

## Architecture

```txt
Stripe-like Demo Event or Local n8n Webhook
  -> n8n workflow suite v1
  -> Next.js ingest and retry API routes
  -> Supabase/Postgres operational tables when configured
  -> Churn Defuser | Dead-Letter Queue | Ops Action Center | Reconciler
  -> Mock CRM Tasks | Notification Outbox | Dashboard
```

## Repository layout

```txt
apps/dashboard       Next.js App Router dashboard and API routes
n8n/workflows        Importable workflow suite v1 templates
n8n/payloads         Sample HTTP bodies for local testing
database             Postgres schema, seed data, demo events
docs                 Architecture, setup, testing, and roadmap notes
```

## Local development

```bash
pnpm install
pnpm dev
```

The default developer experience remains demo-first. Replay the sample events from `database/demo-events` or `n8n/payloads` to exercise ingestion, churn classification, DLQ creation, and the Ops Action Center without any external credentials.

For local orchestration setup, see [docs/setup-n8n.md](/home/zjavier/projectx/synccore-revops-engine/docs/setup-n8n.md).

## Workflow suite

The `n8n/workflows` folder now includes:

1. `00_event_intake_router.json`
2. `01_subscription_lifecycle_sync.json`
3. `02_failed_payment_churn_defuser.json`
4. `03_dead_letter_retry_worker.json`
5. `04_reconciler_job.json`

Each workflow is kept inactive by default, uses placeholder URLs and expressions only, and avoids real Stripe, HubSpot, or Slack credentials.

## Roadmap

1. Local demo dashboard
2. Supabase persistence
3. n8n webhook routing
4. Dead-letter queue retry engine
5. Ops action center and notification outbox
6. n8n workflow suite v1 and local orchestration docs
7. Optional Stripe, HubSpot, and Slack adapters
8. Public case study polish
