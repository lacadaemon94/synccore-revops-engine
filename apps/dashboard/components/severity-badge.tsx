import type { DiscrepancySeverity } from "../lib/types";
import { Badge } from "./badge";

const severityToneMap: Record<DiscrepancySeverity, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  low: "info",
  medium: "warning",
  high: "danger"
};

export function SeverityBadge({ severity }: { severity: DiscrepancySeverity }) {
  return <Badge tone={severityToneMap[severity]}>{severity}</Badge>;
}
