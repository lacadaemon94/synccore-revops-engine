type ActivityKind = 'action' | 'drift' | 'event' | 'recovery';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  label: string;
  sub: string;
  time: string;
  href?: string;
}

export interface ActivityGroup {
  id: string;
  label: string;
  count: number;
  items: ActivityEvent[];
}

export interface RecentActivityPanelProps {
  groups: ActivityGroup[];
  shownCount: number;
  totalCount: number;
}

export interface GreetingHeaderProps {
  userName: string;
  dayOfWeek: string;
  date: string;
  timeUntilStandup: string;
  lastSyncAgo: string;
  openActionCount: number;
  openActionDelta: number;
  exposure: string;
  recovered: string;
  recoveredRetries: number;
}

export interface PipelineStage {
  id: string;
  title: string;
  count: number;
  subtitle?: string;
  sources?: string[];
  details?: string;
  bars: Array<{ width: number; opacity: number }>;
  href: string;
  borderColor: 'fg' | 'warn' | 'critical' | 'success';
}

export interface PipelineStripProps {
  stages: PipelineStage[];
}

type TriageSeverity = 'critical' | 'high' | 'medium' | 'low';

interface TriageDescSegment {
  text: string;
  tone?: 'warn' | 'bright' | 'crit';
}

export interface TriageRow {
  id: string;
  severity: TriageSeverity;
  title: string;
  type: string;
  description: TriageDescSegment[];
  accountName: string;
  accountMeta: string;
  age: string;
  isCriticalAge: boolean;
  actionLabel: string;
  isSecondaryAction: boolean;
  href?: string;
}

export interface NeedsYouNowListProps {
  rows: TriageRow[];
  openActionCount: number;
}

export interface PortfolioAccount {
  id: string;
  name: string;
  segment: 'enterprise' | 'growth' | 'startup';
  owner: string;
  renewDate: string;
  arr: string;
  health: number;
  healthLabel: string;
  openCount: number;
}

interface PortfolioFilterTab {
  id: string;
  label: string;
}

export interface PortfolioPanelProps {
  accounts: PortfolioAccount[];
  activeTab: string;
  tabs: PortfolioFilterTab[];
  footerLabel?: string;
}
