'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NeedsYouNowListProps } from './local';
import styles from './NeedsYouNowList.module.css';

/**
 * NeedsYouNowList
 * Interactive triage list with multi-select checkboxes and bulk actions.
 * Client component that manages checkbox state for Resolve, Snooze, Assign actions.
 * Keyboard hints (R/S/A) displayed but no actual key bindings wired.
 */
export function NeedsYouNowList({
  rows,
  openActionCount,
}: NeedsYouNowListProps) {
  const [resolvedRows, setResolvedRows] = useState<Set<string>>(new Set());
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());

  const pendingRows = rows.filter((row) => !resolvedRows.has(row.id));
  const checkedVisible = Array.from(checkedRows).filter((id) =>
    pendingRows.some((r) => r.id === id)
  ).length;
  const allChecked =
    pendingRows.length > 0 &&
    checkedVisible === pendingRows.length;

  const toggleCheck = (id: string) => {
    const next = new Set(checkedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedRows(next);
  };

  const selectAll = () => {
    if (allChecked) {
      setCheckedRows(new Set());
    } else {
      const ids = new Set(pendingRows.map((r) => r.id));
      setCheckedRows(ids);
    }
  };

  const bulkResolve = () => {
    if (checkedRows.size === 0) return;
    const next = new Set(resolvedRows);
    checkedRows.forEach((id) => next.add(id));
    setResolvedRows(next);
    setCheckedRows(new Set());
  };

  const bulkSnooze = () => {
    if (checkedRows.size === 0) return;
    const next = new Set(resolvedRows);
    checkedRows.forEach((id) => next.add(id));
    setResolvedRows(next);
    setCheckedRows(new Set());
  };

  const resolveRow = (id: string) => {
    const next = new Set(resolvedRows);
    next.add(id);
    setResolvedRows(next);
  };

  const undoRow = (id: string) => {
    const next = new Set(resolvedRows);
    next.delete(id);
    setResolvedRows(next);
  };

  const bulkLabel =
    checkedVisible > 0
      ? `${checkedVisible} selected`
      : 'select all visible · ⌥A';

  const hasChecked = checkedRows.size > 0;

  return (
    <section className={styles.section} data-tour-id="overview-needs-you-now">
      <header className={styles.header}>
        <h2 className={styles.title}>Needs you now</h2>
        <div className={styles.meta}>
          <span>Ranked by exposure × age</span>
          <span className={styles.divider}>|</span>
          <Link href="/actions" className={styles.viewAllLink}>
            view all {openActionCount} →
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        {/* Bulk action bar */}
        <div className={styles.bulkBar}>
          <input
            type="checkbox"
            checked={allChecked}
            onChange={selectAll}
            className={styles.checkbox}
          />
          <span className={styles.bulkLabel}>{bulkLabel}</span>
          <div className={styles.bulkActions}>
            <button
              onClick={bulkResolve}
              className={styles.bulkButton}
              data-active={hasChecked}
            >
              Resolve{' '}
              <kbd className={styles.kbd}>R</kbd>
            </button>
            <button
              onClick={bulkSnooze}
              className={styles.bulkButton}
              data-secondary="true"
            >
              Snooze{' '}
              <kbd className={styles.kbd}>S</kbd>
            </button>
            <button className={styles.bulkButton} data-secondary="true">
              Assign{' '}
              <kbd className={styles.kbd}>A</kbd>
            </button>
          </div>
        </div>

        {/* Rows */}
        {pendingRows.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>●</span>
            <span>inbox zero</span>
            <span className={styles.emptyText}>
              Everything triaged. Nice.
            </span>
          </div>
        ) : (
          <div className={styles.rowsList}>
            {pendingRows.map((row) => {
              const isResolved = resolvedRows.has(row.id);
              const isChecked = checkedRows.has(row.id);

              return (
                <div
                  key={row.id}
                  className={styles.row}
                  data-resolved={isResolved}
                  data-severity={row.severity}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(row.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.content}>
                    <div className={styles.titleLine}>
                      <span className={styles.rowTitle}>
                        {row.title}
                      </span>
                      <span className={styles.sevChip} data-severity={row.severity}>
                        {row.severity.toUpperCase()}
                      </span>
                      <span className={styles.rowType}>{row.type}</span>
                    </div>
                    <div className={styles.description}>
                      {row.description.map((seg, i) => (
                        <span
                          key={i}
                          className={styles.descSegment}
                          data-tone={seg.tone}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>
                      {row.accountName}
                    </div>
                    <div className={styles.accountMeta}>
                      {row.accountMeta}
                    </div>
                  </div>
                  <div
                    className={styles.age}
                    data-critical={row.isCriticalAge}
                  >
                    {row.age}
                  </div>
                  <div className={styles.actions}>
                    {!isResolved ? (
                      <>
                        <button
                          onClick={() => resolveRow(row.id)}
                          className={styles.actionButton}
                          data-primary={!row.isSecondaryAction}
                        >
                          {row.actionLabel}
                        </button>
                        <button className={styles.moreButton}>⋯</button>
                      </>
                    ) : (
                      <>
                        <span className={styles.resolved}>✓ Resolved</span>
                        <button
                          onClick={() => undoRow(row.id)}
                          className={styles.undoButton}
                        >
                          Undo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
