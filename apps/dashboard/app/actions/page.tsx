import { AppShell } from "../../components/app-shell";
import { ActionCard } from "../../components/action-card";
import { Badge } from "../../components/badge";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { SectionHeader } from "../../components/section-header";
import { SeveritySummary } from "../../components/severity-summary";
import { getActionCenterData } from "../../lib/data/actions";
import type { MockCrmTask, NotificationOutboxItem, OpsAction } from "../../lib/types";

function mapNotificationToAction(item: NotificationOutboxItem): OpsAction {
  return {
    id: `ops_notify_${item.id}`,
    accountId: item.accountId,
    accountName: item.accountName,
    title: item.title,
    body: item.body,
    source: "notification_outbox",
    severity: item.severity,
    status: item.status,
    recommendedOwner: item.recommendedOwner,
    suggestedNextStep: item.suggestedNextStep,
    createdAt: item.createdAt
  };
}

function mapCrmTaskToAction(item: MockCrmTask): OpsAction {
  return {
    id: `ops_crm_${item.id}`,
    accountId: item.accountId,
    accountName: item.accountName,
    title: item.title,
    description: item.description,
    source: "mock_crm_task",
    severity: item.severity,
    status: item.status,
    recommendedOwner: item.recommendedOwner,
    suggestedNextStep: item.suggestedNextStep,
    createdAt: item.createdAt
  };
}

export default async function ActionsPage() {
  const actionCenter = await getActionCenterData();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operator action center"
        title="Ops Actions"
      >
        <div className="badge-row">
          <Badge tone="danger" leadingDot>
            {actionCenter.highCriticalCount} high or critical open actions
          </Badge>
          <Badge tone="info" leadingDot>
            {actionCenter.notificationOutboxItems.length} outbox items
          </Badge>
          <Badge tone="warning" leadingDot>
            {actionCenter.dlqEscalations.length} DLQ escalations
          </Badge>
        </div>
      </PageHeader>

      <section>
          <section className="hero-band hero-band--compact">
            <div>
              <p className="hero-band__eyebrow">Human-in-the-loop operations</p>
              <h2 className="hero-band__title">Triage surface</h2>
            </div>
            <div className="hero-band__aside">
              <p className="hero-band__aside-title">Severity mix</p>
              <SeveritySummary actions={actionCenter.openActions} />
            </div>
          </section>

          <section>
            <SectionHeader eyebrow="Priority queue" title="Open ops actions" />
            {actionCenter.openActions.length ? (
              <div className="card-grid card-grid--two">
                {actionCenter.openActions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="table-shell">
                <EmptyState title="No open ops actions" description="When actions are resolved or ignored, the action center quiets down automatically." />
              </div>
            )}
          </section>

          <section className="split-grid split-grid--two">
            <div>
              <SectionHeader
                eyebrow="Outbox"
                title="Notification outbox"
              />
              {actionCenter.notificationOutboxItems.length ? (
                <div className="card-grid">
                  {actionCenter.notificationOutboxItems.map((item) => (
                    <ActionCard key={item.id} action={mapNotificationToAction(item)} />
                  ))}
                </div>
              ) : (
                <div className="table-shell">
                  <EmptyState title="No outbox items" description="Replay a failed payment to stage mock notification payloads here." />
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                eyebrow="Risk alerts"
                title="Churn-defuser alerts"
              />
              {actionCenter.churnAlerts.length ? (
                <div className="card-grid">
                  {actionCenter.churnAlerts.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              ) : (
                <div className="table-shell">
                  <EmptyState title="No churn alerts" description="High-value failed payments will appear here once the churn-defuser classifies them." />
                </div>
              )}
            </div>
          </section>

          <section className="split-grid split-grid--two">
            <div>
              <SectionHeader
                eyebrow="CRM follow-up"
                title="Mock CRM tasks"
              />
              {actionCenter.mockCrmTasks.length ? (
                <div className="card-grid">
                  {actionCenter.mockCrmTasks.map((item) => (
                    <ActionCard key={item.id} action={mapCrmTaskToAction(item)} />
                  ))}
                </div>
              ) : (
                <div className="table-shell">
                  <EmptyState title="No CRM tasks queued" description="Only high and critical recovery paths create mock CRM work recommendations." />
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                eyebrow="Escalations"
                title="DLQ escalation alerts"
              />
              {actionCenter.dlqEscalations.length ? (
                <div className="card-grid">
                  {actionCenter.dlqEscalations.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              ) : (
                <div className="table-shell">
                  <EmptyState title="No escalations" description="The dead-letter queue has not produced any operator escalations in the current snapshot." />
                </div>
              )}
            </div>
          </section>
      </section>
    </AppShell>
  );
}
