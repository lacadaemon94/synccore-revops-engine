import { GreetingHeader } from '@/components/Dashboard/GreetingHeader';
import { PipelineStrip } from '@/components/Dashboard/PipelineStrip';
import { NeedsYouNowList } from '@/components/Dashboard/NeedsYouNowList';
import { PortfolioPanel } from '@/components/Dashboard/PortfolioPanel';
import { RecentActivityPanel } from '@/components/Dashboard/RecentActivityPanel';

import { pipelineStages } from '@/lib/fixtures/overview-pipeline';
import { portfolioAccounts } from '@/lib/fixtures/overview-portfolio';
import { triageRows } from '@/lib/fixtures/overview-triage';
import { dashboardActivityGroups } from '@/lib/fixtures/dashboard';

import styles from './page.module.css';

export default function OverviewPage() {
  // Portfolio tab state setup
  const portfolioTabs = [
    { id: 'atrisk', label: 'at-risk' },
    { id: 'all', label: 'all 48' },
    { id: 'enterprise', label: 'enterprise' },
  ];

  return (
    <div className={styles.container}>
      {/* Greeting + KPI Header */}
      <GreetingHeader
        userName="Jordan"
        dayOfWeek="Tuesday"
        date="June 14"
        timeUntilStandup="27 mins"
        lastSyncAgo="42s"
        openActionCount={12}
        openActionDelta={4}
        exposure="$248k"
        recovered="$86k"
        recoveredRetries={7}
      />

      {/* Pipeline Strip */}
      <PipelineStrip stages={pipelineStages} />

      {/* Needs You Now */}
      <NeedsYouNowList rows={triageRows} openActionCount={12} />

      {/* Portfolio + Activity Grid */}
      <div className={styles.portfolioActivityGrid}>
        <PortfolioPanel
          accounts={portfolioAccounts}
          activeTab="atrisk"
          tabs={portfolioTabs}
        />

        <RecentActivityPanel
          groups={dashboardActivityGroups}
          shownCount={dashboardActivityGroups.reduce((acc, g) => acc + g.items.length, 0)}
          totalCount={412}
        />
      </div>
    </div>
  );
}
