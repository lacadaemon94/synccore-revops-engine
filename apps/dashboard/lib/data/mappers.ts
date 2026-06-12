import type {
  Account,
  Discrepancy,
  DiscrepancySeverity,
  DiscrepancyStatus,
  EventStatus,
  QueueItem,
  QueueStatus,
  RevenueRiskLevel,
  RevOpsEvent
} from "../types";
import { addDaysIso, clamp, readJsonNumber, toNumber } from "./shared";

export type AccountRow = {
  id: string;
  name: string;
  normalized_domain: null | string;
  lifecycle_stage: null | string;
  mrr: null | number | string;
  arr: null | number | string;
  ltv: null | number | string;
  health_score: null | number;
  created_at: null | string;
  updated_at: null | string;
};

export type SubscriptionRow = {
  account_id: null | string;
  tier: null | string;
  status: null | string;
  current_period_end: null | string;
  mrr: null | number | string;
  previous_mrr: null | number | string;
  expansion_amount: null | number | string;
};

export type EventLogRow = {
  id: string;
  provider_event_id: string;
  provider: string;
  event_type: string;
  account_id: null | string;
  status: string;
  payload_json: unknown;
  normalized_json: unknown;
  received_at: string;
  retry_count: null | number;
  error_message: null | string;
};

export type QueueRow = {
  id: string;
  event_log_id: null | string;
  target_system: string;
  status: string;
  retry_count: null | number;
  max_retries: null | number;
  next_retry_at: null | string;
  last_error: null | string;
};

export type DiscrepancyRow = {
  id: string;
  account_id: null | string;
  source_a: string;
  source_b: string;
  field_name: string;
  source_a_value: null | string;
  source_b_value: null | string;
  severity: null | string;
  status: null | string;
  suggested_action: null | string;
};

function mapEventStatus(status: string): EventStatus {
  switch (status) {
    case "processed":
    case "failed":
    case "routed_to_dlq":
    case "pending":
    case "retrying":
    case "resolved":
    case "received":
      return status;
    default:
      return "received";
  }
}

function mapQueueStatus(status: string): QueueStatus {
  switch (status) {
    case "retrying":
    case "resolved":
    case "failed":
    case "pending":
      return status;
    default:
      return "pending";
  }
}

function mapDiscrepancySeverity(severity: null | string): DiscrepancySeverity {
  switch (severity) {
    case "low":
    case "high":
    case "medium":
      return severity;
    default:
      return "medium";
  }
}

function mapDiscrepancyStatus(status: null | string): DiscrepancyStatus {
  switch (status) {
    case "reviewing":
    case "resolved":
    case "open":
      return status;
    default:
      return "open";
  }
}

function deriveSegment(mrr: number, tier?: string | null) {
  if (tier === "enterprise") {
    return "Enterprise";
  }

  if (tier === "scale") {
    return "Growth";
  }

  if (tier === "starter") {
    return "SMB";
  }

  if (mrr >= 5000) {
    return "Enterprise";
  }

  if (mrr >= 1000) {
    return "Growth";
  }

  if (mrr >= 500) {
    return "Mid-market";
  }

  return "SMB";
}

function deriveRevenueAtRisk({
  subscriptionStatus,
  accountMrr,
  latestEventStatus,
  latestEventAmount,
  hasHighSeverityDiscrepancy
}: {
  subscriptionStatus?: null | string;
  accountMrr: number;
  latestEventStatus?: EventStatus;
  latestEventAmount?: number;
  hasHighSeverityDiscrepancy: boolean;
}) {
  if (subscriptionStatus && ["past_due", "unpaid", "canceled", "cancelled", "incomplete", "incomplete_expired"].includes(subscriptionStatus)) {
    return accountMrr;
  }

  if (latestEventStatus === "failed" || latestEventStatus === "routed_to_dlq") {
    return latestEventAmount ?? accountMrr;
  }

  if (hasHighSeverityDiscrepancy) {
    return accountMrr;
  }

  return 0;
}

function deriveRiskLevel({
  revenueAtRisk,
  healthScore,
  hasHighSeverityDiscrepancy,
  discrepancyCount
}: {
  revenueAtRisk: number;
  healthScore: number;
  hasHighSeverityDiscrepancy: boolean;
  discrepancyCount: number;
}): RevenueRiskLevel {
  if (revenueAtRisk > 0 || hasHighSeverityDiscrepancy || healthScore < 60) {
    return "urgent";
  }

  if (discrepancyCount > 0 || healthScore < 75) {
    return "watch";
  }

  return "stable";
}

function buildEventSummary(row: EventLogRow) {
  if (row.event_type === "invoice.payment_failed") {
    return row.status === "routed_to_dlq"
      ? "Payment failure was logged before downstream recovery and parked in the DLQ."
      : "Payment failure was captured before retry workflows ran.";
  }

  if (row.event_type === "customer.subscription.updated") {
    return "Subscription changes were normalized before CRM or notification writes.";
  }

  if (row.event_type === "invoice.paid") {
    return "Successful payment captured cleanly from the billing stream.";
  }

  if (row.event_type === "customer.subscription.deleted") {
    return "Subscription cancellation was captured before any CRM or lifecycle side effects fired.";
  }

  if (row.status === "failed") {
    return row.error_message ?? "Workflow execution failed after the event was recorded.";
  }

  if (row.status === "resolved") {
    return "A previously blocked event replayed successfully from the persisted log.";
  }

  return "Normalized operational event available for inspection and replay.";
}

function buildScenario(row: DiscrepancyRow) {
  const sourceAValue = row.source_a_value ?? "unknown";
  const sourceBValue = row.source_b_value ?? "unknown";

  if (row.field_name === "subscription_status") {
    return `Subscription status mismatch (${sourceAValue} vs ${sourceBValue})`;
  }

  if (row.field_name === "mrr") {
    const left = toNumber(row.source_a_value);
    const right = toNumber(row.source_b_value);

    if (left > right) {
      return "Billing MRR higher than CRM MRR";
    }

    if (right > left) {
      return "CRM MRR higher than billing MRR";
    }

    return "MRR mismatch";
  }

  if (row.field_name === "plan_tier") {
    return `Plan tier mismatch (${sourceAValue} vs ${sourceBValue})`;
  }

  return `${row.field_name.replaceAll("_", " ")} mismatch`;
}

function buildImpact(row: DiscrepancyRow) {
  if (row.field_name === "subscription_status") {
    return "Lifecycle workflows and churn handling can act on the wrong commercial status.";
  }

  if (row.field_name === "mrr") {
    return "Forecasting, renewals, and expansion reporting can drift from live revenue.";
  }

  if (row.field_name === "plan_tier") {
    return "Routing, support coverage, and packaging assumptions can become stale.";
  }

  return "Operators may act on stale CRM and billing context until the mismatch is resolved.";
}

export function mapAccountRowToAccount({
  row,
  subscription,
  latestEvent,
  discrepancyRows
}: {
  row: AccountRow;
  subscription?: SubscriptionRow;
  latestEvent?: RevOpsEvent;
  discrepancyRows: DiscrepancyRow[];
}): Account {
  const mrr = toNumber(subscription?.mrr, toNumber(row.mrr));
  const arr = toNumber(row.arr, mrr * 12);
  const healthScore = clamp(toNumber(row.health_score, 50), 0, 100);
  const hasHighSeverityDiscrepancy = discrepancyRows.some((item) => mapDiscrepancySeverity(item.severity) === "high" && mapDiscrepancyStatus(item.status) !== "resolved");
  const revenueAtRisk = deriveRevenueAtRisk({
    subscriptionStatus: subscription?.status,
    accountMrr: mrr,
    latestEventStatus: latestEvent?.status,
    latestEventAmount: latestEvent?.amount,
    hasHighSeverityDiscrepancy
  });

  return {
    id: row.id,
    name: row.name,
    domain: row.normalized_domain ?? "unknown.local",
    lifecycleStage: row.lifecycle_stage ?? "customer",
    segment: deriveSegment(mrr, subscription?.tier),
    owner: "Unassigned",
    mrr,
    arr,
    ltv: toNumber(row.ltv, arr * 2.5),
    healthScore,
    usageDensity: clamp(healthScore, 0, 100),
    revenueAtRisk,
    riskLevel: deriveRiskLevel({
      revenueAtRisk,
      healthScore,
      hasHighSeverityDiscrepancy,
      discrepancyCount: discrepancyRows.filter((item) => mapDiscrepancyStatus(item.status) !== "resolved").length
    }),
    nextRenewalAt: subscription?.current_period_end ?? addDaysIso(30)
  };
}

export function mapEventRowToRevOpsEvent({
  row,
  account
}: {
  row: EventLogRow;
  account?: Pick<Account, "id" | "mrr" | "name">;
}): RevOpsEvent {
  const normalizedAmount = readJsonNumber(row.normalized_json, "amount");
  const normalizedMrr = readJsonNumber(row.normalized_json, "mrr");
  const payloadAmount = readJsonNumber(row.payload_json, "mrr");

  return {
    id: row.id,
    provider: row.provider,
    providerEventId: row.provider_event_id,
    eventType: row.event_type,
    accountId: row.account_id ?? account?.id ?? "unassigned",
    accountName: account?.name ?? "Unassigned account",
    status: mapEventStatus(row.status),
    receivedAt: row.received_at,
    retryCount: row.retry_count ?? 0,
    amount: normalizedAmount ?? normalizedMrr ?? payloadAmount ?? account?.mrr,
    summary: buildEventSummary(row)
  };
}

export function mapQueueRowToQueueItem({
  row,
  event,
  account
}: {
  row: QueueRow;
  event?: RevOpsEvent;
  account?: Pick<Account, "id" | "name">;
}): QueueItem {
  return {
    id: row.id,
    eventId: event?.providerEventId ?? row.event_log_id ?? row.id,
    accountId: account?.id ?? event?.accountId ?? "unassigned",
    accountName: account?.name ?? event?.accountName ?? "Unassigned account",
    targetSystem: row.target_system,
    status: mapQueueStatus(row.status),
    retryCount: row.retry_count ?? 0,
    maxRetries: row.max_retries ?? 3,
    nextRetryAt: row.next_retry_at ?? addDaysIso(1),
    lastError: row.last_error ?? "No downstream error message recorded."
  };
}

export function mapDiscrepancyRowToDiscrepancy({
  row,
  account
}: {
  row: DiscrepancyRow;
  account?: Pick<Account, "id" | "name">;
}): Discrepancy {
  return {
    id: row.id,
    accountId: row.account_id ?? account?.id ?? "unassigned",
    accountName: account?.name ?? "Unassigned account",
    sourceA: row.source_a,
    sourceB: row.source_b,
    fieldName: row.field_name,
    sourceAValue: row.source_a_value ?? "unknown",
    sourceBValue: row.source_b_value ?? "unknown",
    severity: mapDiscrepancySeverity(row.severity),
    status: mapDiscrepancyStatus(row.status),
    scenario: buildScenario(row),
    impact: buildImpact(row),
    suggestedAction: row.suggested_action ?? "Review the mismatch, confirm the system of record, and replay the sync if needed."
  };
}
