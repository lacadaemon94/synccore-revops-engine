export type EventStatus = "received" | "processed" | "failed" | "routed_to_dlq" | "pending" | "retrying" | "resolved" | "escalated";
export type QueueStatus = "pending" | "retrying" | "resolved" | "failed" | "escalated";
export type DiscrepancySeverity = "low" | "medium" | "high";
export type DiscrepancyStatus = "open" | "reviewing" | "resolved";
export type RevenueRiskLevel = "stable" | "watch" | "urgent";
export type ChurnRiskLevel = "low" | "medium" | "high" | "critical";
export type ActionSeverity = "low" | "medium" | "high" | "critical";
export type ActionStatus = "queued" | "sent" | "acknowledged" | "ignored" | "resolved";
export type ActionSource = "notification_outbox" | "churn_defuser" | "mock_crm_task" | "dlq_escalation";
export type ChurnDefuserActionStatus = ActionStatus | "simulated" | "existing" | "skipped";
export type RetryFailureClass = "availability" | "rate_limit" | "timeout" | "validation" | "authentication" | "unknown";
export type RetryOutcomeHint = "resolve" | "retryable_failure" | "non_retryable_failure";

export type Account = {
  id: string;
  name: string;
  domain: string;
  lifecycleStage: string;
  segment: string;
  owner: string;
  mrr: number;
  arr: number;
  ltv: number;
  healthScore: number;
  usageDensity: number;
  revenueAtRisk: number;
  riskLevel: RevenueRiskLevel;
  nextRenewalAt: string;
};

export type RevOpsEvent = {
  id: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  accountId: string;
  accountName: string;
  status: EventStatus;
  receivedAt: string;
  retryCount: number;
  amount?: number;
  summary: string;
};

export type QueueItem = {
  id: string;
  eventId: string;
  accountId: string;
  accountName: string;
  targetSystem: string;
  status: QueueStatus;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: null | string;
  lastError: string;
  lastAttemptAt?: null | string;
  resolvedAt?: null | string;
  createdAt?: string;
  failureClass?: RetryFailureClass;
  escalationRecommended?: boolean;
  retrySummary?: string;
  retryOutcomeHint?: RetryOutcomeHint;
};

export type Discrepancy = {
  id: string;
  accountId: string;
  accountName: string;
  sourceA: string;
  sourceB: string;
  fieldName: string;
  sourceAValue: string;
  sourceBValue: string;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  scenario: string;
  impact: string;
  suggestedAction: string;
};

export type Metric = {
  label: string;
  value: string;
  helper?: string;
  trend?: number[];
  tone?: "default" | "positive" | "warning" | "danger";
};

export type NotificationOutboxItem = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  body: string;
  source: "notification_outbox";
  severity: ActionSeverity;
  status: ActionStatus;
  recommendedOwner: string;
  suggestedNextStep: string;
  createdAt: string;
  channel?: string;
  recipient?: string;
};

export type MockCrmTask = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  description: string;
  source: "mock_crm_task";
  severity: ActionSeverity;
  status: ActionStatus;
  recommendedOwner: string;
  suggestedNextStep: string;
  createdAt: string;
};

export type OpsAction = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  body?: string;
  description?: string;
  source: ActionSource;
  severity: ActionSeverity;
  status: ActionStatus;
  recommendedOwner: string;
  suggestedNextStep: string;
  createdAt: string;
};

export type ChurnDefuserAction = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  body: string;
  providerEventId: string;
  eventType: string;
  riskLevel: ChurnRiskLevel;
  recommendedAction: string;
  recommendedOwner: string;
  requiresHumanTask: boolean;
  shouldNotifyOps: boolean;
  gracePeriodRecommendation: string;
  status: ChurnDefuserActionStatus;
  createdAt: string;
  suggestedNextStep?: string;
};
