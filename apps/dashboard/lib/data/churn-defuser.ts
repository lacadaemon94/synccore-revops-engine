import { accounts as demoAccounts } from "../demo-data";
import type { Account } from "../types";
import { createSupabaseServerClient } from "../supabase";
import type { NormalizedBillingEvent } from "../events/normalize-billing-event";
import { buildChurnResponse, type ChurnOperationalResponse } from "../revops/build-churn-response";
import { classifyChurnRisk, type ChurnRiskAssessment } from "../revops/classify-churn-risk";
import { getAccounts } from "./accounts";

type NotificationOutboxRow = {
  id: string;
  status: string;
};

type DiscrepancyInsertRow = {
  id: string;
};

export type ChurnDefuserResult = {
  account: Account;
  classification: ChurnRiskAssessment;
  response: ChurnOperationalResponse;
  notification: {
    id: null | string;
    status: "existing" | "queued" | "simulated";
  };
  discrepancy: {
    id: null | string;
    created: boolean;
    status: "created" | "not-needed" | "simulated" | "skipped-existing";
  };
};

function isCustomerLikeStage(stage: string) {
  return ["active", "customer", "evangelist"].includes(stage.toLowerCase());
}

function buildFallbackAccount(normalizedEvent: NormalizedBillingEvent): Account {
  const amount = normalizedEvent.amount ?? 0;
  const usageDensity = normalizedEvent.usageDensity ?? 40;

  return {
    id: "unassigned",
    name: normalizedEvent.accountDomain ?? normalizedEvent.customerId ?? "Unassigned account",
    domain: normalizedEvent.accountDomain ?? "unknown.local",
    lifecycleStage: "customer",
    segment: amount >= 1000 ? "Growth" : "SMB",
    owner: "Unassigned",
    mrr: amount,
    arr: amount * 12,
    ltv: amount * 24,
    healthScore: 55,
    usageDensity,
    revenueAtRisk: amount,
    riskLevel: amount > 0 ? "watch" : "stable",
    nextRenewalAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

async function resolveAccount(normalizedEvent: NormalizedBillingEvent, linkedAccountId?: null | string) {
  const accounts = await getAccounts();

  if (linkedAccountId) {
    const linked = accounts.find((account) => account.id === linkedAccountId);

    if (linked) {
      return linked;
    }
  }

  if (normalizedEvent.accountDomain) {
    const domainMatch = accounts.find((account) => account.domain === normalizedEvent.accountDomain);

    if (domainMatch) {
      return domainMatch;
    }
  }

  const demoMatch = demoAccounts.find((account) => account.domain === normalizedEvent.accountDomain);

  return demoMatch ?? buildFallbackAccount(normalizedEvent);
}

async function findExistingNotification(
  client: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  providerEventId: string
) {
  const { data, error } = await client
    .from("notification_outbox")
    .select("id,status")
    .contains("payload_json", { provider_event_id: providerEventId, workflow: "churn_defuser" })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as NotificationOutboxRow | null;
}

async function insertNotification(
  client: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  {
    account,
    eventLogId,
    normalizedEvent,
    assessment,
    response
  }: {
    account: Account;
    eventLogId: string;
    normalizedEvent: NormalizedBillingEvent;
    assessment: ChurnRiskAssessment;
    response: ChurnOperationalResponse;
  }
) {
  const existing = await findExistingNotification(client, normalizedEvent.providerEventId);

  if (existing) {
    return {
      id: existing.id,
      status: "existing" as const
    };
  }

  const { data, error } = await client
    .from("notification_outbox")
    .insert({
      account_id: account.id === "unassigned" ? null : account.id,
      channel: "mock-slack",
      recipient: assessment.shouldNotifyOps ? "revops-escalations" : "billing-recovery",
      title: response.notificationTitle,
      body: response.notificationBody,
      status: "queued",
      payload_json: {
        workflow: "churn_defuser",
        event_log_id: eventLogId,
        provider_event_id: normalizedEvent.providerEventId,
        event_type: normalizedEvent.type,
        risk_level: assessment.riskLevel,
        recommended_action: assessment.recommendedAction,
        recommended_owner: response.recommendedOwner,
        requires_human_task: assessment.shouldCreateHumanTask,
        should_notify_ops: assessment.shouldNotifyOps,
        grace_period_recommendation: assessment.gracePeriodRecommendation
      }
    })
    .select("id,status")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: (data as NotificationOutboxRow).id,
    status: "queued" as const
  };
}

async function maybeCreateDiscrepancy(
  client: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  {
    account,
    assessment
  }: {
    account: Account;
    assessment: ChurnRiskAssessment;
  }
) {
  if (!account.id || account.id === "unassigned") {
    return {
      id: null,
      created: false,
      status: "not-needed" as const
    };
  }

  if (!["high", "critical"].includes(assessment.riskLevel) || !isCustomerLikeStage(account.lifecycleStage)) {
    return {
      id: null,
      created: false,
      status: "not-needed" as const
    };
  }

  const { data: existingRow, error: existingError } = await client
    .from("discrepancies")
    .select("id")
    .eq("account_id", account.id)
    .eq("field_name", "subscription_status")
    .eq("source_a", "billing")
    .eq("source_b", "crm")
    .eq("source_a_value", "past_due")
    .eq("source_b_value", account.lifecycleStage)
    .in("status", ["open", "reviewing"])
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingRow) {
    return {
      id: (existingRow as DiscrepancyInsertRow).id,
      created: false,
      status: "skipped-existing" as const
    };
  }

  const { data, error } = await client
    .from("discrepancies")
    .insert({
      account_id: account.id,
      source_a: "billing",
      source_b: "crm",
      field_name: "subscription_status",
      source_a_value: "past_due",
      source_b_value: account.lifecycleStage,
      severity: "high",
      status: "open",
      suggested_action: "Review lifecycle stage, confirm failed-payment recovery ownership, and replay the CRM sync after payment resolution."
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: (data as DiscrepancyInsertRow).id,
    created: true,
    status: "created" as const
  };
}

export async function runChurnDefuser({
  normalizedEvent,
  linkedAccountId,
  eventLogId,
  persistSideEffects
}: {
  normalizedEvent: NormalizedBillingEvent;
  linkedAccountId?: null | string;
  eventLogId?: string;
  persistSideEffects: boolean;
}): Promise<ChurnDefuserResult | null> {
  if (normalizedEvent.type !== "invoice.payment_failed") {
    return null;
  }

  const account = await resolveAccount(normalizedEvent, linkedAccountId);
  const classification = classifyChurnRisk({
    account,
    amount: normalizedEvent.amount,
    failureReason: normalizedEvent.failureReason,
    paymentAttemptCount: normalizedEvent.paymentAttemptCount,
    usageDensity: normalizedEvent.usageDensity
  });
  const response = buildChurnResponse({
    account,
    assessment: classification,
    normalizedEvent
  });

  if (!persistSideEffects || !eventLogId) {
    return {
      account,
      classification,
      response,
      notification: {
        id: null,
        status: "simulated"
      },
      discrepancy: {
        id: null,
        created: false,
        status: "simulated"
      }
    };
  }

  const client = createSupabaseServerClient();

  if (!client) {
    return {
      account,
      classification,
      response,
      notification: {
        id: null,
        status: "simulated"
      },
      discrepancy: {
        id: null,
        created: false,
        status: "simulated"
      }
    };
  }

  const notification = await insertNotification(client, {
    account,
    eventLogId,
    normalizedEvent,
    assessment: classification,
    response
  });
  const discrepancy = await maybeCreateDiscrepancy(client, {
    account,
    assessment: classification
  });

  return {
    account,
    classification,
    response,
    notification,
    discrepancy
  };
}
