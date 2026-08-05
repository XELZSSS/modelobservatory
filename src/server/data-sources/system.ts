import { globalCache } from "../cache";
import { START_TTL_MS } from "../../shared/config";

const START_KEY = "metrics:start";
const START_TTL = START_TTL_MS;

let cloudflareRuntime = false;
const appStartTime = Date.now();

/**
 * Marks the runtime as Cloudflare Workers. Deliberately does NOT capture any
 * per-request data (city, lat/long, ASN, ...): the `/api/system-stats`
 * endpoint is public, and reflecting another visitor's geolocation back to
 * everyone would be a privacy leak.
 */
export function setCloudflareRuntime(onCloudflare: boolean) {
  cloudflareRuntime = onCloudflare;
}

export async function getSystemStats() {
  let startTime = await globalCache.get<number>(START_KEY);
  if (startTime === null) {
    startTime = appStartTime;
    await globalCache.set(START_KEY, startTime, START_TTL);
  }

  return {
    runtime: cloudflareRuntime ? ("cloudflare" as const) : ("standard" as const),
    cloudflare: null,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}
