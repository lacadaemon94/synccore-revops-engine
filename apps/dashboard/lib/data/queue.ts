import { queueItems as demoQueueItems } from "../demo-data";
import type { QueueItem } from "../types";
import { getAccounts } from "./accounts";
import { getEvents } from "./events";
import { type QueueRow, mapQueueRowToQueueItem } from "./mappers";
import { withDataFallback } from "./shared";

export async function getQueueItems(): Promise<QueueItem[]> {
  return withDataFallback(
    () => demoQueueItems,
    async (client) => {
      const [{ data: queueRows, error }, accounts, events] = await Promise.all([
        client
          .from("dead_letter_queue")
          .select("id,event_log_id,target_system,status,retry_count,max_retries,next_retry_at,last_error")
          .order("created_at", { ascending: false }),
        getAccounts(),
        getEvents()
      ]);

      if (error) {
        throw error;
      }

      const accountMap = new Map(accounts.map((account) => [account.id, account] as const));
      const eventMap = new Map(events.map((event) => [event.id, event] as const));

      return ((queueRows ?? []) as QueueRow[]).map((row) => {
        const event = row.event_log_id ? eventMap.get(row.event_log_id) : undefined;
        const account = event?.accountId ? accountMap.get(event.accountId) : undefined;

        return mapQueueRowToQueueItem({
          row,
          event,
          account
        });
      });
    }
  );
}
