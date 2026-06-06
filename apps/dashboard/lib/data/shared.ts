import { unstable_noStore as noStore } from "next/cache";
import { env } from "../env";
import { createSupabaseServerClient } from "../supabase";

export function shouldUseDemoData() {
  return env.demoMode || !createSupabaseServerClient();
}

export async function withDataFallback<T>(
  demoLoader: () => T | Promise<T>,
  liveLoader: (client: NonNullable<ReturnType<typeof createSupabaseServerClient>>) => Promise<T>
) {
  noStore();

  const client = createSupabaseServerClient();

  if (env.demoMode || !client) {
    return await demoLoader();
  }

  try {
    return await liveLoader(client);
  } catch (error) {
    console.error("Falling back to demo data after Supabase read failure.", error);
    return await demoLoader();
  }
}

export function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function addDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readJsonNumber(record: unknown, key: string) {
  if (!isRecord(record)) {
    return undefined;
  }

  const value = record[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function readJsonString(record: unknown, key: string) {
  if (!isRecord(record)) {
    return undefined;
  }

  const value = record[key];

  return typeof value === "string" && value.length ? value : undefined;
}
