import { accounts as demoAccounts, events as demoEvents } from "../demo-data";
import type { RevOpsEvent } from "../types";
import { getAccounts } from "./accounts";
import { type EventLogRow, mapEventRowToRevOpsEvent } from "./mappers";
import { withDataFallback } from "./shared";

export async function getEvents(): Promise<RevOpsEvent[]> {
  return withDataFallback(
    () => demoEvents,
    async (client) => {
      const [{ data: eventRows, error }, accounts] = await Promise.all([
        client
          .from("event_log")
          .select("id,provider_event_id,provider,event_type,account_id,status,payload_json,normalized_json,received_at,retry_count,error_message")
          .order("received_at", { ascending: false }),
        getAccounts()
      ]);

      if (error) {
        throw error;
      }

      const accountMap = new Map(accounts.map((account) => [account.id, account] as const));

      return ((eventRows ?? []) as EventLogRow[]).map((row) =>
        mapEventRowToRevOpsEvent({
          row,
          account: row.account_id ? accountMap.get(row.account_id) ?? demoAccounts.find((account) => account.id === row.account_id) : undefined
        })
      );
    }
  );
}
