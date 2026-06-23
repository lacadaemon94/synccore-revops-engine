import type { CSSProperties } from 'react';

import styles from './WorkersPanel.module.css';

const WORKERS = [
  { id: 'wk-01', load: 62 },
  { id: 'wk-02', load: 48 },
  { id: 'wk-03', load: 71 },
  { id: 'wk-04', load: 33 },
];

type BarStyle = CSSProperties & Record<'--worker-load', string>;

function loadTone(load: number): 'normal' | 'warn' | 'critical' {
  if (load >= 80) return 'critical';
  if (load >= 65) return 'warn';
  return 'normal';
}

export function WorkersPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Workers</span>
        <span className={styles.upBadge}>
          <span className={styles.upDot} aria-hidden="true" />
          {WORKERS.length} up
        </span>
      </div>
      <div className={styles.list}>
        {WORKERS.map((w) => {
          const style: BarStyle = { '--worker-load': `${w.load}%` };
          return (
            <div key={w.id} className={styles.row}>
              <span className={styles.name}>{w.id}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  data-tone={loadTone(w.load)}
                  style={style}
                />
              </div>
              <span className={styles.loadValue}>{w.load}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
