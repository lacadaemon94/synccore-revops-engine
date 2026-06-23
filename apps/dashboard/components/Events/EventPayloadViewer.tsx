import styles from './EventPayloadViewer.module.css';

interface EventPayloadViewerProps {
  payload: Record<string, unknown>;
}

export function EventPayloadViewer({ payload }: EventPayloadViewerProps) {
  const jsonString = JSON.stringify(payload, null, 2);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.title}>Raw payload</div>
        <span className={styles.contentType}>application/json</span>
      </div>
      <div className={styles.container}>
        <pre className={styles.pre}>{jsonString}</pre>
      </div>
    </div>
  );
}
