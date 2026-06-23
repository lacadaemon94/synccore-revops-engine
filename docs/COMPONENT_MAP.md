# Component Mapping: SyncCore Dashboard Revamp

This document tracks the translation of HTML mockup sections into modular React Server/Client Components.

---

## Component Map Table

| Mockup Source File | Visual Section / Component | Target Path in Next.js App | Component Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| **All Mockups** | Sidebar Left Rail Layout | [Sidebar.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/AppShell/Sidebar.tsx) | Server Component | `Pending` |
| **All Mockups** | Topbar Header Nav & Search | [Topbar.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/AppShell/Topbar.tsx) | Client Component | `Pending` |
| **All Mockups** | Sidebar Navigation Link (active state) | [NavLink.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/AppShell/NavLink.tsx) | Client Component | `Pending` |
| **All Mockups** | Light/Dark Theme Toggle Button | [ThemeToggle.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/AppShell/ThemeToggle.tsx) | Client Component | `Pending` |
| **All Mockups** | Cmd+K Command Palette Search Modal | [CommandPalette.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/AppShell/CommandPalette.tsx) | Client Component | `Deferred` |
| **Actions / Queue** | Common Interactive Action Button (Server Action trigger) | [ActionButton.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/common/ActionButton.tsx) | Client Component | `Pending` |
| **All Mockups** | Root Layout: AppShell Grid + Theme Hydration | [layout.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/layout.tsx) | Server Component | `Pending` |
| **Overview v3** | Dashboard page layout & grids | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/page.tsx) | Server Component | `Pending` |
| **Overview v3** | KPI Summary Strip (top header stats) | [KpiStrip.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Dashboard/KpiStrip.tsx) | Server Component | `Pending` |
| **Overview v3** | Recent Activity / Triage snapshot feed | [RecentActivityPanel.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Dashboard/RecentActivityPanel.tsx) | Server Component | `Pending` |
| **Overview v3** | Discrepancy details & Alert Panel | [PaymentDiscrepancyCard.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Dashboard/PaymentDiscrepancyCard.tsx) | Server Component | `Pending` |
| **Accounts** | Accounts list main view | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/accounts/page.tsx) | Server Component | `Pending` |
| **Accounts** | Filter Tabs (At-Risk, Renewing, etc) | [AccountsFilterTabs.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/AccountsFilterTabs.tsx) | Client Component | `Pending` |
| **Accounts** | Main Accounts table layout | [AccountsTable.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/AccountsTable.tsx) | Server Component | `Pending` |
| **Accounts** | Account Detail view | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/accounts/[id]/page.tsx) | Server Component | `Pending` |
| **Accounts** | Account Detail Header / Metadata | [AccountHeader.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/AccountHeader.tsx) | Server Component | `Pending` |
| **Accounts** | Account KPI panel (MRR, Health etc) | [AccountKpis.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/AccountKpis.tsx) | Server Component | `Pending` |
| **Accounts** | Action Log / Timeline of issues | [AccountDiscrepancyLog.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/AccountDiscrepancyLog.tsx) | Server Component | `Pending` |
| **Accounts** | System Audits / Sync History | [SyncHistoryTable.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Accounts/SyncHistoryTable.tsx) | Server Component | `Pending` |
| **Actions** | Action Center Layout & page | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/actions/page.tsx) | Server Component | `Pending` |
| **Actions** | Left List (Master view) | [ActionsList.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Actions/ActionsList.tsx) | Client Component | `Pending` |
| **Actions** | Right Detail Form Panel | [ActionDetailPanel.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Actions/ActionDetailPanel.tsx) | Client Component | `Pending` |
| **Events** | Events audit log page | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/events/page.tsx) | Server Component | `Pending` |
| **Events** | Event Log Table layout | [EventLogTable.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Events/EventLogTable.tsx) | Server Component | `Pending` |
| **Events** | JSON payload modal/drawer viewer | [EventPayloadViewer.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Events/EventPayloadViewer.tsx) | Client Component | `Pending` |
| **Reconciler** | Discrepancy manager page | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/reconciler/page.tsx) | Server Component | `Pending` |
| **Reconciler** | Reconciliation check-card items | [DiscrepancyTriageCard.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Reconciler/DiscrepancyTriageCard.tsx) | Client Component | `Pending` |
| **Queue** | Dead Letter Queue main page | [page.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/app/queue/page.tsx) | Server Component | `Pending` |
| **Queue** | Retry queue cards (run state details) | [QueueRetryCard.tsx](file:///wsl.localhost/Ubuntu/home/zjavier/projectx/synccore-revops-engine/apps/dashboard/components/Queue/QueueRetryCard.tsx) | Client Component | `Pending` |

---

## Visual & Functional Alignment Checklists

### 1. Master/Detail Actions Inbox
- [ ] Left column filters: Assigned, Severity, Status
- [ ] Master List displays card with hover actions (Snooze, Assign, Resolve)
- [ ] Selecting action slides in the Right detail drawer with full logs & resolution forms

### 2. Tabbed Reconciler
- [ ] Header summary of un-reconciled records
- [ ] Clean discrepancy grid displaying source billing (Stripe) next to CRM (Hubspot) record details
- [ ] Actions: "Approve sync", "Ignore", "Edit manual"

### 3. Queue retry runs
- [ ] Active running stats overview panel
- [ ] Retry queue logs with visual success/failure indicator and execution logs
- [ ] "Force Retry" operational action triggers a Server Action
