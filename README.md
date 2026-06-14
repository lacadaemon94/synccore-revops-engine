# SyncCore RevOps Engine

SyncCore is an open-source, demo-first RevOps infrastructure case study built with **n8n**, **Next.js**, and **Supabase/Postgres**.

It demonstrates an event-driven architecture for modern SaaS teams: billing events come in, the system normalizes and logs them, routes workflow actions, handles retries through a dead-letter queue, stages a mock notification outbox and CRM follow-up layer, reconciles CRM and billing state, and exposes operational health through a clean dashboard.

## What this proves

- Event-driven webhook architecture
- RevOps data synchronization
- Dead-letter queue and retry design
- Ops action center and notification outbox design
- CRM and billing reconciliation
- n8n as a real workflow backend, not just a toy automation layer
- Next.js as an ops dashboard for business-critical infrastructure

## Demo-first design

SyncCore runs without real Stripe, HubSpot, or Slack accounts.

```env
DEMO_MODE=true
```

When demo mode is enabled, the system uses mock billing events, mock CRM updates, mock CRM task recommendations, and a local notification outbox instead of external APIs.

Optional real integrations can be added later through environment variables.

## Architecture

```txt
Stripe / Demo Billing Events
  -> n8n Event Intake Router
  -> Supabase/Postgres Event Log
  -> Lifecycle Sync | Churn Defuser | DLQ Retry | Ops Action Center | Reconciler
  -> Mock CRM Tasks / Notification Outbox / Dashboard
```

## Repository layout

```txt
apps/dashboard       Next.js App Router dashboard
n8n/workflows        n8n workflow exports and placeholders
database             Postgres schema, seed data, demo events
docs                 Architecture, setup, demo mode, case study notes
```

## Local development

```bash
pnpm install
pnpm dev
```

The default developer experience is still the local demo dashboard backed by static fixtures. Supabase persistence, the DLQ flow, and the action center activate when you replay the sample events in the app.

## Roadmap

1. Local demo dashboard
2. Supabase persistence
3. n8n webhook routing
4. Dead-letter queue retry engine
5. Ops action center and notification outbox
6. Optional Stripe, HubSpot, and Slack adapters
7. Public case study polish
