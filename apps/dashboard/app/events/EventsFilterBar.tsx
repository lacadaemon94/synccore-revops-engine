'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import styles from './EventsFilterBar.module.css';

interface TabOption {
  key: string;
  label: string;
  count: number;
  tone?: 'critical' | 'warn';
}

interface SourceOption {
  key: string;
  label: string;
}

interface EventsFilterBarProps {
  tabs: TabOption[];
  sources: SourceOption[];
}

export function EventsFilterBar({ tabs, sources }: EventsFilterBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const currentSource = searchParams.get('source') || 'all';

  const buildHref = (key: 'tab' | 'source', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete(key); else params.set(key, value);
    params.delete('id');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className={styles.bar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildHref('tab', tab.key)}
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
      <div className={styles.sources}>
        <span className={styles.sourceLabel}>source</span>
        {sources.map((source) => {
          const isActive = currentSource === source.key;
          return (
            <Link
              key={source.key}
              href={buildHref('source', source.key)}
              className={styles.sourcePill}
              data-active={isActive}
            >
              {source.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
