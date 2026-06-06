import { metrics as demoMetrics } from "../demo-data";
import { formatCompactCurrency, formatPercent } from "../format";
import type { Metric } from "../types";
import { getAccounts } from "./accounts";
import { getDiscrepancies } from "./discrepancies";
import { getEvents } from "./events";
import { getQueueItems } from "./queue";
import { withDataFallback } from "./shared";

function isSameUtcDay(left: string, right = new Date().toISOString()) {
  return left.slice(0, 10) === right.slice(0, 10);
}

export async function getOverviewMetrics(): Promise<Metric[]> {
  return withDataFallback(
    () => demoMetrics,
    async () => {
      const [accounts, events, queueItems, discrepancies] = await Promise.all([
        getAccounts(),
        getEvents(),
        getQueueItems(),
        getDiscrepancies()
      ]);

      const processedToday = events.filter((event) => ["processed", "resolved"].includes(event.status) && isSameUtcDay(event.receivedAt)).length;
      const processedCount = processedToday || events.filter((event) => ["processed", "resolved"].includes(event.status)).length;
      const failedCount = events.filter((event) => ["failed", "routed_to_dlq"].includes(event.status)).length;
      const retriedEvents = events.filter((event) => event.retryCount > 0);
      const successfulRetries = retriedEvents.filter((event) => ["processed", "resolved"].includes(event.status)).length;
      const retrySuccessRate = retriedEvents.length ? (successfulRetries / retriedEvents.length) * 100 : 100;
      const churnRiskAccounts = accounts.filter((account) => account.riskLevel !== "stable");
      const openDiscrepancies = discrepancies.filter((item) => item.status !== "resolved");
      const highSeverityDiscrepancies = openDiscrepancies.filter((item) => item.severity === "high").length;
      const revenueAtRisk = accounts.reduce((total, account) => total + account.revenueAtRisk, 0);

      return [
        {
          label: "Events processed today",
          value: processedCount.toLocaleString("en-US"),
          helper: processedToday ? "Live snapshot from the current UTC day" : "Current persisted snapshot",
          tone: "positive"
        },
        {
          label: "Failed events",
          value: failedCount.toLocaleString("en-US"),
          helper: `${queueItems.filter((item) => item.status !== "resolved").length} items still active in the DLQ`,
          tone: failedCount ? "danger" : "positive"
        },
        {
          label: "Retry success rate",
          value: formatPercent(retrySuccessRate),
          helper: retriedEvents.length ? "Derived from persisted retry attempts" : "No retries required in the current snapshot",
          tone: retrySuccessRate >= 95 ? "positive" : retrySuccessRate >= 75 ? "warning" : "danger"
        },
        {
          label: "Accounts at churn risk",
          value: churnRiskAccounts.length.toLocaleString("en-US"),
          helper: `${formatCompactCurrency(churnRiskAccounts.reduce((total, account) => total + account.mrr, 0))} in exposed MRR`,
          tone: churnRiskAccounts.length ? "warning" : "positive"
        },
        {
          label: "CRM/Billing discrepancies",
          value: openDiscrepancies.length.toLocaleString("en-US"),
          helper: `${highSeverityDiscrepancies} high severity mismatches open`,
          tone: openDiscrepancies.length ? "warning" : "positive"
        },
        {
          label: "Revenue at risk",
          value: formatCompactCurrency(revenueAtRisk),
          helper: "Derived from persisted account, subscription, and event state",
          tone: revenueAtRisk > 0 ? "danger" : "positive"
        }
      ];
    }
  );
}
