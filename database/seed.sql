insert into accounts (id, name, normalized_domain, crm_provider, crm_company_id, stripe_customer_id, lifecycle_stage, mrr, arr, ltv, health_score)
values
  ('11111111-1111-4111-8111-111111111111', 'Acme AI Labs', 'acme.ai', 'mock', 'crm_acme_ai', 'cus_acme_ai', 'customer', 1200, 14400, 38400, 87),
  ('22222222-2222-4222-8222-222222222222', 'Norte Cloud', 'norte.cloud', 'mock', 'crm_norte_cloud', 'cus_norte_cloud', 'customer', 350, 4200, 9800, 61),
  ('33333333-3333-4333-8333-333333333333', 'Beta Ops', 'betaops.io', 'mock', 'crm_beta_ops', 'cus_beta_ops', 'evangelist', 2100, 25200, 74400, 93)
on conflict do nothing;

insert into contacts (account_id, email, normalized_email, full_name, crm_contact_id, role)
values
  ('11111111-1111-4111-8111-111111111111', 'ANA@Acme.ai', 'ana@acme.ai', 'Ana Rivera', 'contact_acme_ana', 'VP Operations'),
  ('22222222-2222-4222-8222-222222222222', 'ops@norte.cloud', 'ops@norte.cloud', 'Mario Chen', 'contact_norte_mario', 'Founder'),
  ('33333333-3333-4333-8333-333333333333', 'finance@betaops.io', 'finance@betaops.io', 'Priya Shah', 'contact_beta_priya', 'Head of Finance')
on conflict do nothing;

insert into subscriptions (account_id, stripe_subscription_id, plan_name, tier, status, currency, interval, mrr, previous_mrr, expansion_amount)
values
  ('11111111-1111-4111-8111-111111111111', 'sub_acme_scale', 'Scale', 'scale', 'past_due', 'usd', 'month', 1200, 1200, 0),
  ('22222222-2222-4222-8222-222222222222', 'sub_norte_starter', 'Starter', 'starter', 'active', 'usd', 'month', 350, 250, 100),
  ('33333333-3333-4333-8333-333333333333', 'sub_beta_enterprise', 'Enterprise', 'enterprise', 'active', 'usd', 'month', 2100, 1700, 400)
on conflict do nothing;

insert into event_log (provider_event_id, provider, event_type, account_id, status, payload_json, normalized_json, retry_count)
values
  ('evt_demo_subscription_updated_001', 'stripe-demo', 'customer.subscription.updated', '22222222-2222-4222-8222-222222222222', 'processed', '{"demo": true}', '{"mrr": 350, "expansion_amount": 100}', 0),
  ('evt_demo_invoice_failed_001', 'stripe-demo', 'invoice.payment_failed', '11111111-1111-4111-8111-111111111111', 'routed_to_dlq', '{"demo": true}', '{"risk": "high", "mrr": 1200}', 1),
  ('evt_demo_invoice_paid_001', 'stripe-demo', 'invoice.paid', '33333333-3333-4333-8333-333333333333', 'processed', '{"demo": true}', '{"mrr": 2100}', 0)
on conflict do nothing;

insert into dead_letter_queue (event_log_id, target_system, payload_json, status, retry_count, max_retries, next_retry_at, last_error)
select id, 'mock-crm', payload_json, 'pending', 1, 3, now() + interval '15 minutes', 'Simulated CRM 503 response'
from event_log
where provider_event_id = 'evt_demo_invoice_failed_001'
on conflict do nothing;

insert into discrepancies (account_id, source_a, source_b, field_name, source_a_value, source_b_value, severity, suggested_action)
values
  ('11111111-1111-4111-8111-111111111111', 'billing', 'crm', 'subscription_status', 'past_due', 'active', 'high', 'Create AE task and sync lifecycle stage.'),
  ('22222222-2222-4222-8222-222222222222', 'billing', 'crm', 'mrr', '350', '250', 'medium', 'Update CRM MRR and expansion revenue.'),
  ('33333333-3333-4333-8333-333333333333', 'billing', 'crm', 'plan_tier', 'enterprise', 'scale', 'medium', 'Update CRM plan tier mapping.')
on conflict do nothing;
