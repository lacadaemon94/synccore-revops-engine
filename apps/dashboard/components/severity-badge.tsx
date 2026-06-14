import type { ActionSeverity, DiscrepancySeverity } from "../lib/types";
import { Badge } from "./badge";

const severityToneMap: Record<ActionSeverity, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  critical: "danger",
  low: "info",
  medium: "warning",
  high: "danger"
};

export function SeverityBadge({ severity }: { severity: ActionSeverity | DiscrepancySeverity }) {
  return <Badge tone={severityToneMap[severity]}>{severity}</Badge>;
}
