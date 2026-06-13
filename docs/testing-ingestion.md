# Testing Event Ingestion

Phase 3 adds a first event ingestion bridge through the dashboard itself:

```txt
POST /api/events/ingest
```

## What this route does

- accepts Stripe-like demo billing events
- validates their basic shape
- normalizes the payload
- writes to `event_log` when `DEMO_MODE=false` and Supabase is configured
- classifies `invoice.payment_failed` events for churn risk
- stages a mock notification response for failed payments
- skips persistence when `DEMO_MODE=true`

## Start the dashboard

From the repo root:

```bash
pnpm dev
```

## Choose the mode

### Demo mode

```env
DEMO_MODE=true
```

Behavior:

- the ingest route still validates and normalizes the event
- no database write is attempted
- failed payment events still return a simulated churn classification and mock response payload
- the response clearly says persistence was skipped

### Persistence mode

```env
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Behavior:

- the ingest route attempts to insert into `event_log`
- duplicate events are detected by `provider_event_id`
- the existing row is returned instead of inserting a duplicate
- `invoice.payment_failed` also stages a mock `notification_outbox` item
- high or critical failed payments can create a CRM/billing discrepancy row when lifecycle data still looks customer-like

## Replay a sample event

Use the replay script from the repo root:

```bash
pnpm replay:event -- database/demo-events/invoice-payment-failed-high-value.json
```

Override the endpoint when running the dashboard on another port:

```bash
SYNC_CORE_INGEST_URL=http://localhost:3010/api/events/ingest pnpm replay:event -- database/demo-events/invoice-payment-failed-high-value.json
```

Other samples:

```bash
pnpm replay:event -- database/demo-events/invoice-payment-failed-low-value.json
pnpm replay:event -- database/demo-events/invoice-paid.json
pnpm replay:event -- database/demo-events/subscription-updated.json
pnpm replay:event -- database/demo-events/subscription-deleted.json
```

## Verify in the dashboard

In persistence mode:

1. replay a sample event
2. open the Events page
3. confirm the provider event ID appears in the table
4. confirm the status, account linkage, amount, and received timestamp look correct

Tip:

- `invoice-payment-failed-low-value.json`, `invoice-paid.json`, and `subscription-deleted.json` are the easiest samples to use when you want to see a newly inserted row immediately.
- some seeded demo payload IDs may already exist and intentionally exercise the duplicate-event path instead.

## Expected high-value vs low-value results

### High-value failed payment

```bash
pnpm replay:event -- database/demo-events/invoice-payment-failed-high-value.json
```

Expected result:

- risk level should come back as `high` or `critical`
- response should recommend a human task
- response should notify operations
- in persistence mode, a `notification_outbox` row should be created
- if lifecycle data is still customer-like, a discrepancy row may also be created

### Low-value failed payment

```bash
pnpm replay:event -- database/demo-events/invoice-payment-failed-low-value.json
```

Expected result:

- risk level should come back as `low` or `medium`
- response should stay in automated recovery mode
- no immediate human task should be required for the seeded low-value example

## Fallback behavior

- `DEMO_MODE=true`: returns success, no write
- `DEMO_MODE=false` with missing Supabase env vars: returns a clear configuration error
- invalid JSON or unsupported event type: returns a `400`
- duplicate `provider_event_id`: returns the existing event row instead of creating a second one
- duplicate failed-payment events skip creating a second mock outbox action
