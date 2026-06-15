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

const fallbackTrendMap = {
  default: [42, 46, 45, 51, 50, 56, 58],
  positive: [34, 39, 43, 48, 54, 59, 66],
  warning: [54, 52, 57, 55, 61, 59, 63],
  danger: [36, 45, 42, 58, 53, 67, 72]
} as const;

function buildSparklinePath(values: readonly number[]) {
  const width = 132;
  const height = 42;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MetricCard({ metric }: { metric: Metric }) {
  const tone = metric.tone ?? "default";
  const trend = metric.trend ?? fallbackTrendMap[tone];
  const sparklinePath = buildSparklinePath(trend);

  return (
    <div className="metric-card" data-tone={tone === "default" ? "default" : toneBadgeMap[tone]}>
      <div className="metric-card__header">
        <div className="metric-card__copy">
          <p className="metric-card__label">{metric.label}</p>
        </div>
        <Badge tone={toneBadgeMap[tone]} className="metric-card__badge" leadingDot>
          {toneLabelMap[tone]}
        </Badge>
      </div>
      <div className="metric-card__value-row">
        <p className="metric-card__value">{metric.value}</p>
      </div>
      <svg className="metric-card__sparkline" viewBox="0 0 132 42" role="img" aria-label={`${metric.label} trend`}>
        <path className="metric-card__sparkline-fill" d={`${sparklinePath} L 132 42 L 0 42 Z`} />
        <path className="metric-card__sparkline-line" d={sparklinePath} />
      </svg>
    </div>
  );
}
