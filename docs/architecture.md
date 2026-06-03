# Architecture

SyncCore uses a demo-first event-driven architecture.

## Core flow

```txt
Billing event or demo event
  -> n8n Event Intake Router
  -> Postgres event_log
  -> specialized workflow
  -> Postgres operational tables
  -> dashboard, CRM adapter, notification outbox
```

## Design rules

1. Store every incoming event before side effects.
2. Use `provider_event_id` as the idempotency key.
3. Normalize payloads before routing.
4. Treat external API failures as retryable when possible.
5. Store failures in `dead_letter_queue`.
6. Keep a dashboard-level view of discrepancies and revenue risk.

## Default systems

- Workflow engine: n8n
- Database: Supabase/Postgres
- Dashboard: Next.js App Router
- Billing source: demo Stripe-like events first
- CRM: mock adapter first, HubSpot later
- Notifications: mock Slack-style outbox first, Slack later
