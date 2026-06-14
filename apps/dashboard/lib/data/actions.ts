import {
  churnDefuserActions as demoChurnDefuserActions,
  mockCrmTasks as demoMockCrmTasks,
  notificationOutboxItems as demoNotificationOutboxItems,
  opsActions as demoOpsActions
} from "../demo-data";
import { buildCrmTask } from "../revops/build-crm-task";
import type {
  ActionSeverity,
  ActionStatus,
  ChurnRiskLevel,
  MockCrmTask,
  NotificationOutboxItem,
  OpsAction
} from "../types";
import { getAccounts } from "./accounts";
import { getDeadLetterQueueItems } from "./dead-letter-queue";
import { isRecord, readJsonString, withDataFallback } from "./shared";

type NotificationOutboxRow = {
  id: string;
  account_id: null | string;
  body: string;
  channel: null | string;
  created_at: string;
  payload_json: unknown;
  recipient: null | string;
  status: string;
  title: string;
};

export type ActionCenterData = {
  actions: OpsAction[];
  churnAlerts: OpsAction[];
  dlqEscalations: OpsAction[];
  highCriticalCount: number;
  mockCrmTasks: MockCrmTask[];
  notificationOutboxItems: NotificationOutboxItem[];
  openActions: OpsAction[];
};

const severityRank: Record<ActionSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

function readBoolean(record: unknown, key: string, fallback = false) {
  if (!isRecord(record)) {
    return fallback;
  }

  const value = record[key];

  return typeof value === "boolean" ? value : fallback;
}

function mapActionStatus(status: string): ActionStatus {
  switch (status) {
    case "sent":
    case "acknowledged":
    case "ignored":
    case "resolved":
    case "queued":
      return status;
    case "existing":
      return "acknowledged";
    default:
      return "queued";
  }
}

function mapSeverityFromRisk(riskLevel?: string): ActionSeverity {
  switch (riskLevel) {
    case "critical":
    case "high":
    case "medium":
    case "low":
      return riskLevel;
    default:
      return "medium";
  }
}

function compareActions(left: Pick<OpsAction, "createdAt" | "severity">, right: Pick<OpsAction, "createdAt" | "severity">) {
  const severityDelta = severityRank[right.severity] - severityRank[left.severity];

  if (severityDelta !== 0) {
    return severityDelta;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function normalizeOpsAction(action: OpsAction): OpsAction {
  return {
    ...action,
    status: mapActionStatus(action.status)
  };
}

function buildDemoActionCenterData(): ActionCenterData {
  const churnAlerts = demoChurnDefuserActions.map((item) =>
    normalizeOpsAction({
      id: item.id,
      accountId: item.accountId,
      accountName: item.accountName,
      title: item.title,
      body: item.body,
      source: "churn_defuser",
      severity: item.riskLevel,
      status: item.status === "simulated" || item.status === "existing" || item.status === "skipped" ? "queued" : item.status,
      recommendedOwner: item.recommendedOwner,
      suggestedNextStep: item.suggestedNextStep ?? item.recommendedAction,
      createdAt: item.createdAt
    })
  );
  const dlqEscalations = demoOpsActions.filter((item) => item.source === "dlq_escalation").map(normalizeOpsAction);
  const actions = demoOpsActions.map(normalizeOpsAction).sort(compareActions);
  const openActions = actions.filter((item) => item.status !== "resolved" && item.status !== "ignored");

  return {
    actions,
    churnAlerts,
    dlqEscalations,
    highCriticalCount: openActions.filter((item) => item.severity === "high" || item.severity === "critical").length,
    mockCrmTasks: demoMockCrmTasks,
    notificationOutboxItems: demoNotificationOutboxItems,
    openActions
  };
}

function mapNotificationRowToNotificationItem({
  accountName,
  row
}: {
  accountName: string;
  row: NotificationOutboxRow;
}): NotificationOutboxItem {
  const payload = isRecord(row.payload_json) ? row.payload_json : {};
  const severity = mapSeverityFromRisk(readJsonString(payload, "risk_level"));

  return {
    id: row.id,
    accountId: row.account_id ?? readJsonString(payload, "account_id") ?? "unassigned",
    accountName,
    title: row.title,
    body: row.body,
    source: "notification_outbox",
    severity,
    status: mapActionStatus(row.status),
    recommendedOwner: readJsonString(payload, "recommended_owner") ?? "Revenue operations",
    suggestedNextStep:
      readJsonString(payload, "suggested_next_step") ??
      readJsonString(payload, "recommended_action") ??
      "Review the mock notification payload and route the next operator action.",
    createdAt: row.created_at,
    channel: row.channel ?? "mock-slack",
    recipient: row.recipient ?? "revops-escalations"
  };
}

function buildNotificationAction(item: NotificationOutboxItem): OpsAction {
  return {
    id: `ops_notification_${item.id}`,
    accountId: item.accountId,
    accountName: item.accountName,
    title: item.title,
    body: item.body,
    source: "notification_outbox",
    severity: item.severity,
    status: item.status,
    recommendedOwner: item.recommendedOwner,
    suggestedNextStep: item.suggestedNextStep,
    createdAt: item.createdAt
  };
}

function buildChurnAlertAction(item: NotificationOutboxItem, payload: Record<string, unknown>): OpsAction {
  return {
    id: `ops_churn_${item.id}`,
    accountId: item.accountId,
    accountName: item.accountName,
    title: item.title,
    body:
      readJsonString(payload, "recommended_action") ??
      item.body,
    source: "churn_defuser",
    severity: item.severity,
    status: item.status,
    recommendedOwner: item.recommendedOwner,
    suggestedNextStep: item.suggestedNextStep,
    createdAt: item.createdAt
  };
}

function buildCrmTaskFromPayload({
  item,
  payload
}: {
  item: NotificationOutboxItem;
  payload: Record<string, unknown>;
}): MockCrmTask | null {
  const riskLevel = mapSeverityFromRisk(readJsonString(payload, "risk_level")) as ChurnRiskLevel;
  const shouldCreateHumanTask = readBoolean(payload, "requires_human_task") || riskLevel === "high" || riskLevel === "critical";

  if (!shouldCreateHumanTask) {
    return null;
  }

  const crmTaskRecord = isRecord(payload.crm_task) ? payload.crm_task : null;

  if (crmTaskRecord) {
    return {
      id: readJsonString(crmTaskRecord, "id") ?? `crm_task_${item.id}`,
      accountId: item.accountId,
      accountName: item.accountName,
      title: readJsonString(crmTaskRecord, "title") ?? `Mock CRM task: recover ${item.accountName}`,
      description: readJsonString(crmTaskRecord, "description") ?? item.body,
      source: "mock_crm_task",
      severity: mapSeverityFromRisk(readJsonString(crmTaskRecord, "severity") ?? riskLevel),
      status: mapActionStatus(readJsonString(crmTaskRecord, "status") ?? "queued"),
      recommendedOwner: readJsonString(crmTaskRecord, "recommended_owner") ?? item.recommendedOwner,
      suggestedNextStep: readJsonString(crmTaskRecord, "suggested_next_step") ?? item.suggestedNextStep,
      createdAt: readJsonString(crmTaskRecord, "created_at") ?? item.createdAt
    };
  }

  return buildCrmTask({
    account: {
      id: item.accountId,
      name: item.accountName
    },
    assessment: {
      reasonSummary: readJsonString(payload, "reason_summary") ?? item.body,
      riskLevel
    },
    normalizedEvent: {
      failureReason: readJsonString(payload, "failure_reason") ?? null,
      providerEventId: readJsonString(payload, "provider_event_id") ?? item.id,
      receivedAt: item.createdAt,
      type: (readJsonString(payload, "event_type") ?? "invoice.payment_failed") as
        | "customer.subscription.deleted"
        | "customer.subscription.updated"
        | "invoice.paid"
        | "invoice.payment_failed"
    },
    recommendedOwner: item.recommendedOwner,
    suggestedNextStep: item.suggestedNextStep
  });
}

function buildCrmTaskAction(task: MockCrmTask): OpsAction {
  return {
    id: `ops_${task.id}`,
    accountId: task.accountId,
    accountName: task.accountName,
    title: task.title,
    description: task.description,
    source: "mock_crm_task",
    severity: task.severity,
    status: task.status,
    recommendedOwner: task.recommendedOwner,
    suggestedNextStep: task.suggestedNextStep,
    createdAt: task.createdAt
  };
}

async function buildLiveActionCenterData(client: NonNullable<ReturnType<typeof import("../supabase").createSupabaseServerClient>>): Promise<ActionCenterData> {
  const [{ data: notificationRows, error }, accounts, queueItems] = await Promise.all([
    client.from("notification_outbox")
      .select("id,account_id,title,body,channel,recipient,status,payload_json,created_at")
      .order("created_at", { ascending: false })
      .limit(18),
    getAccounts(),
    getDeadLetterQueueItems()
  ]);

  if (error) {
    throw error;
  }

  const accountMap = new Map(accounts.map((account) => [account.id, account] as const));
  const mappedNotifications = ((notificationRows ?? []) as NotificationOutboxRow[]).map((row) => {
    const payload = isRecord(row.payload_json) ? (row.payload_json as Record<string, unknown>) : {};
    const accountName =
      (row.account_id ? accountMap.get(row.account_id)?.name : undefined) ??
      readJsonString(payload, "account_name") ??
      "Unassigned account";

    return {
      item: mapNotificationRowToNotificationItem({
        accountName,
        row
      }),
      payload
    };
  });
  const notificationOutboxItems = mappedNotifications.map((entry) => entry.item);
  const churnAlerts = mappedNotifications
    .filter((entry) => readJsonString(entry.payload, "workflow") === "churn_defuser")
    .map((entry) => buildChurnAlertAction(entry.item, entry.payload));
  const mockCrmTasks = mappedNotifications
    .map(({ item, payload }) => {
      return buildCrmTaskFromPayload({
        item,
        payload
      });
    })
    .filter((item): item is MockCrmTask => Boolean(item));
  const dlqEscalations = queueItems
    .filter((item) => item.status === "escalated" || item.escalationRecommended)
    .map<OpsAction>((item) => ({
      id: `ops_dlq_${item.id}`,
      accountId: item.accountId,
      accountName: item.accountName,
      title: `DLQ escalation for ${item.accountName}`,
      body: item.lastError,
      source: "dlq_escalation",
      severity: item.status === "escalated" ? "critical" : "high",
      status: item.status === "resolved" ? "resolved" : "acknowledged",
      recommendedOwner: "Revenue systems",
      suggestedNextStep: item.retrySummary ?? "Review the dead-letter queue item and coordinate a safe replay.",
      createdAt: item.createdAt ?? item.lastAttemptAt ?? new Date().toISOString()
    }));

  const actions = [
    ...notificationOutboxItems.map(buildNotificationAction),
    ...churnAlerts,
    ...mockCrmTasks.map(buildCrmTaskAction),
    ...dlqEscalations
  ].sort(compareActions);
  const openActions = actions.filter((item) => item.status !== "resolved" && item.status !== "ignored");

  return {
    actions,
    churnAlerts,
    dlqEscalations,
    highCriticalCount: openActions.filter((item) => item.severity === "high" || item.severity === "critical").length,
    mockCrmTasks,
    notificationOutboxItems,
    openActions
  };
}

export async function getActionCenterData(): Promise<ActionCenterData> {
  return withDataFallback(buildDemoActionCenterData, async (client) => buildLiveActionCenterData(client));
}

export async function getOpsActions(): Promise<OpsAction[]> {
  const data = await getActionCenterData();
  return data.actions;
}

export async function getOpenOpsActions(limit?: number): Promise<OpsAction[]> {
  const data = await getActionCenterData();
  return typeof limit === "number" ? data.openActions.slice(0, limit) : data.openActions;
}

export async function getHighCriticalOpsActionCount(): Promise<number> {
  const data = await getActionCenterData();
  return data.highCriticalCount;
}

export async function getAccountOpsActions(accountId: string): Promise<OpsAction[]> {
  const data = await getActionCenterData();
  return data.actions.filter((item) => item.accountId === accountId);
}

export async function getNotificationOutboxItems(): Promise<NotificationOutboxItem[]> {
  const data = await getActionCenterData();
  return data.notificationOutboxItems;
}

export async function getMockCrmTasks(): Promise<MockCrmTask[]> {
  const data = await getActionCenterData();
  return data.mockCrmTasks;
}
