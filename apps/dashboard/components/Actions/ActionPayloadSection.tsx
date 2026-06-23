'use client';

import type {
  ActionPayloadData,
  ActionFieldDriftRow,
  ActionErrorRow,
} from './local';
import styles from './ActionPayloadSection.module.css';

interface ActionPayloadSectionProps {
  payload: ActionPayloadData;
}

function FieldDriftPayload({ rows }: { rows: ActionFieldDriftRow[] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Field drift · stripe → crm</div>
      <div className={styles.diffGrid}>
        {rows.map((row, idx) => (
          <div key={idx} className={styles.diffRow}>
            <span className={styles.diffLabel}>{row.label}</span>
            <div className={styles.diffValues}>
              <span className={styles.left}>{row.left}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.right}>{row.right}</span>
            </div>
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorDetailPayload({
  label,
  rows,
}: {
  label: string;
  rows: ActionErrorRow[];
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>{label}</div>
      <div className={styles.errorGrid}>
        {rows.map((row, idx) => (
          <div key={idx} className={styles.errorRow}>
            <span className={styles.errorKey}>{row.k}</span>
            <span
              className={`${styles.errorValue} ${
                row.warn ? styles.errorValueWarn : ''
              }`}
            >
              {row.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActionPayloadSection({
  payload,
}: ActionPayloadSectionProps) {
  if (payload.type === 'field-drift' && payload.diffRows) {
    return <FieldDriftPayload rows={payload.diffRows} />;
  }

  if (
    (payload.type === 'error-detail' || payload.type === 'payload-metrics') &&
    payload.errorRows
  ) {
    return (
      <ErrorDetailPayload
        label={payload.label}
        rows={payload.errorRows}
      />
    );
  }

  return null;
}
