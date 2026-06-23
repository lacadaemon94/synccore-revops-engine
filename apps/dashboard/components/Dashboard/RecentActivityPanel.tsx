import Link from "next/link";

import type { ActivityEvent, RecentActivityPanelProps } from "./local";
import styles from "./RecentActivityPanel.module.css";

export function RecentActivityPanel({ groups, shownCount, totalCount }: RecentActivityPanelProps) {
  return (
    <div className={styles.panel} data-tour-id="overview-activity">
      <header className={styles.header}>
        <h2 className={styles.title}>Activity</h2>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} data-kind="action" />action
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} data-kind="drift" />drift
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} data-kind="event" />event
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} data-kind="recovery" />recovery
          </span>
        </div>
      </header>

      <div className={styles.container}>
        {groups.map((group) => (
          <section key={group.id} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupLabel}>{group.label}</span>
              <span className={styles.groupCount}>{group.count} events</span>
            </div>
            {group.items.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </section>
        ))}

        <div className={styles.footer}>
          <span>showing last {shownCount} of {totalCount}</span>
          <Link href="/events" className={styles.footerLink}>
            open Events log →
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderLabel(label: string) {
  const [first, ...rest] = label.split(" · ");
  return (
    <>
      <strong className={styles.labelStrong}>{first}</strong>
      {rest.length > 0 ? ` · ${rest.join(" · ")}` : ""}
    </>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const content = (
    <>
      <span className={styles.indicator} data-kind={event.kind} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.label}>{renderLabel(event.label)}</div>
        <div className={styles.sub}>{event.sub}</div>
      </div>
      <span className={styles.time}>{event.time}</span>
    </>
  );

  if (event.href) {
    return (
      <Link href={event.href} className={styles.row}>
        {content}
      </Link>
    );
  }
  return <div className={styles.row}>{content}</div>;
}
