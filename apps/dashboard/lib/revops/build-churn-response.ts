import type { Account } from "../types";
import type { NormalizedBillingEvent } from "../events/normalize-billing-event";
import type { ChurnRiskAssessment } from "./classify-churn-risk";

export type ChurnOperationalResponse = {
  notificationTitle: string;
  notificationBody: string;
  crmTaskTitle: string;
  crmTaskDescription: string;
  recommendedOwner: string;
  suggestedNextStep: string;
};

function pickOwner(account: Pick<Account, "owner" | "segment">, riskLevel: ChurnRiskAssessment["riskLevel"]) {
  if (riskLevel === "critical") {
    return "RevOps lead";
  }

  if (riskLevel === "high") {
    return account.segment === "Enterprise" ? "Strategic CSM" : account.owner;
  }

  if (riskLevel === "medium") {
    return "Billing operations";
  }

  return "Billing automation";
}

export function buildChurnResponse({
  account,
  assessment,
  normalizedEvent
}: {
  account: Pick<Account, "name" | "owner" | "segment">;
  assessment: ChurnRiskAssessment;
  normalizedEvent: Pick<NormalizedBillingEvent, "amount" | "currency" | "failureReason" | "providerEventId" | "type">;
}): ChurnOperationalResponse {
  const recommendedOwner = pickOwner(account, assessment.riskLevel);
  const amountText = normalizedEvent.amount === null ? "unknown amount" : `${normalizedEvent.currency?.toUpperCase() ?? "USD"} ${normalizedEvent.amount.toLocaleString("en-US")}`;
  const failureReason = normalizedEvent.failureReason ?? "payment failure";

  return {
    notificationTitle: `${assessment.riskLevel.toUpperCase()} failed payment: ${account.name}`,
    notificationBody: `${amountText} failed on ${account.name}. ${assessment.reasonSummary} Recommended action: ${assessment.recommendedAction}`,
    crmTaskTitle: `Recover failed payment for ${account.name}`,
    crmTaskDescription: `Event ${normalizedEvent.providerEventId} (${normalizedEvent.type}) failed with ${failureReason}. ${assessment.reasonSummary} Grace recommendation: ${assessment.gracePeriodRecommendation}`,
    recommendedOwner,
    suggestedNextStep: assessment.shouldCreateHumanTask
      ? "Assign the account owner, confirm the billing contact path, and review retention risk before the next retry."
      : "Keep automated recovery active and review only if another payment attempt fails."
  };
}
