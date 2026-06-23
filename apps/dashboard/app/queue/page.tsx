import { QueueLane } from '@/components/Queue/QueueLane';
import { queueEntries } from '@/lib/fixtures/queue';

import styles from './page.module.css';

export default function QueuePage() {
  const pendingEntries = queueEntries.filter((e) => e.status === 'pending');
  const retryingEntries = queueEntries.filter((e) => e.status === 'retrying');
  const escalatedEntries = queueEntries.filter((e) => e.status === 'escalated');
  const resolvedEntries = queueEntries.filter((e) => e.status === 'resolved');

  const activeCount = pendingEntries.length + retryingEntries.length;
  const escalationCount = escalatedEntries.length;

  return (
    <div className={styles.container}>
      <section className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div>
            <div className={styles.eyebrow}>Dead-letter recovery</div>
            <h1 className={styles.title}>Recovery Queue</h1>
            <p className={styles.description}>
              Retryable failures, replayed on a backoff schedule ·
              <span className={styles.activeCount}>{activeCount} active</span> ·
              <span className={styles.escalationCount}>{escalationCount} need a human</span>
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.backoffBadge}>
              backoff <span className={styles.backoffValue}>15m</span> →
              <span className={styles.backoffValue}>30m</span> →
              <span className={styles.backoffValue}>60m</span>
            </span>
            <button type="button" className={styles.drainButton} aria-disabled="true">Drain retryable</button>
          </div>
        </div>
      </section>

      <section className={styles.kanbanSection} data-tour-id="queue-lanes">
        <div className={styles.kanbanBoard}>
          <QueueLane status="pending" title="Pending" entries={pendingEntries} />
          <QueueLane status="retrying" title="Retrying" entries={retryingEntries} />
          <QueueLane status="escalated" title="Failed · Escalated" entries={escalatedEntries} />
          <QueueLane status="resolved" title="Resolved" entries={resolvedEntries} />
        </div>
      </section>
    </div>
  );
}
