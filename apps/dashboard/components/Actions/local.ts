export type ActionSeverity = 'critical' | 'high' | 'medium' | 'low';
type ActionStatus = 'open' | 'in-progress' | 'resolved' | 'snoozed';
type ActionPayloadType = 'field-drift' | 'error-detail' | 'payload-metrics';

export interface ActionAssignee {
  id: string;
  name: string;
}

export interface ActionSummary {
  id: string;
  title: string;
  severity: ActionSeverity;
  status: ActionStatus;
  assignee: ActionAssignee | null;
  accountName: string;
  accountHref: string;
  createdAt: string;
  snippet: string;
  exposure?: string;
  type?: string;
}

export interface ActionsListProps {
  actions: ActionSummary[];
}

interface ActionLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  message: string;
}

export interface ActionFieldDriftRow {
  label: string;
  left: string;
  right: string;
}

export interface ActionErrorRow {
  k: string;
  v: string;
  warn?: boolean;
}

export interface ActionPayloadData {
  type: ActionPayloadType;
  label: string;
  diffRows?: ActionFieldDriftRow[];
  errorRows?: ActionErrorRow[];
}

interface ActionTimelineEvent {
  kind: 'invoice' | 'action' | 'recovery' | 'drift' | 'event' | 'engagement';
  label: string;
  sub: string;
  time: string;
}

export interface ActionDetail extends ActionSummary {
  description: string;
  logs: ActionLogEntry[];
  createdBy: { id: string; name: string };
  recommendation?: string;
  primaryLabel?: string;
  whyNarrative?: string;
  payload?: ActionPayloadData;
  timeline?: ActionTimelineEvent[];
}

export interface ActionDetailPanelProps {
  action: ActionDetail | null;
  onClose: () => void;
  onSnooze: () => Promise<void>;
  onResolve: () => Promise<void>;
  assigneeOptions: ActionAssignee[];
  onAssigneeChange: (id: string | null) => void;
}
