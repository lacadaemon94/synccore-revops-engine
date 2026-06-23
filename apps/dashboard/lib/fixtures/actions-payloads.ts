import type { ActionPayloadData } from '@/components/Actions/local';

export const actionPayloads: Record<string, ActionPayloadData> = {
  a1: {
    type: 'error-detail',
    label: 'Stripe payload',
    errorRows: [
      { k: 'code', v: 'card_declined', warn: true },
      { k: 'decline_code', v: 'do_not_honor', warn: true },
      { k: 'amount', v: '$48,000.00' },
      { k: 'invoice', v: 'in_3OrLkPa9F' },
      { k: 'customer', v: 'cus_NwInd92' },
    ],
  },
  a2: {
    type: 'error-detail',
    label: 'DLQ payload',
    errorRows: [
      { k: 'source', v: 'netsuite.sync' },
      { k: 'error', v: 'INVALID_REF', warn: true },
      { k: 'field', v: 'customer_id' },
      { k: 'attempts', v: '6 / 6', warn: true },
      { k: 'queue', v: 'dlq.netsuite' },
    ],
  },
  a3: {
    type: 'error-detail',
    label: 'Signal metrics',
    errorRows: [
      { k: 'health', v: '32 (–18)', warn: true },
      { k: 'usage w/w', v: '–68%', warn: true },
      { k: 'admin seat', v: 'inactive 9d' },
      { k: 'renews in', v: '11 days' },
    ],
  },
  a4: {
    type: 'field-drift',
    label: 'Field drift · stripe → crm',
    diffRows: [
      { label: 'plan_tier', left: 'enterprise', right: 'growth' },
      { label: 'mrr', left: '$4,800', right: '$3,600' },
    ],
  },
  a5: {
    type: 'error-detail',
    label: 'Queue state',
    errorRows: [
      { k: 'queue', v: 'n8n.webhooks' },
      { k: 'delay', v: '38m', warn: true },
      { k: 'backlog', v: '412 events' },
      { k: 'drain rate', v: '11 / s' },
      { k: 'sla', v: 'crossed 09:14', warn: true },
    ],
  },
  a6: {
    type: 'field-drift',
    label: 'Field drift · stripe → crm',
    diffRows: [
      { label: 'currency', left: 'USD', right: 'EUR' },
      { label: 'amount', left: '$11,500', right: '€10,580' },
    ],
  },
  a7: {
    type: 'field-drift',
    label: 'Field drift · stripe → crm',
    diffRows: [
      { label: 'tax_region', left: 'US-CA', right: 'US-TX' },
      { label: 'rate', left: '8.50%', right: '8.25%' },
    ],
  },
  a8: {
    type: 'error-detail',
    label: 'Missing fields',
    errorRows: [
      { k: 'invoices', v: '2' },
      { k: 'field', v: 'po_number', warn: true },
      { k: 'amount', v: '$7,300' },
    ],
  },
};

export const actionWhyNarratives: Record<string, string> = {
  a1: 'Highest open exposure ($48k), 2h 18m old, and the enterprise renewal lands in 3 days — ranked top of queue.',
  a2: 'Auto-retry budget exhausted — only manual replay clears it. Blocks invoice reconciliation for the account.',
  a3: 'Large ARR ($162k) with a sharp engagement drop close to renewal — the model flags elevated churn risk.',
  a4: 'Billing-vs-CRM mismatch with a clear causal event in Stripe — safe to auto-resolve toward Stripe.',
  a5: 'SLA threshold crossed, but the queue is self-healing — low intervention value unless drain stalls.',
  a6: 'FX booking error inflates recognized revenue — needs correction before close.',
  a7: 'Tax jurisdiction drift on active invoices — small dollar impact but compliance-sensitive.',
  a8: 'Low urgency — affects future sends, not current recognition.',
};

export const actionRecommendations: Record<string, string> = {
  a1: 'Apply a 14-day grace period and send a concierge recovery email from J. Cole. Stripe retry is already scheduled (1/3, +30m).',
  a2: 'The customer_id mapping is stale. Re-map to NetSuite internalId 4821 and replay the DLQ batch manually — auto-retry is exhausted.',
  a3: 'Trigger exec-sponsor outreach and schedule a value review before the renewal window. Loop in S. Park and the account team.',
  a4: 'Stripe shows a recent upgrade event (08:34). Accept Stripe as source of truth and push the corrected tier to the CRM.',
  a5: 'Infra is draining the backlog at 11/s; ETA to clear is ~40m. Snooze and monitor — page platform-on-call only if the delay exceeds 60m.',
  a6: 'NetSuite booked EUR as USD. Re-book with the day-of FX rate (1.087) and reconcile the invoice line items.',
  a7: 'Billing address changed to TX. Apply the TX jurisdiction and reissue the affected line items.',
  a8: 'Request PO numbers from Pinnacle AP before the next invoice send to avoid payment delays.',
};
