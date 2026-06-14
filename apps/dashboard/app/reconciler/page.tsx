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
        title="Revenue data quality and reconciliation"
        description="Iter SyncCore surfaces mismatches between billing truth and CRM state before they become revenue leakage, bad lifecycle handling, or GTM confusion."
      />

      <section className="metrics-grid metrics-grid--three">
        <MetricCard metric={{ label: "High severity mismatches", value: highSeverityCount.toString(), helper: "Needs immediate human follow-up", tone: "danger" }} />
        <MetricCard metric={{ label: "MRR mismatches", value: mrrMismatchCount.toString(), helper: "Forecasting and attribution risk", tone: "warning" }} />
        <MetricCard metric={{ label: "Plan tier drift", value: tierMismatchCount.toString(), helper: "Packaging and support risk", tone: "default" }} />
      </section>

      <section className="split-grid split-grid--two">
        <Panel>
          <p className="panel__kicker">Why drift matters</p>
          <h2 className="panel__title">Billing truth and CRM truth diverge quietly.</h2>
          <p className="panel__copy">
            A status mismatch can create churn false positives, an MRR gap can understate live revenue, and a tier mismatch can route the wrong support or renewal motion. The reconciler keeps those breaks visible instead of hiding them in system boundaries.
          </p>
        </Panel>
        <Panel>
          <p className="panel__kicker">Severity hierarchy</p>
          <div className="list list--compact">
            <div className="list-row">
              <div className="badge-row">
                <SeverityBadge severity="high" />
              </div>
              <span className="cell-subtle">Lifecycle or renewal handling could change immediately.</span>
            </div>
            <div className="list-row">
              <div className="badge-row">
                <SeverityBadge severity="medium" />
              </div>
              <span className="cell-subtle">Revenue visibility and attribution can drift from reality.</span>
            </div>
            <div className="list-row">
              <div className="badge-row">
                <SeverityBadge severity="low" />
              </div>
              <span className="cell-subtle">Coverage models, packaging, or entitlements may become inconsistent.</span>
            </div>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          eyebrow="Discrepancy table"
          title="Active discrepancies"
          description="Billing vs CRM comparisons stay close to impact and suggested action so RevOps can move from diagnosis to cleanup quickly."
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
              key: "comparison",
              header: "Billing vs CRM",
              render: (row) => (
                <div className="comparison-stack">
                  <div className="comparison-chip">
                    <span className="comparison-chip__label">{titleCase(row.sourceA)}</span>
                    <span className="comparison-chip__value">{row.sourceAValue}</span>
                  </div>
                  <div className="comparison-chip comparison-chip--muted">
                    <span className="comparison-chip__label">{titleCase(row.sourceB)}</span>
                    <span className="comparison-chip__value">{row.sourceBValue}</span>
                  </div>
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
