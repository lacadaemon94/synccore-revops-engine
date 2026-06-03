"use server";

import { queueItems } from "../lib/demo-data";

export async function forceRetry(queueItemId: string) {
  const queueItem = queueItems.find((item) => item.id === queueItemId);

  if (!queueItem) {
    return {
      ok: false,
      message: "Queue item not found."
    };
  }

  return {
    ok: true,
    message: `Mock retry requested for ${queueItem.accountName}.`,
    queueItemId,
    requestedAt: new Date().toISOString()
  };
}
