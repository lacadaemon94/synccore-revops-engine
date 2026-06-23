import type {
  AccountOpenAction,
  AccountRecentEvent,
  AccountSyncSource,
  AccountContact,
} from '@/components/Accounts/local';

interface AccountDetailMetadata {
  seats: string;
  region: string;
  recovered: string;
  lastSync: string;
}

export const accountOpenActions: Record<string, AccountOpenAction[]> = {
  northwind: [
    {
      id: 'action-nw-001',
      title: 'Failed renewal · invoice $48,000',
      severity: 'critical',
      meta: 'stripe.payment_failed · 14d grace recommended',
      age: '2h 18m',
    },
    {
      id: 'action-nw-002',
      title: 'DLQ escalation · 6 retries exhausted',
      severity: 'critical',
      meta: 'netsuite.sync_failed · manual replay only',
      age: '4h 02m',
    },
    {
      id: 'action-nw-003',
      title: 'Seat utilization dropped 22%',
      severity: 'medium',
      meta: 'usage signal · admin review suggested',
      age: '1d 04h',
    },
  ],
  atlas: [
    {
      id: 'action-atlas-001',
      title: 'High-value churn signal · usage –68% w/w',
      severity: 'critical',
      meta: 'churn_defuser · exec sponsor outreach',
      age: '6h 41m',
    },
    {
      id: 'action-atlas-002',
      title: 'Admin seat inactive 9 days',
      severity: 'medium',
      meta: 'engagement risk · renews in 11d',
      age: '9d',
    },
  ],
  halcyon: [
    {
      id: 'action-halcyon-001',
      title: 'DLQ replay · NetSuite mapping',
      severity: 'high',
      meta: 'netsuite.sync_failed · manual replay',
      age: '22m',
    },
    {
      id: 'action-halcyon-002',
      title: 'Webhook backlog acknowledged',
      severity: 'medium',
      meta: 'infra.lag · catching up 11/s',
      age: '38m',
    },
  ],
  meridian: [
    {
      id: 'action-meridian-001',
      title: 'Renewal prep · 204k due Nov',
      severity: 'low',
      meta: 'playbook.renewal · 120d out',
      age: '2d',
    },
  ],
};

export const accountRecentEvents: Record<string, AccountRecentEvent[]> = {
  northwind: [
    {
      id: 'event-nw-001',
      kind: 'invoice',
      label: 'invoice.payment_failed · $48k',
      sub: 'stripe · evt_3OrLkPa9F',
      time: '09:18',
    },
    {
      id: 'event-nw-002',
      kind: 'action',
      label: 'action.proposed · churn-defuser · 14d grace',
      sub: 'auto-assigned J. Cole',
      time: '09:18',
    },
    {
      id: 'event-nw-003',
      kind: 'recovery',
      label: 'retry.scheduled · stripe · in 30m',
      sub: 'attempt 1/3 · backoff 30/60/240m',
      time: '09:18',
    },
  ],
  atlas: [
    {
      id: 'event-atlas-001',
      kind: 'drift',
      label: 'health.recomputed · 32 (–18)',
      sub: 'usage + engagement model',
      time: '07:50',
    },
    {
      id: 'event-atlas-002',
      kind: 'event',
      label: 'usage.reported · –68% w/w',
      sub: 'product telemetry',
      time: '06:20',
    },
    {
      id: 'event-atlas-003',
      kind: 'recovery',
      label: 'recovery.succeeded · $12k',
      sub: 'retry 2/3 cleared last week',
      time: 'Jun 10',
    },
  ],
  halcyon: [
    {
      id: 'event-halcyon-001',
      kind: 'invoice',
      label: 'sync.failed · netsuite · INVALID_REF',
      sub: 'customer_id mapping',
      time: '08:56',
    },
    {
      id: 'event-halcyon-002',
      kind: 'action',
      label: 'action.resolved · ack manual',
      sub: 'M. Reyes · webhook backlog',
      time: '08:12',
    },
    {
      id: 'event-halcyon-003',
      kind: 'event',
      label: 'customer.updated · owner',
      sub: 'crm drift cause',
      time: '07:30',
    },
  ],
  meridian: [
    {
      id: 'event-meridian-001',
      kind: 'recovery',
      label: 'recovery.succeeded · $9.2k',
      sub: 'retry 1/3 cleared',
      time: 'Jun 11',
    },
    {
      id: 'event-meridian-002',
      kind: 'event',
      label: 'invoice.paid · $17k',
      sub: 'stripe · on time',
      time: 'Jun 01',
    },
  ],
};

export const accountSyncSources: Record<string, AccountSyncSource[]> = {
  northwind: [
    {
      id: 'sync-nw-stripe',
      name: 'Stripe',
      state: 'failed',
      detail: 'invoice.payment_failed · do_not_honor',
      last: '2m ago',
    },
    {
      id: 'sync-nw-netsuite',
      name: 'NetSuite',
      state: 'drift',
      detail: 'INVALID_REF on customer mapping',
      last: '14m ago',
    },
    {
      id: 'sync-nw-crm',
      name: 'CRM · HubSpot',
      state: 'synced',
      detail: 'tier enterprise · in agreement',
      last: '2m ago',
    },
  ],
  atlas: [
    {
      id: 'sync-atlas-stripe',
      name: 'Stripe',
      state: 'synced',
      detail: 'active · $13.5k MRR',
      last: '6m ago',
    },
    {
      id: 'sync-atlas-netsuite',
      name: 'NetSuite',
      state: 'synced',
      detail: 'invoices reconciled',
      last: '6m ago',
    },
    {
      id: 'sync-atlas-crm',
      name: 'CRM · HubSpot',
      state: 'drift',
      detail: 'admin seat inactive 9d · health 32',
      last: '1h ago',
    },
  ],
  halcyon: [
    {
      id: 'sync-halcyon-stripe',
      name: 'Stripe',
      state: 'synced',
      detail: 'active · $8k MRR',
      last: '4m ago',
    },
    {
      id: 'sync-halcyon-netsuite',
      name: 'NetSuite',
      state: 'failed',
      detail: 'INVALID_REF on customer_id',
      last: '22m ago',
    },
    {
      id: 'sync-halcyon-crm',
      name: 'CRM · HubSpot',
      state: 'drift',
      detail: 'owner mismatch · M. Reyes vs A. Lim',
      last: '40m ago',
    },
  ],
  meridian: [
    {
      id: 'sync-meridian-stripe',
      name: 'Stripe',
      state: 'synced',
      detail: 'active · $17k MRR',
      last: '1m ago',
    },
    {
      id: 'sync-meridian-netsuite',
      name: 'NetSuite',
      state: 'synced',
      detail: 'invoices reconciled',
      last: '1m ago',
    },
    {
      id: 'sync-meridian-crm',
      name: 'CRM · HubSpot',
      state: 'synced',
      detail: 'in agreement',
      last: '1m ago',
    },
  ],
};

export const accountContacts: Record<string, AccountContact[]> = {
  northwind: [
    {
      id: 'contact-nw-001',
      name: 'Dana Whitfield',
      role: 'VP Finance',
      email: 'dana@northwind.co',
    },
    {
      id: 'contact-nw-002',
      name: 'Marcus Bell',
      role: 'Admin · primary',
      email: 'marcus@northwind.co',
    },
  ],
  atlas: [
    {
      id: 'contact-atlas-001',
      name: 'Priya Anand',
      role: 'Director Eng',
      email: 'priya@atlasph.io',
    },
    {
      id: 'contact-atlas-002',
      name: 'Tom Reeves',
      role: 'Procurement',
      email: 'tom@atlasph.io',
    },
  ],
  halcyon: [
    {
      id: 'contact-halcyon-001',
      name: 'Greg Marsh',
      role: 'Ops Lead',
      email: 'greg@halcyon.com',
    },
    {
      id: 'contact-halcyon-002',
      name: 'Nadia Okoro',
      role: 'Finance',
      email: 'nadia@halcyon.com',
    },
  ],
  meridian: [
    {
      id: 'contact-meridian-001',
      name: 'Dr. Alan Ford',
      role: 'VP Operations',
      email: 'alan@meridianhealth.org',
    },
    {
      id: 'contact-meridian-002',
      name: 'Beth Kaur',
      role: 'Procurement',
      email: 'beth@meridianhealth.org',
    },
  ],
};

export const accountDetailMetadata: Record<string, AccountDetailMetadata> = {
  northwind: {
    seats: '140/180',
    region: 'us-east-1',
    recovered: '$0',
    lastSync: '2m ago',
  },
  atlas: {
    seats: '88/120',
    region: 'eu-west-1',
    recovered: '$12k',
    lastSync: '6m ago',
  },
  halcyon: {
    seats: '54/80',
    region: 'us-east-1',
    recovered: '$4.1k',
    lastSync: '4m ago',
  },
  meridian: {
    seats: '160/200',
    region: 'us-east-1',
    recovered: '$9.2k',
    lastSync: '1m ago',
  },
};
