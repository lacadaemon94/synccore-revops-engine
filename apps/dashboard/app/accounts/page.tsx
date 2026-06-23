import { AccountsFilterTabs } from '@/components/Accounts/AccountsFilterTabs';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import type { AccountTableRow } from '@/components/Accounts/local';
import { accountRows } from '@/lib/fixtures/accounts';

import styles from './page.module.css';

const TOTAL_ACCOUNTS = 48;

function isAtRisk(row: AccountTableRow): boolean {
  return row.healthScore < 75;
}

function getFilteredRows(rows: AccountTableRow[], filter: string): AccountTableRow[] {
  if (filter === 'at-risk') {
    return rows.filter(isAtRisk);
  }
  if (filter === 'enterprise') {
    return rows.filter((row) => row.segment === 'enterprise');
  }
  if (filter === 'growth') {
    return rows.filter((row) => row.segment === 'growth');
  }
  if (filter === 'starter') {
    return rows.filter((row) => row.segment === 'starter');
  }
  return rows;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'all';

  const filteredRows = getFilteredRows(accountRows, filter);

  const atRiskCount = accountRows.filter(isAtRisk).length;
  const enterpriseCount = accountRows.filter((row) => row.segment === 'enterprise').length;
  const growthCount = accountRows.filter((row) => row.segment === 'growth').length;
  const starterCount = accountRows.filter((row) => row.segment === 'starter').length;

  const tabs = [
    { key: 'all', label: 'All', count: accountRows.length },
    { key: 'at-risk', label: 'At-risk', count: atRiskCount, tone: 'critical' as const },
    { key: 'enterprise', label: 'Enterprise', count: enterpriseCount },
    { key: 'growth', label: 'Growth', count: growthCount },
    { key: 'starter', label: 'Starter', count: starterCount },
  ];

  const totalMrr = accountRows.reduce((sum, row) => {
    const numStr = row.mrr.replace(/[$,]/g, '');
    return sum + (parseFloat(numStr) || 0);
  }, 0);
  const totalArrM = (totalMrr * 12) / 1000000;

  return (
    <div className={styles.container}>
      <section className={styles.titleSection}>
        <div className={styles.titleContent}>
          <h1 className={styles.title}>Accounts</h1>
          <p className={styles.subtitle}>
            {TOTAL_ACCOUNTS} accounts ·
            <span className={styles.atRiskHighlight}>{atRiskCount} at-risk</span> ·
            ${totalArrM.toFixed(2)}M ARR under management · synced just now
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.buttonSecondary} aria-disabled="true">Export CSV</button>
          <button type="button" className={styles.buttonPrimary} aria-disabled="true">+ New account</button>
        </div>
      </section>

      <section className={styles.tablesSection}>
        <AccountsFilterTabs tabs={tabs} />
        <AccountsTable rows={filteredRows} totalCount={TOTAL_ACCOUNTS} />
      </section>
    </div>
  );
}
