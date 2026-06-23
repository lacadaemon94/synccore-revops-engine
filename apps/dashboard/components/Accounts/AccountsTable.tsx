import Link from "next/link";
import type { CSSProperties } from "react";

import { AccountsTableProps } from "./local";
import styles from "./AccountsTable.module.css";

type RowStyle = CSSProperties & Record<"--health-percent", string>;

type HealthBand = "critical" | "high" | "watch" | "stable";

function getHealthBand(score: number): HealthBand {
  if (score < 35) return "critical";
  if (score < 50) return "high";
  if (score < 75) return "watch";
  return "stable";
}

function getOpenTone(openIssues: number): "critical" | "none" {
  return openIssues > 0 ? "critical" : "none";
}

export function AccountsTable({ rows, shownCount, totalCount = 48 }: AccountsTableProps) {
  const shown = shownCount ?? rows.length;

  return (
    <div className={styles.wrapper} data-tour-id="accounts-table">
      <div className={styles.header}>
        <div>Account</div>
        <div className={styles.headerSegment}>Segment</div>
        <div className={styles.headerMrr}>ARR</div>
        <div className={styles.headerHealth}>Health</div>
        <div className={styles.headerOpen}>Open</div>
        <div className={styles.headerLastActivity}>Renews</div>
      </div>

      {rows.map((row) => {
        const band = getHealthBand(row.healthScore);
        const openTone = getOpenTone(row.openIssues);
        return (
          <Link
            key={row.id}
            href={`/accounts/${row.id}`}
            className={styles.row}
            data-health-band={band}
            style={{ "--health-percent": `${row.healthScore}%` } as RowStyle}
          >
            <div className={styles.nameCell}>
              <div className={styles.accountName}>{row.name}</div>
              {(row.owner || row.segment) && (
                <div className={styles.subline}>
                  {row.owner && <span>{row.owner}</span>}
                  {row.owner && row.segment && <span className={styles.bullet}>·</span>}
                  {row.segment && <span>{row.segment}</span>}
                </div>
              )}
            </div>
            <div className={styles.segmentCell}>{row.segment}</div>
            <div className={styles.mrrCell}>{row.mrr}</div>
            <div className={styles.healthCell}>
              <div className={styles.healthBar}>
                <div className={styles.healthBarFill}></div>
              </div>
              <div className={styles.healthMeta}>
                <span className={styles.healthScore}>{row.healthScore}</span>
                <span className={styles.healthDivider}>·</span>
                <span className={styles.healthLabel}>{band}</span>
              </div>
            </div>
            <div className={styles.openCell} data-tone={openTone}>{row.openIssues}</div>
            <div className={styles.lastActivityCell}>{row.lastActivity}</div>
          </Link>
        );
      })}

      <div className={styles.footer}>
        <span>showing {shown} of {totalCount} · press <kbd className={styles.kbd}>⌘K</kbd> to jump</span>
        <span className={styles.footerHint}>click a row to open detail →</span>
      </div>
    </div>
  );
}
