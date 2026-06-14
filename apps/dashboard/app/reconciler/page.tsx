import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { DataTable } from "../../components/data-table";
import { MetricCard } from "../../components/metric-card";
import { PageHeader } from "../../components/page-header";
import { Panel } from "../../components/panel";
import { SectionHeader } from "../../components/section-header";
import { SeverityBadge } from "../../components/severity-badge";
import { StatusBadge } from "../../components/status-badge";
import { getDiscrepancies } from "../../lib/data/discrepancies";
import { titleCase } from "../../lib/format";

export default async function ReconcilerPage() {
  const discrepancies = await getDiscrepancies();
  const highSeverityCount = discrepancies.filter((item) => item.severity === "high" && item.status !== "resolved").length;
  const mrrMismatchCount = discrepancies.filter((item) => item.fieldName === "mrr").length;
  const tierMismatchCount = discrepancies.filter((item) => item.fieldName === "plan_tier").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Commercial drift detection"
        title="CRM/Billing reconciler"
        description="Iter SyncCore surfaces mismatches between billing truth and CRM state before they become revenue leakage or GTM confusion."
      />

      <section className="metrics-grid metrics-grid--three">
        <MetricCard metric={{ label: "High severity mismatches", value: highSeverityCount.toString(), helper: "Needs immediate human follow-up", tone: "danger" }} />
        <MetricCard metric={{ label: "MRR mismatches", value: mrrMismatchCount.toString(), helper: "Forecasting and attribution risk", tone: "warning" }} />
        <MetricCard metric={{ label: "Plan tier drift", value: tierMismatchCount.toString(), helper: "Packaging and support risk", tone: "default" }} />
      </section>

      <section className="split-grid split-grid--two">
        <Panel>
          <p className="panel__kicker">Why this matters</p>
          <h2 className="panel__title">CRM and billing drift quietly compounds.</h2>
          <p className="panel__copy">
            A status mismatch can create churn false-positives, an MRR gap can understate live revenue, and a tier mismatch can route the wrong coverage model. The reconciler keeps these breaks visible instead of letting them hide in system boundaries.
          </p>
        </Panel>
        <Panel>
          <p className="panel__kicker">Live examples in this phase</p>
          <div className="badge-row">
            <SeverityBadge severity="high" />
            <span className="cell-subtle">Status mismatches that change lifecycle handling</span>
          </div>
          <div className="badge-row">
            <SeverityBadge severity="medium" />
            <span className="cell-subtle">MRR mismatches that distort revenue visibility</span>
          </div>
          <div className="badge-row">
            <SeverityBadge severity="low" />
            <span className="cell-subtle">Tier mismatches that skew coverage and packaging</span>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Active discrepancy table"
          description="Suggested actions stay close to the mismatch so RevOps can move from diagnosis to cleanup quickly."
        />
        <DataTable
          rows={discrepancies}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: "account",
              header: "Account",
              render: (row) => (
                <Link className="text-link" href={`/accounts/${row.accountId}`}>
                  {row.accountName}
                </Link>
              )
            },
            {
              key: "scenario",
              header: "Drift example",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title">{row.scenario}</span>
                  <span className="cell-subtle">{row.impact}</span>
                </div>
              )
            },
            {
              key: "billing",
              header: "Billing",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title">{titleCase(row.sourceA)}</span>
                  <span className="cell-subtle">{row.sourceAValue}</span>
                </div>
              )
            },
            {
              key: "crm",
              header: "CRM",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title">{titleCase(row.sourceB)}</span>
                  <span className="cell-subtle">{row.sourceBValue}</span>
                </div>
              )
            },
            {
              key: "severity",
              header: "Severity",
              render: (row) => <SeverityBadge severity={row.severity} />
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status === "open" ? "pending" : row.status === "reviewing" ? "retrying" : "resolved"} />
            },
            {
              key: "action",
              header: "Suggested action",
              render: (row) => <span className="cell-subtle">{row.suggestedAction}</span>
            }
          ]}
          emptyTitle="No discrepancies open"
          emptyDescription="Billing and CRM currently agree for every tracked field in the active data source."
        />
      </section>
    </AppShell>
  );
}
