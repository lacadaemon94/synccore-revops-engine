export const supportedBillingEventTypes = [
  "customer.subscription.updated",
  "invoice.payment_failed",
  "invoice.paid",
  "customer.subscription.deleted"
] as const;

export type SupportedBillingEventType = (typeof supportedBillingEventTypes)[number];

export type DemoBillingEventPayload = {
  id: string;
  type: SupportedBillingEventType;
  livemode?: boolean;
  created?: number;
  data: {
    object: Record<string, unknown>;
  };
};

type ValidationResult =
  | { ok: true; value: DemoBillingEventPayload }
  | { ok: false; issues: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSupportedBillingEventType(value: string): value is SupportedBillingEventType {
  return supportedBillingEventTypes.includes(value as SupportedBillingEventType);
}

export function validateDemoBillingEventPayload(payload: unknown): ValidationResult {
  const issues: string[] = [];

  if (!isRecord(payload)) {
    return {
      ok: false,
      issues: ["Request body must be a JSON object."]
    };
  }

  if (typeof payload.id !== "string" || !payload.id.length) {
    issues.push("Event id is required.");
  }

  if (typeof payload.type !== "string" || !isSupportedBillingEventType(payload.type)) {
    issues.push(`Event type must be one of: ${supportedBillingEventTypes.join(", ")}.`);
  }

  if ("created" in payload && typeof payload.created !== "number") {
    issues.push("Event created must be a Unix timestamp number when provided.");
  }

  if (!isRecord(payload.data)) {
    issues.push("Event data must be an object.");
  } else if (!isRecord(payload.data.object)) {
    issues.push("Event data.object must be an object.");
  }

  if (issues.length) {
    return {
      ok: false,
      issues
    };
  }

  return {
    ok: true,
    value: payload as DemoBillingEventPayload
  };
}
