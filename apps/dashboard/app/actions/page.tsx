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
        description="One place to review mock notifications, churn-defuser guidance, CRM follow-ups, and dead-letter escalations before any real Slack or HubSpot adapter is enabled."
      >
        <div className="badge-row">
          <Badge tone="danger">{actionCenter.highCriticalCount} high or critical open actions</Badge>
          <Badge tone="info">{actionCenter.notificationOutboxItems.length} outbox items</Badge>
          <Badge tone="warning">{actionCenter.dlqEscalations.length} DLQ escalations</Badge>
        </div>
      </PageHeader>

      <section className="split-grid">
        <div className="hero-band">
          <div>
            <p className="hero-band__lead">
              Notification outbox rows act as the mock Slack layer, CRM tasks stay generated but local, and escalated queue items surface the operator work that a real RevOps team would need to pick up.
            </p>
          </div>
          <div className="hero-band__aside">
            <p className="hero-band__aside-title">Severity mix</p>
            <SeveritySummary actions={actionCenter.openActions} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Open ops actions"
          description="The highest-signal actions that still need operator attention."
        />
        {actionCenter.openActions.length ? (
          <div className="card-grid">
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
            title="Notification outbox"
            description="Mock Slack-style rows that would be delivered to billing or RevOps channels later."
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
            title="Churn-defuser alerts"
            description="Human-readable summaries of the highest-risk billing failures."
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
            title="Mock CRM tasks"
            description="Suggested follow-up tasks that future HubSpot or CRM adapters could eventually persist."
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
            title="DLQ escalation alerts"
            description="When automatic retries are exhausted, the queue turns into an explicit operator action."
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
    </AppShell>
  );
}
