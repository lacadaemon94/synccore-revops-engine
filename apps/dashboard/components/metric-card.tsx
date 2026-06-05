import type { Metric } from "../lib/types";
import { Badge } from "./badge";

const toneLabelMap = {
  default: "steady",
  positive: "healthy",
  warning: "watchlist",
  danger: "attention"
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
        <p className="metric-card__label">{metric.label}</p>
        <Badge tone={toneBadgeMap[tone]}>{toneLabelMap[tone]}</Badge>
      </div>
      <p className="metric-card__value">{metric.value}</p>
      <p className="metric-card__helper">{metric.helper}</p>
    </div>
  );
}
