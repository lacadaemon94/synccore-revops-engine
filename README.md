# Business Systems Sync Workflow

SyncCore is an open-source sample workflow for businesses that keep the same
records in more than one place: sales lists, invoices, inventory sheets, POS
exports, accounting tools, customer records, or shared spreadsheets.

It demonstrates a practical pattern for replacing manual cross-checking with a
system that logs events, compares records, flags mismatches, explains what needs
attention, and gives the team a clear place to review the work.

This repo is not a client deployment or a measured implementation result. It is
a production-shaped sample of a common manual workflow: different systems drift
apart, the team spends time reconciling them by hand, and important exceptions
are discovered too late.

## What this sample shows

- Capture business events before side effects happen.
- Keep a shared operational history in Postgres.
- Compare records across billing, sales, inventory, spreadsheets, or any
  equivalent tools.
- Detect mismatches, retries, failed syncs, and records that need review.
- Use automation for predictable routing and AI-assisted logic for messy
  explanations, prioritization, and next-step summaries.
- Surface the result in a dashboard so people can approve, correct, or follow up
  with context.

## Where the impact is felt

- **Operations:** fewer repetitive checks between tools and spreadsheets.
- **Cash flow:** cleaner billing, payment, and account follow-up.
- **Customer experience:** fewer broken promises caused by stale stock, status,
  or account data.
- **Management visibility:** earlier signals when records stop matching.

## Demo-first design

SyncCore runs without real payment, CRM, POS, inventory, messaging, or accounting
accounts.

```env
DEMO_MODE=true
```

When demo mode is enabled, the system uses mock business events, simulated
downstream failures, mock follow-up tasks, and a local notification outbox
instead of external APIs. Optional adapters can be added later without changing
the base demo path.

## Architecture

```txt
Business event, spreadsheet upload, or local n8n webhook
  -> n8n workflow suite
  -> Next.js ingest and retry API routes
  -> Supabase/Postgres operational tables when configured
  -> Reconciler | Dead-Letter Queue | Action Center | Notification Outbox
  -> Dashboard for review, correction, and follow-up
```

The important idea is not a specific vendor. The same pattern can map to a POS,
an accounting tool, a CRM, a Google Sheet, a WhatsApp intake flow, an inventory
spreadsheet, or a custom internal system.

## Repository layout

```txt
apps/dashboard       Next.js App Router dashboard and API routes
n8n/workflows        Importable workflow suite templates
n8n/payloads         Sample HTTP bodies for local testing
database             Postgres schema, seed data, demo events
docs                 Architecture, setup, testing, and roadmap notes
```

## Local development

```bash
pnpm install
pnpm dev
```

The default developer experience remains demo-first. Replay the sample events
from `database/demo-events` or `n8n/payloads` to exercise ingestion,
classification, mismatch detection, retry handling, and the action center
without external credentials.

For local orchestration setup, see [docs/setup-n8n.md](docs/setup-n8n.md).

## Workflow suite

The `n8n/workflows` folder includes:

1. `00_event_intake_router.json`
2. `01_subscription_lifecycle_sync.json`
3. `02_failed_payment_churn_defuser.json`
4. `03_dead_letter_retry_worker.json`
5. `04_reconciler_job.json`

The existing workflow names still reflect the first demo scenario, but the
pattern is broader than subscription software. Treat them as examples of event
intake, record synchronization, exception handling, retry work, and
reconciliation.

Each workflow is kept inactive by default, uses placeholder URLs and expressions
only, and avoids real third-party credentials.

## Technical patterns

- Event logging before side effects.
- Idempotency for incoming provider or system events.
- Retryable workflow failures through a dead-letter queue.
- A visible action center for exceptions that need review.
- A notification outbox that can later connect to email, WhatsApp, SMS, chat, or
  internal dashboards.
- Optional real integrations after the demo path is solid.

## Potential fit

This pattern is useful when a business relies on manual reconciliation like:

- Comparing sales orders with invoices.
- Checking stock sheets against POS exports.
- Matching payments against customer records.
- Updating a spreadsheet after messages, calls, or forms.
- Noticing when one system says "paid" and another still says "pending".

It does not promise automatic financial gain by itself. The value depends on
volume, error cost, team habits, and how much of the workflow can be safely
standardized. In the right process, the gains usually show up as less manual
checking, faster cleanup, fewer missed follow-ups, and better visibility.

## Roadmap

1. Local demo dashboard
2. Supabase persistence
3. n8n webhook routing
4. Dead-letter queue retry engine
5. Action center and notification outbox
6. n8n workflow suite and local orchestration docs
7. Optional adapters for the tools a business already uses
8. Public sample-workflow polish

## License

[MIT](LICENSE).
