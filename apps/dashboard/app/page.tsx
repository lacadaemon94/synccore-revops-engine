import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/badge";
import { CollapsibleRailCard } from "../components/collapsible-rail-card";
import { DataTable } from "../components/data-table";
import { MetricCard } from "../components/metric-card";
import { PageHeader } from "../components/page-header";
import { Panel } from "../components/panel";
import { SectionHeader } from "../components/section-header";
import { SourceBadge } from "../components/source-badge";
import { SeverityBadge } from "../components/severity-badge";
import { StatusBadge } from "../components/status-badge";
import { TruncatedText } from "../components/truncated-text";
import { getAccounts } from "../lib/data/accounts";
import { getActionCenterData } from "../lib/data/actions";
import { getDiscrepancies } from "../lib/data/discrepancies";
import { getEvents } from "../lib/data/events";
import { getOverviewMetrics } from "../lib/data/metrics";
import { getRecentChurnDefuserActions } from "../lib/data/notifications";
import { getQueueItems } from "../lib/data/queue";
import { formatCompactCurrency, formatCurrency, formatDate, formatDateTime, formatPercent, titleCase } from "../lib/format";

type AttentionTone = "danger" | "info" | "warning";

function getRiskTone(riskLevel: "critical" | "high" | "low" | "medium") {
  if (riskLevel === "critical") {
    return "danger" as const;
  }

  if (riskLevel === "high") {
    return "warning" as const;
  }

  if (riskLevel === "medium") {
    return "info" as const;
  }

  return "positive" as const;
}

export default async function OverviewPage() {
  const [accounts, actionCenter, churnActions, discrepancies, events, metrics, queueItems] = await Promise.all([
    getAccounts(),
    getActionCenterData(),
    getRecentChurnDefuserActions(),
    getDiscrepancies(),
    getEvents(),
    getOverviewMetrics(),
    getQueueItems()
  ]);

  const recentEvents = events.slice(0, 5);
  const queuePreview = queueItems.slice(0, 3);
  const openOpsActions = actionCenter.openActions.slice(0, 3);
  const atRiskAccounts = accounts
    .filter((account) => account.revenueAtRisk > 0)
    .sort((left, right) => right.revenueAtRisk - left.revenueAtRisk);
  const highestPriorityChurnAction =
    churnActions.find((item) => item.riskLevel === "critical" || item.riskLevel === "high") ?? churnActions[0] ?? null;
  const openDiscrepancies = discrepancies.filter((item) => item.status !== "resolved");
  const firstAccount = accounts[0] ?? null;
  const formatOptionalDateTime = (value: null | string) => (value ? formatDateTime(value) : "Manual review");
  const attentionItems = [
    ...actionCenter.openActions.slice(0, 3).map((action) => ({
      description: action.suggestedNextStep,
      id: action.id,
      title: action.title,
      tone: (action.severity === "critical" ? "danger" : action.severity === "high" ? "warning" : "info") as AttentionTone
    })),
    ...queueItems
      .filter((item) => item.escalationRecommended)
      .slice(0, 2)
      .map((item) => ({
        description: item.retrySummary,
        id: item.id,
        title: `${item.accountName} needs retry review`,
        tone: "danger" as AttentionTone
      }))
  ].slice(0, 4);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Iter command center"
        title="Revenue operations command center for retries, risk, and recovery"
        description="Iter SyncCore gives RevOps teams a serious operating layer for billing events, dead-letter retries, discrepancies, and human-in-the-loop action management."
      >
        <div className="badge-row">
          <Badge tone="info" leadingDot>
            Demo-first workflow surface
          </Badge>
          <Badge tone="positive" leadingDot>
            {accounts.length ? "Live dashboard state loaded" : "Waiting on data"}
          </Badge>
          <Badge tone="danger" leadingDot>
            {actionCenter.highCriticalCount} high or critical actions
          </Badge>
        </div>
      </PageHeader>

      <section className="content-with-rail">
        <div className="content-main">
          <section className="hero-band hero-band--hero">
            <div className="hero-band__copy">
              <p className="hero-band__eyebrow">Iter SyncCore / RevOps infrastructure</p>
              <h2 className="hero-band__title">Revenue-critical events, operator actions, and retry posture with infrastructure-grade clarity.</h2>
              <p className="hero-band__lead">
                Follow the event log, inspect the queue, and spot commercial drift before it becomes churn, broken CRM state, or missed renewals.
              </p>
            </div>
            <div className="hero-kpis">
              <div className="hero-kpi">
                <p className="hero-band__stat-label">Revenue exposed</p>
                <p className="hero-band__stat-value">{formatCompactCurrency(atRiskAccounts.reduce((total, account) => total + account.revenueAtRisk, 0))}</p>
              </div>
              <div className="hero-kpi">
                <p className="hero-band__stat-label">Open discrepancies</p>
                <p className="hero-band__stat-value">{openDiscrepancies.length}</p>
              </div>
              <div className="hero-kpi">
                <p className="hero-band__stat-label">Retry recovery</p>
                <p className="hero-band__stat-value">{metrics.find((metric) => metric.label === "Retry success rate")?.value ?? formatPercent(100)}</p>
              </div>
            </div>
          </section>

          <section className="metrics-grid metrics-grid--overview">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="split-grid split-grid--two">
            <div>
              <SectionHeader
                eyebrow="Risk signal"
                title="High-value failed payment alert"
                description="Churn defuser logic classifies failed payments before any real Slack or CRM integration is needed."
              />
              <Panel>
                {highestPriorityChurnAction ? (
                  <div className="alert-panel">
                    <div className="alert-panel__header">
                      <div className="cell-stack">
                        <p className="panel__kicker">Mock operational response</p>
                        <h3 className="panel__title">{highestPriorityChurnAction.title}</h3>
                        <p className="panel__copy">{highestPriorityChurnAction.body}</p>
                      </div>
                      <div className="badge-row">
                        <Badge tone={getRiskTone(highestPriorityChurnAction.riskLevel)} leadingDot>
                          {highestPriorityChurnAction.riskLevel} risk
                        </Badge>
                        <Badge tone={highestPriorityChurnAction.requiresHumanTask ? "warning" : "positive"} leadingDot>
                          {highestPriorityChurnAction.requiresHumanTask ? "Human task required" : "Automated recovery"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mini-stats">
                      <div className="mini-stat">
                        <p className="mini-stat__label">Account</p>
                        <Link className="text-link mini-stat__value" href={`/accounts/${highestPriorityChurnAction.accountId}`}>
                          {highestPriorityChurnAction.accountName}
                        </Link>
                      </div>
                      <div className="mini-stat">
                        <p className="mini-stat__label">Recommended owner</p>
                        <p className="mini-stat__value">{highestPriorityChurnAction.recommendedOwner}</p>
                      </div>
                      <div className="mini-stat">
                        <p className="mini-stat__label">Grace window</p>
                        <p className="mini-stat__value">{highestPriorityChurnAction.gracePeriodRecommendation}</p>
                      </div>
                    </div>
                    <div className="alert-panel__footer">
                      <div>
                        <p className="panel__kicker">Recommended action</p>
                        <p className="panel__copy">{highestPriorityChurnAction.recommendedAction}</p>
                      </div>
                      <span className="cell-subtle">Logged {formatDateTime(highestPriorityChurnAction.createdAt)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-inline">
                    <p className="empty-inline__title">No failed payment alerts yet</p>
                    <p className="empty-inline__description">When a failed invoice arrives, Iter SyncCore will stage the mock response and risk summary here.</p>
                  </div>
                )}
              </Panel>
            </div>

            <div>
              <SectionHeader
                eyebrow="Triage"
                title="Open ops actions"
                description="The highest-priority work the action center is surfacing right now."
                action={
                  <Link className="text-link" href="/actions">
                    Open action center
                  </Link>
                }
              />
              <Panel>
                {openOpsActions.length ? (
                  <div className="list list--compact">
                    {openOpsActions.map((action) => (
                      <div key={action.id} className="list-row list-row--stack-mobile">
                        <div className="cell-stack">
                          <Link className="text-link cell-title" href={`/accounts/${action.accountId}`}>
                            {action.accountName}
                          </Link>
                          <span className="cell-title">{action.title}</span>
                          <span className="cell-subtle">{action.suggestedNextStep}</span>
                        </div>
                        <div className="list-row__meta">
                          <div className="badge-row">
                            <SeverityBadge severity={action.severity} />
                            <SourceBadge source={action.source} />
                          </div>
                          <span className="cell-subtle">{formatDateTime(action.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-inline">
                    <p className="empty-inline__title">No ops actions staged</p>
                    <p className="empty-inline__description">Replay a failed payment event to populate the operator action center.</p>
                  </div>
                )}
              </Panel>
            </div>
          </section>

          <section className="split-grid split-grid--two">
            <div>
              <SectionHeader
                eyebrow="Observability"
                title="Recent event stream preview"
                description="Normalized events stay visible before any downstream side effects fire."
                action={
                  <Link className="text-link" href="/events">
                    Open event log
                  </Link>
                }
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
                        <TruncatedText className="cell-title">{row.eventType}</TruncatedText>
                        <TruncatedText className="cell-subtle">{row.summary}</TruncatedText>
                      </div>
                    )
                  },
                  {
                    key: "account",
                    header: "Account",
                    render: (row) => (
                      <Link className="text-link table-link" href={`/accounts/${row.accountId}`} title={row.accountName}>
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
                    render: (row) => <span className="cell-subtle cell-nowrap">{formatDateTime(row.receivedAt)}</span>
                  }
                ]}
                emptyTitle="No recent events yet"
                emptyDescription="When the event stream is quiet, new billing and workflow events will show up here."
              />
            </div>

            <div>
              <SectionHeader
                eyebrow="Reliability"
                title="Queue health preview"
                description="Blocked downstream work waiting on retry or manual intervention."
                action={
                  <Link className="text-link" href="/queue">
                    Review queue
                  </Link>
                }
              />
              <DataTable
                rows={queuePreview}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    key: "account",
                    header: "Account",
                    render: (row) => (
                      <Link className="text-link table-link" href={`/accounts/${row.accountId}`} title={row.accountName}>
                        {row.accountName}
                      </Link>
                    )
                  },
                  {
                    key: "system",
                    header: "Target",
                    render: (row) => <TruncatedText className="cell-subtle cell-subtle--mono">{row.targetSystem}</TruncatedText>
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => <StatusBadge status={row.status} />
                  },
                  {
                    key: "nextRetry",
                    header: "Next retry",
                    render: (row) => <span className="cell-subtle cell-nowrap">{formatOptionalDateTime(row.nextRetryAt)}</span>
                  }
                ]}
                emptyTitle="DLQ is clear"
                emptyDescription="When no retries are pending, Iter SyncCore keeps this queue empty and quiet."
              />
            </div>
          </section>

          <section className="split-grid split-grid--two">
            <div>
              <SectionHeader eyebrow="Exposure" title="Revenue risk panel" description="Accounts currently carrying revenue exposure in the current data source." />
              <Panel>
                {atRiskAccounts.length ? (
                  <div className="list list--compact">
                    {atRiskAccounts.map((account) => (
                      <div key={account.id} className="list-row">
                        <div className="cell-stack">
                          <Link className="text-link cell-title" href={`/accounts/${account.id}`}>
                            {account.name}
                          </Link>
                          <span className="cell-subtle">
                            {titleCase(account.riskLevel)} risk / renews {formatDate(account.nextRenewalAt)}
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
                eyebrow="Health"
                title="Account health panel"
                description="Commercial health, usage density, and mismatch pressure for monitored accounts."
                action={firstAccount ? <Link className="text-link" href={`/accounts/${firstAccount.id}`}>Inspect an account</Link> : null}
              />
              <Panel>
                {accounts.length ? (
                  <div className="list list--compact">
                    {accounts.map((account) => {
                      const discrepancyCount = openDiscrepancies.filter((item) => item.accountId === account.id).length;

                      return (
                        <div key={account.id} className="list-row list-row--stack-mobile">
                          <div className="cell-stack">
                            <Link className="text-link cell-title" href={`/accounts/${account.id}`}>
                              {account.name}
                            </Link>
                            <span className="cell-subtle">
                              {account.segment} / {account.owner}
                            </span>
                          </div>
                          <div className="health-meter">
                            <div className="health-meter__track">
                              <div className="health-meter__fill" style={{ width: `${account.healthScore}%` }} />
                            </div>
                            <div className="health-meter__meta">
                              <span>{formatPercent(account.healthScore)} health</span>
                              <span>
                                {discrepancyCount} {discrepancyCount === 1 ? "discrepancy" : "discrepancies"}
                              </span>
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
              eyebrow="Data quality"
              title="Discrepancy watchlist"
              description="Commercial drift that can distort lifecycle status, renewals, and account ownership."
              action={
                <Link className="text-link" href="/reconciler">
                  Open reconciler
                </Link>
              }
            />
            <DataTable
              rows={openDiscrepancies}
              getRowKey={(row) => row.id}
              columns={[
                {
                  key: "account",
                  header: "Account",
                    render: (row) => (
                    <Link className="text-link table-link" href={`/accounts/${row.accountId}`} title={row.accountName}>
                      {row.accountName}
                    </Link>
                  )
                },
                {
                  key: "scenario",
                  header: "Scenario",
                    render: (row) => (
                    <div className="cell-stack">
                      <TruncatedText className="cell-title">{row.scenario}</TruncatedText>
                      <TruncatedText className="cell-subtle">{row.impact}</TruncatedText>
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
        </div>

          <aside className="content-rail">
          <CollapsibleRailCard eyebrow="Attention rail" title="What needs attention">
            <div className="attention-list attention-list--rail">
              {attentionItems.length ? (
                attentionItems.map((item) => (
                  <div key={item.id} className="attention-item">
                    <Badge tone={item.tone} className="badge--severity" leadingDot>
                      Attention
                    </Badge>
                    <div className="attention-item__copy">
                      <p className="attention-item__title">{item.title}</p>
                      <p className="attention-item__description">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="attention-item attention-item--empty">
                  <div className="attention-item__copy">
                    <p className="attention-item__title">No active escalations</p>
                    <p className="attention-item__description">The queue and action center are quiet in the current snapshot.</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleRailCard>

          <div className="rail-card rail-card--compact">
            <p className="rail-card__eyebrow">System posture</p>
            <h3 className="rail-card__title">What the demo proves</h3>
            <div className="rail-card__list">
              <div className="rail-row">
                <span className="rail-row__label">Event logging first</span>
                <span className="rail-row__value">Stable audit trail</span>
              </div>
              <div className="rail-row">
                <span className="rail-row__label">Dead-letter recovery</span>
                <span className="rail-row__value">{queueItems.length} queue items</span>
              </div>
              <div className="rail-row">
                <span className="rail-row__label">Human operator work</span>
                <span className="rail-row__value">{actionCenter.openActions.length} open actions</span>
              </div>
            </div>
          </div>

          <div className="rail-card rail-card--compact">
            <p className="rail-card__eyebrow">Signal counts</p>
            <h3 className="rail-card__title">Immediate watchlist</h3>
            <div className="rail-card__stack">
              <div className="signal-card">
                <span className="signal-card__label">High severity actions</span>
                <span className="signal-card__value">{actionCenter.highCriticalCount}</span>
              </div>
              <div className="signal-card">
                <span className="signal-card__label">Retrying or pending</span>
                <span className="signal-card__value">{queueItems.filter((item) => item.status === "pending" || item.status === "retrying").length}</span>
              </div>
              <div className="signal-card">
                <span className="signal-card__label">Accounts at risk</span>
                <span className="signal-card__value">{atRiskAccounts.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
