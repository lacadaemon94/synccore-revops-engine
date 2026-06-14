# Local n8n Setup

Phase 4D turns the `n8n/` folder into a credible local workflow suite for SyncCore without requiring Stripe, HubSpot, Slack, or any paid integration.

## What this setup does

- runs n8n locally
- lets n8n post demo billing payloads to the Next.js ingestion route
- keeps `DEMO_MODE=true` working by default
- supports `DEMO_MODE=false` when the dashboard is configured for Supabase persistence
- avoids any real provider credentials

## Start the dashboard first

From the repo root:

```bash
pnpm dev
```

By default the dashboard ingest route is:

```txt
http://localhost:3000/api/events/ingest
```

The optional force-retry API route for n8n is:

```txt
http://localhost:3000/api/queue/force-retry
```

## Option 1: Run n8n with Docker Compose

This repo now includes an optional `n8n` service under the `n8n` compose profile.

From the repo root:

```bash
docker compose --profile n8n up -d
```

This is intentionally lightweight:

- it uses local placeholder environment values only
- it does not require Postgres-backed n8n metadata storage
- it persists the local n8n workspace in a Docker volume
- it keeps the existing local Postgres service intact

## Option 2: Run n8n manually

If you prefer a local install instead of Docker:

```bash
npx n8n
```

Use the same environment variables shown in `n8n/.env.example`.

## Configure local environment values

Copy:

```txt
n8n/.env.example
```

to a local-only env file or export the variables in your shell.

Important values:

- `SYNC_CORE_INGEST_URL=http://host.docker.internal:3000/api/events/ingest`
- `SYNC_CORE_FORCE_RETRY_URL=http://host.docker.internal:3000/api/queue/force-retry`
- `N8N_ENCRYPTION_KEY=replace_with_local_value`

If you run n8n outside Docker on the same machine, `localhost` usually works instead of `host.docker.internal`.

## Import workflow JSON files

The workflow templates live in:

```txt
n8n/workflows/
```

Recommended import order:

1. `00_event_intake_router.json`
2. `01_subscription_lifecycle_sync.json`
3. `02_failed_payment_churn_defuser.json`
4. `03_dead_letter_retry_worker.json`
5. `04_reconciler_job.json`

In n8n:

1. Open the workflow list.
2. Choose the import option.
3. Import each JSON file.
4. Keep each workflow inactive until you confirm local URLs and credentials.

Note:

- the JSON files are designed as credible workflow templates and should be easy to adapt
- import compatibility was not verified in a running n8n editor during this phase, so validate node settings after import before activation

## Test with demo mode

Leave:

```env
DEMO_MODE=true
```

Behavior:

- n8n posts Stripe-like demo payloads to the Next.js ingestion route
- the dashboard validates and normalizes the payload
- no Supabase write is attempted
- the response still includes churn classification, mock CRM task data, notification outbox payloads, and DLQ simulation when requested

Useful sample request bodies are in:

```txt
n8n/payloads/
```

## Test with Supabase persistence mode

Set:

```env
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Behavior:

- the ingest route writes to `event_log`
- failed payments can write `notification_outbox`
- deterministic downstream failures can create `dead_letter_queue` rows
- the Ops Action Center reads actions back from the operational store when available

No automatic migrations are applied by this phase.

## Credentials intentionally not required yet

This workflow suite does **not** require:

- Stripe API keys
- HubSpot credentials
- Slack tokens
- paid n8n cloud features

The suite is still demo-first. Real adapters remain a later phase.
