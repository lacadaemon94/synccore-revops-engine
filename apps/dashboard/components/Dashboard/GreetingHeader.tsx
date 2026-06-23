import type { GreetingHeaderProps } from './local';
import styles from './GreetingHeader.module.css';

/**
 * GreetingHeader
 * Displays contextual greeting with user name, time until standup,
 * and key metrics (open actions, exposure, recovered).
 *
 * Server component that doesn't require interactivity.
 */
export function GreetingHeader({
  userName,
  dayOfWeek,
  date,
  timeUntilStandup,
  lastSyncAgo,
  openActionCount,
  openActionDelta,
  exposure,
  recovered,
  recoveredRetries,
}: GreetingHeaderProps) {
  return (
    <section className={styles.section} data-tour-id="overview-greeting">
      <div className={styles.greetingBlock}>
        <h1 className={styles.greeting}>Good {getGreeting()}, {userName}.</h1>
        <p className={styles.context}>
          {dayOfWeek}, {date} · <span className={styles.needsAttention}>{timeUntilStandup}</span> before 11:00 standup · last sync {lastSyncAgo} ago
        </p>
      </div>

      <div className={styles.kpiGroup}>
        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Open actions</div>
          <div className={styles.kpiValue}>
            {openActionCount}
            <span className={styles.delta}>{openActionDelta > 0 ? '+' : ''}{openActionDelta} since 8am</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Exposure</div>
          <div className={styles.kpiValue}>
            {exposure}
            <span className={styles.deltaAccent}>across 3 accts</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Recovered · 24h</div>
          <div className={styles.kpiValue}>
            {recovered}
            <span className={styles.deltaRecovered}>{recoveredRetries} retries</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Determine greeting based on time of day (simplified)
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
