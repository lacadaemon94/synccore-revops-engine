import type { QueueItem, RetryFailureClass } from "../types";

const retryDelayMinutes = [15, 30, 60] as const;

type RetryFailureInput =
  | Error
  | {
      code?: number | string;
      message?: string;
      status?: number | string;
    }
  | number
  | string
  | unknown;

export type RetryFailureClassification = {
  category: RetryFailureClass;
  retryable: boolean;
  message: string;
};

function extractFailureMessage(error: RetryFailureInput) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "number") {
    return String(error);
  }

  if (typeof error === "object" && error !== null) {
    const message = "message" in error ? error.message : undefined;
    const code = "code" in error ? error.code : undefined;
    const status = "status" in error ? error.status : undefined;

    return [message, code, status].filter((value) => typeof value === "string" || typeof value === "number").join(" ");
  }

  return "Unknown retry failure";
}

function extractStatusCode(error: RetryFailureInput) {
  if (typeof error === "number") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = "status" in error ? error.status : "code" in error ? error.code : undefined;

    if (typeof candidate === "number") {
      return candidate;
    }

    if (typeof candidate === "string") {
      const parsed = Number(candidate);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function formatScheduleDate(value: null | string) {
  if (!value) {
    return "manual review";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function classifyRetryFailure(error: RetryFailureInput): RetryFailureClassification {
  const message = extractFailureMessage(error).toLowerCase();
  const statusCode = extractStatusCode(error);

  if (statusCode === 401 || statusCode === 403 || /(unauthorized|forbidden|auth|credential|token)/.test(message)) {
    return {
      category: "authentication",
      retryable: false,
      message: "Authentication or permission failure."
    };
  }

  if (statusCode === 408 || /(timed out|timeout|gateway timeout)/.test(message)) {
    return {
      category: "timeout",
      retryable: true,
      message: "Transient timeout while calling a downstream system."
    };
  }

  if (statusCode === 429 || /(rate limit|too many requests)/.test(message)) {
    return {
      category: "rate_limit",
      retryable: true,
      message: "Downstream system asked SyncCore to back off and retry."
    };
  }

  if (
    statusCode === 409 ||
    statusCode === 423 ||
    statusCode === 425 ||
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504 ||
    /(service unavailable|temporar|unavailable|overloaded|connection reset|downstream failure|503|502|500)/.test(message)
  ) {
    return {
      category: "availability",
      retryable: true,
      message: "Downstream availability issue that should be retried."
    };
  }

  if (statusCode === 400 || statusCode === 404 || statusCode === 422 || /(schema|payload|validation|invalid|malformed|not found)/.test(message)) {
    return {
      category: "validation",
      retryable: false,
      message: "Non-retryable payload or contract validation problem."
    };
  }

  return {
    category: "unknown",
    retryable: true,
    message: "Unknown downstream failure treated as retryable for the demo."
  };
}

export function shouldSendToDeadLetterQueue(errorOrStatus: RetryFailureInput) {
  if (typeof errorOrStatus === "string") {
    const normalized = errorOrStatus.toLowerCase();

    if (["routed_to_dlq", "retryable", "retrying", "pending", "failed", "escalated"].includes(normalized)) {
      return true;
    }
  }

  return classifyRetryFailure(errorOrStatus).retryable;
}

export function calculateNextRetryAt(retryCount: number) {
  const offsetMinutes = retryDelayMinutes[Math.min(Math.max(retryCount, 1), retryDelayMinutes.length) - 1];
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

export function shouldEscalate(retryCount: number, maxRetries: number) {
  return retryCount >= maxRetries;
}

export function buildRetrySummary(queueItem: Pick<QueueItem, "maxRetries" | "nextRetryAt" | "retryCount" | "status">) {
  if (queueItem.status === "resolved") {
    return `Recovered after ${queueItem.retryCount} attempt${queueItem.retryCount === 1 ? "" : "s"}.`;
  }

  if (queueItem.status === "escalated" || shouldEscalate(queueItem.retryCount, queueItem.maxRetries)) {
    return `Max retries reached at ${queueItem.retryCount} of ${queueItem.maxRetries}. Escalate to an operator.`;
  }

  return `Retry ${queueItem.retryCount} of ${queueItem.maxRetries} is scheduled for ${formatScheduleDate(queueItem.nextRetryAt)}.`;
}
