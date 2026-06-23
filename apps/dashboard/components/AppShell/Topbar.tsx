'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { TourButton } from '@/components/Onboarding/TourButton';

import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';

import styles from './Topbar.module.css';

interface TopbarProps {
  ingestStatus?: string;
  userInitials?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'overview',
  '/accounts': 'accounts',
  '/actions': 'actions',
  '/events': 'events',
  '/queue': 'queue',
  '/reconciler': 'reconciler',
};

function derivePageLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) {
    return ROUTE_LABELS[pathname];
  }
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return 'overview';
  }
  if (segments[0] === 'accounts' && segments[1]) {
    return `accounts / ${segments[1]}`;
  }
  return segments[0];
}

export function Topbar({
  ingestStatus = 'ingest healthy · 1.2s p95',
  userInitials = 'JC',
}: TopbarProps) {
  const pathname = usePathname();
  const pageLabel = derivePageLabel(pathname);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className={styles.container}>
        <div className={styles.left}>
          <span className={styles.pageLabel}>{pageLabel}</span>
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={openPalette}
          aria-label="Search (Cmd+K)"
        >
          <span className={styles.searchHint}>⌘K</span>
          <span className={styles.searchDivider}>|</span>
          <span className={styles.searchText}>find account, run action, jump to…</span>
        </button>

        <div className={styles.right}>
          <div className={styles.healthPill}>
            <span className={styles.healthDot} aria-hidden="true" />
            <span className={styles.healthText}>{ingestStatus}</span>
          </div>

          <TourButton />

          <ThemeToggle />

          <div className={styles.avatar}>
            <span className={styles.avatarInitials}>{userInitials}</span>
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
