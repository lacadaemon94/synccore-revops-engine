'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActivityCircleIcon,
  AlertCircleIcon,
  ArrowRight01Icon,
  ContrastIcon,
  DashboardSquare01Icon,
  DatabaseIcon,
  Exchange01Icon,
  RefreshIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { accountRows } from '@/lib/fixtures/accounts';
import { queueEntries } from '@/lib/fixtures/queue';

import styles from './CommandPalette.module.css';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  group: 'commands' | 'navigate' | 'queue' | 'accounts';
  icon: typeof DashboardSquare01Icon;
  label: string;
  sub?: string;
  trailing?: string;
  href?: string;
  action?: () => void;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('themechange'));
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const allItems = useMemo<PaletteItem[]>(() => {
    const commands: PaletteItem[] = [
      {
        id: 'cmd-theme',
        group: 'commands',
        icon: ContrastIcon,
        label: 'Toggle black / alabaster theme',
        sub: 'appearance',
        action: toggleTheme,
      },
      {
        id: 'cmd-drain',
        group: 'commands',
        icon: RefreshIcon,
        label: 'Drain retryable items',
        sub: 'force-resolve safe retries',
      },
    ];

    const navigate: PaletteItem[] = [
      { id: 'nav-overview', group: 'navigate', icon: DashboardSquare01Icon, label: 'Overview', sub: 'dashboard home', trailing: '↗', href: '/' },
      { id: 'nav-accounts', group: 'navigate', icon: DatabaseIcon, label: 'Accounts', sub: 'all 48 accounts', trailing: '↗', href: '/accounts' },
      { id: 'nav-actions', group: 'navigate', icon: AlertCircleIcon, label: 'Actions', sub: '12 open', trailing: '↗', href: '/actions' },
      { id: 'nav-events', group: 'navigate', icon: ActivityCircleIcon, label: 'Events', sub: 'audit log', trailing: '↗', href: '/events' },
      { id: 'nav-reconciler', group: 'navigate', icon: Exchange01Icon, label: 'Reconciler', sub: 'drift detection', trailing: '↗', href: '/reconciler' },
      { id: 'nav-queue', group: 'navigate', icon: RefreshIcon, label: 'Queue', sub: 'dead-letter recovery', trailing: '↗', href: '/queue' },
    ];

    const queue: PaletteItem[] = queueEntries.slice(0, 8).map((entry) => ({
      id: `q-${entry.id}`,
      group: 'queue',
      icon: RefreshIcon,
      label: entry.account,
      sub: `${entry.target} · ${entry.failureClass}`,
      trailing: entry.status,
      href: '/queue',
    }));

    const accounts: PaletteItem[] = accountRows.slice(0, 8).map((row) => ({
      id: `a-${row.id}`,
      group: 'accounts',
      icon: DatabaseIcon,
      label: row.name,
      sub: `${row.segment ?? ''}${row.owner ? ` · ${row.owner}` : ''}`,
      trailing: row.mrr,
      href: `/accounts/${row.id}`,
    }));

    return [...commands, ...navigate, ...queue, ...accounts];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const haystack = `${item.label} ${item.sub ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [allItems, query]);

  const groups = useMemo(() => {
    const order: PaletteItem['group'][] = ['commands', 'navigate', 'queue', 'accounts'];
    const labels: Record<PaletteItem['group'], string> = {
      commands: 'Commands',
      navigate: 'Navigate',
      queue: 'Queue',
      accounts: 'Accounts',
    };
    return order
      .map((g) => ({ id: g, label: labels[g], items: filtered.filter((i) => i.group === g) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const updateQuery = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
  };

  const select = (item: PaletteItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) select(item);
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">
            <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.8} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search queue, accounts, commands…"
            className={styles.searchInput}
            aria-label="Search"
          />
          <kbd className={styles.escKbd}>esc</kbd>
        </div>

        <div className={styles.results}>
          {groups.length === 0 ? (
            <div className={styles.empty}>No matches for &ldquo;{query}&rdquo;</div>
          ) : (
            groups.map((group) => (
              <section key={group.id} className={styles.group}>
                <div className={styles.groupLabel}>{group.label}</div>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.row}
                      data-active={isActive}
                      onClick={() => select(item)}
                      onMouseEnter={() => setActiveIndex(filtered.indexOf(item))}
                    >
                      <span className={styles.rowIcon} aria-hidden="true">
                        <HugeiconsIcon icon={item.icon} size={14} strokeWidth={1.8} />
                      </span>
                      <span className={styles.rowLabel}>{item.label}</span>
                      {item.sub && <span className={styles.rowSub}>{item.sub}</span>}
                      {item.trailing && (
                        <span className={styles.rowTrailing}>
                          {item.trailing === '↗' ? (
                            <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={1.8} />
                          ) : (
                            item.trailing
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </section>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>↕</kbd> navigate
            </span>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>⏎</kbd> open
            </span>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>esc</kbd> close
            </span>
          </div>
          <span className={styles.resultCount}>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
