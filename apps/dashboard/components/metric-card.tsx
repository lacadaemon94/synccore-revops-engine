import type { Metric } from "../lib/types";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{metric.label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
      <p className="mt-2 text-sm text-emerald-300">{metric.helper}</p>
    </div>
  );
}
