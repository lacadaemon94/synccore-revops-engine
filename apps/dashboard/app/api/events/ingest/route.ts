import { NextResponse } from "next/server";
import { env } from "../../../../lib/env";
import { runChurnDefuser } from "../../../../lib/data/churn-defuser";
import { ingestBillingEvent, canPersistBillingEvents } from "../../../../lib/data/ingest-events";
import { normalizeBillingEvent } from "../../../../lib/events/normalize-billing-event";
import { validateDemoBillingEventPayload } from "../../../../lib/events/validators";

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

  const validation = validateDemoBillingEventPayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid event payload.",
        issues: validation.issues
      },
      { status: 400 }
    );
  }

  const normalizedEvent = normalizeBillingEvent(validation.value);

  if (env.demoMode) {
    const churnDefuser = await runChurnDefuser({
      normalizedEvent,
      persistSideEffects: false
    });

    return NextResponse.json({
      ok: true,
      mode: "demo",
      persisted: false,
      message: "Event validated and normalized, but DEMO_MODE=true so no database write was attempted.",
      normalizedEvent,
      churnDefuser
    });
  }

  if (!canPersistBillingEvents()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase is not configured for ingestion. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or switch DEMO_MODE=true."
      },
      { status: 503 }
    );
  }

  try {
    const result = await ingestBillingEvent({
      normalizedEvent,
      payload: validation.value
    });
    const churnDefuser = await runChurnDefuser({
      normalizedEvent,
      linkedAccountId: result.linkedAccountId,
      eventLogId: result.eventLog.id,
      persistSideEffects: !result.duplicate
    });

    return NextResponse.json({
      ok: true,
      mode: "persistence",
      persisted: result.inserted,
      duplicate: result.duplicate,
      linkedAccountId: result.linkedAccountId,
      eventLogId: result.eventLog.id,
      providerEventId: result.eventLog.provider_event_id,
      status: result.eventLog.status,
      message: result.duplicate
        ? "Duplicate provider_event_id detected. Returning the existing event log row."
        : "Event stored successfully in event_log.",
      normalizedEvent,
      churnDefuser
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion failure.";

    return NextResponse.json(
      {
        ok: false,
        error: "Event ingestion failed.",
        details: message
      },
      { status: 500 }
    );
  }
}
