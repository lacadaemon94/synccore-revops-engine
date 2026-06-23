import { PipelineStep } from './local';
import styles from './EventTimeline.module.css';

interface EventTimelineProps {
  steps: PipelineStep[];
}

function getDotClass(tone: string): string {
  switch (tone) {
    case 'critical':
      return styles.dotCritical;
    case 'warn':
      return styles.dotWarn;
    case 'success':
      return styles.dotSuccess;
    case 'link':
      return styles.dotLink;
    case 'dim':
      return styles.dotDim;
    default:
      return styles.dotDefault;
  }
}

export function EventTimeline({ steps }: EventTimelineProps) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>Processing pipeline</div>
      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.dotContainer}>
              <div className={`${styles.dot} ${getDotClass(step.tone)}`} />
            </div>
            <div className={styles.content}>
              <div className={styles.label}>
                <strong>{step.label}</strong>
              </div>
              <div className={styles.sub}>{step.sub}</div>
            </div>
            <span className={styles.time}>{step.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
