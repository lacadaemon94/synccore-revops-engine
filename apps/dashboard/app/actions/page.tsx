import { ActionsList } from '@/components/Actions/ActionsList';
import { ActionsSeverityTabs } from '@/components/Actions/ActionsSeverityTabs';
import { ActionDetailHost } from './ActionDetailHost';
import {
  actionSummaries,
  actionDetails,
  actionAssignees,
} from '@/lib/fixtures/actions';
import type { ActionDetail, ActionSeverity } from '@/components/Actions/local';

import styles from './page.module.css';

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const selectedId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const severityParam = typeof params.severity === 'string' ? params.severity : params.severity?.[0];

  const filteredSummaries =
    severityParam && severityParam !== 'all'
      ? actionSummaries.filter((a) => a.severity === severityParam)
      : actionSummaries;

  const firstId = filteredSummaries[0]?.id;
  const resolvedId = selectedId && actionDetails[selectedId] ? selectedId : firstId;

  const summary = resolvedId ? actionSummaries.find((s) => s.id === resolvedId) : null;
  const detail = resolvedId ? actionDetails[resolvedId] : null;
  const mergedAction: ActionDetail | null = summary && detail ? { ...summary, ...detail } : null;

  const totalOpen = actionSummaries.length;
  const criticalCount = actionSummaries.filter((a) => a.severity === 'critical').length;

  const counts: Record<ActionSeverity | 'all' | 'resolved', number> = {
    all: actionSummaries.length,
    critical: criticalCount,
    high: actionSummaries.filter((a) => a.severity === 'high').length,
    medium: actionSummaries.filter((a) => a.severity === 'medium').length,
    low: actionSummaries.filter((a) => a.severity === 'low').length,
    resolved: actionSummaries.filter((a) => a.status === 'resolved').length,
  };

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'critical', label: 'Critical', count: counts.critical, tone: 'critical' as const },
    { key: 'medium', label: 'Medium', count: counts.medium, tone: 'warn' as const },
    { key: 'low', label: 'Low', count: counts.low },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Actions</h1>
          <p className={styles.subtitle}>
            <span className={styles.count}>{totalOpen} open</span>
            {' · '}
            <span className={styles.critical}>{criticalCount} critical</span>
            {' · $248k exposure · ranked by exposure × age'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.headerButton} aria-disabled="true">
            Assignee: anyone <span className={styles.caret}>▾</span>
          </button>
          <button type="button" className={styles.headerButton} aria-disabled="true">
            Export
          </button>
        </div>
      </header>

      <ActionsSeverityTabs tabs={tabs} />

      <div className={styles.container}>
        <div className={styles.listPanel}>
          <ActionsList actions={filteredSummaries} />
        </div>

        <div className={styles.detailPanel}>
          <ActionDetailHost action={mergedAction} assigneeOptions={actionAssignees} />
        </div>
      </div>
    </div>
  );
}
