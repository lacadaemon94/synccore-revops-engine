"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { forceRetry, type ForceRetryActionResult } from "../actions/force-retry";
import { formatDateTime, titleCase } from "../lib/format";
import type { QueueItem } from "../lib/types";
import { Badge } from "./badge";
import { StatusBadge } from "./status-badge";

function renderDate(value: null | string, fallback: string) {
  return value ? formatDateTime(value) : fallback;
}

export function QueueRetryCard({ item }: { item: QueueItem }) {
  const [currentItem, setCurrentItem] = useState(item);
  const [result, setResult] = useState<ForceRetryActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="queue-card">
      <div className="queue-card__header">
        <div className="cell-stack">
          <p className="queue-card__title">{currentItem.accountName}</p>
          <p className="cell-subtle">{currentItem.targetSystem}</p>
        </div>
        <StatusBadge status={currentItem.status} />
      </div>
      <div className="badge-row queue-card__badges">
        {currentItem.failureClass ? <Badge tone="info">{titleCase(currentItem.failureClass)}</Badge> : null}
        {currentItem.escalationRecommended ? <Badge tone="danger">Escalation recommended</Badge> : <Badge tone="warning">Auto retry active</Badge>}
      </div>
      <div className="queue-card__grid">
        <div className="detail-pair">
          <span className="detail-pair__label">Retry count</span>
          <span className="detail-pair__value">
            {currentItem.retryCount} / {currentItem.maxRetries}
          </span>
        </div>
        <div className="detail-pair">
          <span className="detail-pair__label">Next retry</span>
          <span className="detail-pair__value">{renderDate(currentItem.nextRetryAt, "Manual review only")}</span>
        </div>
        <div className="detail-pair">
          <span className="detail-pair__label">Last attempt</span>
          <span className="detail-pair__value">{renderDate(currentItem.lastAttemptAt ?? null, "Not attempted yet")}</span>
        </div>
        <div className="detail-pair">
          <span className="detail-pair__label">Resolved at</span>
          <span className="detail-pair__value">{renderDate(currentItem.resolvedAt ?? null, "Still active")}</span>
        </div>
        <div className="detail-pair detail-pair--wide">
          <span className="detail-pair__label">Retry summary</span>
          <span className="detail-pair__value">{currentItem.retrySummary}</span>
        </div>
        <div className="detail-pair detail-pair--wide">
          <span className="detail-pair__label">Last error</span>
          <span className="detail-pair__value detail-pair__value--muted">{currentItem.lastError}</span>
        </div>
      </div>
      {result ? (
        <div className={`queue-action-feedback ${result.ok ? "queue-action-feedback--success" : "queue-action-feedback--warning"}`}>
          <p className="queue-action-feedback__title">{result.ok ? "Force retry completed" : "Force retry needs follow-up"}</p>
          <p className="queue-action-feedback__body">{result.message}</p>
        </div>
      ) : null}
      <div className="queue-card__footer">
        <p className="cell-subtle">
          {currentItem.status === "resolved"
            ? "This item already recovered, but the action can still be replayed for demo validation."
            : "Manual replay stays inside the demo retry engine. No external APIs are called."}
        </p>
        <button
          className="button button--primary"
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const actionResult = await forceRetry(currentItem.id);
              setResult(actionResult);
              if ("queueItem" in actionResult) {
                setCurrentItem(actionResult.queueItem);
              }
              router.refresh();
            });
          }}
        >
          {isPending ? "Retrying..." : "Force Retry"}
        </button>
      </div>
    </div>
  );
}
