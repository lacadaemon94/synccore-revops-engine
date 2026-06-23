'use client';

import Link from 'next/link';
import { EventDetail } from './local';
import { EventPayloadViewer } from './EventPayloadViewer';
import { EventTimeline } from './EventTimeline';
import { EventActions } from './EventActions';
import styles from './EventDetailDrawer.module.css';

interface EventDetailDrawerProps {
  detail: EventDetail | null;
  open: boolean;
  onClose: () => void;
  statusFilter?: string;
  sourceFilter?: string;
}

export function EventDetailDrawer({
  detail,
  open,
  onClose,
  statusFilter,
  sourceFilter,
}: EventDetailDrawerProps) {
  if (!open || !detail) {
    return null;
  }

  const getStatusChipClass = (status: string): string => {
    switch (status) {
      case 'failed':
      case 'escalated':
        return styles.statusCritical;
      case 'routed_to_dlq':
        return styles.statusWarn;
      case 'processed':
      case 'resolved':
        return styles.statusSuccess;
      case 'pending':
      case 'received':
        return styles.statusLink;
      case 'retrying':
        return styles.statusWarn;
      default:
        return styles.statusDim;
    }
  };

  const getProviderChipClass = (): string => {
    return styles.providerChip;
  };

  const getNormalizedValueClass = (tone?: string): string => {
    switch (tone) {
      case 'critical':
        return styles.toneCritical;
      case 'warn':
        return styles.toneWarn;
      case 'success':
        return styles.toneSuccess;
      case 'link':
        return styles.toneLink;
      case 'dim':
        return styles.toneDim;
      default:
        return styles.toneBright;
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHead}>
          <div className={styles.headTop}>
            <div className={styles.chipRow}>
              <span className={`${styles.chip} ${getStatusChipClass(detail.status)}`}>
                {detail.status}
              </span>
              <span className={`${styles.chip} ${getProviderChipClass()}`}>
                {detail.provider}
              </span>
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close drawer">
              ✕
            </button>
          </div>

          <div className={styles.eventType}>{detail.type}</div>
          <div className={styles.eventId}>{detail.eventId}</div>
        </div>

        {/* Content */}
        <div className={styles.drawerContent}>
          {/* Meta Grid */}
          <div className={styles.metaGrid}>
            {[
              { key: 'account', value: detail.account },
              { key: 'owner', value: detail.owner },
              { key: 'amount', value: detail.amount },
              { key: 'received', value: `${detail.clock} · ${detail.rel}` },
              { key: 'retries', value: String(detail.retries) },
              { key: 'ingest latency', value: detail.latency },
            ].map((item) => (
              <div key={item.key} className={styles.metaCell}>
                <div className={styles.metaLabel}>{item.key}</div>
                <div className={styles.metaValue}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Summary / Note */}
          <div className={styles.noteSection}>
            <span className={styles.sectionLabel}>note</span>
            <p className={styles.noteParagraph}>{detail.summary}</p>
          </div>

          {/* Normalized Fields */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>Normalized fields</div>
            <div className={styles.normalizedList}>
              {detail.normalized.map((field) => (
                <div key={field.key} className={styles.normalizedRow}>
                  <div className={styles.normalizedKey}>{field.key}</div>
                  <div className={`${styles.normalizedValue} ${getNormalizedValueClass(field.tone)}`}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Payload */}
          <EventPayloadViewer payload={detail.raw} />

          {/* Processing Pipeline */}
          <EventTimeline steps={detail.pipeline} />

          {/* Actions */}
          <div className={styles.actionsSection}>
            <EventActions
              eventId={detail.eventId}
              primaryLabel={detail.primaryLabel}
              payload={detail.raw}
              accountId={detail.accountId}
              statusFilter={statusFilter}
              sourceFilter={sourceFilter}
            />
            <Link
              href={`/accounts/${detail.accountId}`}
              className={styles.secondaryLink}
              title="Open account details"
            >
              Open account ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
