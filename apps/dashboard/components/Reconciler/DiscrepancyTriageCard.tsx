"use client";

import styles from "./DiscrepancyTriageCard.module.css";
import type { DiscrepancyTriageCardProps } from "./local";

const noopAsync = async (_id: string) => {};

export function DiscrepancyTriageCard({
  triage,
  isDismissed: _isDismissed = false,
  onAcceptBilling = noopAsync,
  onAcceptCrm = noopAsync,
  onDismiss = noopAsync,
}: DiscrepancyTriageCardProps) {
  // Determine if card is resolved
  const isResolved = triage.status === 'resolved';

  // Determine which side won: use client-side accepted side, fallback to recommend if status is resolved
  const winner = triage.resolvedWinner || (isResolved ? triage.recommend : null);

  const aState = winner === 'A' ? 'winner' : (winner === 'B' ? 'loser' : 'neutral');
  const bState = winner === 'B' ? 'winner' : (winner === 'A' ? 'loser' : 'neutral');

  // Determine severity-based styling
  const cardClassName = `${styles.card} ${
    triage.severity === 'high' || triage.severity === 'critical' ? styles.cardCritical : ''
  } ${isResolved ? styles.cardResolved : ''}`;

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return `${styles.badge} ${styles.badgeSeverity} ${styles.badgeSeverityHigh}`;
      case 'medium':
        return `${styles.badge} ${styles.badgeSeverity} ${styles.badgeSeverityMedium}`;
      case 'low':
        return `${styles.badge} ${styles.badgeSeverity} ${styles.badgeSeverityLow}`;
      default:
        return `${styles.badge} ${styles.badgeSeverity}`;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return `${styles.statusChip} ${styles.statusChipResolved}`;
      case 'reviewing':
        return `${styles.statusChip} ${styles.statusChipReviewing}`;
      case 'open':
      default:
        return `${styles.statusChip} ${styles.statusChipOpen}`;
    }
  };

  const getSourcePanelClass = (state: string) => {
    switch (state) {
      case 'winner':
        return `${styles.sourcePanel} ${styles.sourcePanelWinner}`;
      case 'loser':
        return `${styles.sourcePanel} ${styles.sourcePanelLoser}`;
      default:
        return `${styles.sourcePanel} ${styles.sourcePanelNeutral}`;
    }
  };

  const getSourceValueClass = (state: string) => {
    switch (state) {
      case 'winner':
        return `${styles.sourceValue} ${styles.sourceValueWinner}`;
      case 'loser':
        return `${styles.sourceValue} ${styles.sourceValueLoser}`;
      default:
        return `${styles.sourceValue} ${styles.sourceValueNeutral}`;
    }
  };

  const symbolText = isResolved ? (winner === 'A' ? '←' : '→') : '≠';
  const symbolClass = isResolved ? `${styles.symbol} ${styles.symbolResolved}` : styles.symbol;

  return (
    <div className={cardClassName}>
      {/* Card Head */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.titleRow}>
            <span className={styles.accountName}>{triage.account}</span>
            <span className={getSeverityBadgeClass(triage.severity)}>
              {triage.severity}
            </span>
            <span className={styles.badge + ' ' + styles.badgeField}>
              {triage.field}
            </span>
            {triage.isAutoSafe && !isResolved && (
              <span className={styles.badge + ' ' + styles.badgeAutoSafe}>
                <span>◆</span>
                <span>auto-safe</span>
              </span>
            )}
          </div>
          <h3 className={styles.scenario}>{triage.scenario}</h3>
          <p className={styles.impact}>{triage.impactNarrative}</p>
        </div>
        <div className={styles.headRight}>
          <div className={getStatusBadgeClass(triage.status)}>
            {triage.status}
          </div>
          <div className={styles.detected}>{triage.detected}</div>
        </div>
      </div>

      {/* Body: Comparison + Resolution */}
      <div className={styles.body}>
        {/* Comparison Panel */}
        <div className={styles.comparison}>
          <div className={styles.comparisonGrid}>
            {/* Source A */}
            <div className={getSourcePanelClass(aState)}>
              <div className={styles.sourceLabel}>
                <span className={styles.sourceLabelText}>{triage.aLabel}</span>
                {isResolved && winner === 'A' && (
                  <span className={styles.sourceTag + ' ' + styles.sourceTagTruth}>
                    source of truth
                  </span>
                )}
                {!isResolved && triage.recommend === 'A' && (
                  <span className={styles.sourceTag + ' ' + styles.sourceTagRecommended}>
                    recommended
                  </span>
                )}
              </div>
              <div className={getSourceValueClass(aState)}>
                {triage.aValue}
              </div>
              <div className={styles.sourceSystem}>{triage.aSystem}</div>
            </div>

            {/* Center divider with symbol */}
            <div className={styles.symbolContainer}>
              <div className={symbolClass}>{symbolText}</div>
            </div>

            {/* Source B */}
            <div className={getSourcePanelClass(bState)}>
              <div className={styles.sourceLabel}>
                <span className={styles.sourceLabelText}>{triage.bLabel}</span>
                {isResolved && winner === 'B' && (
                  <span className={styles.sourceTag + ' ' + styles.sourceTagTruth}>
                    source of truth
                  </span>
                )}
                {!isResolved && triage.recommend === 'B' && (
                  <span className={styles.sourceTag + ' ' + styles.sourceTagRecommended}>
                    recommended
                  </span>
                )}
              </div>
              <div className={getSourceValueClass(bState)}>
                {triage.bValue}
              </div>
              <div className={styles.sourceSystem}>{triage.bSystem}</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Resolution Panel */}
        <div className={styles.resolution}>
          <div className={styles.fixSection}>
            <div className={styles.fixLabel}>
              {isResolved ? 'Resolution' : 'Suggested fix'}
            </div>
            <div className={styles.fixText}>{triage.fixText}</div>
          </div>

          <div className={styles.actionBar}>
            {isResolved && (
              <span className={styles.resolvedBadge}>
                ✓ Accepted {winner === 'A' ? triage.aLabel : triage.bLabel} (
                {winner === 'A' ? triage.aSystem : triage.bSystem})
              </span>
            )}
            {!isResolved && (
              <>
                <button
                  onClick={() => onAcceptBilling(triage.id)}
                  className={`${styles.actionButton} ${
                    triage.recommend === 'A'
                      ? styles.actionButtonPrimary
                      : styles.actionButtonSecondary
                  }`}
                >
                  Accept {triage.aShort}
                </button>
                <button
                  onClick={() => onAcceptCrm(triage.id)}
                  className={`${styles.actionButton} ${
                    triage.recommend === 'B'
                      ? styles.actionButtonPrimary
                      : styles.actionButtonSecondary
                  }`}
                >
                  Accept {triage.bShort}
                </button>
                <button
                  onClick={() => onDismiss(triage.id)}
                  className={`${styles.actionButton} ${styles.actionButtonGhost}`}
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
