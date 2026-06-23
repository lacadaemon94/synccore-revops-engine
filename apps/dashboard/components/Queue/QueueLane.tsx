import type { CSSProperties } from 'react';

import type { QueueEntry, QueueStatus } from './local';
import { QueueCard } from './QueueCard';
import styles from './QueueLane.module.css';

interface QueueLaneProps {
  status: QueueStatus;
  title: string;
  entries: QueueEntry[];
  onForceRetry?: (id: string) => void;
}

const laneColorMap: Record<QueueStatus, string> = {
  pending: 'var(--text-faint)',
  retrying: 'var(--link)',
  escalated: 'var(--critical)',
  resolved: 'var(--success)',
};

const emptyLabelMap: Record<QueueStatus, string> = {
  pending: 'queue clear',
  retrying: 'no active retries',
  escalated: 'nothing escalated',
  resolved: 'none yet',
};

type LaneHeaderStyle = CSSProperties & Record<'--lane-dot-color', string>;

export function QueueLane({ status, title, entries, onForceRetry }: QueueLaneProps) {
  const headerStyle: LaneHeaderStyle = { '--lane-dot-color': laneColorMap[status] };

  return (
    <div className={styles.laneContainer}>
      <div className={styles.laneHeader} style={headerStyle}>
        <span className={styles.laneDot} />
        <span className={styles.laneTitle}>{title}</span>
        <span className={styles.laneCount}>{entries.length}</span>
      </div>

      <div className={styles.laneContent}>
        {entries.length > 0 ? (
          <div className={styles.cardGrid}>
            {entries.map((entry) => (
              <QueueCard key={entry.id} entry={entry} onForceRetry={onForceRetry} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>{emptyLabelMap[status]}</div>
        )}
      </div>
    </div>
  );
}
