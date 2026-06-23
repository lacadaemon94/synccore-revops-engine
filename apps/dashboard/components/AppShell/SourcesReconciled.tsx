import styles from './SourcesReconciled.module.css';

const SOURCES = [
  { id: 'stripe', label: 'Stripe', lag: '< 1s', state: 'synced' as const },
  { id: 'netsuite', label: 'NetSuite', lag: '2m', state: 'drift' as const },
  { id: 'crm', label: 'CRM', lag: '12m', state: 'drift' as const },
];

export function SourcesReconciled() {
  return (
    <div className={styles.panel}>
      <div className={styles.label}>Sources reconciled</div>
      <div className={styles.list}>
        {SOURCES.map((src) => (
          <div key={src.id} className={styles.row} data-state={src.state}>
            <div className={styles.identity}>
              <span className={styles.dot} aria-hidden="true" />
              <span>{src.label}</span>
            </div>
            <span className={styles.lag}>{src.lag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
