type AccountHealth = 'healthy' | 'at-risk' | 'renewing' | 'churn-risk';
type AccountPlanTier = 'free' | 'starter' | 'growth' | 'enterprise';
type SyncStatus = 'in-sync' | 'syncing' | 'stale' | 'failed';

export interface AccountSummary {
  id: string;
  name: string;
  health: AccountHealth;
  renewalDate: string;
  owner: { name: string; email?: string };
  planTier: AccountPlanTier;
  metadata: Record<string, string>;
}

export interface AccountTableRow {
  id: string;
  name: string;
  metadata?: string;
  segment?: string;
  owner?: string;
  mrr: string;
  health: AccountHealth;
  healthScore: number;
  syncStatus: SyncStatus;
  openIssues: number;
  lastActivity: string;
}

export interface AccountsTableProps {
  rows: AccountTableRow[];
  shownCount?: number;
  totalCount?: number;
}

/* Account detail sections */

export type ActionSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface AccountOpenAction {
  id: string;
  title: string;
  severity: ActionSeverity;
  meta: string;
  age: string;
}

export interface AccountOpenActionsProps {
  actions: AccountOpenAction[];
}

type EventKind = 'invoice' | 'action' | 'recovery' | 'drift' | 'event';

export interface AccountRecentEvent {
  id: string;
  kind: EventKind;
  label: string;
  sub: string;
  time: string;
}

export interface AccountRecentEventsProps {
  events: AccountRecentEvent[];
}

type AccountSyncSourceState = 'synced' | 'drift' | 'failed';

export interface AccountSyncSource {
  id: string;
  name: string;
  state: AccountSyncSourceState;
  detail: string;
  last: string;
}

export interface AccountSyncStatusProps {
  sources: AccountSyncSource[];
}

export interface AccountContact {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface AccountContactsProps {
  contacts: AccountContact[];
}
