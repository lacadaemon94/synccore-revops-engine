import type { ActionSummary, ActionDetail, ActionAssignee } from '@/components/Actions/local';
import { actionPayloads, actionWhyNarratives, actionRecommendations } from './actions-payloads';

export const actionSummaries: ActionSummary[] = [
  { id: 'a1', title: 'Failed renewal · invoice $48,000', severity: 'critical', status: 'open', assignee: { id: 'user1', name: 'J. Cole' }, accountName: 'Northwind Industrial', accountHref: '/accounts/northwind', createdAt: '2h 18m', snippet: 'Apply grace period and send recovery email', exposure: '$48k', type: 'stripe.payment_failed' },
  { id: 'a2', title: 'DLQ escalation · 6 retries exhausted', severity: 'critical', status: 'open', assignee: { id: 'user2', name: 'M. Reyes' }, accountName: 'Halcyon Logistics', accountHref: '/accounts/halcyon', createdAt: '4h 02m', snippet: 'Re-map customer_id and replay DLQ batch', exposure: '$24k', type: 'netsuite.sync_failed' },
  { id: 'a3', title: 'High-value churn signal · usage –68% w/w', severity: 'critical', status: 'open', assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Atlas Photonics', accountHref: '/accounts/atlas', createdAt: '6h 41m', snippet: 'Trigger exec sponsor outreach and value review', exposure: '$162k', type: 'churn_defuser' },
  { id: 'a4', title: 'CRM tier drift · enterprise → growth', severity: 'medium', status: 'open', assignee: { id: 'user2', name: 'M. Reyes' }, accountName: 'Acme Manufacturing', accountHref: '/accounts/acme', createdAt: '11h 04m', snippet: 'Accept Stripe as source of truth', exposure: '$1.2k/mo', type: 'reconciler.plan_tier' },
  { id: 'a5', title: 'Webhook backlog · n8n queue 38m delayed', severity: 'medium', status: 'open', assignee: { id: 'user4', name: 'platform-on-call' }, accountName: 'Platform · n8n', accountHref: '/accounts/platform', createdAt: '38m', snippet: 'Monitor queue drain; page if delay exceeds 60m', exposure: '—', type: 'infra.lag' },
  { id: 'a6', title: 'Currency mismatch on invoice', severity: 'medium', status: 'open', assignee: { id: 'user1', name: 'J. Cole' }, accountName: 'Quartz Analytics', accountHref: '/accounts/quartz', createdAt: '2h', snippet: 'Re-book with day-of FX rate', exposure: '$11.5k', type: 'reconciler.fx' },
  { id: 'a7', title: 'Tax region mismatch on line items', severity: 'medium', status: 'open', assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Forge Dynamics', accountHref: '/accounts/forge', createdAt: '1h', snippet: 'Apply TX jurisdiction and reissue line items', exposure: '$5.5k', type: 'reconciler.tax' },
  { id: 'a8', title: 'PO number missing on 2 invoices', severity: 'low', status: 'open', assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Pinnacle Foods', accountHref: '/accounts/pinnacle', createdAt: '5h', snippet: 'Request PO numbers before next invoice send', exposure: '$7.3k', type: 'reconciler.po_number' },
];

export const actionDetails: Record<string, ActionDetail> = {
  a1: {
    id: 'a1', title: 'Failed renewal · invoice $48,000', severity: 'critical', status: 'open',
    assignee: { id: 'user1', name: 'J. Cole' }, accountName: 'Northwind Industrial', accountHref: '/accounts/northwind',
    createdAt: '2h 18m', snippet: 'Apply grace period and send recovery email',
    description: 'Apply a 14-day grace period and send a concierge recovery email from J. Cole. Stripe retry is already scheduled (1/3, +30m).',
    recommendation: actionRecommendations.a1,
    whyNarrative: actionWhyNarratives.a1,
    payload: actionPayloads.a1,
    logs: [
      { id: 'log1', timestamp: '2025-06-21T09:18:00Z', actor: 'System', message: 'invoice.payment_failed · stripe · evt_3OrLkPa9F' },
      { id: 'log2', timestamp: '2025-06-21T09:18:00Z', actor: 'System', message: 'action.proposed · churn-defuser · auto-assigned J. Cole' },
      { id: 'log3', timestamp: '2025-06-21T09:18:00Z', actor: 'System', message: 'retry.scheduled · +30m · attempt 1/3' },
    ],
    timeline: [
      { kind: 'invoice', label: 'invoice.payment_failed', sub: 'stripe · evt_3OrLkPa9F', time: '09:18' },
      { kind: 'action', label: 'action.proposed · churn-defuser', sub: 'auto-assigned J. Cole', time: '09:18' },
      { kind: 'recovery', label: 'retry.scheduled · +30m', sub: 'attempt 1/3 · backoff 30/60/240m', time: '09:18' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a2: {
    id: 'a2', title: 'DLQ escalation · 6 retries exhausted', severity: 'critical', status: 'open',
    assignee: { id: 'user2', name: 'M. Reyes' }, accountName: 'Halcyon Logistics', accountHref: '/accounts/halcyon',
    createdAt: '4h 02m', snippet: 'Re-map customer_id and replay DLQ batch',
    description: 'The customer_id mapping is stale. Re-map to NetSuite internalId 4821 and replay the DLQ batch manually — auto-retry is exhausted.',
    recommendation: actionRecommendations.a2,
    whyNarrative: actionWhyNarratives.a2,
    payload: actionPayloads.a2,
    logs: [
      { id: 'log4', timestamp: '2025-06-21T08:56:00Z', actor: 'System', message: 'sync.failed · INVALID_REF · netsuite · customer_id' },
      { id: 'log5', timestamp: '2025-06-21T09:02:00Z', actor: 'System', message: 'retries.exhausted · 6/6 · moved to DLQ' },
      { id: 'log6', timestamp: '2025-06-21T09:05:00Z', actor: 'System', message: 'action.escalated · priority bumped to critical' },
    ],
    timeline: [
      { kind: 'invoice', label: 'sync.failed · INVALID_REF', sub: 'netsuite · customer_id', time: '08:56' },
      { kind: 'invoice', label: 'retries.exhausted · 6/6', sub: 'moved to DLQ', time: '09:02' },
      { kind: 'action', label: 'action.escalated', sub: 'priority bumped to critical', time: '09:05' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a3: {
    id: 'a3', title: 'High-value churn signal · usage –68% w/w', severity: 'critical', status: 'open',
    assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Atlas Photonics', accountHref: '/accounts/atlas',
    createdAt: '6h 41m', snippet: 'Trigger exec sponsor outreach and value review',
    description: 'Trigger exec-sponsor outreach and schedule a value review before the renewal window. Loop in S. Park and the account team.',
    recommendation: actionRecommendations.a3,
    whyNarrative: actionWhyNarratives.a3,
    payload: actionPayloads.a3,
    logs: [
      { id: 'log7', timestamp: '2025-06-21T07:50:00Z', actor: 'System', message: 'health.recomputed · 32 · usage + engagement model' },
      { id: 'log8', timestamp: '2025-06-21T06:20:00Z', actor: 'System', message: 'usage.reported · –68% w/w · product telemetry' },
      { id: 'log9', timestamp: '2025-06-21T07:51:00Z', actor: 'System', message: 'action.proposed · outreach · suggested owner S. Park' },
    ],
    timeline: [
      { kind: 'drift', label: 'health.recomputed · 32', sub: 'usage + engagement model', time: '07:50' },
      { kind: 'event', label: 'usage.reported · –68% w/w', sub: 'product telemetry', time: '06:20' },
      { kind: 'action', label: 'action.proposed · outreach', sub: 'suggested owner S. Park', time: '07:51' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a4: {
    id: 'a4', title: 'CRM tier drift · enterprise → growth', severity: 'medium', status: 'open',
    assignee: { id: 'user2', name: 'M. Reyes' }, accountName: 'Acme Manufacturing', accountHref: '/accounts/acme',
    createdAt: '11h 04m', snippet: 'Accept Stripe as source of truth',
    description: 'Stripe shows a recent upgrade event (08:34). Accept Stripe as source of truth and push the corrected tier to the CRM.',
    recommendation: actionRecommendations.a4,
    whyNarrative: actionWhyNarratives.a4,
    payload: actionPayloads.a4,
    logs: [
      { id: 'log10', timestamp: '2025-06-21T09:11:00Z', actor: 'System', message: 'drift.detected · plan_tier · stripe ent ≠ crm growth' },
      { id: 'log11', timestamp: '2025-06-21T08:34:00Z', actor: 'System', message: 'customer.updated · upgraded · stripe' },
    ],
    timeline: [
      { kind: 'drift', label: 'drift.detected · plan_tier', sub: 'stripe ent ≠ crm growth', time: '09:11' },
      { kind: 'event', label: 'customer.updated · upgraded', sub: 'stripe · pre-drift cause', time: '08:34' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a5: {
    id: 'a5', title: 'Webhook backlog · n8n queue 38m delayed', severity: 'medium', status: 'open',
    assignee: { id: 'user4', name: 'platform-on-call' }, accountName: 'Platform · n8n', accountHref: '/accounts/platform',
    createdAt: '38m', snippet: 'Monitor queue drain; page if delay exceeds 60m',
    description: 'Infra is draining the backlog at 11/s; ETA to clear is ~40m. Snooze and monitor — page platform-on-call only if the delay exceeds 60m.',
    recommendation: actionRecommendations.a5,
    whyNarrative: actionWhyNarratives.a5,
    payload: actionPayloads.a5,
    logs: [
      { id: 'log12', timestamp: '2025-06-21T09:14:00Z', actor: 'System', message: 'sla.crossed · webhooks · threshold 30m' },
      { id: 'log13', timestamp: '2025-06-21T09:16:00Z', actor: 'System', message: 'autoscale.triggered · +2 workers' },
    ],
    timeline: [
      { kind: 'event', label: 'sla.crossed · webhooks', sub: 'threshold 30m', time: '09:14' },
      { kind: 'recovery', label: 'autoscale.triggered', sub: '+2 workers', time: '09:16' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a6: {
    id: 'a6', title: 'Currency mismatch on invoice', severity: 'medium', status: 'open',
    assignee: { id: 'user1', name: 'J. Cole' }, accountName: 'Quartz Analytics', accountHref: '/accounts/quartz',
    createdAt: '2h', snippet: 'Re-book with day-of FX rate',
    description: 'NetSuite booked EUR as USD. Re-book with the day-of FX rate (1.087) and reconcile the invoice line items.',
    recommendation: actionRecommendations.a6,
    whyNarrative: actionWhyNarratives.a6,
    payload: actionPayloads.a6,
    logs: [
      { id: 'log14', timestamp: '2025-06-21T07:10:00Z', actor: 'System', message: 'drift.detected · fx · netsuite EUR ≠ stripe USD' },
    ],
    timeline: [
      { kind: 'drift', label: 'drift.detected · fx', sub: 'netsuite EUR ≠ stripe USD', time: '07:10' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a7: {
    id: 'a7', title: 'Tax region mismatch on line items', severity: 'medium', status: 'open',
    assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Forge Dynamics', accountHref: '/accounts/forge',
    createdAt: '1h', snippet: 'Apply TX jurisdiction and reissue line items',
    description: 'Billing address changed to TX. Apply the TX jurisdiction and reissue the affected line items.',
    recommendation: actionRecommendations.a7,
    whyNarrative: actionWhyNarratives.a7,
    payload: actionPayloads.a7,
    logs: [
      { id: 'log15', timestamp: '2025-06-21T08:05:00Z', actor: 'System', message: 'drift.detected · tax_region · netsuite vs stripe address' },
    ],
    timeline: [
      { kind: 'drift', label: 'drift.detected · tax_region', sub: 'netsuite vs stripe address', time: '08:05' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
  a8: {
    id: 'a8', title: 'PO number missing on 2 invoices', severity: 'low', status: 'open',
    assignee: { id: 'user3', name: 'S. Park' }, accountName: 'Pinnacle Foods', accountHref: '/accounts/pinnacle',
    createdAt: '5h', snippet: 'Request PO numbers before next invoice send',
    description: 'Request PO numbers from Pinnacle AP before the next invoice send to avoid payment delays.',
    recommendation: actionRecommendations.a8,
    whyNarrative: actionWhyNarratives.a8,
    payload: actionPayloads.a8,
    logs: [
      { id: 'log16', timestamp: '2025-06-21T04:40:00Z', actor: 'System', message: 'drift.detected · po_number · auto-queued for reconciler' },
    ],
    timeline: [
      { kind: 'drift', label: 'drift.detected · po_number', sub: 'auto-queued for reconciler', time: '04:40' },
    ],
    createdBy: { id: 'sys1', name: 'System' },
  },
};

export const actionAssignees: ActionAssignee[] = [
  { id: 'user1', name: 'J. Cole' },
  { id: 'user2', name: 'M. Reyes' },
  { id: 'user3', name: 'S. Park' },
  { id: 'user4', name: 'platform-on-call' },
];
