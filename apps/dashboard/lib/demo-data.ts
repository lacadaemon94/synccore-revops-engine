import type { Account, Discrepancy, Metric, QueueItem, RevOpsEvent } from "./types";

export const accounts: Account[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Acme AI Labs",
    domain: "acme.ai",
    lifecycleStage: "customer",
    mrr: 1200,
    arr: 14400,
    ltv: 38400,
    healthScore: 87,
    usageDensity: 87
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Norte Cloud",
    domain: "norte.cloud",
    lifecycleStage: "customer",
    mrr: 350,
    arr: 4200,
    ltv: 9800,
    healthScore: 61,
    usageDensity: 41
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Beta Ops",
    domain: "betaops.io",
    lifecycleStage: "evangelist",
    mrr: 2100,
    arr: 25200,
    ltv: 74400,
    healthScore: 93,
    usageDensity: 92
  }
];

export const metrics: Metric[] = [
  { label: "Events processed today", value: "1,284", helper: "+18% vs yesterday" },
  { label: "Failed events", value: "3", helper: "2 pending retry" },
  { label: "Retry success rate", value: "98.7%", helper: "last 7 days" },
  { label: "Accounts at churn risk", value: "4", helper: "$6.8k MRR monitored" },
  { label: "CRM/Billing discrepancies", value: "7", helper: "3 high priority" },
  { label: "Revenue at risk", value: "$1.2k", helper: "active failed payment" }
];

export const events: RevOpsEvent[] = [
  {
    id: "evt_001",
    providerEventId: "evt_demo_subscription_updated_001",
    eventType: "customer.subscription.updated",
    accountId: accounts[1].id,
    accountName: accounts[1].name,
    status: "processed",
    receivedAt: "2026-06-03T09:02:00Z",
    retryCount: 0,
    amount: 350
  },
  {
    id: "evt_002",
    providerEventId: "evt_demo_invoice_failed_001",
    eventType: "invoice.payment_failed",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    status: "routed_to_dlq",
    receivedAt: "2026-06-03T09:04:00Z",
    retryCount: 1,
    amount: 1200
  },
  {
    id: "evt_003",
    providerEventId: "evt_demo_invoice_paid_001",
    eventType: "invoice.paid",
    accountId: accounts[2].id,
    accountName: accounts[2].name,
    status: "processed",
    receivedAt: "2026-06-03T09:07:00Z",
    retryCount: 0,
    amount: 2100
  }
];

export const queueItems: QueueItem[] = [
  {
    id: "dlq_001",
    eventId: "evt_demo_invoice_failed_001",
    accountName: "Acme AI Labs",
    targetSystem: "mock-crm",
    status: "pending",
    retryCount: 1,
    maxRetries: 3,
    nextRetryAt: "2026-06-03T09:19:00Z",
    lastError: "Simulated CRM 503 response"
  }
];

export const discrepancies: Discrepancy[] = [
  {
    id: "disc_001",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    sourceA: "billing",
    sourceB: "crm",
    fieldName: "subscription_status",
    sourceAValue: "past_due",
    sourceBValue: "active",
    severity: "high",
    status: "open",
    suggestedAction: "Create AE task and sync lifecycle stage."
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
    suggestedAction: "Update CRM MRR and expansion revenue."
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
    severity: "medium",
    status: "reviewing",
    suggestedAction: "Update CRM plan tier mapping."
  }
];
