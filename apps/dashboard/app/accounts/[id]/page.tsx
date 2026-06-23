import Link from 'next/link';
import type { CSSProperties } from 'react';

import { AccountOpenActions } from '@/components/Accounts/AccountOpenActions';
import { AccountRecentEvents } from '@/components/Accounts/AccountRecentEvents';
import { AccountSyncStatus } from '@/components/Accounts/AccountSyncStatus';
import { AccountContacts } from '@/components/Accounts/AccountContacts';
import { accountRows, accountSummaries } from '@/lib/fixtures/accounts';
import {
  accountOpenActions,
  accountRecentEvents,
  accountSyncSources,
  accountContacts,
  accountDetailMetadata,
} from '@/lib/fixtures/account-detail-extras';

import styles from './page.module.css';

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
}

type HealthLevel = 'critical' | 'warn' | 'success';

type HealthBarStyle = CSSProperties & Record<'--health-percent', string>;

function getHealthLevel(healthScore: number): HealthLevel {
  if (healthScore >= 75) return 'success';
  if (healthScore >= 50) return 'warn';
  return 'critical';
}

function getStatusLabel(health: string): string {
  switch (health) {
    case 'at-risk':
      return 'At Risk';
    case 'churn-risk':
      return 'Critical';
    case 'healthy':
      return 'Stable';
    default:
      return 'Watch';
  }
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const { id } = await params;

  const accountRow = accountRows.find((row) => row.id === id);
  const accountSummary = accountSummaries[id as keyof typeof accountSummaries];

  if (!accountRow || !accountSummary) {
    return <div>Account not found</div>;
  }

  const actions = accountOpenActions[id as keyof typeof accountOpenActions] || [];
  const events = accountRecentEvents[id as keyof typeof accountRecentEvents] || [];
  const sources = accountSyncSources[id as keyof typeof accountSyncSources] || [];
  const contacts = accountContacts[id as keyof typeof accountContacts] || [];
  const metadata =
    accountDetailMetadata[id as keyof typeof accountDetailMetadata] || {
      seats: 'N/A',
      region: 'N/A',
      recovered: '$0',
      lastSync: 'N/A',
    };

  const statusLabel = getStatusLabel(accountRow.health);
  const healthLevel = getHealthLevel(accountRow.healthScore);
  const healthBarStyle: HealthBarStyle = {
    '--health-percent': `${accountRow.healthScore}%`,
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/accounts" className={styles.breadcrumbButton}>
          ← Accounts
        </Link>
        <span className={styles.breadcrumbPath}>accounts / {accountSummary.name}</span>
      </div>

      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>
            {accountSummary.name}
            <span
              className={styles.statusBadge}
              data-status={accountRow.health}
            >
              {statusLabel}
            </span>
          </h1>
          <div className={styles.headerMeta}>
            <span className={styles.metaSegment}>
              {accountSummary.metadata.segment}
            </span>
            <span className={styles.metaSeparator}>·</span>
            <span>owner {accountSummary.owner.name}</span>
            <span className={styles.metaSeparator}>·</span>
            <span>renews {accountSummary.renewalDate}</span>
            <span className={styles.metaSeparator}>·</span>
            <span className={styles.metaPlan}>
              {accountSummary.planTier} · annual
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} aria-disabled="true">
            Open in CRM
          </button>
          <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} aria-disabled="true">
            + New action
          </button>
        </div>
      </section>

      {/* KPI Strip */}
      <section className={styles.kpiSection} data-tour-id="account-kpis">
        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>ARR</div>
          <div className={styles.kpiValue}>
            {accountRow.mrr.replace('$', '').includes(',')
              ? `$${Math.round((parseInt(accountRow.mrr.replace(/[$,]/g, '')) * 12) / 1000)}k`
              : accountRow.mrr}
          </div>
          <div className={styles.kpiSubtext}>{accountRow.mrr}/mo</div>
        </div>

        <div className={styles.kpiItem} data-health-level={healthLevel}>
          <div className={styles.kpiLabel}>Health</div>
          <div className={styles.kpiValue}>{accountRow.healthScore}</div>
          <div className={styles.healthBar}>
            <div className={styles.healthBarFill} style={healthBarStyle} />
          </div>
        </div>

        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Open actions</div>
          <div className={styles.kpiValue}>{actions.length}</div>
          <div className={styles.kpiSubtext}>{accountRow.openIssues} drift open</div>
        </div>

        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Seats</div>
          <div className={styles.kpiValue}>{metadata.seats}</div>
          <div className={styles.kpiSubtext}>{metadata.region}</div>
        </div>

        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Recovered · LTD</div>
          <div className={`${styles.kpiValue} ${styles.kpiSuccessValue}`}>
            {metadata.recovered}
          </div>
          <div className={styles.kpiSubtext}>last sync {metadata.lastSync}</div>
        </div>
      </section>

      {/* Main Grid */}
      <section className={styles.gridSection}>
        <AccountOpenActions actions={actions} />
        <AccountSyncStatus sources={sources} />
        <AccountRecentEvents events={events} />
        <AccountContacts contacts={contacts} />
      </section>
    </div>
  );
}
