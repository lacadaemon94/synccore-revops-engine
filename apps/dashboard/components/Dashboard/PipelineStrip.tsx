import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { PipelineStripProps } from './local';
import styles from './PipelineStrip.module.css';

type BarStyle = CSSProperties & Record<'--bar-opacity', string>;

/**
 * PipelineStrip
 * Displays the 5-stage data pipeline visualization.
 * Each stage is clickable and links to relevant section (Events, Reconciler, Actions, Queue).
 *
 * Server component that renders static pipeline data.
 */
export function PipelineStrip({ stages }: PipelineStripProps) {
  return (
    <section className={styles.section} data-tour-id="overview-pipeline">
      <header className={styles.header}>
        <h2 className={styles.title}>Today&apos;s pipeline</h2>
        <span className={styles.subtitle}>
          since 00:00 UTC · click any stage to drill
        </span>
      </header>

      <div className={styles.stagesGrid}>
        {stages.map((stage, index) => (
          <div key={stage.id} className={styles.stageRow}>
            {index > 0 && <div className={styles.arrow}>→</div>}

            <Link href={stage.href} className={styles.stageCard}>
              <div className={styles.stageLabel}>{stage.title}</div>

              <div className={styles.stageCount}>
                {stage.count}
                {stage.subtitle && (
                  <span className={styles.subtitle}>{stage.subtitle}</span>
                )}
              </div>

              <div className={styles.stageDetails}>
                {stage.sources ? stage.sources.join(' · ') : stage.details}
              </div>

              <div className={styles.progressBar}>
                {stage.bars.map((bar, barIndex) => {
                  const opacity = bar.opacity > 0.05 ? bar.opacity : 0.1;
                  const segStyle: BarStyle = { '--bar-opacity': `${opacity}` };
                  return (
                    <div
                      key={barIndex}
                      className={styles.progressSegment}
                      style={segStyle}
                      data-color={stage.borderColor}
                    />
                  );
                })}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
