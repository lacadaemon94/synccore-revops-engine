import { NextResponse } from "next/server";
import { forceRetryQueueItem } from "../../../../lib/data/dead-letter-queue";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  const queueItemId =
    typeof payload === "object" && payload !== null && "queueItemId" in payload && typeof payload.queueItemId === "string"
      ? payload.queueItemId
      : null;

  if (!queueItemId) {
    return NextResponse.json(
      {
        ok: false,
        error: "queueItemId is required."
      },
      { status: 400 }
    );
  }

  try {
    const result = await forceRetryQueueItem(queueItemId);

    return NextResponse.json({
      ok: result.ok,
      queueItemId,
      result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Force retry failed.";
    const status = message === "Queue item not found." ? 404 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message,
        queueItemId
      },
      { status }
    );
  }
}
