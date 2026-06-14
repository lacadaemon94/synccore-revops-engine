import type { NormalizedBillingEvent } from "../events/normalize-billing-event";
import type { Account, ChurnRiskLevel, MockCrmTask, QueueItem } from "../types";
import type { ChurnRiskAssessment } from "./classify-churn-risk";

function resolveSeverity({
  escalationItem,
  riskLevel
}: {
  escalationItem?: Pick<QueueItem, "status"> | null;
  riskLevel: ChurnRiskLevel;
}) {
  if (escalationItem?.status === "escalated") {
    return "critical" as const;
  }

  return riskLevel;
}

export function buildCrmTask({
  account,
  assessment,
  escalationItem,
  normalizedEvent,
  recommendedOwner,
  suggestedNextStep
}: {
  account: Pick<Account, "id" | "name">;
  assessment: Pick<ChurnRiskAssessment, "reasonSummary" | "riskLevel">;
  escalationItem?: null | Pick<QueueItem, "lastError" | "retrySummary" | "status" | "targetSystem">;
  normalizedEvent: Pick<NormalizedBillingEvent, "failureReason" | "providerEventId" | "receivedAt" | "type">;
  recommendedOwner: string;
  suggestedNextStep: string;
}): MockCrmTask {
  const escalationSummary =
    escalationItem?.status === "escalated"
      ? ` DLQ escalation: ${escalationItem.targetSystem} is blocked and needs manual operator review.`
      : "";
  const retrySummary = escalationItem?.retrySummary ? ` ${escalationItem.retrySummary}` : "";
  const lastError = escalationItem?.lastError ? ` Latest downstream error: ${escalationItem.lastError}.` : "";

  return {
    id: `crm_task_${normalizedEvent.providerEventId}`,
    accountId: account.id,
    accountName: account.name,
    title: `Mock CRM task: recover ${account.name}`,
    description: `Event ${normalizedEvent.providerEventId} (${normalizedEvent.type}) failed with ${normalizedEvent.failureReason ?? "a billing issue"}. ${assessment.reasonSummary}${escalationSummary}${retrySummary}${lastError}`,
    source: "mock_crm_task",
    severity: resolveSeverity({
      escalationItem,
      riskLevel: assessment.riskLevel
    }),
    status: "queued",
    recommendedOwner,
    suggestedNextStep,
    createdAt: normalizedEvent.receivedAt
  };
}
