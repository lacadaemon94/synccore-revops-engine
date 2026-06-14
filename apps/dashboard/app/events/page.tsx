import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { Badge } from "../../components/badge";
import { DataTable } from "../../components/data-table";
import { PageHeader } from "../../components/page-header";
import { Panel } from "../../components/panel";
import { SectionHeader } from "../../components/section-header";
import { StatusBadge } from "../../components/status-badge";
import { getEvents } from "../../lib/data/events";
import { formatCurrency, formatDateTime } from "../../lib/format";

export default async function EventsPage() {
  const events = await getEvents();
  const failedOrRouted = events.filter((event) => event.status === "failed" || event.status === "routed_to_dlq").length;
  const workflowEvents = events.filter((event) => event.provider === "n8n").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operational event log"
        title="Event observability surface"
        description="Every inbound webhook and workflow outcome is logged before Iter SyncCore attempts downstream writes."
      >
        <div className="badge-row">
          <Badge tone="info" leadingDot>
            {events.length} logged events
          </Badge>
          <Badge tone="warning" leadingDot>
            {failedOrRouted} blocked or routed outcomes
          </Badge>
          <Badge tone="neutral" leadingDot>
            {workflowEvents} workflow-originated events
          </Badge>
        </div>
      </PageHeader>

      <section className="split-grid split-grid--two">
        <Panel>
          <p className="panel__kicker">Why log first</p>
          <h2 className="panel__title">Event logging before side effects is the control point.</h2>
          <p className="panel__copy">
            When Iter SyncCore records the event first, retries become deterministic, downstream failures stay recoverable, and revenue operations gets an audit trail before anything mutates CRM or notifications.
          </p>
        </Panel>
        <Panel>
          <p className="panel__kicker">Observability posture</p>
          <div className="mini-stats">
            <div className="mini-stat">
              <p className="mini-stat__label">Provider event IDs</p>
              <p className="mini-stat__value">Stable idempotency anchors for replay and dedupe.</p>
            </div>
            <div className="mini-stat">
              <p className="mini-stat__label">Workflow outcomes</p>
              <p className="mini-stat__value">n8n-originated outcomes stay visible next to billing events.</p>
            </div>
            <div className="mini-stat">
              <p className="mini-stat__label">Revenue audit trail</p>
              <p className="mini-stat__value">Operators can inspect causality before downstream systems drift.</p>
            </div>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          eyebrow="Event stream"
          title="Normalized event table"
          description="Provider events, workflow outcomes, account context, amount, retry posture, and status in one dense view."
        />
        <DataTable
          rows={events}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: "providerEvent",
              header: "Provider event",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title cell-title--mono">{row.providerEventId}</span>
                  <span className="cell-subtle">{row.provider}</span>
                </div>
              )
            },
            {
              key: "eventType",
              header: "Event type",
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
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) => <span>{row.amount ? formatCurrency(row.amount) : "-"}</span>
            },
            {
              key: "retry",
              header: "Retries",
              align: "right",
              render: (row) => <span className="cell-title">{row.retryCount}</span>
            },
            {
              key: "receivedAt",
              header: "Received",
              render: (row) => <span className="cell-subtle">{formatDateTime(row.receivedAt)}</span>
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />
            }
          ]}
          emptyTitle="No events received yet"
          emptyDescription="As soon as events flow through Iter SyncCore, they will be logged here before any side effects run."
        />
      </section>
    </AppShell>
  );
}
