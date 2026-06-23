import Link from 'next/link';
import styles from './EventLogTable.module.css';
import { EventLogTableProps, EventStatus, EventSource } from './local';

interface EventLogTableWithParamsProps extends EventLogTableProps {
  searchParams?: Record<string, string | string[]>;
  totalCount?: number;
}

function getStatusToneClass(status: EventStatus): string {
  switch (status) {
    case 'failed':
    case 'escalated':
      return styles.statusCritical;
    case 'routed_to_dlq':
      return styles.statusWarn;
    case 'pending':
    case 'received':
      return styles.statusPending;
    case 'retrying':
      return styles.statusWarn;
    case 'processed':
    case 'resolved':
    case 'success':
      return styles.statusSuccess;
    default:
      return styles.statusDim;
  }
}

function buildHref(eventId: string, searchParams?: Record<string, string | string[]>): string {
  const params = new URLSearchParams();
  if (searchParams) {
    const tab = typeof searchParams.tab === 'string' ? searchParams.tab : searchParams.tab?.[0];
    const source = typeof searchParams.source === 'string' ? searchParams.source : searchParams.source?.[0];
    if (tab && tab !== 'all') params.set('tab', tab);
    if (source && source !== 'all') params.set('source', source);
  }
  params.set('id', eventId);
  return `/events?${params.toString()}`;
}

function formatStatus(status: EventStatus): string {
  return status.replace(/_/g, '_'); // keep underscores readable
}

const providerLabel: Record<EventSource, string> = {
  stripe: 'stripe',
  n8n: 'n8n',
  netsuite: 'netsuite',
  crm: 'crm',
  hubspot: 'hubspot',
  internal: 'internal',
};

export function EventLogTable({ rows, searchParams, totalCount }: EventLogTableWithParamsProps) {
  const shown = rows.length;
  const total = totalCount ?? rows.length;
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <span>Event · source</span>
        <span>Type</span>
        <span>Account</span>
        <span className={styles.alignRight}>Amount</span>
        <span className={styles.alignRight}>Retries</span>
        <span className={styles.alignRight}>Received</span>
      </div>

      <div className={styles.body}>
        {rows.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyHeading}>∅ no matching events</div>
            <div className={styles.emptyDetail}>Nothing in this filter. Try “all” or a different source.</div>
          </div>
        ) : (
          rows.map((row) => {
            const href = buildHref(row.id, searchParams);
            return (
              <Link key={row.id} href={href} className={styles.row}>
                <div className={styles.eventColumn}>
                  <div className={styles.eventId}>{row.eventId}</div>
                  <div className={styles.chipRow}>
                    <span className={styles.providerChip}>{providerLabel[row.source]}</span>
                    <span className={[styles.statusChip, getStatusToneClass(row.status)].filter(Boolean).join(' ')}>
                      {formatStatus(row.status)}
                    </span>
                  </div>
                </div>
                <div className={styles.typeColumn}>
                  <div className={styles.type}>{row.type}</div>
                  <div className={styles.summary}>{row.summary}</div>
                </div>
                <div className={styles.accountColumn}>
                  <span className={styles.accountName}>{row.accountName}</span>
                  {row.owner && <span className={styles.owner}>{row.owner}</span>}
                </div>
                <div className={styles.amountColumn}>{row.amount || '—'}</div>
                <div className={styles.retriesColumn}>
                  <span className={row.retries > 0 ? styles.retriesActive : styles.retriesIdle}>
                    {row.retries}
                  </span>
                </div>
                <div className={styles.receivedColumn}>
                  <div className={styles.relTime}>{row.rel}</div>
                  <div className={styles.clockTime}>{row.clock}</div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className={styles.footer}>
        <span>{shown} of {total} events</span>
        <span>retention 30d · normalized at ingest</span>
      </div>
    </section>
  );
}
