import type { TriageRow } from '@/components/Dashboard/local';

/**
 * Triage row fixtures for the "Needs you now" section.
 * 5 ranked items by exposure × age, with severity and action hints.
 */

export const triageRows: TriageRow[] = [
  {
    id: 'n1',
    severity: 'critical',
    title: 'Failed renewal · invoice $48,000',
    type: 'stripe.payment_failed',
    description: [
      { text: 'Card declined · ', tone: undefined },
      { text: 'do_not_honor', tone: 'warn' },
      { text: '. Recommended: 14d grace + concierge email from J. Cole.' },
    ],
    accountName: 'Northwind Industrial',
    accountMeta: 'enterprise · J. Cole',
    age: '2h 18m',
    isCriticalAge: true,
    actionLabel: 'Resolve',
    isSecondaryAction: false,
  },
  {
    id: 'n2',
    severity: 'critical',
    title: 'DLQ escalation · 6 retries exhausted',
    type: 'netsuite.sync_failed',
    description: [
      { text: 'NetSuite returned ', tone: undefined },
      { text: 'INVALID_REF', tone: 'warn' },
      { text: ' on customer_id mapping. Manual replay only.' },
    ],
    accountName: 'Halcyon Logistics',
    accountMeta: 'growth · M. Reyes',
    age: '4h 02m',
    isCriticalAge: true,
    actionLabel: 'Force retry',
    isSecondaryAction: false,
  },
  {
    id: 'n3',
    severity: 'high',
    title: 'High-value churn signal · usage –68% w/w',
    type: 'churn_defuser',
    description: [
      {
        text: 'Renews in 11 days · admin seat inactive 9d · health score 32. Suggested: exec sponsor outreach.',
      },
    ],
    accountName: 'Atlas Photonics',
    accountMeta: 'enterprise · S. Park',
    age: '6h 41m',
    isCriticalAge: false,
    actionLabel: 'Assign',
    isSecondaryAction: false,
  },
  {
    id: 'n4',
    severity: 'medium',
    title: 'CRM tier drift · enterprise → growth',
    type: 'reconciler.plan_tier',
    description: [
      { text: 'Stripe says ', tone: undefined },
      { text: '$4,800/mo', tone: 'bright' },
      { text: ' · CRM says ', tone: undefined },
      { text: '$3,600/mo', tone: 'bright' },
      { text: '. Suggested: accept Stripe (recent upgrade event).' },
    ],
    accountName: 'Acme Manufacturing',
    accountMeta: 'growth · M. Reyes',
    age: '11h 04m',
    isCriticalAge: false,
    actionLabel: 'Accept Stripe',
    isSecondaryAction: false,
  },
  {
    id: 'n5',
    severity: 'medium',
    title: 'Webhook backlog · n8n queue 38m delayed',
    type: 'infra.lag',
    description: [
      {
        text: 'SLA threshold crossed at 09:14. 412 events queued · catching up at 11/s.',
      },
    ],
    accountName: 'Platform · n8n',
    accountMeta: 'infra · platform-on-call',
    age: '38m',
    isCriticalAge: false,
    actionLabel: 'Snooze 1h',
    isSecondaryAction: true,
  },
];
