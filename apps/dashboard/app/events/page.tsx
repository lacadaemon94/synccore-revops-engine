import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { Badge } from "../../components/badge";
import { DataTable } from "../../components/data-table";
import { PageHeader } from "../../components/page-header";
import { SectionHeader } from "../../components/section-header";
import { StatusBadge } from "../../components/status-badge";
import { getEvents } from "../../lib/data/events";
import { formatCurrency, formatRelativeTime } from "../../lib/format";

export default async function EventsPage() {
  const events = await getEvents();
  const failedOrRouted = events.filter((event) => event.status === "failed" || event.status === "routed_to_dlq").length;
  const workflowEvents = events.filter((event) => event.provider === "n8n").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operational event log"
        title="Event Log"
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



      <section>
        <SectionHeader
          eyebrow="Event stream"
          title="Normalized event table"
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
              render: (row) => <span className="cell-subtle">{formatRelativeTime(row.receivedAt)}</span>
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
