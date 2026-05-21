import { globalCache } from "../cache";
import type { CloudflareInfo } from "../../shared/types";
import { START_TTL_MS } from "../../shared/config/cache";

const START_KEY = "metrics:start";
const START_TTL = START_TTL_MS;

let cachedCf: CloudflareInfo | null = null;
const appStartTime = Date.now();

export function setCloudflareInfo(cf: Record<string, unknown> | null | undefined) {
  if (!cf) return;
  cachedCf = {
    colo: (cf.colo as string) ?? "",
    city: (cf.city as string | null) ?? null,
    country: (cf.country as string | null) ?? null,
    continent: (cf.continent as string | null) ?? null,
    latitude: (cf.latitude as string | null) ?? null,
    longitude: (cf.longitude as string | null) ?? null,
    postalCode: (cf.postalCode as string | null) ?? null,
    timezone: (cf.timezone as string | null) ?? null,
    isEUCountry: (cf.isEUCountry as string | null) ?? null,
    httpProtocol: (cf.httpProtocol as string | null) ?? null,
    tlsVersion: (cf.tlsVersion as string | null) ?? null,
    tlsCipher: (cf.tlsCipher as string | null) ?? null,
    asOrganization: (cf.asOrganization as string | null) ?? null,
    asn: typeof cf.asn === "number" ? cf.asn : cf.asn != null ? Number(cf.asn) : null,
  };
}

export async function getSystemStats() {
  let startTime = await globalCache.get<number>(START_KEY);
  if (startTime === null) {
    startTime = appStartTime;
    globalCache.set(START_KEY, startTime, START_TTL);
  }

  return {
    runtime: cachedCf ? ("cloudflare" as const) : ("standard" as const),
    cloudflare: cachedCf,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}
