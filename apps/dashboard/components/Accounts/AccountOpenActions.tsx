'use client';

import { useState } from 'react';

import type { AccountOpenActionsProps } from './local';
import styles from './AccountOpenActions.module.css';

export function AccountOpenActions({ actions }: AccountOpenActionsProps) {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const activeActions = actions.filter((action) => !resolvedIds.has(action.id));
  const isEmpty = activeActions.length === 0;

  return (
    <div className={styles.section} data-tour-id="account-open-actions">
      <h2 className={styles.title}>Open actions</h2>
      <div className={styles.container}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>● all clear</div>
            <div className={styles.emptyStateLabel}>
              No open actions. All sources reconciled.
            </div>
          </div>
        ) : (
          activeActions.map((action) => (
            <div
              key={action.id}
              className={styles.actionItem}
              data-severity={action.severity}
            >
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.title_action}>{action.title}</h3>
                  <span className={styles.badge}>{action.severity}</span>
                </div>
                <div className={styles.meta}>{action.meta}</div>
              </div>
              <div className={styles.actions}>
                <span className={styles.age}>{action.age}</span>
                <button
                  onClick={() => handleResolve(action.id)}
                  className={styles.resolveButton}
                  type="button"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
