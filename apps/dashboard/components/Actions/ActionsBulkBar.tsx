'use client';

import styles from './ActionsBulkBar.module.css';

export interface ActionsBulkBarProps {
  selectedCount: number;
  allChecked: boolean;
  onSelectAll: (checked: boolean) => void;
  onResolve: () => void;
  onSnooze: () => void;
  onAssign: () => void;
}

export function ActionsBulkBar({
  selectedCount,
  allChecked,
  onSelectAll,
  onResolve,
  onSnooze,
  onAssign,
}: ActionsBulkBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className={styles.bar}>
      <div className={styles.leftSection}>
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => onSelectAll(e.target.checked)}
          className={styles.checkbox}
          aria-label="Select all visible actions"
        />
        <span className={styles.label}>
          {hasSelection
            ? `${selectedCount} selected`
            : 'select all visible · ⌥A'}
        </span>
      </div>

      <div className={styles.rightSection}>
        <button
          onClick={onResolve}
          className={`${styles.button} ${
            hasSelection ? styles.buttonActive : styles.buttonInactive
          }`}
          disabled={!hasSelection}
        >
          Resolve <span className={styles.shortcut}>R</span>
        </button>
        <button
          onClick={onSnooze}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={!hasSelection}
        >
          Snooze <span className={styles.shortcut}>S</span>
        </button>
        <button
          onClick={onAssign}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={!hasSelection}
        >
          Assign <span className={styles.shortcut}>A</span>
        </button>
      </div>
    </div>
  );
}
