export type QueueStatus = 'pending' | 'retrying' | 'escalated' | 'resolved';
type FailureClass = 'availability' | 'timeout' | 'authentication' | 'validation' | 'rate_limit' | 'unknown';

export interface QueueEntry {
  id: string;
  account: string;
  target: string;
  status: QueueStatus;
  failureClass: FailureClass;
  retryCount: number;
  maxRetries: number;
  lastError: string;
  etaSec: number;
  resolvedAt?: string;
}
