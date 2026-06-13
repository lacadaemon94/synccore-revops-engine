import type { Account, ChurnRiskLevel } from "../types";

export type ChurnRiskAssessment = {
  riskLevel: ChurnRiskLevel;
  recommendedAction: string;
  reasonSummary: string;
  shouldCreateHumanTask: boolean;
  shouldNotifyOps: boolean;
  gracePeriodRecommendation: string;
};

export function classifyChurnRisk({
  account,
  amount,
  failureReason,
  paymentAttemptCount,
  usageDensity
}: {
  account: Pick<Account, "healthScore" | "lifecycleStage" | "ltv" | "mrr" | "name" | "segment" | "usageDensity">;
  amount?: null | number;
  failureReason?: null | string;
  paymentAttemptCount?: null | number;
  usageDensity?: null | number;
}): ChurnRiskAssessment {
  const effectiveUsageDensity = usageDensity ?? account.usageDensity;
  const attemptCount = paymentAttemptCount ?? 1;
  const drivers: string[] = [];
  let score = 0;

  if (account.mrr >= 5000) {
    score += 3;
    drivers.push("large MRR exposure");
  } else if (account.mrr >= 1000) {
    score += 2;
    drivers.push("meaningful MRR exposure");
  }

  if (effectiveUsageDensity >= 80) {
    score += 3;
    drivers.push("very high product usage");
  } else if (effectiveUsageDensity >= 70) {
    score += 2;
    drivers.push("high product usage");
  } else if (effectiveUsageDensity <= 35) {
    score -= 1;
    drivers.push("light usage footprint");
  }

  if (account.segment === "Enterprise" || account.ltv >= 100000) {
    score += 2;
    drivers.push("strategic account profile");
  } else if (account.ltv >= 30000) {
    score += 1;
    drivers.push("meaningful lifetime value");
  }

  if (account.lifecycleStage === "customer" || account.lifecycleStage === "active") {
    score += 1;
    drivers.push("active paying lifecycle");
  }

  if (account.healthScore < 45) {
    score += 2;
    drivers.push("weak account health");
  } else if (account.healthScore < 65) {
    score += 1;
    drivers.push("softening account health");
  }

  if (attemptCount >= 3) {
    score += 2;
    drivers.push("repeated failed payment attempts");
  } else if (attemptCount >= 2) {
    score += 1;
    drivers.push("second failed payment attempt");
  }

  if (amount && amount >= 1000) {
    score += 1;
    drivers.push("invoice value above self-serve threshold");
  }

  if (failureReason === "card_declined" || failureReason === "do_not_honor") {
    score += 1;
    drivers.push("harder payment failure reason");
  }

  const riskLevel: ChurnRiskLevel = score >= 8 ? "critical" : score >= 6 ? "high" : score >= 3 ? "medium" : "low";

  if (drivers.length === 0) {
    drivers.push("limited commercial exposure");
  }

  switch (riskLevel) {
    case "critical":
      return {
        riskLevel,
        recommendedAction: "Escalate to RevOps and the account owner immediately, then protect the renewal path with same-day follow-up.",
        reasonSummary: `${account.name} is a critical failed payment because it combines ${drivers.slice(0, 3).join(", ")}.`,
        shouldCreateHumanTask: true,
        shouldNotifyOps: true,
        gracePeriodRecommendation: "Hold service for no more than 3 days before human review and recovery outreach."
      };
    case "high":
      return {
        riskLevel,
        recommendedAction: "Create a human follow-up task, notify revenue operations, and verify the billing contact recovery path today.",
        reasonSummary: `${account.name} needs a high-priority recovery path because of ${drivers.slice(0, 3).join(", ")}.`,
        shouldCreateHumanTask: true,
        shouldNotifyOps: true,
        gracePeriodRecommendation: "Allow a 3 to 5 day grace window while a human owner works the account."
      };
    case "medium":
      return {
        riskLevel,
        recommendedAction: "Keep automated retries active, queue a billing review, and escalate only if another attempt fails.",
        reasonSummary: `${account.name} is medium risk with ${drivers.slice(0, 3).join(", ")}.`,
        shouldCreateHumanTask: false,
        shouldNotifyOps: false,
        gracePeriodRecommendation: "Keep a 5 day grace period and re-evaluate after the next payment attempt."
      };
    default:
      return {
        riskLevel,
        recommendedAction: "Use the standard automated billing recovery sequence and monitor for repeated failures.",
        reasonSummary: `${account.name} is currently low risk because the failure shows ${drivers.slice(0, 3).join(", ")}.`,
        shouldCreateHumanTask: false,
        shouldNotifyOps: false,
        gracePeriodRecommendation: "Allow a 7 day grace period before routing to a human queue."
      };
  }
}
