import { EventLogTable } from '@/components/Events/EventLogTable';
import { EventDetailDrawerHost } from '@/components/Events/EventDetailDrawerHost';
import { eventLogRows } from '@/lib/fixtures/events';
import { eventDetails } from '@/lib/fixtures/events-detail';

import { EventsFilterBar } from './EventsFilterBar';
import styles from './page.module.css';

interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const tab = (typeof params.tab === 'string' ? params.tab : params.tab?.[0]) || 'all';
  const source = (typeof params.source === 'string' ? params.source : params.source?.[0]) || 'all';
  const selectedEventId = (typeof params.id === 'string' ? params.id : params.id?.[0]) || null;

  const isBlocked = (s: string) => s === 'failed' || s === 'escalated' || s === 'routed_to_dlq';
  const isInFlight = (s: string) => s === 'pending' || s === 'received' || s === 'retrying';
  const isProcessed = (s: string) => s === 'processed' || s === 'resolved' || s === 'success';

  const filteredRows = eventLogRows.filter((event) => {
    if (source !== 'all' && event.source !== source) return false;
    if (tab === 'blocked' && !isBlocked(event.status)) return false;
    if (tab === 'in-flight' && !isInFlight(event.status)) return false;
    if (tab === 'processed' && !isProcessed(event.status)) return false;
    return true;
  });

  const totalCount = eventLogRows.length;
  const blockedCount = eventLogRows.filter((e) => isBlocked(e.status)).length;
  const inFlightCount = eventLogRows.filter((e) => isInFlight(e.status)).length;
  const processedCount = eventLogRows.filter((e) => isProcessed(e.status)).length;

  const tabs = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'blocked', label: 'Blocked', count: blockedCount, tone: 'critical' as const },
    { key: 'in-flight', label: 'In flight', count: inFlightCount, tone: 'warn' as const },
    { key: 'processed', label: 'Processed', count: processedCount },
  ];

  const sources = [
    { key: 'all', label: 'all' },
    { key: 'stripe', label: 'stripe' },
    { key: 'n8n', label: 'n8n' },
    { key: 'netsuite', label: 'netsuite' },
    { key: 'crm', label: 'crm' },
  ];

  const selectedDetail = selectedEventId ? eventDetails[selectedEventId] : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Event Log</h1>
            <span className={styles.streamingPill}>
              <span className={styles.streamingDot} aria-hidden="true" />
              streaming
            </span>
          </div>
          <p className={styles.subtitle}>
            Every webhook is logged here <span className={styles.subFaint}>before</span> side effects run ·{' '}
            <span className={styles.subStrong}>{totalCount} events</span> ·{' '}
            <span className={styles.subCritical}>{blockedCount} blocked</span>
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.headerButton} aria-disabled="true">
            <span className={styles.pauseIcon} aria-hidden="true">⏸</span> Pause
          </button>
          <button type="button" className={styles.headerButton} aria-disabled="true">
            Export NDJSON
          </button>
        </div>
      </header>

      <section className={styles.statStrip} data-tour-id="events-stats">
        <StatCard label="logged" value={totalCount} sub="last 60m" dot="dim" />
        <StatCard label="processed" value={processedCount} sub="clean" dot="success" />
        <StatCard label="blocked / routed" value={blockedCount} sub="needs eyes" dot="critical" />
        <StatCard label="in flight" value={inFlightCount} sub="pending · retry" dot="link" />
      </section>

      <div data-tour-id="events-filters">
        <EventsFilterBar tabs={tabs} sources={sources} />
      </div>

      <div data-tour-id="events-table">
        <EventLogTable rows={filteredRows} searchParams={params} totalCount={totalCount} />
      </div>

      <EventDetailDrawerHost
        selectedEventId={selectedEventId}
        selectedDetail={selectedDetail}
        statusFilter={tab}
        sourceFilter={source}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  dot,
}: {
  label: string;
  value: number;
  sub: string;
  dot: 'dim' | 'success' | 'critical' | 'link';
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>
        <span className={styles.statDot} data-tone={dot} aria-hidden="true" />
        {label}
      </div>
      <div className={styles.statValue}>
        <span className={styles.statNumber}>{value}</span>
        <span className={styles.statSub}>{sub}</span>
      </div>
    </div>
  );
}
