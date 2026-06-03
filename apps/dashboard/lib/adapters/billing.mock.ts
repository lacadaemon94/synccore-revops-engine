import { events } from "../demo-data";

export async function listMockBillingEvents() {
  return events;
}

export async function getMockBillingEvent(providerEventId: string) {
  return events.find((event) => event.providerEventId === providerEventId) ?? null;
}
