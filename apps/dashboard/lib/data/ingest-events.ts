import { createSupabaseServerClient, isSupabaseConfigured } from "../supabase";
import type { EventLogRow } from "./mappers";
import type { NormalizedBillingEvent } from "../events/normalize-billing-event";

type AccountLookupRow = {
  id: string;
  name: string;
  normalized_domain: null | string;
  stripe_customer_id: null | string;
};

export type IngestBillingEventResult =
  | {
      duplicate: true;
      eventLog: EventLogRow;
      inserted: false;
      linkedAccountId: null | string;
    }
  | {
      duplicate: false;
      eventLog: EventLogRow;
      inserted: true;
      linkedAccountId: null | string;
    };

async function findExistingEvent(client: NonNullable<ReturnType<typeof createSupabaseServerClient>>, providerEventId: string) {
  const { data, error } = await client
    .from("event_log")
    .select("id,provider_event_id,provider,event_type,account_id,status,payload_json,normalized_json,received_at,retry_count,error_message")
    .eq("provider_event_id", providerEventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as EventLogRow | null;
}

async function findLinkedAccountId(
  client: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  normalizedEvent: NormalizedBillingEvent
) {
  if (normalizedEvent.customerId) {
    const { data, error } = await client
      .from("accounts")
      .select("id,name,normalized_domain,stripe_customer_id")
      .eq("stripe_customer_id", normalizedEvent.customerId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return (data as AccountLookupRow).id;
    }
  }

  if (normalizedEvent.accountDomain) {
    const { data, error } = await client
      .from("accounts")
      .select("id,name,normalized_domain,stripe_customer_id")
      .eq("normalized_domain", normalizedEvent.accountDomain)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return (data as AccountLookupRow).id;
    }
  }

  return null;
}

export function canPersistBillingEvents() {
  return isSupabaseConfigured();
}

export async function ingestBillingEvent({
  normalizedEvent,
  payload
}: {
  normalizedEvent: NormalizedBillingEvent;
  payload: unknown;
}): Promise<IngestBillingEventResult> {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase is not configured for event ingestion.");
  }

  const existingEvent = await findExistingEvent(client, normalizedEvent.providerEventId);

  if (existingEvent) {
    return {
      duplicate: true,
      eventLog: existingEvent,
      inserted: false,
      linkedAccountId: existingEvent.account_id ?? null
    };
  }

  const linkedAccountId = await findLinkedAccountId(client, normalizedEvent);

  const { data, error } = await client
    .from("event_log")
    .insert({
      provider_event_id: normalizedEvent.providerEventId,
      provider: normalizedEvent.provider,
      event_type: normalizedEvent.type,
      account_id: linkedAccountId,
      status: normalizedEvent.status,
      payload_json: payload,
      normalized_json: {
        account_domain: normalizedEvent.accountDomain,
        amount: normalizedEvent.amount,
        crm_company_id: normalizedEvent.crmCompanyId,
        currency: normalizedEvent.currency,
        customer_id: normalizedEvent.customerId,
        failure_reason: normalizedEvent.failureReason,
        payment_attempt_count: normalizedEvent.paymentAttemptCount,
        subscription_id: normalizedEvent.subscriptionId,
        usage_density: normalizedEvent.usageDensity
      },
      received_at: normalizedEvent.receivedAt,
      retry_count: 0,
      error_message: normalizedEvent.status === "failed" ? "Captured at ingest for later recovery workflow handling." : null
    })
    .select("id,provider_event_id,provider,event_type,account_id,status,payload_json,normalized_json,received_at,retry_count,error_message")
    .single();

  if (error) {
    throw error;
  }

  return {
    duplicate: false,
    eventLog: data as EventLogRow,
    inserted: true,
    linkedAccountId
  };
}
