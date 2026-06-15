import { Badge } from "./badge";
import type { ActionStatus } from "../lib/types";

const statusToneMap: Record<ActionStatus, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  queued: "warning",
  sent: "info",
  acknowledged: "neutral",
  ignored: "neutral",
  resolved: "positive"
};

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return (
    <Badge tone={statusToneMap[status]} className="badge--action-status">
      {status.replace("_", " ")}
    </Badge>
  );
}
