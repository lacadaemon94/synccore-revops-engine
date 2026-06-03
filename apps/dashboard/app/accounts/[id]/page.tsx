import { AppShell } from "../../../components/app-shell";
import { DataTable } from "../../../components/data-table";
import { accounts, discrepancies, events } from "../../../lib/demo-data";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = accounts.find((item) => item.id === id) ?? accounts[0];
  const accountEvents = events.filter((event) => event.accountId === account.id);
  const accountDiscrepancies = discrepancies.filter((item) => item.accountId === account.id);

  return (
    <AppShell>
      <h2 className="text-3xl font-semibold">{account.name}</h2>
      <p className="mt-2 text-slate-400">{account.domain} · {account.lifecycleStage}</p>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">MRR</p><p className="mt-2 text-2xl font-semibold">${account.mrr}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">ARR</p><p className="mt-2 text-2xl font-semibold">${account.arr}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">LTV</p><p className="mt-2 text-2xl font-semibold">${account.ltv}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Usage density</p><p className="mt-2 text-2xl font-semibold">{account.usageDensity}%</p></div>
      </section>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">Recent account events</h3>
        <DataTable rows={accountEvents} columns={[
          { key: "event", header: "Event", render: (row) => row.eventType },
          { key: "status", header: "Status", render: (row) => row.status },
          { key: "retry", header: "Retries", render: (row) => row.retryCount }
        ]} />
      </section>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">Open discrepancies</h3>
        <DataTable rows={accountDiscrepancies} columns={[
          { key: "field", header: "Field", render: (row) => row.fieldName },
          { key: "billing", header: "Billing", render: (row) => row.sourceAValue },
          { key: "crm", header: "CRM", render: (row) => row.sourceBValue },
          { key: "action", header: "Action", render: (row) => row.suggestedAction }
        ]} />
      </section>
    </AppShell>
  );
}
