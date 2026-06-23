'use client';

import { useState } from 'react';
import styles from './EventActions.module.css';

interface EventActionsProps {
  eventId: string;
  primaryLabel: string;
  payload: Record<string, unknown>;
  accountId: string;
  statusFilter?: string;
  sourceFilter?: string;
}

export function EventActions({
  eventId,
  primaryLabel,
  payload,
  statusFilter,
  sourceFilter,
}: EventActionsProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyPayload = async () => {
    try {
      const jsonString = JSON.stringify(payload, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (_error) {
      // Failed to copy, silently ignore
    }
  };

  const handlePrimaryAction = async () => {
    if (primaryLabel === 'Replay event') {
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (sourceFilter && sourceFilter !== 'all') params.set('source', sourceFilter);
        params.set('id', eventId);

        const response = await fetch('/api/events/retry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        });

        if (!response.ok) {
          throw new Error('Failed to retry event');
        }

        const href = `/events?${params.toString()}`;
        window.location.href = href;
      } catch (_error) {
        // Failed to replay, silently ignore
      }
    }
  };

  return (
    <>
      <button className={styles.primaryButton} onClick={handlePrimaryAction}>
        {primaryLabel}
      </button>
      <button
        className={styles.secondaryButton}
        onClick={handleCopyPayload}
        title={copying ? 'Copied!' : 'Copy payload'}
      >
        {copying ? 'Copied!' : 'Copy payload'}
      </button>
    </>
  );
}
