import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className={styles.page} aria-label="Loading dashboard">
      <div className={styles.shell}>
        <div className={`${styles.bar} ${styles.barShort}`} />
        <div className={`${styles.bar} ${styles.barTitle}`} />
        <div className={styles.grid}>
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
        </div>
        <div className={styles.panel} />
      </div>
    </main>
  );
}
