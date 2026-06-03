import { AppShell } from "../../components/app-shell";
import { DataTable } from "../../components/data-table";
import { events } from "../../lib/demo-data";

export default function EventsPage() {
  return (
    <AppShell>
      <h2 className="text-3xl font-semibold">Event stream</h2>
      <p className="mt-2 text-slate-400">Billing and workflow events normalized into a single operational log.</p>
      <div className="mt-6">
        <DataTable
          rows={events}
          columns={[
            { key: "id", header: "Provider Event", render: (row) => row.providerEventId },
            { key: "type", header: "Type", render: (row) => row.eventType },
            { key: "account", header: "Account", render: (row) => row.accountName },
            { key: "status", header: "Status", render: (row) => row.status },
            { key: "retry", header: "Retries", render: (row) => row.retryCount },
            { key: "amount", header: "Amount", render: (row) => (row.amount ? `$${row.amount}` : "-") }
          ]}
        />
      </div>
    </AppShell>
  );
}
