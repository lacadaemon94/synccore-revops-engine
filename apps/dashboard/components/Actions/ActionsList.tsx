'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { ChangeEvent } from 'react';

import type { ActionsListProps } from './local';
import { ActionsBulkBar } from './ActionsBulkBar';
import styles from './ActionsList.module.css';

function buildSelectionLink(searchParams: URLSearchParams, id: string): string {
  const params = new URLSearchParams(searchParams);
  params.set('id', id);
  return `?${params.toString()}`;
}

function getSeverityClass(severity: string): string {
  const map: Record<string, string> = {
    critical: styles.severityCritical,
    high: styles.severityHigh,
    medium: styles.severityMedium,
    low: styles.severityLow,
  };
  return map[severity] || '';
}

export function ActionsList({ actions }: ActionsListProps) {
  const searchParams = useSearchParams();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const severity = searchParams.get('severity') || 'all';
  const status = searchParams.get('status') || 'all';
  const selectedId = searchParams.get('id');

  const filteredActions = actions.filter((action) => {
    if (severity !== 'all' && action.severity !== severity) return false;
    if (status !== 'all' && action.status !== status) return false;
    return true;
  });

  const checkedCount = checkedIds.size;
  const allChecked =
    filteredActions.length > 0 &&
    filteredActions.every((a) => checkedIds.has(a.id));

  const handleCheckChange = (id: string, checked: boolean) => {
    const next = new Set(checkedIds);
    if (checked) next.add(id); else next.delete(id);
    setCheckedIds(next);
  };

  const handleSelectAll = (checked: boolean) => {
    setCheckedIds(checked ? new Set(filteredActions.map((a) => a.id)) : new Set());
  };

  const handleResolve = () => setCheckedIds(new Set());
  const handleSnooze = () => setCheckedIds(new Set());
  const handleAssign = () => {};

  return (
    <div className={styles.container} data-tour-id="actions-list">
      {filteredActions.length > 0 ? (
        <>
          <ActionsBulkBar
            selectedCount={checkedCount}
            allChecked={allChecked}
            onSelectAll={handleSelectAll}
            onResolve={handleResolve}
            onSnooze={handleSnooze}
            onAssign={handleAssign}
          />
          <div className={styles.list}>
            {filteredActions.map((action) => {
              const isActive = action.id === selectedId;
              const isChecked = checkedIds.has(action.id);
              return (
                <Link
                  key={action.id}
                  href={buildSelectionLink(searchParams, action.id)}
                  className={[styles.row, isActive ? styles.rowActive : ''].filter(Boolean).join(' ')}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        handleCheckChange(action.id, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={styles.rowCheckbox}
                      aria-label={`Select ${action.title}`}
                    />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <span className={styles.title}>{action.title}</span>
                      <span className={[styles.sevChip, getSeverityClass(action.severity)].filter(Boolean).join(' ')}>
                        {action.severity.toUpperCase()}
                      </span>
                      {action.type && <span className={styles.typeTag}>{action.type}</span>}
                    </div>
                    <div className={styles.metaRow}>
                      <span>{action.accountName}</span>
                      {action.assignee && (
                        <>
                          <span className={styles.bullet}>·</span>
                          <span>{action.assignee.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.rightColumn}>
                    <span className={styles.exposure}>{action.exposure || '—'}</span>
                    <span className={styles.age}>{action.createdAt}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>●</div>
          <div className={styles.emptyTitle}>Inbox zero</div>
          <div className={styles.emptyMessage}>No actions in this filter.</div>
        </div>
      )}
    </div>
  );
}
