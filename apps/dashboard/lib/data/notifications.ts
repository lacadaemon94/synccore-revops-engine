import { churnDefuserActions as demoChurnDefuserActions } from "../demo-data";
import type { ChurnDefuserAction } from "../types";
import { getAccounts } from "./accounts";
import { isRecord, readJsonString, withDataFallback } from "./shared";

type NotificationOutboxRow = {
  id: string;
  account_id: null | string;
  title: string;
  body: string;
  status: string;
  payload_json: unknown;
  created_at: string;
};

function mapNotificationStatus(status: string): ChurnDefuserAction["status"] {
  switch (status) {
    case "queued":
      return "queued";
    case "sent":
      return "sent";
    case "acknowledged":
      return "acknowledged";
    case "ignored":
      return "ignored";
    case "resolved":
      return "resolved";
    case "existing":
      return "existing";
    default:
      return "queued";
  }
}

function readBoolean(record: unknown, key: string, fallback = false) {
  if (!isRecord(record)) {
    return fallback;
  }

  const value = record[key];

  return typeof value === "boolean" ? value : fallback;
}

export async function getRecentChurnDefuserActions(): Promise<ChurnDefuserAction[]> {
  return withDataFallback(
    () => demoChurnDefuserActions,
    async (client) => {
      const [{ data: rows, error }, accounts] = await Promise.all([
        client
          .from("notification_outbox")
          .select("id,account_id,title,body,status,payload_json,created_at")
          .contains("payload_json", { workflow: "churn_defuser" })
          .order("created_at", { ascending: false })
          .limit(6),
        getAccounts()
      ]);

      if (error) {
        throw error;
      }

      const accountMap = new Map(accounts.map((account) => [account.id, account] as const));

      return ((rows ?? []) as NotificationOutboxRow[]).map((row) => {
        const payload = isRecord(row.payload_json) ? row.payload_json : {};
        const account = row.account_id ? accountMap.get(row.account_id) : undefined;

        return {
          id: row.id,
          accountId: row.account_id ?? account?.id ?? "unassigned",
          accountName: account?.name ?? "Unassigned account",
          title: row.title,
          body: row.body,
          providerEventId: readJsonString(payload, "provider_event_id") ?? row.id,
          eventType: readJsonString(payload, "event_type") ?? "invoice.payment_failed",
          riskLevel:
            readJsonString(payload, "risk_level") === "critical" ||
            readJsonString(payload, "risk_level") === "high" ||
            readJsonString(payload, "risk_level") === "medium" ||
            readJsonString(payload, "risk_level") === "low"
              ? (readJsonString(payload, "risk_level") as ChurnDefuserAction["riskLevel"])
              : "medium",
          recommendedAction:
            readJsonString(payload, "recommended_action") ?? "Review the billing failure and continue the mock recovery sequence.",
          recommendedOwner: readJsonString(payload, "recommended_owner") ?? "Billing operations",
          requiresHumanTask: readBoolean(payload, "requires_human_task"),
          shouldNotifyOps: readBoolean(payload, "should_notify_ops"),
          gracePeriodRecommendation:
            readJsonString(payload, "grace_period_recommendation") ?? "Keep the standard recovery grace window active.",
          suggestedNextStep:
            readJsonString(payload, "suggested_next_step") ??
            readJsonString(payload, "recommended_action") ??
            "Review the billing failure and continue the mock recovery sequence.",
          status: mapNotificationStatus(row.status),
          createdAt: row.created_at
        };
      });
    }
  );
}
