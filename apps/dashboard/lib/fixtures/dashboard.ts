import type { ActivityGroup } from '@/components/Dashboard/local';

export const dashboardActivityGroups: ActivityGroup[] = [
  {
    id: 'today-09',
    label: 'Today · 09:00',
    count: 7,
    items: [
      { id: 'a1', kind: 'action', label: 'invoice.payment_failed · Northwind · $48k', sub: 'stripe · evt_3OrLkPa9F', time: '09:18', href: '/events?id=evt_3OrLkPa9F' },
      { id: 'a2', kind: 'action', label: 'action.proposed · churn-defuser · 14d grace', sub: '→ Northwind · auto-assigned J. Cole', time: '09:18', href: '/actions?id=a1' },
      { id: 'a3', kind: 'recovery', label: 'retry.scheduled · stripe · in 30m', sub: 'attempt 1/3 · backoff 30m/60m/240m', time: '09:18', href: '/queue' },
      { id: 'a4', kind: 'drift', label: 'drift.detected · plan_tier · Acme', sub: 'stripe enterprise ≠ crm growth · auto-suggest stripe', time: '09:11', href: '/reconciler' },
    ],
  },
  {
    id: 'today-08',
    label: 'Today · 08:00',
    count: 22,
    items: [
      { id: 'b1', kind: 'recovery', label: 'recovery.succeeded · stripe · $14.2k', sub: 'Vector Robotics · retry 2/3 cleared', time: '08:42', href: '/queue' },
      { id: 'b2', kind: 'event', label: 'customer.updated · Acme · plan upgraded', sub: 'stripe · pre-drift cause', time: '08:34', href: '/events' },
      { id: 'b3', kind: 'recovery', label: 'action.resolved · M. Reyes · ack manual', sub: "Halcyon · webhook backlog ack'd", time: '08:12', href: '/actions' },
    ],
  },
];
