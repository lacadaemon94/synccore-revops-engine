# SyncCore Dashboard — Database Schema

Reference design for a future Supabase/Postgres backend. **Not yet implemented** — fixtures in `apps/dashboard/lib/fixtures/` are the current source of truth.

## Conventions

- **Primary keys**: `uuid` (`gen_random_uuid()`), with an optional `slug text unique` for human-readable routes (e.g. `/accounts/northwind`).
- **Naming**: `snake_case` for all columns and tables.
- **Timestamps**: every table includes `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()` (trigger-maintained), and `deleted_at timestamptz null` (soft delete).
- **Enums**: declared at the database level via `create type ... as enum (...)`. Application enums in `components/*/local.ts` are the canonical source list.
- **Money**: integer cents (`bigint`). Display formatting is performed in the UI; fixtures currently hold pre-formatted strings.
- **RLS**: not configured. To be designed when auth is introduced.

---

## `accounts`

Customer accounts. The root entity that most other tables reference.

| column         | type                    | notes |
| -------------- | ----------------------- | --- |
| id             | uuid pk                 | `gen_random_uuid()` |
| slug           | text unique not null    | route slug (e.g. `northwind`) |
| name           | text not null           |  |
| segment        | account_plan_tier null  | enum: `free` \| `starter` \| `growth` \| `enterprise` |
| plan_tier      | account_plan_tier null  | current billed tier |
| health         | account_health not null | enum: `healthy` \| `at-risk` \| `renewing` \| `churn-risk` |
| health_score   | smallint                | 0–100 |
| sync_status    | sync_status not null    | enum: `in-sync` \| `syncing` \| `stale` \| `failed` |
| mrr_cents      | bigint                  |  |
| owner_id       | uuid null → users.id    |  |
| renewal_date   | date                    |  |
| region         | text                    | e.g. `us-east-1` |
| metadata       | jsonb not null default '{}' | freeform key/value |
| last_activity_at | timestamptz           |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(health) where deleted_at is null`, `(sync_status)`, `(slug)`.

---

## `users`

Account owners / assignees.

| column   | type             | notes |
| -------- | ---------------- | --- |
| id       | uuid pk          |  |
| name     | text not null    |  |
| email    | citext unique    |  |
| role     | text             | e.g. `cs`, `platform-on-call` |
| created_at, updated_at, deleted_at | timestamptz | |

---

## `actions`

Operator triage queue. The list + detail pair on `/actions`.

| column         | type                 | notes |
| -------------- | -------------------- | --- |
| id             | uuid pk              |  |
| account_id     | uuid not null → accounts.id |  |
| title          | text not null        |  |
| severity       | action_severity not null | enum: `critical` \| `high` \| `medium` \| `low` |
| status         | action_status not null   | enum: `open` \| `in-progress` \| `resolved` \| `snoozed` |
| assignee_id    | uuid null → users.id |  |
| created_by_id  | uuid null → users.id | null = system |
| snippet        | text                 | short summary for list |
| description    | text                 | long-form for detail panel |
| snoozed_until  | timestamptz null     |  |
| resolved_at    | timestamptz null     |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(status, severity) where deleted_at is null`, `(assignee_id)`, `(account_id)`.

---

## `action_logs`

Audit trail per action. Append-only.

| column      | type             | notes |
| ----------- | ---------------- | --- |
| id          | uuid pk          |  |
| action_id   | uuid not null → actions.id |  |
| actor_id    | uuid null → users.id | null = system |
| actor_label | text             | denormalized (e.g. `System`) |
| message     | text not null    |  |
| created_at  | timestamptz not null default now() | no updated_at — immutable |

**Indexes**: `(action_id, created_at desc)`.

---

## `events`

Operational event log surfaced on `/events`.

| column        | type            | notes |
| ------------- | --------------- | --- |
| id            | uuid pk         |  |
| account_id    | uuid null → accounts.id | nullable for platform-level events |
| event_type    | event_type not null | enum: `webhook` \| `sync` \| `reconciler` \| `manual` |
| source        | event_source not null | enum: `stripe` \| `hubspot` \| `internal` |
| status        | event_status not null | enum: `success` \| `failed` \| `pending` \| `retrying` |
| payload       | jsonb not null  | original event body or normalized summary |
| occurred_at   | timestamptz not null |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(occurred_at desc)`, `(status, source)`, `(account_id, occurred_at desc)`.

---

## `queue_entries`

Dead-letter / retry queue surfaced on `/queue`.

| column         | type            | notes |
| -------------- | --------------- | --- |
| id             | uuid pk         |  |
| account_id     | uuid null → accounts.id |  |
| target         | text not null   | e.g. `mock-crm`, `netsuite-sync` |
| status         | queue_status not null | enum: `pending` \| `retrying` \| `escalated` \| `resolved` |
| failure_class  | failure_class not null | enum: `availability` \| `timeout` \| `authentication` \| `validation` \| `rate_limit` \| `unknown` |
| retry_count    | smallint not null default 0 |  |
| max_retries    | smallint not null |  |
| last_error     | text            |  |
| next_attempt_at | timestamptz null | drives ETA display |
| resolved_at    | timestamptz null |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(status, next_attempt_at)`, `(account_id)`.

---

## `discrepancies`

Detected drift between billing and CRM systems. Drives `/reconciler` and the per-account discrepancy log.

| column            | type            | notes |
| ----------------- | --------------- | --- |
| id                | uuid pk         |  |
| account_id        | uuid not null → accounts.id |  |
| type              | discrepancy_type not null | enum: `payment-mismatch` \| `subscription-drift` \| `metadata-conflict` \| `manual-override` |
| severity          | discrepancy_severity not null | enum: `critical` \| `high` \| `medium` \| `low` |
| resolution_status | discrepancy_resolution_status not null | enum: `open` \| `in-review` \| `resolved` \| `ignored` |
| summary           | text not null   |  |
| field_diffs       | jsonb not null default '[]' | array of `{ field, stripe_value, hubspot_value, differs }` |
| detected_at       | timestamptz not null |  |
| resolved_at       | timestamptz null |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(resolution_status, severity)`, `(account_id, detected_at desc)`.

---

## `sync_history`

Per-source sync attempts surfaced on the account detail page.

| column        | type            | notes |
| ------------- | --------------- | --- |
| id            | uuid pk         |  |
| account_id    | uuid not null → accounts.id |  |
| source        | sync_source not null | enum: `stripe` \| `hubspot` \| `internal` |
| direction     | sync_direction not null | enum: `inbound` \| `outbound` \| `bidirectional` |
| status        | sync_row_status not null | enum: `success` \| `partial` \| `failed` |
| record_count  | integer not null default 0 |  |
| started_at    | timestamptz not null |  |
| finished_at   | timestamptz null |  |
| created_at, updated_at, deleted_at | timestamptz | |

**Indexes**: `(account_id, started_at desc)`, `(source, started_at desc)`.

---

## Open questions

- Auth model and RLS policies — deferred until the demo gains a sign-in flow.
- Multi-tenant isolation — currently one logical workspace; an `org_id` foreign key can be added uniformly later.
- Materialized views for the Overview KPIs (open action count, MRR exposure) vs. computing on read.
