import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionCard } from "../../../components/action-card";
import { AppShell } from "../../../components/app-shell";
import { Badge } from "../../../components/badge";
import { DataTable } from "../../../components/data-table";
import { EmptyState } from "../../../components/empty-state";
import { MetricCard } from "../../../components/metric-card";
import { PageHeader } from "../../../components/page-header";
import { Panel } from "../../../components/panel";
import { SectionHeader } from "../../../components/section-header";
import { SeverityBadge } from "../../../components/severity-badge";
import { StatusBadge } from "../../../components/status-badge";
import { getAccountById } from "../../../lib/data/accounts";
import { getAccountOpsActions } from "../../../lib/data/actions";
import { getDiscrepancies } from "../../../lib/data/discrepancies";
import { getEvents } from "../../../lib/data/events";
import { formatCompactCurrency, formatCurrency, formatDate, formatRelativeTime, formatPercent, titleCase } from "../../../lib/format";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [account, accountActions, accountEvents, accountDiscrepancies] = await Promise.all([
    getAccountById(id),
    getAccountOpsActions(id),
    getEvents(),
    getDiscrepancies()
  ]);

  if (!account) {
    notFound();
  }

  const scopedEvents = accountEvents.filter((event) => event.accountId === account.id);
  const scopedDiscrepancies = accountDiscrepancies.filter((item) => item.accountId === account.id && item.status !== "resolved");
  const latestEvent = scopedEvents[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Account object view"
        title={account.name}
      >
        <div className="badge-row">
          <Badge tone={account.riskLevel === "urgent" ? "danger" : account.riskLevel === "watch" ? "warning" : "positive"} leadingDot>
            {titleCase(account.riskLevel)} revenue risk
          </Badge>
          <Badge tone="neutral">{account.owner}</Badge>
          <Badge tone="neutral" leadingDot>
            {titleCase(account.lifecycleStage)}
          </Badge>
          <Badge tone="info">{account.revenueAtRisk > 0 ? `${formatCurrency(account.revenueAtRisk)} at risk` : "No revenue risk"}</Badge>
        </div>
      </PageHeader>

      <section className="hero-band hero-band--compact">
        <div>
          <p className="hero-band__eyebrow">Account summary</p>
          <h2 className="hero-band__title">Account overview</h2>
        </div>
        <div className="hero-band__stats hero-band__stats--dense">
          <div>
            <p className="hero-band__stat-label">Owner</p>
            <p className="hero-band__stat-value">{account.owner}</p>
          </div>
          <div>
            <p className="hero-band__stat-label">Lifecycle</p>
            <p className="hero-band__stat-value">{titleCase(account.lifecycleStage)}</p>
          </div>
          <div>
            <p className="hero-band__stat-label">Latest event</p>
            <p className="hero-band__stat-value">{latestEvent ? latestEvent.eventType : "No recent activity"}</p>
          </div>
        </div>
      </section>

      <section>
          <section className="metrics-grid metrics-grid--account">
            <MetricCard metric={{ label: "Monthly recurring", value: formatCurrency(account.mrr), tone: account.riskLevel === "urgent" ? "danger" : account.riskLevel === "watch" ? "warning" : "positive" }} />
            <MetricCard metric={{ label: "Annual recurring", value: formatCompactCurrency(account.arr), tone: account.riskLevel === "urgent" ? "danger" : account.riskLevel === "watch" ? "warning" : "positive" }} />
            <MetricCard metric={{ label: "Lifetime value", value: formatCompactCurrency(account.ltv), tone: "default" }} />
            <MetricCard metric={{ label: "Health score", value: formatPercent(account.healthScore), tone: account.healthScore >= 80 ? "positive" : account.healthScore >= 50 ? "warning" : "danger" }} />
          </section>

          <section className="split-grid split-grid--two">
            <Panel>
              <p className="panel__kicker">Revenue risk summary</p>
              <h2 className="panel__title">Revenue risk</h2>
              {scopedDiscrepancies.length ? (
                <div className="badge-row">
                  {scopedDiscrepancies.map((item) => (
                    <SeverityBadge key={item.id} severity={item.severity} />
                  ))}
                </div>
              ) : null}
            </Panel>

            <Panel>
              <p className="panel__kicker">Commercial health</p>
              <div className="mini-stats">
                <div className="mini-stat">
                  <p className="mini-stat__label">Renewal date</p>
                  <p className="mini-stat__value">{formatDate(account.nextRenewalAt)}</p>
                </div>
                <div className="mini-stat">
                  <p className="mini-stat__label">Usage density</p>
                  <p className="mini-stat__value">{formatPercent(account.usageDensity)}</p>
                </div>
                <div className="mini-stat">
                  <p className="mini-stat__label">Open discrepancies</p>
                  <p className="mini-stat__value">{scopedDiscrepancies.length}</p>
                </div>
              </div>
            </Panel>
          </section>

          <section>
            <SectionHeader
              eyebrow="Recent events"
              title="Account event history"
            />
            <DataTable
              rows={scopedEvents}
              getRowKey={(row) => row.id}
              columns={[
                {
                  key: "event",
                  header: "Event",
                  render: (row) => (
                    <div className="cell-stack">
                      <span className="cell-title">{row.eventType}</span>
                      <span className="cell-subtle">{row.summary}</span>
                    </div>
                  )
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right",
                  render: (row) => <span>{row.amount ? formatCurrency(row.amount) : "-"}</span>
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => <StatusBadge status={row.status} />
                },
                {
                  key: "receivedAt",
                  header: "Received",
                  render: (row) => <span className="cell-subtle">{formatRelativeTime(row.receivedAt)}</span>
                }
              ]}
              emptyTitle="No recent events for this account"
              emptyDescription="When new events land for this account, they will appear here."
            />
          </section>

          <section>
            <SectionHeader
              eyebrow="Discrepancies"
              title="Open discrepancies"
              action={
                <Link className="text-link" href="/reconciler">
                  Back to reconciler
                </Link>
              }
            />
            <DataTable
              rows={scopedDiscrepancies}
              getRowKey={(row) => row.id}
              columns={[
                {
                  key: "scenario",
                  header: "Scenario",
                  render: (row) => (
                    <div className="cell-stack">
                      <span className="cell-title">{row.scenario}</span>
                      <span className="cell-subtle">{row.impact}</span>
                    </div>
                  )
                },
                {
                  key: "field",
                  header: "Field",
                  render: (row) => <span>{titleCase(row.fieldName)}</span>
                },
                {
                  key: "severity",
                  header: "Severity",
                  render: (row) => <SeverityBadge severity={row.severity} />
                },
                {
                  key: "action",
                  header: "Suggested action",
                  render: (row) => <span className="cell-subtle">{row.suggestedAction}</span>
                }
              ]}
              emptyTitle="No open discrepancies"
              emptyDescription="CRM and billing are aligned for this account right now."
            />
          </section>

          <section>
            <SectionHeader
              eyebrow="Triage"
              title="Related ops actions"
            />
            {accountActions.length ? (
              <div className="card-grid card-grid--two">
                {accountActions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="table-shell">
                <EmptyState title="No related ops actions" description="There are no active operator actions staging for this account." />
              </div>
            )}
          </section>
      </section>
    </AppShell>
  );
}
