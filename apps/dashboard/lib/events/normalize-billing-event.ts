import type { EventStatus } from "../types";
import type { DemoBillingEventPayload, SupportedBillingEventType } from "./validators";

export type NormalizedBillingEvent = {
  accountDomain: null | string;
  amount: null | number;
  crmCompanyId: null | string;
  currency: null | string;
  customerId: null | string;
  provider: "stripe-demo";
  providerEventId: string;
  receivedAt: string;
  status: EventStatus;
  subscriptionId: null | string;
  type: SupportedBillingEventType;
  usageDensity: null | number;
};

type BillingEventObject = Record<string, unknown> & {
  customer?: unknown;
  currency?: unknown;
  id?: unknown;
  metadata?: unknown;
  status?: unknown;
  subscription?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.length ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeCurrencyAmount(value: unknown) {
  const amount = readNumber(value);

  if (amount === null) {
    return null;
  }

  return amount / 100;
}

function normalizeDomain(value: null | string) {
  return value ? value.trim().toLowerCase() : null;
}

function readMetadata(object: BillingEventObject) {
  return isRecord(object.metadata) ? object.metadata : {};
}

function deriveAmount(type: SupportedBillingEventType, object: BillingEventObject) {
  if (type === "invoice.payment_failed") {
    return normalizeCurrencyAmount(object.amount_due);
  }

  if (type === "invoice.paid") {
    return normalizeCurrencyAmount(object.amount_paid ?? object.amount_due);
  }

  if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const items = isRecord(object.items) ? object.items : null;
    const itemList = Array.isArray(items?.data) ? items?.data : [];
    const firstItem = itemList[0];
    const price = isRecord(firstItem) && isRecord(firstItem.price) ? firstItem.price : null;

    return normalizeCurrencyAmount(price?.unit_amount);
  }

  return null;
}

function deriveSubscriptionId(type: SupportedBillingEventType, object: BillingEventObject) {
  if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    return readString(object.id);
  }

  return readString(object.subscription);
}

function deriveStatus(type: SupportedBillingEventType, object: BillingEventObject): EventStatus {
  if (type === "invoice.payment_failed") {
    return "failed";
  }

  if (type === "invoice.paid") {
    return "processed";
  }

  if (type === "customer.subscription.deleted") {
    return "processed";
  }

  if (type === "customer.subscription.updated") {
    return "processed";
  }

  if (readString(object.status) === "past_due") {
    return "failed";
  }

  return "received";
}

export function normalizeBillingEvent(payload: DemoBillingEventPayload): NormalizedBillingEvent {
  const object = payload.data.object as BillingEventObject;
  const metadata = readMetadata(object);

  return {
    accountDomain: normalizeDomain(readString(metadata.account_domain)),
    amount: deriveAmount(payload.type, object),
    crmCompanyId: readString(metadata.crm_company_id),
    currency: readString(object.currency) ?? "usd",
    customerId: readString(object.customer),
    provider: "stripe-demo",
    providerEventId: payload.id,
    receivedAt: typeof payload.created === "number" ? new Date(payload.created * 1000).toISOString() : new Date().toISOString(),
    status: deriveStatus(payload.type, object),
    subscriptionId: deriveSubscriptionId(payload.type, object),
    type: payload.type,
    usageDensity: readNumber(metadata.usage_density)
  };
}
