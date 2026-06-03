import { AppShell } from "../components/app-shell";
import { MetricCard } from "../components/metric-card";
import { DataTable } from "../components/data-table";
import { accounts, events, metrics, queueItems } from "../lib/demo-data";

export default function OverviewPage() {
  return (
    <AppShell>
      <section>
        <p className="text-sm uppercase tracking-wide text-emerald-300">Demo mode active</p>
        <h2 className="mt-2 text-4xl font-semibold">Revenue operations health</h2>
        <p className="mt-3 max-w-3xl text-slate-400">
          SyncCore shows how billing events, CRM state, retries, and revenue risk can be centralized into one operational control plane.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold">Recent events</h3>
          <DataTable
            rows={events}
            columns={[
              { key: "event", header: "Event", render: (row) => row.eventType },
              { key: "account", header: "Account", render: (row) => row.accountName },
              { key: "status", header: "Status", render: (row) => row.status }
            ]}
          />
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold">Accounts monitored</h3>
          <DataTable
            rows={accounts}
            columns={[
              { key: "name", header: "Account", render: (row) => row.name },
              { key: "mrr", header: "MRR", render: (row) => `$${row.mrr}` },
              { key: "health", header: "Health", render: (row) => `${row.healthScore}%` }
            ]}
          />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-xl font-semibold">Queue status</h3>
        <p className="mt-2 text-slate-400">{queueItems.length} event currently waiting for retry in the demo dead-letter queue.</p>
      </section>
    </AppShell>
  );
}
