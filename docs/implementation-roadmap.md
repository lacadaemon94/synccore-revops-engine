# Implementation Roadmap

## Phase 1: Local demo dashboard

Build the dashboard with realistic static demo data. No real SaaS accounts required.

## Phase 2: Supabase persistence

Connect the dashboard to Supabase/Postgres and replace static demo data with database-backed reads.

## Phase 3: n8n webhook routing

Implement the event intake router, event logging, idempotency, and workflow routing.

## Phase 4A: Failed payment churn defuser

Classify failed payment risk, stage mock operational responses, and surface the response plan in the dashboard before adding real integrations.

## Phase 4B: Dead-letter queue retry engine

Turn retryable downstream failures into first-class DLQ records with retry scheduling, force replay, resolution, and escalation behavior.

## Phase 4C: Ops action center and notification outbox

Surface operator-ready recommendations from churn defuser, notification_outbox, mock CRM tasks, and DLQ escalations in a dedicated dashboard view.

## Phase 4D: n8n workflow suite v1 and local orchestration docs

Turn the documented workflow placeholders into importable local n8n templates, add sample payloads and setup instructions, and keep the orchestration story demo-first without real provider credentials.

## Phase 5: Optional real adapters

Add optional adapters for Stripe test mode, HubSpot CRM, and Slack notifications only after the demo DLQ and churn-defuser paths are stable.

## Phase 6: Public case study polish

Add screenshots, diagrams, sample events, seed data, and a polished write-up for Iter and portfolio use.
