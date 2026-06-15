import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/badge";

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
import { formatCurrency, formatDate, formatRelativeTime, formatPercent, titleCase } from "../lib/format";

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
  const formatOptionalDateTime = (value: null | string) => (value ? formatRelativeTime(value) : "Manual review");
  const attentionItems = [
    ...actionCenter.openActions.slice(0, 2).map((action) => ({
      href: `/accounts/${action.accountId}`,
      label: action.severity,
      meta: formatRelativeTime(action.createdAt),
      title: action.title,
      tone: action.severity === "critical" || action.severity === "high" ? "danger" as const : "warning" as const
    })),
    ...openDiscrepancies.slice(0, 2).map((item) => ({
      href: "/reconciler",
      label: item.severity,
      meta: item.accountName,
      title: item.scenario,
      tone: item.severity === "high" ? "danger" as const : "warning" as const
    })),
    ...queueItems
      .filter((item) => item.status === "failed" || item.status === "escalated" || item.escalationRecommended)
      .slice(0, 2)
      .map((item) => ({
        href: "/queue",
        label: item.status,
        meta: item.accountName,
        title: item.retrySummary ?? item.lastError,
        tone: "danger" as const
      }))
  ].slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Command center"
        title="Command Center"
      >
        <div className="badge-row">
          <Badge tone="positive" leadingDot>
            {accounts.length ? "Live dashboard state loaded" : "Waiting on data"}
          </Badge>
          <Badge tone="danger" leadingDot>
            {actionCenter.highCriticalCount} high or critical actions
          </Badge>
        </div>
      </PageHeader>

      <section className="metrics-grid metrics-grid--overview">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="command-pulse">
            <div className="command-pulse__header">
              <div>
                <p className="section-header__eyebrow">Command pulse</p>
                <h2 className="section-header__title">Live attention feed</h2>
              </div>
              <Link className="text-link" href="/actions">
                Open action center
              </Link>
            </div>
            <div className="command-pulse__grid">
              {attentionItems.length ? (
                attentionItems.map((item) => (
                  <Link key={`${item.href}-${item.title}`} className="command-pulse__item" href={item.href} data-tone={item.tone}>
                    <Badge tone={item.tone}>{item.label}</Badge>
                    <span className="command-pulse__title">{item.title}</span>
                    <span className="command-pulse__meta">{item.meta}</span>
                  </Link>
                ))
              ) : (
                <div className="command-pulse__empty">
                  <span className="cell-title">No active attention items</span>
                  <span className="cell-subtle">The current operating snapshot is quiet.</span>
                </div>
              )}
            </div>
          </section>

          <section className="split-grid split-grid--golden">
            <div>
              <SectionHeader
                eyebrow="Risk signal"
                title="High-value failed payment alert"
              />
              <Panel>
                {highestPriorityChurnAction ? (
                  <div className="alert-panel">
                    <div className="alert-panel__header">
                      <div className="alert-panel__headline">
                        <SeverityBadge severity={highestPriorityChurnAction.riskLevel} />
                        <h3 className="panel__title">{highestPriorityChurnAction.title}</h3>
                        <p className="alert-panel__summary">{highestPriorityChurnAction.body}</p>
                      </div>
                      <div className="badge-row alert-panel__badges">
                        <Badge tone={highestPriorityChurnAction.requiresHumanTask ? "warning" : "positive"}>
                          {highestPriorityChurnAction.requiresHumanTask ? "Human task required" : "Automated recovery"}
                        </Badge>
                        <Badge tone={getRiskTone(highestPriorityChurnAction.riskLevel)}>
                          {highestPriorityChurnAction.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    <dl className="description-list description-list--alert">
                      <div className="description-list__item">
                        <dt className="description-list__label">Account</dt>
                        <dd className="description-list__value">
                          <Link className="text-link" href={`/accounts/${highestPriorityChurnAction.accountId}`}>
                            {highestPriorityChurnAction.accountName}
                          </Link>
                        </dd>
                      </div>
                      <div className="description-list__item">
                        <dt className="description-list__label">Recommended owner</dt>
                        <dd className="description-list__value">{highestPriorityChurnAction.recommendedOwner}</dd>
                      </div>
                      <div className="description-list__item">
                        <dt className="description-list__label">Grace window</dt>
                        <dd className="description-list__value">{highestPriorityChurnAction.gracePeriodRecommendation}</dd>
                      </div>
                    </dl>
                    <div className="callout-panel">
                      <div>
                        <p className="panel__kicker">Recommended action</p>
                        <p className="panel__copy">{highestPriorityChurnAction.recommendedAction}</p>
                      </div>
                      <span className="cell-subtle cell-nowrap">
                        Logged {formatRelativeTime(highestPriorityChurnAction.createdAt)}
                      </span>
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
                action={
                  <Link className="text-link" href="/actions">
                    View All &rarr;
                  </Link>
                }
              />
              <Panel>
                {openOpsActions.length ? (
                  <div className="list list--compact">
                    {openOpsActions.map((action) => (
                      <div key={action.id} className="list-row">
                        <div className="list-row__content">
                          <div className="list-row__content-line">
                            <SeverityBadge severity={action.severity} />
                            <Link className="text-link cell-title cell-nowrap" href={`/accounts/${action.accountId}`}>
                              {action.accountName}
                            </Link>
                            <span className="cell-title cell-nowrap">{action.title}</span>
                          </div>
                          <div className="list-row__content-line list-row__content-line--secondary">
                            <span className="cell-subtle list-row__next-step">{action.suggestedNextStep}</span>
                            <SourceBadge source={action.source} />
                            <span className="cell-subtle">{formatRelativeTime(action.createdAt)}</span>
                          </div>
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
                    render: (row) => <span className="cell-subtle cell-nowrap">{formatRelativeTime(row.receivedAt)}</span>
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
              <SectionHeader eyebrow="Exposure" title="Revenue risk panel" />
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
                action={firstAccount ? <Link className="text-link" href={`/accounts/${firstAccount.id}`}>View accounts &rarr;</Link> : null}
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
              action={
                <Link className="text-link" href="/reconciler">
                  View reconciler &rarr;
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
    </AppShell>
  );
}
