import { Badge } from "./badge";
import type { EventStatus, QueueStatus } from "../lib/types";

const statusToneMap: Record<EventStatus | QueueStatus, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  received: "info",
  processed: "positive",
  failed: "danger",
  routed_to_dlq: "warning",
  pending: "neutral",
  retrying: "info",
  resolved: "positive",
  escalated: "danger"
};

export function StatusBadge({ status }: { status: EventStatus | QueueStatus }) {
  return (
    <Badge tone={statusToneMap[status]} className="badge--status" leadingDot>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
