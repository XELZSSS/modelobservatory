import { fetchRsc } from "../http";
import { upstreamConfig } from "../../shared/config";

const AA_BASE = upstreamConfig.artificialAnalysis;
const AA_RSC_HEADERS = { RSC: "1", "Next-Router-State-Tree": "%5B%5D" } as const;

export async function fetchAARsc(path: string): Promise<string> {
  return fetchRsc(`${AA_BASE}${path}`, { headers: AA_RSC_HEADERS });
}
