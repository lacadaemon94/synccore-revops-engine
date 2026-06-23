type EventType = 'webhook' | 'sync' | 'reconciler' | 'manual';
export type EventStatus = 'success' | 'failed' | 'pending' | 'retrying' | 'processed' | 'resolved' | 'routed_to_dlq' | 'escalated' | 'received';
export type EventSource = 'stripe' | 'hubspot' | 'internal' | 'n8n' | 'netsuite' | 'crm';
type ToneName = 'critical' | 'warn' | 'success' | 'link' | 'dim' | 'default';

export interface EventLogRow {
  id: string;
  eventId: string;
  timestamp: string;
  eventType: EventType;
  source: EventSource;
  accountName: string;
  accountHref: string;
  owner?: string;
  amount?: string;
  retries: number;
  status: EventStatus;
  type: string;
  summary: string;
  clock: string;
  rel: string;
  payload: unknown;
}

export interface EventLogTableProps {
  rows: EventLogRow[];
  onRowSelect?: (row: EventLogRow) => void;
}

interface NormalizedField {
  key: string;
  value: string;
  tone?: ToneName;
}

export interface PipelineStep {
  label: string;
  sub: string;
  time: string;
  tone: ToneName;
}

export interface EventDetail {
  eventId: string;
  type: string;
  status: string;
  provider: string;
  account: string;
  accountId: string;
  owner: string;
  amount: string;
  latency: string;
  retries: number;
  clock: string;
  rel: string;
  summary: string;
  normalized: NormalizedField[];
  raw: Record<string, unknown>;
  pipeline: PipelineStep[];
  primaryLabel: string;
}

export interface EventDetailDrawerProps {
  detail: EventDetail | null;
  open: boolean;
  onClose: () => void;
}
