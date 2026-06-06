import { accounts as demoAccounts } from "../demo-data";
import type { Account } from "../types";
import {
  type AccountRow,
  type DiscrepancyRow,
  type EventLogRow,
  type SubscriptionRow,
  mapAccountRowToAccount,
  mapEventRowToRevOpsEvent
} from "./mappers";
import { withDataFallback } from "./shared";

async function readAccountRows(client: NonNullable<ReturnType<typeof import("../supabase").createSupabaseServerClient>>) {
  const [{ data: accountRows, error: accountError }, { data: subscriptionRows, error: subscriptionError }, { data: eventRows, error: eventError }, { data: discrepancyRows, error: discrepancyError }] =
    await Promise.all([
      client.from("accounts").select("id,name,normalized_domain,lifecycle_stage,mrr,arr,ltv,health_score,created_at,updated_at").order("name"),
      client.from("subscriptions").select("account_id,tier,status,current_period_end,mrr,previous_mrr,expansion_amount"),
      client.from("event_log").select("id,provider_event_id,provider,event_type,account_id,status,payload_json,normalized_json,received_at,retry_count,error_message").order("received_at", { ascending: false }),
      client.from("discrepancies").select("id,account_id,source_a,source_b,field_name,source_a_value,source_b_value,severity,status,suggested_action")
    ]);

  if (accountError) {
    throw accountError;
  }

  if (subscriptionError) {
    throw subscriptionError;
  }

  if (eventError) {
    throw eventError;
  }

  if (discrepancyError) {
    throw discrepancyError;
  }

  return {
    accountRows: (accountRows ?? []) as AccountRow[],
    subscriptionRows: (subscriptionRows ?? []) as SubscriptionRow[],
    eventRows: (eventRows ?? []) as EventLogRow[],
    discrepancyRows: (discrepancyRows ?? []) as DiscrepancyRow[]
  };
}

function buildAccounts({
  accountRows,
  subscriptionRows,
  eventRows,
  discrepancyRows
}: {
  accountRows: AccountRow[];
  subscriptionRows: SubscriptionRow[];
  eventRows: EventLogRow[];
  discrepancyRows: DiscrepancyRow[];
}) {
  const latestEventsByAccountId = new Map<string, ReturnType<typeof mapEventRowToRevOpsEvent>>();

  for (const row of eventRows) {
    if (!row.account_id || latestEventsByAccountId.has(row.account_id)) {
      continue;
    }

    latestEventsByAccountId.set(
      row.account_id,
      mapEventRowToRevOpsEvent({
        row,
        account: row.account_id ? { id: row.account_id, name: "Unassigned account", mrr: 0 } : undefined
      })
    );
  }

  return accountRows.map((row) =>
    mapAccountRowToAccount({
      row,
      subscription: subscriptionRows.find((item) => item.account_id === row.id),
      latestEvent: latestEventsByAccountId.get(row.id),
      discrepancyRows: discrepancyRows.filter((item) => item.account_id === row.id)
    })
  );
}

export async function getAccounts(): Promise<Account[]> {
  return withDataFallback(
    () => demoAccounts,
    async (client) => {
      const snapshot = await readAccountRows(client);
      return buildAccounts(snapshot);
    }
  );
}

export async function getAccountById(id: string): Promise<Account | null> {
  const accountList = await getAccounts();

  return accountList.find((item) => item.id === id) ?? null;
}
