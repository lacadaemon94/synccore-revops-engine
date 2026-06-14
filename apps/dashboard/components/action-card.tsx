import Link from "next/link";
import { formatDateTime } from "../lib/format";
import type { OpsAction } from "../lib/types";
import { ActionStatusBadge } from "./action-status-badge";
import { SeverityBadge } from "./severity-badge";
import { SourceBadge } from "./source-badge";

export function ActionCard({ action }: { action: OpsAction }) {
  return (
    <article className="action-card">
      <div className="action-card__topline">
        <SourceBadge source={action.source} />
        <ActionStatusBadge status={action.status} />
      </div>
      <div className="action-card__header">
        <div className="cell-stack">
          <p className="action-card__title">{action.title}</p>
          <Link className="text-link" href={`/accounts/${action.accountId}`}>
            {action.accountName}
          </Link>
        </div>
        <SeverityBadge severity={action.severity} />
      </div>
      <p className="action-card__body">{action.body ?? action.description}</p>
      <div className="action-card__grid">
        <div className="detail-pair">
          <span className="detail-pair__label">Owner</span>
          <span className="detail-pair__value detail-pair__value--strong">{action.recommendedOwner}</span>
        </div>
        <div className="detail-pair">
          <span className="detail-pair__label">Created</span>
          <span className="detail-pair__value">{formatDateTime(action.createdAt)}</span>
        </div>
        <div className="detail-pair detail-pair--wide">
          <span className="detail-pair__label">Suggested next step</span>
          <span className="detail-pair__value detail-pair__value--priority">{action.suggestedNextStep}</span>
        </div>
      </div>
    </article>
  );
}
