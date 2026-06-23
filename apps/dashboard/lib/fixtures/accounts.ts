import type {
  AccountTableRow,
  AccountSummary,
} from '@/components/Accounts/local';

export const accountRows: AccountTableRow[] = [
  { id: 'northwind', name: 'Northwind Industrial', segment: 'enterprise', owner: 'J. Cole', metadata: 'acme · prod', mrr: '$20,667', health: 'churn-risk', healthScore: 32, syncStatus: 'failed', openIssues: 3, lastActivity: '26 Jun' },
  { id: 'atlas', name: 'Atlas Photonics', segment: 'enterprise', owner: 'S. Park', metadata: 'crm sync drift', mrr: '$13,500', health: 'churn-risk', healthScore: 38, syncStatus: 'stale', openIssues: 2, lastActivity: '25 Jun' },
  { id: 'quartz', name: 'Quartz Analytics', segment: 'enterprise', owner: 'J. Cole', metadata: 'currency mismatch', mrr: '$11,500', health: 'at-risk', healthScore: 47, syncStatus: 'stale', openIssues: 1, lastActivity: '17 Oct' },
  { id: 'forge', name: 'Forge Dynamics', segment: 'growth', owner: 'S. Park', metadata: 'tax region drift', mrr: '$5,500', health: 'at-risk', healthScore: 54, syncStatus: 'stale', openIssues: 1, lastActivity: '05 Sep' },
  { id: 'halcyon', name: 'Halcyon Logistics', segment: 'growth', owner: 'M. Reyes', metadata: 'netsuite failed', mrr: '$8,000', health: 'at-risk', healthScore: 58, syncStatus: 'failed', openIssues: 2, lastActivity: '18 Sep' },
  { id: 'acme', name: 'Acme Manufacturing', segment: 'growth', owner: 'M. Reyes', metadata: 'crm drift detected', mrr: '$4,800', health: 'at-risk', healthScore: 67, syncStatus: 'stale', openIssues: 1, lastActivity: '03 Aug' },
  { id: 'pinnacle', name: 'Pinnacle Foods', segment: 'growth', owner: 'S. Park', metadata: 'po number issue', mrr: '$7,300', health: 'healthy', healthScore: 69, syncStatus: 'stale', openIssues: 0, lastActivity: '22 Oct' },
  { id: 'meridian', name: 'Meridian Health', segment: 'enterprise', owner: 'J. Cole', metadata: 'renewal prep', mrr: '$17,000', health: 'healthy', healthScore: 74, syncStatus: 'in-sync', openIssues: 1, lastActivity: '09 Nov' },
  { id: 'vector', name: 'Vector Robotics', segment: 'growth', owner: 'A. Lim', metadata: 'subscription renewed', mrr: '$4,500', health: 'healthy', healthScore: 81, syncStatus: 'in-sync', openIssues: 0, lastActivity: '14 Jul' },
  { id: 'cobalt', name: 'Cobalt Systems', segment: 'enterprise', owner: 'A. Lim', metadata: 'all reconciled', mrr: '$14,667', health: 'healthy', healthScore: 85, syncStatus: 'in-sync', openIssues: 0, lastActivity: '30 Dec' },
  { id: 'sable', name: 'Sable Media', segment: 'starter', owner: 'A. Lim', metadata: 'invoice paid', mrr: '$1,583', health: 'healthy', healthScore: 88, syncStatus: 'in-sync', openIssues: 0, lastActivity: '28 Jul' },
  { id: 'lumen', name: 'Lumen Retail', segment: 'starter', owner: 'M. Reyes', metadata: 'self-serve upgrade', mrr: '$2,000', health: 'healthy', healthScore: 91, syncStatus: 'in-sync', openIssues: 0, lastActivity: '12 Aug' },
];

export const accountSummaries: Record<string, AccountSummary> = {
  northwind: {
    id: 'northwind',
    name: 'Northwind Industrial',
    health: 'at-risk',
    renewalDate: '26 Jun 2026',
    owner: { name: 'J. Cole', email: 'j.cole@company.com' },
    planTier: 'enterprise',
    metadata: { segment: 'enterprise', region: 'us-east-1', recovered: '$0' },
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas Photonics',
    health: 'at-risk',
    renewalDate: '25 Jun 2026',
    owner: { name: 'S. Park', email: 's.park@company.com' },
    planTier: 'enterprise',
    metadata: { segment: 'enterprise', region: 'eu-west-1', recovered: '$12k' },
  },
  halcyon: {
    id: 'halcyon',
    name: 'Halcyon Logistics',
    health: 'renewing',
    renewalDate: '18 Sep 2026',
    owner: { name: 'M. Reyes', email: 'm.reyes@company.com' },
    planTier: 'growth',
    metadata: { segment: 'growth', region: 'us-east-1', recovered: '$4.1k' },
  },
  meridian: {
    id: 'meridian',
    name: 'Meridian Health',
    health: 'healthy',
    renewalDate: '09 Nov 2026',
    owner: { name: 'J. Cole', email: 'j.cole@company.com' },
    planTier: 'enterprise',
    metadata: { segment: 'enterprise', region: 'us-east-1', recovered: '$9.2k' },
  },
};

