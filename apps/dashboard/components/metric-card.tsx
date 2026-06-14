import type { Metric } from "../lib/types";
import { Badge } from "./badge";

const toneLabelMap = {
  default: "steady",
  positive: "ok",
  warning: "watch",
  danger: "alert"
} as const;

const toneBadgeMap = {
  default: "neutral",
  positive: "positive",
  warning: "warning",
  danger: "danger"
} as const;

export function MetricCard({ metric }: { metric: Metric }) {
  const tone = metric.tone ?? "default";

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <div className="metric-card__copy">
          <p className="metric-card__label">{metric.label}</p>
          <p className="metric-card__helper">{metric.helper}</p>
        </div>
        <Badge tone={toneBadgeMap[tone]} className="metric-card__badge" leadingDot>
          {toneLabelMap[tone]}
        </Badge>
      </div>
      <div className="metric-card__value-row">
        <p className="metric-card__value">{metric.value}</p>
      </div>
    </div>
  );
}
