import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionCard } from "../../../components/action-card";
import { AppShell } from "../../../components/app-shell";
import { Badge } from "../../../components/badge";
import { DataTable } from "../../../components/data-table";
import { PageHeader } from "../../../components/page-header";
import { Panel } from "../../../components/panel";
import { SectionHeader } from "../../../components/section-header";
import { SeverityBadge } from "../../../components/severity-badge";
import { StatusBadge } from "../../../components/status-badge";
import { getAccountById } from "../../../lib/data/accounts";
import { getAccountOpsActions } from "../../../lib/data/actions";
import { getDiscrepancies } from "../../../lib/data/discrepancies";
import { getEvents } from "../../../lib/data/events";
import { formatCompactCurrency, formatCurrency, formatDate, formatDateTime, formatPercent, titleCase } from "../../../lib/format";

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
        description={`${account.domain} / ${titleCase(account.segment)} / owned by ${account.owner}`}
      >
        <div className="badge-row">
          <Badge tone={account.riskLevel === "urgent" ? "danger" : account.riskLevel === "watch" ? "warning" : "positive"} leadingDot>
            {titleCase(account.riskLevel)} revenue risk
          </Badge>
          <Badge tone="neutral" leadingDot>
            {titleCase(account.lifecycleStage)}
          </Badge>
        </div>
      </PageHeader>

      <section className="hero-band hero-band--compact">
        <div>
          <p className="hero-band__eyebrow">Account summary</p>
          <h2 className="hero-band__title">A single view of account health, revenue exposure, workflow state, and follow-up work.</h2>
          <p className="hero-band__lead">
            This page is where operators inspect account-level impact once billing events, discrepancies, or retries start affecting commercial truth.
          </p>
        </div>
        <div className="hero-band__aside">
          <p className="hero-band__aside-title">Latest event</p>
          <p className="hero-band__aside-copy">{latestEvent ? latestEvent.eventType : "No recent activity"}</p>
        </div>
      </section>

      <section className="content-with-rail">
        <div className="content-main">
          <section className="metrics-grid metrics-grid--account">
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__copy">
                  <p className="metric-card__label">MRR</p>
                  <p className="metric-card__helper">Recurring revenue currently tracked in billing.</p>
                </div>
              </div>
              <div className="metric-card__value-row">
                <p className="metric-card__value">{formatCurrency(account.mrr)}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__copy">
                  <p className="metric-card__label">ARR</p>
                  <p className="metric-card__helper">Annualized value for renewal planning.</p>
                </div>
              </div>
              <div className="metric-card__value-row">
                <p className="metric-card__value">{formatCompactCurrency(account.arr)}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__copy">
                  <p className="metric-card__label">LTV</p>
                  <p className="metric-card__helper">Estimated long-term value from the account profile.</p>
                </div>
              </div>
              <div className="metric-card__value-row">
                <p className="metric-card__value">{formatCompactCurrency(account.ltv)}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__copy">
                  <p className="metric-card__label">Health score</p>
                  <p className="metric-card__helper">Blended usage and operational confidence score.</p>
                </div>
              </div>
              <div className="metric-card__value-row">
                <p className="metric-card__value">{formatPercent(account.healthScore)}</p>
              </div>
            </div>
          </section>

          <section className="split-grid split-grid--two">
            <Panel>
              <p className="panel__kicker">Revenue risk summary</p>
              <h2 className="panel__title">What needs attention for this account</h2>
              <p className="panel__copy">
                {account.revenueAtRisk > 0
                  ? `${account.name} has ${formatCurrency(account.revenueAtRisk)} of revenue exposure in the current data source. Recovery depends on clearing open workflow issues and making sure CRM matches the billing source of truth.`
                  : `${account.name} has no direct revenue exposure in the current snapshot, but the account still stays visible for lifecycle and discrepancy monitoring.`}
              </p>
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
              description="The most recent operational changes linked to this account."
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
                  render: (row) => <span className="cell-subtle">{formatDateTime(row.receivedAt)}</span>
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
              description="Commercial mismatches currently attached to this account."
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
        </div>

        <aside className="content-rail">
          <div className="rail-card">
            <p className="rail-card__eyebrow">Account metadata</p>
            <h3 className="rail-card__title">Object details</h3>
            <div className="rail-card__list">
              <div className="rail-row">
                <span className="rail-row__label">Owner</span>
                <span className="rail-row__value">{account.owner}</span>
              </div>
              <div className="rail-row">
                <span className="rail-row__label">Lifecycle stage</span>
                <span className="rail-row__value">{titleCase(account.lifecycleStage)}</span>
              </div>
              <div className="rail-row">
                <span className="rail-row__label">Revenue at risk</span>
                <span className="rail-row__value">{formatCurrency(account.revenueAtRisk)}</span>
              </div>
            </div>
          </div>

          <div className="rail-card">
            <p className="rail-card__eyebrow">Related actions</p>
            <h3 className="rail-card__title">Operator follow-up</h3>
            {accountActions.length ? (
              <div className="card-grid">
                {accountActions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="empty-inline empty-inline--tight">
                <p className="empty-inline__title">No ops actions for this account</p>
                <p className="empty-inline__description">When Iter SyncCore stages notifications or follow-up work for this account, it will appear here.</p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
