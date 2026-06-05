import { forceRetry } from "../../actions/force-retry";
import { AppShell } from "../../components/app-shell";
import { Badge } from "../../components/badge";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { SectionHeader } from "../../components/section-header";
import { StatusBadge } from "../../components/status-badge";
import { queueItems } from "../../lib/demo-data";
import { formatDateTime } from "../../lib/format";

export default function QueuePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Recovery queue"
        title="Dead-letter queue"
        description="Retryable workflow failures are isolated here until SyncCore can recover them automatically or an operator intervenes."
      >
        <div className="badge-row">
          <Badge tone="warning">force retry uses mock server action</Badge>
        </div>
      </PageHeader>

      <section>
        <SectionHeader
          title="DLQ workload"
          description="Each item shows the blocked downstream system, current retry posture, and the last observed error."
        />
        <p className="section-note">The Force Retry button currently triggers a demo-only mock server action. No live provider calls are made in Phase 1.</p>
        <div className="card-grid">
          {queueItems.length ? (
            queueItems.map((item) => (
              <form
                key={item.id}
                action={async () => {
                  "use server";
                  await forceRetry(item.id);
                }}
                className="queue-card"
              >
                <div className="queue-card__header">
                  <div className="cell-stack">
                    <p className="queue-card__title">{item.accountName}</p>
                    <p className="cell-subtle">{item.targetSystem}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="queue-card__grid">
                  <div className="detail-pair">
                    <span className="detail-pair__label">Retry count</span>
                    <span className="detail-pair__value">{item.retryCount} / {item.maxRetries}</span>
                  </div>
                  <div className="detail-pair">
                    <span className="detail-pair__label">Next retry</span>
                    <span className="detail-pair__value">{formatDateTime(item.nextRetryAt)}</span>
                  </div>
                  <div className="detail-pair detail-pair--wide">
                    <span className="detail-pair__label">Last error</span>
                    <span className="detail-pair__value detail-pair__value--muted">{item.lastError}</span>
                  </div>
                </div>
                <div className="queue-card__footer">
                  <p className="cell-subtle">Mock manual replay for demo validation.</p>
                  <button className="button button--primary" type="submit">
                    Force Retry
                  </button>
                </div>
              </form>
            ))
          ) : (
            <div className="table-shell">
              <EmptyState
                title="No blocked retries"
                description="When the demo recovery queue is empty, all retryable failures have already been cleared."
              />
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
