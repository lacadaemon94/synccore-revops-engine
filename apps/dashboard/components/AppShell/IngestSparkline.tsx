import styles from './IngestSparkline.module.css';

interface SparkBar {
  height: number;
  tone: 'normal' | 'warn' | 'critical';
}

const FIXTURE_BARS: SparkBar[] = [
  { height: 32, tone: 'normal' }, { height: 48, tone: 'normal' }, { height: 38, tone: 'normal' },
  { height: 52, tone: 'normal' }, { height: 41, tone: 'normal' }, { height: 60, tone: 'normal' },
  { height: 47, tone: 'normal' }, { height: 55, tone: 'normal' }, { height: 72, tone: 'normal' },
  { height: 64, tone: 'normal' }, { height: 80, tone: 'warn' }, { height: 95, tone: 'critical' },
  { height: 88, tone: 'critical' }, { height: 71, tone: 'warn' }, { height: 58, tone: 'normal' },
  { height: 49, tone: 'normal' }, { height: 56, tone: 'normal' }, { height: 62, tone: 'normal' },
  { height: 70, tone: 'normal' }, { height: 78, tone: 'normal' }, { height: 65, tone: 'normal' },
  { height: 54, tone: 'normal' }, { height: 60, tone: 'normal' }, { height: 68, tone: 'normal' },
];

export function IngestSparkline() {
  return (
    <div className={styles.panel}>
      <div className={styles.label}>Ingest · last 60m</div>
      <div className={styles.bars}>
        {FIXTURE_BARS.map((bar, i) => (
          <div
            key={i}
            className={styles.bar}
            data-tone={bar.tone}
            data-height={bar.height}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <span>14 evt/min</span>
        <span className={styles.failed}>2 failed</span>
      </div>
    </div>
  );
}
