'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import styles from './ActionsSeverityTabs.module.css';

interface TabOption {
  key: string;
  label: string;
  count: number;
  tone?: 'critical' | 'warn';
}

interface ActionsSeverityTabsProps {
  tabs: TabOption[];
  sortNote?: string;
}

export function ActionsSeverityTabs({ tabs, sortNote = 'ranked by exposure × age' }: ActionsSeverityTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSeverity = searchParams.get('severity') || 'all';

  const buildHref = (key: string): string => {
    const params = new URLSearchParams(searchParams);
    if (key === 'all') {
      params.delete('severity');
    } else {
      params.set('severity', key);
    }
    params.delete('id');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav className={styles.container} role="tablist" data-tour-id="actions-severity-tabs">
      <div className={styles.tabGroup}>
        {tabs.map((tab) => {
          const isActive = currentSeverity === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildHref(tab.key)}
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
