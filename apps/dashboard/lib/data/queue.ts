import type { QueueItem } from "../types";
import { getDeadLetterQueueItems } from "./dead-letter-queue";

export async function getQueueItems(): Promise<QueueItem[]> {
  return getDeadLetterQueueItems();
}
