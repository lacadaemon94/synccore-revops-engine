'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { DiscrepancyTriageCard } from '@/components/Reconciler/DiscrepancyTriageCard';
import { discrepancyTriages } from '@/lib/fixtures/reconciler';

import styles from './page.module.css';

const SEVERITY_FILTERS = ['open', 'high', 'medium', 'low', 'resolved'] as const;
type SeverityFilter = (typeof SEVERITY_FILTERS)[number];

function isOpen(status: string): boolean {
  return status !== 'resolved';
}

export default function ReconcilerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get('tab') as SeverityFilter | null;
  const activeFilter: SeverityFilter = rawFilter && SEVERITY_FILTERS.includes(rawFilter) ? rawFilter : 'open';

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [resolvedState, setResolvedState] = useState<Record<string, 'A' | 'B'>>({});

  const setFilter = (next: SeverityFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'open') params.delete('tab'); else params.set('tab', next);
    const qs = params.toString();
    router.push(qs ? `/reconciler?${qs}` : '/reconciler');
  };

  // Filter to show only non-dismissed cards
  const visibleTriages = discrepancyTriages.filter((t) => !dismissedIds.has(t.id));

  // Apply resolved state to cards that were accepted
  const displayTriages = visibleTriages.map((triage) => {
    const acceptedSide = resolvedState[triage.id];
    if (!acceptedSide) return triage;
    // Update the triage to show resolved state with accepted side
    return { ...triage, status: 'resolved' as const, resolvedWinner: acceptedSide };
  });

  const handleAcceptBilling = async (id: string) => {
    setResolvedState((prev) => ({ ...prev, [id]: 'A' }));
  };

  const handleAcceptCrm = async (id: string) => {
    setResolvedState((prev) => ({ ...prev, [id]: 'B' }));
  };

  const handleDismiss = async (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const isOpenWithLive = (t: { id: string; status: string }) =>
    isOpen(t.status) && !resolvedState[t.id];
  const totalOpen = discrepancyTriages.filter(isOpenWithLive).length;
  const highSeverity = discrepancyTriages.filter(
    (t) => (t.severity === 'high' || t.severity === 'critical') && isOpenWithLive(t)
  ).length;
  const mediumCount = discrepancyTriages.filter((t) => t.severity === 'medium' && isOpenWithLive(t)).length;
  const lowCount = discrepancyTriages.filter((t) => t.severity === 'low' && isOpenWithLive(t)).length;
  const mrrDriftCount = discrepancyTriages.filter((t) => t.field === 'mrr').length;
  const planTierDriftCount = discrepancyTriages.filter((t) => t.field === 'plan_tier').length;
  const resolvedCount =
    discrepancyTriages.filter((t) => t.status === 'resolved').length +
    Object.keys(resolvedState).length;

  const tabFilteredTriages = displayTriages.filter((t) => {
    if (activeFilter === 'open') return isOpen(t.status);
    if (activeFilter === 'resolved') return t.status === 'resolved';
    if (activeFilter === 'high') return (t.severity === 'high' || t.severity === 'critical') && isOpen(t.status);
    if (activeFilter === 'medium') return t.severity === 'medium' && isOpen(t.status);
    if (activeFilter === 'low') return t.severity === 'low' && isOpen(t.status);
    return true;
  });

  return (
    <div className={styles.pageContainer}>
      <section className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Commercial drift detection</div>
          <h1 className={styles.title}>Reconciler</h1>
          <p className={styles.description}>
            Where <span className={styles.bold}>billing</span> and the{' '}
            <span className={styles.bold}>CRM</span> disagree ·{' '}
            <span className={styles.openCount}>{totalOpen} open</span> · pick a
            source of truth to resolve
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.sweepButton} aria-disabled="true">
            <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
            Run sweep
          </button>
          <button type="button" className={styles.rulesButton} aria-disabled="true">
            Rules
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className={styles.statsStrip} data-tour-id="reconciler-stats">
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span className={`${styles.statDot} ${styles.statDotCritical}`}></span>
            high severity
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{highSeverity}</span>
            <span className={styles.statSub}>act now</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span className={`${styles.statDot} ${styles.statDotWarn}`}></span>
            mrr drift
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{mrrDriftCount}</span>
            <span className={styles.statSub}>forecast risk</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span className={`${styles.statDot} ${styles.statDotWarn}`}></span>
            plan-tier drift
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{planTierDriftCount}</span>
            <span className={styles.statSub}>packaging risk</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span className={`${styles.statDot} ${styles.statDotSuccess}`}></span>
            resolved today
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{resolvedCount}</span>
            <span className={styles.statSub}>reconciled</span>
          </div>
        </div>
      </section>

      <section className={styles.tabBar} data-tour-id="reconciler-tabs">
        <div className={styles.tabs}>
          {([
            { key: 'open', label: 'Open', count: totalOpen },
            { key: 'high', label: 'High', count: highSeverity, tone: 'critical' as const },
            { key: 'medium', label: 'Medium', count: mediumCount, tone: 'warn' as const },
            { key: 'low', label: 'Low', count: lowCount },
            { key: 'resolved', label: 'Resolved', count: resolvedCount },
          ] as const).map((t) => {
            const isActive = activeFilter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                role="tab"
                aria-selected={isActive}
              >
                <span>{t.label}</span>
                <span className={styles.tabCount} data-tone={'tone' in t ? t.tone : undefined}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <span className={styles.tabNote}>
          {resolvedCount > 0 ? `${resolvedCount} reconciled today` : 'sweeps every 5m'}
        </span>
      </section>

      <section className={styles.cardsGrid} data-tour-id="reconciler-cards">
        {tabFilteredTriages.length > 0 ? (
          tabFilteredTriages.map((triage) => (
            <DiscrepancyTriageCard
              key={triage.id}
              triage={triage}
              onAcceptBilling={handleAcceptBilling}
              onAcceptCrm={handleAcceptCrm}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIndicator}>● in agreement</div>
            <div className={styles.emptyStateTitle}>No drift in this filter</div>
            <div className={styles.emptyStateText}>
              Billing and CRM agree for every tracked field here.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
