import { queueItems as demoQueueItems } from "../demo-data";
import { createSupabaseServerClient } from "../supabase";
import type { Account, QueueItem, QueueStatus, RetryFailureClass, RetryOutcomeHint, RevOpsEvent } from "../types";
import {
  buildRetrySummary,
  calculateNextRetryAt,
  classifyRetryFailure,
  shouldEscalate,
  shouldSendToDeadLetterQueue
} from "../revops/dead-letter-queue";
import { getAccounts } from "./accounts";
import { getEvents } from "./events";
import type { QueueRow } from "./mappers";
import { mapQueueRowToQueueItem } from "./mappers";
import { isRecord, readJsonString, withDataFallback } from "./shared";

type QueueAccount = Pick<Account, "id" | "name">;

type DeadLetterQueueRow = QueueRow & {
  payload_json: unknown;
  last_attempt_at: null | string;
  resolved_at: null | string;
  created_at: string;
  updated_at: string;
};

type DeadLetterQueuePayload = {
  account_id?: string;
  account_name?: string;
  event_type?: string;
  failure_class?: RetryFailureClass;
  last_error?: string;
  operation?: string;
  provider_event_id?: string;
  retry_outcome_hint?: RetryOutcomeHint;
  simulate_downstream_failure?: boolean | string;
};

export type CreateDeadLetterQueueItemInput = {
  accountId?: null | string;
  accountName?: null | string;
  eventId?: null | string;
  eventLogId?: null | string;
  eventType?: null | string;
  lastError: string;
  maxRetries?: number;
  payload?: Record<string, unknown>;
  retryCount?: number;
  retryOutcomeHint?: RetryOutcomeHint;
  targetSystem: string;
};

export type ForceRetryQueueItemResult = {
  ok: boolean;
  escalated: boolean;
  message: string;
  nextRetryAt: null | string;
  queueItem: QueueItem;
  queueItemId: string;
  simulated: boolean;
  statusAfter: QueueStatus;
  statusBefore: QueueStatus;
};

function cloneDemoItem(item: QueueItem): QueueItem {
  return {
    ...item,
    retrySummary: item.retrySummary ?? buildRetrySummary(item)
  };
}

function getDemoQueueItems() {
  return demoQueueItems.map(cloneDemoItem);
}

function normalizeQueueItem(item: QueueItem): QueueItem {
  const failureClass = item.failureClass ?? classifyRetryFailure(item.lastError).category;
  const escalationRecommended =
    item.escalationRecommended ?? (item.status === "escalated" || shouldEscalate(item.retryCount, item.maxRetries));

  return {
    ...item,
    failureClass,
    escalationRecommended,
    retrySummary: buildRetrySummary({
      ...item,
      status: item.status
    })
  };
}

function getPayloadString(payload: unknown, key: keyof DeadLetterQueuePayload) {
  return readJsonString(payload, key);
}

function getPayloadBoolean(payload: unknown, key: keyof DeadLetterQueuePayload) {
  if (!isRecord(payload)) {
    return false;
  }

  const value = payload[key];

  return value === true || value === "true";
}

function buildQueueItem({
  row,
  event,
  account
}: {
  row: DeadLetterQueueRow;
  event?: RevOpsEvent;
  account?: QueueAccount;
}) {
  const baseItem = mapQueueRowToQueueItem({
    row,
    event,
    account
  });
  const payload = row.payload_json;
  const mapped = normalizeQueueItem({
    ...baseItem,
    accountId: account?.id ?? event?.accountId ?? getPayloadString(payload, "account_id") ?? baseItem.accountId,
    accountName: account?.name ?? event?.accountName ?? getPayloadString(payload, "account_name") ?? baseItem.accountName,
    eventId: event?.providerEventId ?? getPayloadString(payload, "provider_event_id") ?? baseItem.eventId,
    failureClass: classifyRetryFailure(getPayloadString(payload, "failure_class") ?? row.last_error ?? "").category,
    retryOutcomeHint:
      (getPayloadString(payload, "retry_outcome_hint") as RetryOutcomeHint | undefined) ??
      (getPayloadBoolean(payload, "simulate_downstream_failure") ? "retryable_failure" : undefined),
    nextRetryAt: baseItem.status === "resolved" || baseItem.status === "escalated" ? null : baseItem.nextRetryAt
  });

  return mapped;
}

async function getLiveQueueRows() {
  const client = createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const [{ data: queueRows, error }, accounts, events] = await Promise.all([
    client
      .from("dead_letter_queue")
      .select("id,event_log_id,target_system,payload_json,status,retry_count,max_retries,next_retry_at,last_attempt_at,last_error,resolved_at,created_at,updated_at")
      .order("created_at", { ascending: false }),
    getAccounts(),
    getEvents()
  ]);

  if (error) {
    throw error;
  }

  const accountMap = new Map(accounts.map((account) => [account.id, account] as const));
  const eventMap = new Map(events.map((event) => [event.id, event] as const));

  return ((queueRows ?? []) as DeadLetterQueueRow[]).map((row) => {
    const event = row.event_log_id ? eventMap.get(row.event_log_id) : undefined;
    const account = event?.accountId ? accountMap.get(event.accountId) : undefined;

    return buildQueueItem({
      row,
      event,
      account
    });
  });
}

async function findLiveQueueRow(id: string) {
  const client = createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("dead_letter_queue")
    .select("id,event_log_id,target_system,payload_json,status,retry_count,max_retries,next_retry_at,last_attempt_at,last_error,resolved_at,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as DeadLetterQueueRow | null;
}

async function updateLinkedEventStatus({
  errorMessage,
  eventLogId,
  retryCount,
  status
}: {
  errorMessage?: null | string;
  eventLogId?: null | string;
  retryCount?: number;
  status: string;
}) {
  const client = createSupabaseServerClient();

  if (!client || !eventLogId) {
    return;
  }

  const { error } = await client
    .from("event_log")
    .update({
      status,
      retry_count: retryCount ?? 0,
      error_message: errorMessage ?? null
    })
    .eq("id", eventLogId);

  if (error) {
    throw error;
  }
}

async function persistQueueUpdate(id: string, values: Partial<DeadLetterQueueRow>) {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase is not configured for DLQ updates.");
  }

  const { error } = await client
    .from("dead_letter_queue")
    .update({
      ...values,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

function buildDemoCreatedQueueItem(input: CreateDeadLetterQueueItemInput) {
  return normalizeQueueItem({
    id: `demo_dlq_${input.eventId ?? Date.now()}`,
    eventId: input.eventId ?? "demo_event",
    accountId: input.accountId ?? "unassigned",
    accountName: input.accountName ?? "Unassigned account",
    targetSystem: input.targetSystem,
    status: "pending",
    retryCount: input.retryCount ?? 1,
    maxRetries: input.maxRetries ?? 3,
    nextRetryAt: calculateNextRetryAt(input.retryCount ?? 1),
    lastError: input.lastError,
    lastAttemptAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    failureClass: classifyRetryFailure(input.lastError).category,
    retryOutcomeHint: input.retryOutcomeHint
  });
}

function determineRetryOutcome(item: QueueItem) {
  if (item.status === "resolved") {
    return "resolve" as const;
  }

  if (item.retryOutcomeHint) {
    return item.retryOutcomeHint;
  }

  switch (item.failureClass ?? classifyRetryFailure(item.lastError).category) {
    case "validation":
    case "authentication":
      return "non_retryable_failure" as const;
    case "availability":
    case "rate_limit":
    case "timeout":
      return "resolve" as const;
    default:
      return "retryable_failure" as const;
  }
}

export async function getDeadLetterQueueItems(): Promise<QueueItem[]> {
  return withDataFallback(getDemoQueueItems, async () => {
    const rows = await getLiveQueueRows();
    return rows ?? getDemoQueueItems();
  });
}

export async function getDeadLetterQueueItemById(id: string): Promise<null | QueueItem> {
  return withDataFallback(
    () => getDemoQueueItems().find((item) => item.id === id) ?? null,
    async () => {
      const row = await findLiveQueueRow(id);

      if (!row) {
        return null;
      }

      const [accounts, events] = await Promise.all([getAccounts(), getEvents()]);
      const event = row.event_log_id ? events.find((item) => item.id === row.event_log_id) : undefined;
      const account = event?.accountId ? accounts.find((item) => item.id === event.accountId) : undefined;

      return buildQueueItem({
        row,
        event,
        account
      });
    }
  );
}

export async function createDeadLetterQueueItem(input: CreateDeadLetterQueueItemInput): Promise<QueueItem> {
  const client = createSupabaseServerClient();
  const retryCount = input.retryCount ?? 1;
  const payload = {
    ...(input.payload ?? {}),
    account_id: input.accountId ?? undefined,
    account_name: input.accountName ?? undefined,
    event_type: input.eventType ?? undefined,
    failure_class: classifyRetryFailure(input.lastError).category,
    provider_event_id: input.eventId ?? undefined,
    retry_outcome_hint: input.retryOutcomeHint ?? undefined
  };

  if (!client) {
    return buildDemoCreatedQueueItem(input);
  }

  const { data, error } = await client
    .from("dead_letter_queue")
    .insert({
      event_log_id: input.eventLogId ?? null,
      target_system: input.targetSystem,
      payload_json: payload,
      status: "pending",
      retry_count: retryCount,
      max_retries: input.maxRetries ?? 3,
      next_retry_at: calculateNextRetryAt(retryCount),
      last_attempt_at: new Date().toISOString(),
      last_error: input.lastError
    })
    .select("id,event_log_id,target_system,payload_json,status,retry_count,max_retries,next_retry_at,last_attempt_at,last_error,resolved_at,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  await updateLinkedEventStatus({
    eventLogId: input.eventLogId,
    retryCount,
    status: "routed_to_dlq",
    errorMessage: input.lastError
  });

  return buildQueueItem({
    row: data as DeadLetterQueueRow
  });
}

export async function markQueueItemRetrying(id: string): Promise<QueueItem> {
  const item = await getDeadLetterQueueItemById(id);

  if (!item) {
    throw new Error("Queue item not found.");
  }

  const nextItem = normalizeQueueItem({
    ...item,
    status: "retrying",
    lastAttemptAt: new Date().toISOString()
  });
  const liveRow = await findLiveQueueRow(id);

  if (liveRow) {
    await persistQueueUpdate(id, {
      status: "retrying",
      last_attempt_at: nextItem.lastAttemptAt
    });
    await updateLinkedEventStatus({
      eventLogId: liveRow.event_log_id,
      retryCount: nextItem.retryCount,
      status: "retrying",
      errorMessage: nextItem.lastError
    });
  }

  return nextItem;
}

export async function markQueueItemResolved(id: string): Promise<QueueItem> {
  const item = await getDeadLetterQueueItemById(id);

  if (!item) {
    throw new Error("Queue item not found.");
  }

  const nextItem = normalizeQueueItem({
    ...item,
    status: "resolved",
    nextRetryAt: null,
    resolvedAt: new Date().toISOString()
  });
  const liveRow = await findLiveQueueRow(id);

  if (liveRow) {
    await persistQueueUpdate(id, {
      status: "resolved",
      next_retry_at: null,
      resolved_at: nextItem.resolvedAt ?? null
    });
    await updateLinkedEventStatus({
      eventLogId: liveRow.event_log_id,
      retryCount: nextItem.retryCount,
      status: "resolved",
      errorMessage: null
    });
  }

  return nextItem;
}

export async function markQueueItemFailed(id: string, error: Error | string): Promise<QueueItem> {
  const item = await getDeadLetterQueueItemById(id);

  if (!item) {
    throw new Error("Queue item not found.");
  }

  const nextRetryCount = item.retryCount + 1;
  const escalated = shouldEscalate(nextRetryCount, item.maxRetries);
  const nextStatus: QueueStatus = escalated ? "escalated" : shouldSendToDeadLetterQueue(error) ? "pending" : "failed";
  const nextItem = normalizeQueueItem({
    ...item,
    status: nextStatus,
    retryCount: nextRetryCount,
    nextRetryAt: nextStatus === "pending" ? calculateNextRetryAt(nextRetryCount) : null,
    lastError: error instanceof Error ? error.message : error,
    lastAttemptAt: new Date().toISOString()
  });
  const liveRow = await findLiveQueueRow(id);

  if (liveRow) {
    await persistQueueUpdate(id, {
      status: nextStatus,
      retry_count: nextRetryCount,
      next_retry_at: nextItem.nextRetryAt,
      last_attempt_at: nextItem.lastAttemptAt ?? null,
      last_error: nextItem.lastError,
      resolved_at: null
    });
    await updateLinkedEventStatus({
      eventLogId: liveRow.event_log_id,
      retryCount: nextRetryCount,
      status: nextStatus === "pending" ? "routed_to_dlq" : nextStatus,
      errorMessage: nextItem.lastError
    });
  }

  return nextItem;
}

export async function forceRetryQueueItem(id: string): Promise<ForceRetryQueueItemResult> {
  const original = await getDeadLetterQueueItemById(id);

  if (!original) {
    throw new Error("Queue item not found.");
  }

  const liveRow = await findLiveQueueRow(id);
  const simulated = !liveRow;
  const statusBefore = original.status;

  if (statusBefore !== "resolved") {
    await markQueueItemRetrying(id);
  }

  const outcome = determineRetryOutcome(original);

  if (outcome === "resolve") {
    const resolved = statusBefore === "resolved" ? original : await markQueueItemResolved(id);

    return {
      ok: true,
      escalated: false,
      message: `Force retry resolved ${resolved.accountName} for ${resolved.targetSystem}.`,
      nextRetryAt: resolved.nextRetryAt ?? null,
      queueItem: resolved,
      queueItemId: id,
      simulated,
      statusAfter: resolved.status,
      statusBefore
    };
  }

  const nextFailureMessage =
    outcome === "non_retryable_failure"
      ? "Manual replay hit the same non-retryable payload contract failure."
      : "Manual replay still hit the downstream demo failure and was re-queued.";
  const failed = await markQueueItemFailed(id, nextFailureMessage);

  return {
    ok: failed.status === "pending",
    escalated: failed.status === "escalated",
    message:
      failed.status === "escalated"
        ? `Force retry exhausted the DLQ policy for ${failed.accountName}. Escalation is recommended.`
        : `Force retry re-queued ${failed.accountName} for another scheduled attempt.`,
    nextRetryAt: failed.nextRetryAt ?? null,
    queueItem: failed,
    queueItemId: id,
    simulated,
    statusAfter: failed.status,
    statusBefore
  };
}
