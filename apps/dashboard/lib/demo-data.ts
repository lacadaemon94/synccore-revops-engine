import { buildRetrySummary } from "./revops/dead-letter-queue";
import type {
  Account,
  ChurnDefuserAction,
  Discrepancy,
  Metric,
  MockCrmTask,
  NotificationOutboxItem,
  OpsAction,
  QueueItem,
  RevOpsEvent
} from "./types";

export const accounts: Account[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Acme AI Labs",
    domain: "acme.ai",
    lifecycleStage: "customer",
    segment: "Growth",
    owner: "Jules Morales",
    mrr: 1200,
    arr: 14400,
    ltv: 38400,
    healthScore: 58,
    usageDensity: 42,
    revenueAtRisk: 1200,
    riskLevel: "urgent",
    nextRenewalAt: "2026-06-28T00:00:00Z"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Norte Cloud",
    domain: "norte.cloud",
    lifecycleStage: "customer",
    segment: "SMB",
    owner: "Priya Chen",
    mrr: 350,
    arr: 4200,
    ltv: 9800,
    healthScore: 71,
    usageDensity: 56,
    revenueAtRisk: 350,
    riskLevel: "watch",
    nextRenewalAt: "2026-07-09T00:00:00Z"
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Beta Ops",
    domain: "betaops.io",
    lifecycleStage: "evangelist",
    segment: "Enterprise",
    owner: "Marcus Vale",
    mrr: 2100,
    arr: 25200,
    ltv: 74400,
    healthScore: 93,
    usageDensity: 92,
    revenueAtRisk: 0,
    riskLevel: "stable",
    nextRenewalAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Helio Commerce",
    domain: "helio.shop",
    lifecycleStage: "customer",
    segment: "Mid-market",
    owner: "Dana Ibrahim",
    mrr: 5400,
    arr: 64800,
    ltv: 172800,
    healthScore: 67,
    usageDensity: 78,
    revenueAtRisk: 2700,
    riskLevel: "watch",
    nextRenewalAt: "2026-06-22T00:00:00Z"
  }
];

export const metrics: Metric[] = [
  { label: "Events processed today", value: "1,284", helper: "+18% vs yesterday", tone: "positive" },
  { label: "Failed events", value: "3", helper: "1 routed to the DLQ right now", tone: "danger" },
  { label: "Retry success rate", value: "98.7%", helper: "7-day rolling recovery rate", tone: "positive" },
  { label: "Accounts at churn risk", value: "3", helper: "$3.55k in exposed MRR", tone: "warning" },
  { label: "CRM/Billing discrepancies", value: "3", helper: "1 high severity mismatch open", tone: "warning" },
  { label: "Revenue at risk", value: "$4.25k", helper: "watching live exposure in demo mode", tone: "danger" }
];

export const events: RevOpsEvent[] = [
  {
    id: "evt_001",
    provider: "stripe",
    providerEventId: "evt_demo_subscription_updated_001",
    eventType: "customer.subscription.updated",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    status: "processed",
    receivedAt: "2026-06-04T09:02:00Z",
    retryCount: 0,
    amount: 350,
    summary: "Seat contraction synced to the customer record before lifecycle alerts fired."
  },
  {
    id: "evt_002",
    provider: "stripe",
    providerEventId: "evt_demo_invoice_failed_001",
    eventType: "invoice.payment_failed",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    status: "routed_to_dlq",
    receivedAt: "2026-06-04T09:04:00Z",
    retryCount: 1,
    amount: 1200,
    summary: "Payment failure logged first, then routed to recovery automations and the demo DLQ."
  },
  {
    id: "evt_003",
    provider: "stripe",
    providerEventId: "evt_demo_invoice_paid_001",
    eventType: "invoice.paid",
    accountId: accounts[2].id,
    accountName: accounts[2].name,
    status: "processed",
    receivedAt: "2026-06-04T09:07:00Z",
    retryCount: 0,
    amount: 2100,
    summary: "Renewal captured cleanly and account health remained green."
  },
  {
    id: "evt_004",
    provider: "n8n",
    providerEventId: "wf_demo_route_pending_004",
    eventType: "workflow.route.pending",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    status: "pending",
    receivedAt: "2026-06-04T09:12:00Z",
    retryCount: 0,
    amount: 5400,
    summary: "Usage expansion is waiting on a demo CRM field mapping before downstream writes."
  },
  {
    id: "evt_005",
    provider: "n8n",
    providerEventId: "wf_demo_retry_005",
    eventType: "crm.sync.retry",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    status: "retrying",
    receivedAt: "2026-06-04T09:16:00Z",
    retryCount: 2,
    amount: 350,
    summary: "Demo CRM adapter returned a transient 429 and the retry worker picked it up."
  },
  {
    id: "evt_006",
    provider: "n8n",
    providerEventId: "wf_demo_recovered_006",
    eventType: "recovery.retry.resolved",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    status: "resolved",
    receivedAt: "2026-06-04T09:20:00Z",
    retryCount: 2,
    amount: 1200,
    summary: "Retry workflow replayed the event and the mock downstream write recovered."
  },
  {
    id: "evt_007",
    provider: "n8n",
    providerEventId: "wf_demo_failed_007",
    eventType: "workflow.route.failed",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    status: "failed",
    receivedAt: "2026-06-04T09:23:00Z",
    retryCount: 3,
    amount: 5400,
    summary: "Schema validation failed on a demo notification step, so downstream effects stayed blocked."
  }
];

export const queueItems: QueueItem[] = [
  {
    id: "dlq_001",
    eventId: "evt_demo_invoice_failed_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    targetSystem: "mock-crm",
    status: "pending",
    retryCount: 1,
    maxRetries: 3,
    nextRetryAt: "2026-06-04T09:34:00Z",
    lastError: "Simulated CRM 503 response",
    lastAttemptAt: "2026-06-04T09:19:00Z",
    createdAt: "2026-06-04T09:04:10Z",
    failureClass: "availability",
    escalationRecommended: false,
    retryOutcomeHint: "resolve"
  },
  {
    id: "dlq_002",
    eventId: "evt_demo_invoice_failed_dlq_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    targetSystem: "mock-notifications-outbox",
    status: "retrying",
    retryCount: 2,
    maxRetries: 3,
    nextRetryAt: "2026-06-04T09:41:00Z",
    lastError: "Downstream notifier is intentionally failing because simulate_downstream_failure=true.",
    lastAttemptAt: "2026-06-04T09:26:00Z",
    createdAt: "2026-06-04T09:05:30Z",
    failureClass: "availability",
    escalationRecommended: false,
    retryOutcomeHint: "retryable_failure"
  },
  {
    id: "dlq_003",
    eventId: "wf_demo_failed_007",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    targetSystem: "mock-notifications-outbox",
    status: "escalated",
    retryCount: 3,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: "Payload schema mismatch in the demo escalation notifier",
    lastAttemptAt: "2026-06-04T09:40:00Z",
    createdAt: "2026-06-04T09:18:00Z",
    failureClass: "validation",
    escalationRecommended: true,
    retryOutcomeHint: "non_retryable_failure"
  },
  {
    id: "dlq_004",
    eventId: "wf_demo_retry_005",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    targetSystem: "mock-billing-adapter",
    status: "resolved",
    retryCount: 2,
    maxRetries: 4,
    nextRetryAt: null,
    lastError: "Recovered after a transient adapter rate limit",
    lastAttemptAt: "2026-06-04T09:18:00Z",
    resolvedAt: "2026-06-04T09:20:00Z",
    createdAt: "2026-06-04T09:16:00Z",
    failureClass: "rate_limit",
    escalationRecommended: false,
    retryOutcomeHint: "resolve"
  }
];

for (const item of queueItems) {
  item.retrySummary = buildRetrySummary(item);
}

export const discrepancies: Discrepancy[] = [
  {
    id: "disc_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    sourceA: "billing",
    sourceB: "crm",
    fieldName: "subscription_status",
    sourceAValue: "active",
    sourceBValue: "cancelled",
    severity: "high",
    status: "open",
    scenario: "Stripe active / CRM cancelled",
    impact: "Sales could incorrectly treat a retained customer as churned and miss expansion follow-up.",
    suggestedAction: "Create an AE task, correct lifecycle stage, and replay the account sync."
  },
  {
    id: "disc_002",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    sourceA: "billing",
    sourceB: "crm",
    fieldName: "mrr",
    sourceAValue: "350",
    sourceBValue: "250",
    severity: "medium",
    status: "open",
    scenario: "Billing MRR higher than CRM MRR",
    impact: "Pipeline reviews understate live expansion revenue and skew RevOps forecasting.",
    suggestedAction: "Update CRM MRR, backfill the expansion note, and confirm attribution rules."
  },
  {
    id: "disc_003",
    accountId: accounts[2].id,
    accountName: accounts[2].name,
    sourceA: "billing",
    sourceB: "crm",
    fieldName: "plan_tier",
    sourceAValue: "enterprise",
    sourceBValue: "scale",
    severity: "low",
    status: "reviewing",
    scenario: "Enterprise tier in billing but scale tier in CRM",
    impact: "CS routing, support coverage, and renewal prep can drift from the commercial truth.",
    suggestedAction: "Review the plan mapping, update CRM tier, and verify entitlement labels."
  }
];

export const churnDefuserActions: ChurnDefuserAction[] = [
  {
    id: "action_demo_churn_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: "Critical failed payment on Acme AI Labs",
    body: "High-usage revenue is exposed, so the mock notifier escalated RevOps and created a human follow-up task.",
    providerEventId: "evt_demo_invoice_failed_001",
    eventType: "invoice.payment_failed",
    riskLevel: "critical",
    recommendedAction: "Route an owner to confirm payment recovery, protect renewal motion, and review account health today.",
    recommendedOwner: "RevOps lead",
    requiresHumanTask: true,
    shouldNotifyOps: true,
    gracePeriodRecommendation: "Hold service access for 3 days while a human owner works the recovery path.",
    status: "simulated",
    createdAt: "2026-06-04T09:04:30Z",
    suggestedNextStep: "Open the ops action center, assign RevOps, and log a mock CRM follow-up before the next billing retry."
  },
  {
    id: "action_demo_churn_002",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    title: "Low-risk failed payment on Norte Cloud",
    body: "This mock action stays in automated recovery mode and does not require immediate human intervention.",
    providerEventId: "evt_demo_invoice_failed_002",
    eventType: "invoice.payment_failed",
    riskLevel: "low",
    recommendedAction: "Retry the invoice on schedule, email the billing contact, and re-check if another attempt fails.",
    recommendedOwner: "Billing automation",
    requiresHumanTask: false,
    shouldNotifyOps: false,
    gracePeriodRecommendation: "Allow a 7-day billing grace period before escalating to a human queue.",
    status: "simulated",
    createdAt: "2026-06-04T09:05:10Z",
    suggestedNextStep: "Keep the automated recovery sequence running and review only if the next payment attempt fails."
  }
];

export const notificationOutboxItems: NotificationOutboxItem[] = [
  {
    id: "notify_demo_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: "Critical failed payment escalation queued",
    body: "RevOps should review Acme AI Labs today because the failed payment and usage profile indicate churn risk.",
    source: "notification_outbox",
    severity: "critical",
    status: "queued",
    recommendedOwner: "RevOps lead",
    suggestedNextStep: "Acknowledge the escalation, confirm billing outreach, and route the mock CRM task.",
    createdAt: "2026-06-04T09:04:45Z",
    channel: "mock-slack",
    recipient: "revops-escalations"
  },
  {
    id: "notify_demo_002",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    title: "Billing recovery reminder sent",
    body: "Automated recovery is still active for Norte Cloud and no human escalation is required yet.",
    source: "notification_outbox",
    severity: "medium",
    status: "sent",
    recommendedOwner: "Billing automation",
    suggestedNextStep: "Watch the next payment attempt and only escalate if another failure lands.",
    createdAt: "2026-06-04T09:06:00Z",
    channel: "mock-slack",
    recipient: "billing-recovery"
  },
  {
    id: "notify_demo_003",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    title: "DLQ escalation acknowledged",
    body: "The demo notifier schema mismatch has already been seen by ops and is waiting on a manual replay plan.",
    source: "notification_outbox",
    severity: "high",
    status: "acknowledged",
    recommendedOwner: "Revenue systems",
    suggestedNextStep: "Review the blocked payload contract and replay the queue item after correcting the mapping.",
    createdAt: "2026-06-04T09:41:00Z",
    channel: "mock-slack",
    recipient: "ops-escalations"
  }
];

export const mockCrmTasks: MockCrmTask[] = [
  {
    id: "crm_task_demo_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: "Mock CRM task: recover Acme AI Labs",
    description: "Critical failed payment follow-up for Acme AI Labs. Confirm billing contact coverage, protect renewal motion, and document the retention plan.",
    source: "mock_crm_task",
    severity: "critical",
    status: "queued",
    recommendedOwner: "RevOps lead",
    suggestedNextStep: "Assign the account owner and log the recovery motion in the mock CRM record.",
    createdAt: "2026-06-04T09:05:00Z"
  },
  {
    id: "crm_task_demo_002",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    title: "Mock CRM task: review Helio Commerce escalation",
    description: "A DLQ escalation blocked the mock notification path, so an operator needs to inspect the payload contract and re-run the workflow safely.",
    source: "mock_crm_task",
    severity: "high",
    status: "acknowledged",
    recommendedOwner: "Revenue systems",
    suggestedNextStep: "Validate the action payload and trigger a manual replay from the queue after the review.",
    createdAt: "2026-06-04T09:41:30Z"
  }
];

export const opsActions: OpsAction[] = [
  {
    id: "ops_action_demo_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: "Critical failed payment on Acme AI Labs",
    body: "The churn defuser recommends a same-day human follow-up because revenue, usage, and renewal risk are all elevated.",
    source: "churn_defuser",
    severity: "critical",
    status: "queued",
    recommendedOwner: "RevOps lead",
    suggestedNextStep: "Open the account, assign recovery ownership, and queue the mock CRM follow-up.",
    createdAt: "2026-06-04T09:04:30Z"
  },
  {
    id: "ops_action_demo_002",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: notificationOutboxItems[0].title,
    body: notificationOutboxItems[0].body,
    source: "notification_outbox",
    severity: notificationOutboxItems[0].severity,
    status: notificationOutboxItems[0].status,
    recommendedOwner: notificationOutboxItems[0].recommendedOwner,
    suggestedNextStep: notificationOutboxItems[0].suggestedNextStep,
    createdAt: notificationOutboxItems[0].createdAt
  },
  {
    id: "ops_action_demo_003",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    title: mockCrmTasks[0].title,
    description: mockCrmTasks[0].description,
    source: "mock_crm_task",
    severity: mockCrmTasks[0].severity,
    status: mockCrmTasks[0].status,
    recommendedOwner: mockCrmTasks[0].recommendedOwner,
    suggestedNextStep: mockCrmTasks[0].suggestedNextStep,
    createdAt: mockCrmTasks[0].createdAt
  },
  {
    id: "ops_action_demo_004",
    accountId: accounts[3].id,
    accountName: accounts[3].name,
    title: "DLQ escalation needs operator review",
    body: "Helio Commerce has an escalated dead-letter queue item after the demo notifier payload failed validation at max retries.",
    source: "dlq_escalation",
    severity: "high",
    status: "acknowledged",
    recommendedOwner: "Revenue systems",
    suggestedNextStep: "Inspect the blocked queue item, repair the payload contract, and force a controlled replay.",
    createdAt: "2026-06-04T09:40:30Z"
  }
];
