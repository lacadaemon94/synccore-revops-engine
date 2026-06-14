"use server";

import type { ForceRetryQueueItemResult } from "../lib/data/dead-letter-queue";
import { forceRetryQueueItem } from "../lib/data/dead-letter-queue";

export type ForceRetryActionResult =
  | ForceRetryQueueItemResult
  | {
      ok: false;
      message: string;
      queueItemId: string;
      simulated: boolean;
    };

export async function forceRetry(queueItemId: string): Promise<ForceRetryActionResult> {
  try {
    return await forceRetryQueueItem(queueItemId);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Force retry failed.",
      queueItemId,
      simulated: true
    };
  }
}
