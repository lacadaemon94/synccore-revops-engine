import { discrepancies as demoDiscrepancies } from "../demo-data";
import type { Discrepancy } from "../types";
import { getAccounts } from "./accounts";
import { type DiscrepancyRow, mapDiscrepancyRowToDiscrepancy } from "./mappers";
import { withDataFallback } from "./shared";

export async function getDiscrepancies(): Promise<Discrepancy[]> {
  return withDataFallback(
    () => demoDiscrepancies,
    async (client) => {
      const [{ data: discrepancyRows, error }, accounts] = await Promise.all([
        client
          .from("discrepancies")
          .select("id,account_id,source_a,source_b,field_name,source_a_value,source_b_value,severity,status,suggested_action")
          .order("detected_at", { ascending: false }),
        getAccounts()
      ]);

      if (error) {
        throw error;
      }

      const accountMap = new Map(accounts.map((account) => [account.id, account] as const));

      return ((discrepancyRows ?? []) as DiscrepancyRow[]).map((row) =>
        mapDiscrepancyRowToDiscrepancy({
          row,
          account: row.account_id ? accountMap.get(row.account_id) : undefined
        })
      );
    }
  );
}
