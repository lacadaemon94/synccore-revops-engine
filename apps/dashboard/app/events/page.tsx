import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { DataTable } from "../../components/data-table";
import { PageHeader } from "../../components/page-header";
import { Panel } from "../../components/panel";
import { SectionHeader } from "../../components/section-header";
import { StatusBadge } from "../../components/status-badge";
import { events } from "../../lib/demo-data";
import { formatCurrency, formatDateTime } from "../../lib/format";

export default function EventsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Operational event log"
        title="Event stream"
        description="Every inbound webhook and workflow outcome is logged before SyncCore attempts downstream writes."
      />

      <section className="split-grid split-grid--two">
        <Panel>
          <p className="panel__kicker">Why log first</p>
          <h2 className="panel__title">Event logging before side effects is the control point.</h2>
          <p className="panel__copy">
            When SyncCore records the event first, retries become deterministic, downstream failures stay recoverable, and revenue operations has an audit trail before anything mutates CRM or notifications.
          </p>
        </Panel>
        <Panel>
          <p className="panel__kicker">What this protects</p>
          <div className="list">
            <div className="list-row">
              <span className="cell-title">Idempotency</span>
              <span className="cell-subtle">Duplicate provider events can be recognized before another side effect fires.</span>
            </div>
            <div className="list-row">
              <span className="cell-title">Replayability</span>
              <span className="cell-subtle">Failed workflow branches can be retried from a known event record instead of manual guesswork.</span>
            </div>
            <div className="list-row">
              <span className="cell-title">Operational trust</span>
              <span className="cell-subtle">Finance, CS, and GTM teams can inspect exactly what changed and when.</span>
            </div>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Normalized event table"
          description="Provider events, workflow outcomes, account context, and retry posture in one place."
        />
        <DataTable
          rows={events}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: "providerEvent",
              header: "Provider event ID",
              render: (row) => (
                <div className="cell-stack">
                  <span className="cell-title">{row.providerEventId}</span>
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
              header: "Retry count",
              align: "right",
              render: (row) => <span>{row.retryCount}</span>
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
          emptyDescription="As soon as demo events flow through SyncCore, they will be logged here before any side effects run."
        />
      </section>
    </AppShell>
  );
}
