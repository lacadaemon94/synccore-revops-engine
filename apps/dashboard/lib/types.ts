export type EventStatus = "received" | "processed" | "failed" | "routed_to_dlq" | "pending" | "retrying" | "resolved" | "escalated";
export type QueueStatus = "pending" | "retrying" | "resolved" | "failed" | "escalated";
export type DiscrepancySeverity = "low" | "medium" | "high";
export type DiscrepancyStatus = "open" | "reviewing" | "resolved";
export type RevenueRiskLevel = "stable" | "watch" | "urgent";
export type ChurnRiskLevel = "low" | "medium" | "high" | "critical";
export type ChurnDefuserActionStatus = "simulated" | "queued" | "existing" | "skipped";
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
  helper: string;
  tone?: "default" | "positive" | "warning" | "danger";
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
};
