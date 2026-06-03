# Demo Mode

SyncCore is demo-first by design.

`DEMO_MODE=true` means the dashboard and future workflows should use local sample data, mock adapters, and the notification outbox instead of requiring live SaaS accounts.

## Mocked systems

- Billing: Stripe-like event payloads in `database/demo-events`
- CRM: mock CRM adapter in `apps/dashboard/lib/adapters/crm.mock.ts`
- Notifications: mock Slack-style adapter in `apps/dashboard/lib/adapters/notifications.mock.ts`

## Why this matters

The public case study should be cloneable and understandable without asking developers to create Stripe, HubSpot, or Slack accounts.

Real integrations should be optional adapters, not requirements for the base demo.
