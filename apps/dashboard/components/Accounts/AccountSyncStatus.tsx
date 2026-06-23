import type { AccountSyncStatusProps } from './local';
import styles from './AccountSyncStatus.module.css';

export function AccountSyncStatus({ sources }: AccountSyncStatusProps) {
  return (
    <div className={styles.section} data-tour-id="account-sync-status">
      <h2 className={styles.title}>Sync status</h2>
      <div className={styles.container}>
        {sources.map((source) => (
          <div key={source.id} className={styles.sourceItem} data-state={source.state}>
            <div className={styles.dot} />
            <div className={styles.content}>
              <h3 className={styles.name}>{source.name}</h3>
              <div className={styles.detail}>{source.detail}</div>
            </div>
            <div className={styles.statusColumn}>
              <div className={styles.state}>{source.state}</div>
              <div className={styles.lastSync}>{source.last}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
