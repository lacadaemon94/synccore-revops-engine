'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import styles from './AccountsFilterTabs.module.css';

interface TabOption {
  key: string;
  label: string;
  count: number;
  tone?: 'critical';
}

interface AccountsFilterTabsProps {
  tabs: TabOption[];
  sortNote?: string;
}

export function AccountsFilterTabs({ tabs, sortNote = 'ranked by health · ascending' }: AccountsFilterTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get('filter') || 'all';

  const buildTabHref = (tabKey: string): string => {
    const params = new URLSearchParams(searchParams);
    if (tabKey === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', tabKey);
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <nav className={styles.container} role="tablist" data-tour-id="accounts-tabs">
      <div className={styles.tabGroup}>
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildTabHref(tab.key)}
              className={styles.tab}
              data-active={isActive}
              role="tab"
              aria-selected={isActive}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabCount} data-tone={tab.tone}>{tab.count}</span>
            </Link>
          );
        })}
      </div>
      {sortNote && <span className={styles.sortNote}>{sortNote}</span>}
    </nav>
  );
}
