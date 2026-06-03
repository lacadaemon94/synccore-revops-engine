# n8n Workflows

This folder contains the workflow suite for SyncCore RevOps Engine.

The initial files are documented placeholders. The next implementation phase should import or recreate them in n8n and connect them to Supabase/Postgres.

## Workflow suite

1. `00_event_intake_router.json` — receives billing events, normalizes them, writes to `event_log`, and routes by event type.
2. `01_subscription_lifecycle_sync.json` — updates account/subscription lifecycle state and CRM mapping.
3. `02_failed_payment_churn_defuser.json` — classifies failed payments by account value and routes high-value churn risk.
4. `03_dead_letter_retry_worker.json` — retries failed external operations and escalates after max retries.
5. `04_reconciler_job.json` — scans billing and CRM state for discrepancies.

## Demo principle

The workflows should always support mock/demo mode before requiring Stripe, HubSpot, or Slack credentials.
