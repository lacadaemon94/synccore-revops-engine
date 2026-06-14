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
    <div className="severity-summary">
      {severityOrder.map((severity) => {
        const count = actions.filter((action) => action.severity === severity).length;

        return (
          <div key={severity} className="severity-summary__item">
            <Badge tone={severityToneMap[severity]} className="badge--severity" leadingDot>
              {severity}
            </Badge>
            <span className="severity-summary__count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
