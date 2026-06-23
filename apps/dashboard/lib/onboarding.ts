export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  benefit?: string;
  /** A data-tour-id value present on a DOM node. If missing or not found, the step renders centered. */
  target?: string;
}

export interface OnboardingTour {
  route: string;
  label: string;
  intro: OnboardingStep;
  steps: OnboardingStep[];
}

export const ONBOARDING_VERSION = 'v1';
export const ONBOARDING_GLOBAL_KEY = `synccore:onboarding:${ONBOARDING_VERSION}:completed`;
export const onboardingRouteKey = (route: string) =>
  `synccore:onboarding:${ONBOARDING_VERSION}:${route}`;

const overview: OnboardingTour = {
  route: '/',
  label: 'Overview',
  intro: {
    id: 'overview-intro',
    title: 'Welcome to SyncCore',
    body: "SyncCore stitches your billing, CRM, and ops systems together and surfaces what needs human attention today. This quick tour shows what each section is for.",
    benefit: 'Start the day knowing what matters — without checking every tool manually.',
  },
  steps: [
    {
      id: 'overview-greeting',
      target: 'overview-greeting',
      title: 'Daily snapshot',
      body: 'Open actions, dollar exposure, recovered value, and how fresh your syncs are — at a glance.',
    },
    {
      id: 'overview-pipeline',
      target: 'overview-pipeline',
      title: "Today's pipeline",
      body: 'How events flow from ingestion through normalization, drift detection, action, and recovery. Click any stage to drill in.',
    },
    {
      id: 'overview-needs-you-now',
      target: 'overview-needs-you-now',
      title: 'Needs you now',
      body: 'The highest-priority items where a person should review or decide. Ranked by exposure × age.',
      benefit: 'Cut through noise — focus on the few decisions that move the number.',
    },
    {
      id: 'overview-portfolio',
      target: 'overview-portfolio',
      title: 'Portfolio exposure',
      body: 'Account-level risk and ARR exposure, filtered by segment so you can see where revenue is concentrated.',
    },
    {
      id: 'overview-activity',
      target: 'overview-activity',
      title: 'Recent activity',
      body: 'An audit-style stream of system activity: drift detections, actions taken, recoveries.',
    },
  ],
};

const accounts: OnboardingTour = {
  route: '/accounts',
  label: 'Accounts',
  intro: {
    id: 'accounts-intro',
    title: 'Accounts portfolio',
    body: 'A unified view of every account, its health, and the signals coming in from connected systems.',
    benefit: 'Spot at-risk accounts and prioritize follow-up faster.',
  },
  steps: [
    {
      id: 'accounts-tabs',
      target: 'accounts-tabs',
      title: 'Filter tabs',
      body: 'Slice the portfolio by risk band or segment: All, At-risk, Enterprise, Growth, Starter.',
    },
    {
      id: 'accounts-table',
      target: 'accounts-table',
      title: 'Accounts table',
      body: 'Health score, segment, MRR/ARR, open issues, last activity. Click any row to drill into an account.',
    },
  ],
};

const accountDetail: OnboardingTour = {
  route: '/accounts/[id]',
  label: 'Account detail',
  intro: {
    id: 'account-detail-intro',
    title: 'Account deep-dive',
    body: 'Everything that matters for one account — health, exposure, open work, and the signals driving it.',
    benefit: 'One place to understand an account before taking action.',
  },
  steps: [
    {
      id: 'account-kpis',
      target: 'account-kpis',
      title: 'Account KPIs',
      body: 'ARR, health, open actions, seats, and recovered value. The basics, up top.',
    },
    {
      id: 'account-open-actions',
      target: 'account-open-actions',
      title: 'Open actions',
      body: 'Work items tied to this account, ranked by severity, with resolution suggestions.',
    },
    {
      id: 'account-recent-events',
      target: 'account-recent-events',
      title: 'Recent events',
      body: "The account's last few sync events, drift detections, and recoveries.",
    },
    {
      id: 'account-sync-status',
      target: 'account-sync-status',
      title: 'Sync status',
      body: 'Per-source state — Stripe, NetSuite, CRM — and where things last drifted.',
    },
  ],
};

const actions: OnboardingTour = {
  route: '/actions',
  label: 'Actions',
  intro: {
    id: 'actions-intro',
    title: 'Action inbox',
    body: 'The priority layer. SyncCore groups the work that needs human review so the team does not have to inspect every system manually.',
    benefit: 'A focused list of things to review and resolve, ranked by business impact.',
  },
  steps: [
    {
      id: 'actions-severity-tabs',
      target: 'actions-severity-tabs',
      title: 'Severity tabs',
      body: 'Filter by urgency: critical, medium, low, or resolved.',
    },
    {
      id: 'actions-list',
      target: 'actions-list',
      title: 'Action list',
      body: 'Each row is one work item — title, account, exposure, age. Selectable for batch actions.',
    },
    {
      id: 'actions-detail',
      target: 'actions-detail',
      title: 'Detail panel',
      body: 'Context, recommended next step, payload diff, and assignee/status controls.',
    },
  ],
};

const events: OnboardingTour = {
  route: '/events',
  label: 'Events',
  intro: {
    id: 'events-intro',
    title: 'Event log',
    body: 'An audit log for everything flowing in from connected systems: webhooks, syncs, recoveries.',
    benefit: 'Debug what happened, trace source data, and build trust in the automation.',
  },
  steps: [
    {
      id: 'events-stats',
      target: 'events-stats',
      title: 'Event stats',
      body: 'Volume, processing health, and in-flight count — refreshed live.',
    },
    {
      id: 'events-filters',
      target: 'events-filters',
      title: 'Filters',
      body: 'Slice by status (blocked, in-flight, processed) and source system.',
    },
    {
      id: 'events-table',
      target: 'events-table',
      title: 'Event timeline',
      body: 'Each row is one normalized event. Click any row to inspect raw payload and pipeline steps.',
    },
  ],
};

const reconciler: OnboardingTour = {
  route: '/reconciler',
  label: 'Reconciler',
  intro: {
    id: 'reconciler-intro',
    title: 'Reconciler',
    body: 'The reconciler compares records across systems and highlights mismatches before they become operational problems.',
    benefit: 'Catch billing, CRM, and inventory drift early — before it hits a customer or the books.',
  },
  steps: [
    {
      id: 'reconciler-stats',
      target: 'reconciler-stats',
      title: 'Drift summary',
      body: 'Open mismatches, dollar exposure, and resolution rate.',
    },
    {
      id: 'reconciler-tabs',
      target: 'reconciler-tabs',
      title: 'Severity tabs',
      body: 'Filter discrepancies by severity or status.',
    },
    {
      id: 'reconciler-cards',
      target: 'reconciler-cards',
      title: 'Discrepancy cards',
      body: 'Side-by-side comparison of two sources, with a suggested resolution.',
    },
  ],
};

const queue: OnboardingTour = {
  route: '/queue',
  label: 'Queue',
  intro: {
    id: 'queue-intro',
    title: 'Recovery queue',
    body: 'These lanes show where failed sync work stands: waiting, retrying, escalated, or resolved.',
    benefit: 'Keep failed automations visible and recoverable instead of silently losing work.',
  },
  steps: [
    {
      id: 'queue-lanes',
      target: 'queue-lanes',
      title: 'Status lanes',
      body: 'Pending, Retrying, Failed/Escalated, Resolved — each card is a stuck job with retry context.',
    },
  ],
};

const tours: OnboardingTour[] = [overview, accounts, accountDetail, actions, events, reconciler, queue];

export function getTourForRoute(pathname: string): OnboardingTour | null {
  if (pathname === '/') return overview;
  if (pathname.startsWith('/accounts/') && pathname !== '/accounts') return accountDetail;
  return tours.find((t) => t.route === pathname) ?? null;
}

export function getAllTours(): OnboardingTour[] {
  return tours;
}
