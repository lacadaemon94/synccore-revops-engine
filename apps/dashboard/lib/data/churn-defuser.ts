import { accounts as demoAccounts } from "../demo-data";
import type { Account, MockCrmTask, NotificationOutboxItem, QueueItem } from "../types";
import { createSupabaseServerClient } from "../supabase";
import type { NormalizedBillingEvent } from "../events/normalize-billing-event";
import { buildCrmTask } from "../revops/build-crm-task";
import { buildChurnResponse, type ChurnOperationalResponse } from "../revops/build-churn-response";
import { classifyChurnRisk, type ChurnRiskAssessment } from "../revops/classify-churn-risk";
import { getAccounts } from "./accounts";
import { createDeadLetterQueueItem } from "./dead-letter-queue";

type NotificationOutboxRow = {
  created_at: null | string;
  id: string;
  status: string;
};

type DiscrepancyInsertRow = {
  id: string;
};

type NotificationOutboxInsertResult = {
  createdAt: null | string;
  id: string;
  status: "existing" | "queued";
};

export type ChurnDefuserResult = {
  account: Account;
  classification: ChurnRiskAssessment;
  crmTask: MockCrmTask | null;
  response: ChurnOperationalResponse;
  deadLetterQueue: {
    created: boolean;
    item: null | QueueItem;
    mode: "persisted" | "simulated" | "skipped";
  };
  notification: {
    id: null | string;
    item: NotificationOutboxItem | null;
    payload: null | Record<string, unknown>;
    status: "deferred-to-dlq" | "existing" | "queued" | "simulated";
  };
  discrepancy: {
    id: null | string;
    created: boolean;
    status: "created" | "deferred-to-dlq" | "not-needed" | "simulated" | "skipped-existing";
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

function buildNotificationOutboxPayload({
  account,
  classification,
  crmTask,
  normalizedEvent,
  response
}: {
  account: Account;
  classification: ChurnRiskAssessment;
  crmTask: MockCrmTask | null;
  normalizedEvent: NormalizedBillingEvent;
  response: ChurnOperationalResponse;
}) {
  return {
    workflow: "churn_defuser",
    account_id: account.id,
    account_name: account.name,
    provider_event_id: normalizedEvent.providerEventId,
    event_type: normalizedEvent.type,
    failure_reason: normalizedEvent.failureReason,
    risk_level: classification.riskLevel,
    reason_summary: classification.reasonSummary,
    recommended_action: classification.recommendedAction,
    recommended_owner: response.recommendedOwner,
    suggested_next_step: response.suggestedNextStep,
    requires_human_task: classification.shouldCreateHumanTask,
    should_notify_ops: classification.shouldNotifyOps,
    grace_period_recommendation: classification.gracePeriodRecommendation,
    crm_task: crmTask
      ? {
          id: crmTask.id,
          title: crmTask.title,
          description: crmTask.description,
          severity: crmTask.severity,
          status: crmTask.status,
          recommended_owner: crmTask.recommendedOwner,
          suggested_next_step: crmTask.suggestedNextStep,
          created_at: crmTask.createdAt
        }
      : null
  };
}

function buildNotificationOutboxItem({
  account,
  createdAt,
  payload,
  response,
  status
}: {
  account: Account;
  createdAt: string;
  payload: Record<string, unknown>;
  response: ChurnOperationalResponse;
  status: NotificationOutboxItem["status"];
}): NotificationOutboxItem {
  const severity =
    payload.risk_level === "critical" || payload.risk_level === "high" || payload.risk_level === "medium" || payload.risk_level === "low"
      ? payload.risk_level
      : "medium";

  return {
    id: typeof payload.provider_event_id === "string" ? `notify_${payload.provider_event_id}` : `notify_${account.id}`,
    accountId: account.id,
    accountName: account.name,
    title: response.notificationTitle,
    body: response.notificationBody,
    source: "notification_outbox",
    severity,
    status,
    recommendedOwner: response.recommendedOwner,
    suggestedNextStep: response.suggestedNextStep,
    createdAt
  };
}

async function findExistingNotification(
  client: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  providerEventId: string
) {
  const { data, error } = await client
    .from("notification_outbox")
    .select("id,status,created_at")
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
    notificationPayload,
    response
  }: {
    account: Account;
    eventLogId: string;
    notificationPayload: Record<string, unknown>;
    response: ChurnOperationalResponse;
  }
): Promise<NotificationOutboxInsertResult> {
  const providerEventId =
    typeof notificationPayload.provider_event_id === "string" ? notificationPayload.provider_event_id : account.id;
  const shouldNotifyOps = notificationPayload.should_notify_ops === true;
  const existing = await findExistingNotification(client, providerEventId);

  if (existing) {
    return {
      createdAt: existing.created_at,
      id: existing.id,
      status: "existing"
    };
  }

  const { data, error } = await client
    .from("notification_outbox")
    .insert({
      account_id: account.id === "unassigned" ? null : account.id,
      channel: "mock-slack",
      recipient: shouldNotifyOps ? "revops-escalations" : "billing-recovery",
      title: response.notificationTitle,
      body: response.notificationBody,
      status: "queued",
      payload_json: {
        ...notificationPayload,
        event_log_id: eventLogId
      }
    })
    .select("id,status,created_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    createdAt: (data as NotificationOutboxRow).created_at,
    id: (data as NotificationOutboxRow).id,
    status: "queued"
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
  const crmTask = classification.shouldCreateHumanTask
    ? buildCrmTask({
        account,
        assessment: classification,
        normalizedEvent,
        recommendedOwner: response.recommendedOwner,
        suggestedNextStep: response.suggestedNextStep
      })
    : null;
  const notificationPayload = buildNotificationOutboxPayload({
    account,
    classification,
    crmTask,
    normalizedEvent,
    response
  });
  const simulatedNotificationItem = buildNotificationOutboxItem({
    account,
    createdAt: normalizedEvent.receivedAt,
    payload: notificationPayload,
    response,
    status: "queued"
  });
  const shouldCreateDeadLetterQueueItem = normalizedEvent.simulateDownstreamFailure;

  if (shouldCreateDeadLetterQueueItem) {
    const dlqItem = await createDeadLetterQueueItem({
      accountId: account.id,
      accountName: account.name,
      eventId: normalizedEvent.providerEventId,
      eventLogId,
      eventType: normalizedEvent.type,
      lastError: "Simulated downstream failure triggered by metadata.simulate_downstream_failure=true.",
      maxRetries: 3,
      payload: {
        workflow: "churn_defuser",
        operation: "send_recovery_notification",
        simulate_downstream_failure: true
      },
      retryCount: 1,
      retryOutcomeHint: "retryable_failure",
      targetSystem: "mock-notifications-outbox"
    });

    return {
      account,
      classification,
      crmTask,
      response,
      deadLetterQueue: {
        created: true,
        item: dlqItem,
        mode: persistSideEffects && eventLogId ? "persisted" : "simulated"
      },
      notification: {
        id: null,
        item: simulatedNotificationItem,
        payload: notificationPayload,
        status: "deferred-to-dlq"
      },
      discrepancy: {
        id: null,
        created: false,
        status: "deferred-to-dlq"
      }
    };
  }

  if (!persistSideEffects || !eventLogId) {
    return {
      account,
      classification,
      crmTask,
      response,
      deadLetterQueue: {
        created: false,
        item: null,
        mode: "skipped"
      },
      notification: {
        id: null,
        item: simulatedNotificationItem,
        payload: notificationPayload,
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
      crmTask,
      response,
      deadLetterQueue: {
        created: false,
        item: null,
        mode: "skipped"
      },
      notification: {
        id: null,
        item: simulatedNotificationItem,
        payload: notificationPayload,
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
    notificationPayload,
    response
  });
  const discrepancy = await maybeCreateDiscrepancy(client, {
    account,
    assessment: classification
  });

  return {
    account,
    classification,
    crmTask,
    response,
    deadLetterQueue: {
      created: false,
      item: null,
      mode: "skipped"
    },
    notification: {
      id: notification.id,
      item: buildNotificationOutboxItem({
        account,
        createdAt: notification.createdAt ?? normalizedEvent.receivedAt,
        payload: notificationPayload,
        response,
        status: notification.status === "existing" ? "acknowledged" : "queued"
      }),
      payload: notificationPayload,
      status: notification.status
    },
    discrepancy
  };
}
