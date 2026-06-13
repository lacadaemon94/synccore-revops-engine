# Implementation Roadmap

## Phase 1: Local demo dashboard

Build the dashboard with realistic static demo data. No real SaaS accounts required.

## Phase 2: Supabase persistence

Connect the dashboard to Supabase/Postgres and replace static demo data with database-backed reads.

## Phase 3: n8n webhook routing

Implement the event intake router, event logging, idempotency, and workflow routing.

## Phase 4A: Failed payment churn defuser

Classify failed payment risk, stage mock operational responses, and surface the response plan in the dashboard before adding real integrations.

## Phase 4B: Optional real adapters

Add optional adapters for Stripe test mode, HubSpot CRM, and Slack notifications.

## Phase 5: Public case study polish

Add screenshots, diagrams, sample events, seed data, and a polished write-up for Iterwave and portfolio use.
