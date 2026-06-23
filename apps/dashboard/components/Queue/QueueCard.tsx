'use client';

import {
  Alert02Icon,
  CheckmarkCircle01Icon,
  Loading02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { QueueEntry } from './local';
import styles from './QueueCard.module.css';

interface QueueCardProps {
  entry: QueueEntry;
  onForceRetry?: (id: string) => void;
}

export function QueueCard({ entry, onForceRetry }: QueueCardProps) {
  const isResolved = entry.status === 'resolved';
  const isEscalated = entry.status === 'escalated';

  const segments = Array.from({ length: entry.maxRetries }, (_, i) => {
    const isFilled = i < entry.retryCount;
    return (
      <div
        key={i}
        className={`${styles.segment} ${isFilled ? styles.segmentFilled : styles.segmentEmpty}`}
        data-failure-class={entry.failureClass}
      />
    );
  });

  const formatEta = (sec: number): string => {
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerIcon = isResolved
    ? CheckmarkCircle01Icon
    : isEscalated
      ? Alert02Icon
      : Loading02Icon;

  return (
    <div className={`${styles.card} ${isEscalated ? styles.cardEscalated : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.account}>{entry.account}</div>
          <div className={styles.target}>→ {entry.target}</div>
        </div>
        <span className={`${styles.failureChip} ${styles[`failure_${entry.failureClass}`]}`}>
          {entry.failureClass}
        </span>
      </div>

      <div className={styles.retryMeter}>
        <div className={styles.meterLabel}>
          <span className={styles.meterLabelText}>attempts</span>
          <span className={styles.meterCount}>
            {entry.retryCount} / {entry.maxRetries}
          </span>
        </div>
        <div className={styles.segments}>{segments}</div>
      </div>

      <div
        className={`${styles.timerRow} ${
          isResolved
            ? styles.timerRowResolved
            : isEscalated
              ? styles.timerRowEscalated
              : styles.timerRowActive
        }`}
      >
        <span className={styles.timerIcon} data-status={entry.status}>
          <HugeiconsIcon icon={timerIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className={styles.timerText}>
          {isResolved ? 'recovered' : isEscalated ? 'manual review' : entry.status === 'retrying' ? 'retrying in' : 'next retry'}
        </span>
        <span className={styles.timerValue} data-status={entry.status}>
          {isResolved ? entry.resolvedAt || 'done' : isEscalated ? 'no auto-retry' : entry.etaSec <= 0 ? 'due now' : formatEta(entry.etaSec)}
        </span>
      </div>

      <div className={styles.errorMessage}>{entry.lastError}</div>

      <button
        type="button"
        onClick={() => onForceRetry?.(entry.id)}
        className={`${styles.actionButton} ${isResolved ? styles.buttonReplay : isEscalated ? styles.buttonEscalated : styles.buttonRetry}`}
      >
        {isResolved ? 'Replay' : isEscalated ? 'Force retry anyway' : 'Force retry'}
      </button>
    </div>
  );
}
