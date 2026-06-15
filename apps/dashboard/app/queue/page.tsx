import { AppShell } from "../../components/app-shell";
import { Badge } from "../../components/badge";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { QueueRetryCard } from "../../components/queue-retry-card";
import { SectionHeader } from "../../components/section-header";
import { getQueueItems } from "../../lib/data/queue";

function buildSections(queueItems: Awaited<ReturnType<typeof getQueueItems>>) {
  return [
    {
      items: queueItems.filter((item) => item.status === "pending"),
      title: "Pending retry items"
    },
    {
      items: queueItems.filter((item) => item.status === "retrying"),
      title: "Retrying items"
    },
    {
      items: queueItems.filter((item) => item.status === "failed" || item.status === "escalated"),
      title: "Failed or escalated items"
    },
    {
      items: queueItems.filter((item) => item.status === "resolved"),
      title: "Resolved items"
    }
  ];
}

export default async function QueuePage() {
  const queueItems = await getQueueItems();
  const sections = buildSections(queueItems);
  const escalationCount = queueItems.filter((item) => item.escalationRecommended).length;
  const activeRetryCount = queueItems.filter((item) => item.status === "pending" || item.status === "retrying").length;
  const resolvedCount = queueItems.filter((item) => item.status === "resolved").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recovery queue"
        title="Recovery Queue"
      >
        <div className="badge-row">
          <Badge tone="warning" leadingDot>
            Retry schedule: 15m / 30m / 60m
          </Badge>
          <Badge tone="danger" leadingDot>
            {escalationCount} escalation candidates
          </Badge>
          <Badge tone="positive" leadingDot>
            {resolvedCount} recovered items
          </Badge>
        </div>
      </PageHeader>

      <section className="hero-band">
        <div className="hero-band__stats hero-band__stats--dense">
          <div>
            <p className="hero-band__stat-label">Active retry workload</p>
            <p className="hero-band__stat-value">{activeRetryCount}</p>
          </div>
          <div>
            <p className="hero-band__stat-label">Escalated posture</p>
            <p className="hero-band__stat-value">{escalationCount}</p>
          </div>
          <div>
            <p className="hero-band__stat-label">Resolved examples</p>
            <p className="hero-band__stat-value">{resolvedCount}</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Dead-letter queue"
          title="DLQ workload"
        />
        {queueItems.length ? (
          <div className="queue-section-stack">
            {sections.map((section) =>
              section.items.length ? (
                <div key={section.title} className="queue-section">
                  <SectionHeader eyebrow="Queue section" title={section.title} />
                  <div className="card-grid card-grid--two">
                    {section.items.map((item) => (
                      <QueueRetryCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <div className="table-shell">
            <EmptyState title="No blocked retries" description="When the recovery queue is empty, all retryable failures have already been cleared." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
