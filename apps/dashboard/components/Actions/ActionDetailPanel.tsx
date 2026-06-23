'use client';

import { ActionButton } from '@/components/common/ActionButton';
import { ActionPayloadSection } from './ActionPayloadSection';
import type { ActionDetailPanelProps } from './local';
import styles from './ActionDetailPanel.module.css';

export function ActionDetailPanel({
  action,
  onClose: _onClose,
  onSnooze,
  onResolve,
  assigneeOptions: _assigneeOptions,
  onAssigneeChange: _onAssigneeChange,
}: ActionDetailPanelProps) {
  if (!action) {
    return (
      <div className={styles.emptyState} data-tour-id="actions-detail">
        <div className={styles.emptyIcon}>●</div>
        <div className={styles.emptyTitle}>Select an action to view details</div>
        <div className={styles.emptyDescription}>
          Pick an action from the list to see its resolution path.
        </div>
      </div>
    );
  }

  const severityClass = {
    critical: styles.severityCritical,
    high: styles.severityHigh,
    medium: styles.severityMedium,
    low: styles.severityLow,
  }[action.severity];

  const ownerName = action.assignee?.name || 'Unassigned';
  const primaryLabel = action.primaryLabel || 'Resolve';

  return (
    <div className={styles.panel} data-tour-id="actions-detail">
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={`${styles.severityChip} ${severityClass}`}>
            {action.severity.toUpperCase()}
          </span>
          {action.type && <span className={styles.typeTag}>{action.type}</span>}
        </div>

        <h2 className={styles.title}>{action.title}</h2>

        <div className={styles.metadata}>
          <span className={styles.metadataStrong}>{action.accountName}</span>
          <span className={styles.metadataSeparator}>·</span>
          <span>{ownerName}</span>
          {action.createdAt && (
            <>
              <span className={styles.metadataSeparator}>·</span>
              <span className={styles.metadataMono}>{action.createdAt} old</span>
            </>
          )}
          {action.exposure && (
            <>
              <span className={styles.metadataSeparator}>·</span>
              <span className={styles.metadataExposure}>{action.exposure} exposure</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {action.recommendation && (
          <div className={styles.section}>
            <div className={styles.recommendationBox}>
              <div className={styles.sectionLabel}>Recommended</div>
              <p className={styles.recommendationText}>{action.recommendation}</p>
              <div className={styles.actionBar}>
                <ActionButton label={primaryLabel} variant="primary" onClick={onResolve} />
                <ActionButton label="Snooze 1h" variant="ghost" onClick={onSnooze} />
                <button type="button" className={styles.secondaryButton}>Reassign</button>
              </div>
            </div>
          </div>
        )}

        {action.payload && <ActionPayloadSection payload={action.payload} />}

        {action.whyNarrative && (
          <div className={styles.whySection}>
            <span className={styles.whyLabel}>why</span>
            <span className={styles.whyText}>{action.whyNarrative}</span>
          </div>
        )}

        {action.timeline && action.timeline.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Activity</div>
            <div className={styles.timeline}>
              {action.timeline.map((event, idx) => (
                <div key={idx} className={styles.timelineEntry}>
                  <div className={styles.timelineDot} data-kind={event.kind} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineMessage}>
                      <strong className={styles.timelineActor}>{event.label}</strong>
                    </div>
                    <div className={styles.timelineDetail}>{event.sub}</div>
                  </div>
                  <span className={styles.timelineTime}>{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
