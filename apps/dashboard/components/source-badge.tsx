import { Badge } from "./badge";
import type { ActionSource } from "../lib/types";

const sourceToneMap: Record<ActionSource, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  churn_defuser: "warning",
  dlq_escalation: "danger",
  mock_crm_task: "info",
  notification_outbox: "positive"
};

const sourceLabelMap: Record<ActionSource, string> = {
  churn_defuser: "Churn",
  dlq_escalation: "DLQ",
  mock_crm_task: "CRM task",
  notification_outbox: "Outbox"
};

export function SourceBadge({ source }: { source: ActionSource }) {
  return (
    <Badge tone={sourceToneMap[source]} className="badge--source" leadingDot>
      {sourceLabelMap[source]}
    </Badge>
  );
}
