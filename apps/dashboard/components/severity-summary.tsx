import { Badge } from "./badge";
import type { ActionSeverity, OpsAction } from "../lib/types";

const severityOrder: ActionSeverity[] = ["critical", "high", "medium", "low"];
const severityToneMap: Record<ActionSeverity, "neutral" | "positive" | "warning" | "danger" | "info"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "positive"
};

export function SeveritySummary({ actions }: { actions: OpsAction[] }) {
  return (
    <div className="badge-row">
      {severityOrder.map((severity) => {
        const count = actions.filter((action) => action.severity === severity).length;

        return (
          <Badge key={severity} tone={severityToneMap[severity]}>
            {count} {severity}
          </Badge>
        );
      })}
    </div>
  );
}
