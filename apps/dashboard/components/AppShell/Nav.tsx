'use client';

import {
  ActivityCircleIcon,
  AlertCircleIcon,
  DashboardSquare01Icon,
  DatabaseIcon,
  Exchange01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LayoutGroup, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import styles from './Nav.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: typeof DashboardSquare01Icon;
  badge?: string;
  badgeTone?: 'critical' | 'warn';
  livePulseOnActive?: boolean;
}

interface NavProps {
  actionCount?: number;
  accountsCount?: number;
  eventsCount?: string;
  reconcilerCount?: number;
  queueCount?: number;
}

export function Nav({
  actionCount = 12,
  accountsCount = 48,
  eventsCount = '2.5k',
  reconcilerCount = 7,
  queueCount = 23,
}: NavProps) {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const items: NavItem[] = [
    { href: '/', label: 'Overview', icon: DashboardSquare01Icon },
    { href: '/accounts', label: 'Accounts', icon: DatabaseIcon, badge: `${accountsCount}` },
    { href: '/actions', label: 'Actions', icon: AlertCircleIcon, badge: `${actionCount}`, badgeTone: 'critical' },
    { href: '/events', label: 'Events', icon: ActivityCircleIcon, badge: eventsCount, livePulseOnActive: true },
    { href: '/reconciler', label: 'Reconciler', icon: Exchange01Icon, badge: `${reconcilerCount}`, badgeTone: 'warn' },
    { href: '/queue', label: 'Queue', icon: RefreshIcon, badge: `${queueCount}` },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <LayoutGroup id="sidebar-nav">
      <nav className={styles.nav} onMouseLeave={() => setHoveredHref(null)}>
        {items.map((item) => {
          const active = isActive(item.href);
          const hovered = hoveredHref === item.href;
          const showLivePulse = active && item.livePulseOnActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              data-active={active}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => setHoveredHref(item.href)}
              onFocus={() => setHoveredHref(item.href)}
            >
              {hovered && !active && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className={styles.hoverPill}
                  transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
                  aria-hidden="true"
                />
              )}
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className={styles.activePill}
                  transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
                  aria-hidden="true"
                />
              )}

              <span className={styles.icon} aria-hidden="true">
                <HugeiconsIcon icon={item.icon} size={14} strokeWidth={1.8} />
              </span>
              <span className={styles.label}>{item.label}</span>

              {showLivePulse ? (
                <span className={styles.livePulse}>
                  <span className={styles.livePulseDot} aria-hidden="true" />
                  <span className={styles.livePulseText}>live</span>
                </span>
              ) : item.badge !== undefined ? (
                <span className={styles.badge} data-tone={item.badgeTone}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
