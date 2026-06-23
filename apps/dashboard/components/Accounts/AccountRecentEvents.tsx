import type { AccountRecentEventsProps } from './local';
import styles from './AccountRecentEvents.module.css';

export function AccountRecentEvents({ events }: AccountRecentEventsProps) {
  return (
    <div className={styles.section} data-tour-id="account-recent-events">
      <h2 className={styles.title}>Recent events</h2>
      <div className={styles.container}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventItem} data-kind={event.kind}>
            <div className={styles.dot} />
            <div className={styles.content}>
              <div className={styles.label}>{event.label}</div>
              <div className={styles.sub}>{event.sub}</div>
            </div>
            <span className={styles.time}>{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
