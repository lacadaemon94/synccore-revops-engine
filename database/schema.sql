create extension if not exists pgcrypto;

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_domain text unique,
  crm_provider text default 'mock',
  crm_company_id text,
  stripe_customer_id text,
  lifecycle_stage text default 'lead',
  mrr numeric(12,2) default 0,
  arr numeric(12,2) default 0,
  ltv numeric(12,2) default 0,
  health_score integer default 50 check (health_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  email text not null,
  normalized_email text not null unique,
  full_name text,
  crm_contact_id text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  stripe_subscription_id text unique,
  plan_name text not null,
  tier text not null,
  status text not null,
  currency text not null default 'usd',
  interval text not null default 'month',
  current_period_start timestamptz,
  current_period_end timestamptz,
  mrr numeric(12,2) not null default 0,
  previous_mrr numeric(12,2) not null default 0,
  expansion_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_log (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  provider text not null,
  event_type text not null,
  account_id uuid references accounts(id) on delete set null,
  status text not null default 'received',
  payload_json jsonb not null default '{}'::jsonb,
  normalized_json jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  retry_count integer not null default 0,
  error_message text
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  event_log_id uuid references event_log(id) on delete cascade,
  target_system text not null,
  operation text not null,
  status text not null default 'pending',
  request_json jsonb not null default '{}'::jsonb,
  response_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists dead_letter_queue (
  id uuid primary key default gen_random_uuid(),
  event_log_id uuid references event_log(id) on delete cascade,
  target_system text not null,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  next_retry_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists discrepancies (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  source_a text not null,
  source_b text not null,
  field_name text not null,
  source_a_value text,
  source_b_value text,
  severity text not null default 'medium',
  status text not null default 'open',
  suggested_action text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete set null,
  channel text not null default 'mock-slack',
  recipient text,
  title text not null,
  body text not null,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_event_log_event_type on event_log(event_type);
create index if not exists idx_event_log_status on event_log(status);
create index if not exists idx_dlq_status_next_retry on dead_letter_queue(status, next_retry_at);
create index if not exists idx_discrepancies_status on discrepancies(status);
