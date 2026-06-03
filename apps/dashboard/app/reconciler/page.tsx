import { AppShell } from "../../components/app-shell";
import { DataTable } from "../../components/data-table";
import { discrepancies } from "../../lib/demo-data";

export default function ReconcilerPage() {
  return (
    <AppShell>
      <h2 className="text-3xl font-semibold">CRM/Billing reconciler</h2>
      <p className="mt-2 text-slate-400">Find mismatches between commercial systems before they become revenue leaks.</p>
      <div className="mt-6">
        <DataTable
          rows={discrepancies}
          columns={[
            { key: "account", header: "Account", render: (row) => row.accountName },
            { key: "field", header: "Field", render: (row) => row.fieldName },
            { key: "billing", header: "Billing", render: (row) => row.sourceAValue },
            { key: "crm", header: "CRM", render: (row) => row.sourceBValue },
            { key: "severity", header: "Severity", render: (row) => row.severity },
            { key: "action", header: "Suggested Action", render: (row) => row.suggestedAction }
          ]}
        />
      </div>
    </AppShell>
  );
}
