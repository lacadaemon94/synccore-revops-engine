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

## Fallback behavior

- `DEMO_MODE=true`: returns success, no write
- `DEMO_MODE=false` with missing Supabase env vars: returns a clear configuration error
- invalid JSON or unsupported event type: returns a `400`
- duplicate `provider_event_id`: returns the existing event row instead of creating a second one
