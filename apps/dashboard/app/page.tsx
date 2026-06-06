import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/badge";
import { DataTable } from "../components/data-table";
import { MetricCard } from "../components/metric-card";
import { PageHeader } from "../components/page-header";
import { Panel } from "../components/panel";
import { SectionHeader } from "../components/section-header";
import { SeverityBadge } from "../components/severity-badge";
import { StatusBadge } from "../components/status-badge";
import { getAccounts } from "../lib/data/accounts";
import { getDiscrepancies } from "../lib/data/discrepancies";
import { getEvents } from "../lib/data/events";
import { getOverviewMetrics } from "../lib/data/metrics";
import { getQueueItems } from "../lib/data/queue";
import { formatCompactCurrency, formatCurrency, formatDate, formatDateTime, formatPercent, titleCase } from "../lib/format";

export default async function OverviewPage() {
  const [accounts, discrepancies, events, metrics, queueItems] = await Promise.all([
    getAccounts(),
    getDiscrepancies(),
    getEvents(),
    getOverviewMetrics(),
    getQueueItems()
  ]);

  const recentEvents = events.slice(0, 5);
  const queuePreview = queueItems.slice(0, 3);
  const atRiskAccounts = accounts
    .filter((account) => account.revenueAtRisk > 0)
    .sort((left, right) => right.revenueAtRisk - left.revenueAtRisk);
  const openDiscrepancies = discrepancies.filter((item) => item.status !== "resolved");
  const firstAccount = accounts[0] ?? null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Demo control plane"
        title="Event-driven RevOps control plane"
        description="SyncCore turns billing events, workflow retries, and CRM drift into one operational surface for revenue teams."
      >
        <div className="badge-row">
          <Badge tone="info">DEMO_MODE decides source</Badge>
          <Badge tone="positive">{accounts.length ? "dashboard data loaded" : "waiting on data"}</Badge>
        </div>
      </PageHeader>

      <section className="hero-band">
        <div className="hero-band__copy">
          <p className="hero-band__lead">
            SyncCore gives SaaS operators one place to inspect incoming events, recover failures, and catch revenue-impacting drift before it leaks into renewals.
          </p>
          <div className="hero-band__stats">
            <div>
              <p className="hero-band__stat-label">Revenue exposed</p>
              <p className="hero-band__stat-value">{formatCompactCurrency(atRiskAccounts.reduce((total, account) => total + account.revenueAtRisk, 0))}</p>
            </div>
            <div>
              <p className="hero-band__stat-label">Open discrepancies</p>
              <p className="hero-band__stat-value">{openDiscrepancies.length}</p>
            </div>
            <div>
              <p className="hero-band__stat-label">Retry recovery</p>
              <p className="hero-band__stat-value">{metrics.find((metric) => metric.label === "Retry success rate")?.value ?? formatPercent(100)}</p>
            </div>
          </div>
        </div>
        <div className="hero-band__aside">
          <p className="hero-band__aside-title">What the demo proves</p>
          <div className="badge-row">
            <Badge tone="neutral">event logging first</Badge>
            <Badge tone="warning">retryable failures</Badge>
            <Badge tone="info">discrepancy management</Badge>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="split-grid split-grid--two">
        <div>
          <SectionHeader
            title="Recent event stream preview"
            description="A normalized log of what came in before any downstream side effects fired."
            action={<Link className="text-link" href="/events">Open event log</Link>}
          />
          <DataTable
            rows={recentEvents}
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
                key: "account",
                header: "Account",
                render: (row) => (
                  <Link className="text-link" href={`/accounts/${row.accountId}`}>
                    {row.accountName}
                  </Link>
                )
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
            emptyTitle="No recent events yet"
            emptyDescription="When the event stream is quiet, new billing and workflow events will show up here."
          />
        </div>
        <div>
          <SectionHeader
            title="Dead-letter queue preview"
            description="Failures waiting on retry or manual intervention."
            action={<Link className="text-link" href="/queue">Review DLQ</Link>}
          />
          <DataTable
            rows={queuePreview}
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
                key: "system",
                header: "Target system",
                render: (row) => <span className="cell-subtle">{row.targetSystem}</span>
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status} />
              },
              {
                key: "nextRetry",
                header: "Next retry",
                render: (row) => <span className="cell-subtle">{formatDateTime(row.nextRetryAt)}</span>
              }
            ]}
            emptyTitle="DLQ is clear"
            emptyDescription="When no retries are pending, SyncCore keeps this queue empty and quiet."
          />
        </div>
      </section>

      <section className="split-grid split-grid--two">
        <div>
          <SectionHeader
            title="Revenue risk panel"
            description="Accounts currently carrying revenue exposure in the current data source."
          />
          <Panel>
            {atRiskAccounts.length ? (
              <div className="list">
                {atRiskAccounts.map((account) => (
                  <div key={account.id} className="list-row">
                    <div className="cell-stack">
                      <Link className="text-link cell-title" href={`/accounts/${account.id}`}>
                        {account.name}
                      </Link>
                      <span className="cell-subtle">
                        {titleCase(account.riskLevel)} risk · renews {formatDate(account.nextRenewalAt)}
                      </span>
                    </div>
                    <div className="list-row__meta">
                      <span className="emphasis-value">{formatCurrency(account.revenueAtRisk)}</span>
                      <span className="cell-subtle">{formatPercent(account.healthScore)} health</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-inline">
                <p className="empty-inline__title">No revenue at risk</p>
                <p className="empty-inline__description">The current snapshot does not show any accounts with direct revenue exposure.</p>
              </div>
            )}
          </Panel>
        </div>

        <div>
          <SectionHeader
            title="Account health panel"
            description="Commercial health, usage density, and mismatch pressure for monitored accounts."
            action={firstAccount ? <Link className="text-link" href={`/accounts/${firstAccount.id}`}>Inspect an account</Link> : null}
          />
          <Panel>
            {accounts.length ? (
              <div className="list">
                {accounts.map((account) => {
                  const discrepancyCount = openDiscrepancies.filter((item) => item.accountId === account.id).length;

                  return (
                    <div key={account.id} className="list-row list-row--stack-mobile">
                      <div className="cell-stack">
                        <Link className="text-link cell-title" href={`/accounts/${account.id}`}>
                          {account.name}
                        </Link>
                        <span className="cell-subtle">
                          {account.segment} · {account.owner}
                        </span>
                      </div>
                      <div className="health-meter">
                        <div className="health-meter__track">
                          <div className="health-meter__fill" style={{ width: `${account.healthScore}%` }} />
                        </div>
                        <div className="health-meter__meta">
                          <span>{formatPercent(account.healthScore)} health</span>
                          <span>{discrepancyCount} {discrepancyCount === 1 ? "discrepancy" : "discrepancies"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-inline">
                <p className="empty-inline__title">No accounts loaded</p>
                <p className="empty-inline__description">When accounts are available from Supabase or demo mode, health and risk will appear here.</p>
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Discrepancy watchlist"
          description="Commercial drift that can distort lifecycle status, renewals, and account ownership."
          action={<Link className="text-link" href="/reconciler">Open reconciler</Link>}
        />
        <DataTable
          rows={openDiscrepancies}
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
              header: "Scenario",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title">{row.scenario}</span>
                  <span className="cell-subtle">{row.impact}</span>
                </div>
              )
            },
            {
              key: "severity",
              header: "Severity",
              render: (row) => <SeverityBadge severity={row.severity} />
            }
          ]}
          emptyTitle="No discrepancies detected"
          emptyDescription="Billing and CRM are currently aligned for the active data source."
        />
      </section>
    </AppShell>
  );
}
