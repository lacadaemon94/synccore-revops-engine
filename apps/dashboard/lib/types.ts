export type Account = {
  id: string;
  name: string;
  domain: string;
  lifecycleStage: string;
  mrr: number;
  arr: number;
  ltv: number;
  healthScore: number;
  usageDensity: number;
};

export type RevOpsEvent = {
  id: string;
  providerEventId: string;
  eventType: string;
  accountId: string;
  accountName: string;
  status: "received" | "processed" | "routed_to_dlq" | "failed";
  receivedAt: string;
  retryCount: number;
  amount?: number;
};

export type QueueItem = {
  id: string;
  eventId: string;
  accountName: string;
  targetSystem: string;
  status: "pending" | "retrying" | "resolved" | "failed";
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string;
  lastError: string;
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
  severity: "low" | "medium" | "high";
  status: "open" | "reviewing" | "resolved";
  suggestedAction: string;
};

export type Metric = {
  label: string;
  value: string;
  helper: string;
};
