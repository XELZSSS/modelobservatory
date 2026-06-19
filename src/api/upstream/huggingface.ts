import { fetchJSON } from "../http";
import { withCache } from "../cache";
import { getOpenLicense } from "../parsers/license";
import { upstreamConfig, DEFAULT_TTL_MS } from "../../shared/config";
import type { OpenSourceModelEntry } from "../../shared/types";

interface HFModel {
  id?: string;
  author?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string | null;
  createdAt?: string | null;
  lastModified?: string | null;
  tags?: string[];
}

function mapModel(m: HFModel): OpenSourceModelEntry {
  const id = m.id || "";
  return {
    id,
    author: m.author || id.split("/")[0] || "unknown",
    downloads: m.downloads ?? 0,
    likes: m.likes ?? 0,
    license: getOpenLicense(m.tags ?? []) ?? "unknown",
    task: m.pipeline_tag || null,
    createdAt: m.createdAt || null,
    lastModified: m.lastModified || null,
    tags: m.tags ?? [],
  };
}

const HF_API = upstreamConfig.huggingface;
const ALLOWED_SORT = new Set(["trendingScore", "downloads", "likes", "createdAt", "lastModified"]);
const ALLOWED_DIR = new Set(["-1", "1"]);

export async function getModels(sort: string, direction: string, limit: number): Promise<OpenSourceModelEntry[]> {
  const safeSort = ALLOWED_SORT.has(sort) ? sort : "trendingScore";
  const safeDir = ALLOWED_DIR.has(direction) ? direction : "-1";
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 50, 1), 500);
  return withCache(`opensource-models:${safeSort}:${safeDir}:${safeLimit}`, DEFAULT_TTL_MS, async () => {
    const items = await fetchJSON<HFModel[]>(`${HF_API}?sort=${safeSort}&direction=${safeDir}&limit=${safeLimit}&full=true`);
    if (!Array.isArray(items)) throw new Error(`HuggingFace API returned non-array response (got ${items === null ? "null" : typeof items})`);
    return items.map(mapModel).filter((m) => m.downloads > 0);
  });
}

export async function getReleases(): Promise<OpenSourceModelEntry[]> {
  return withCache("opensource-releases", DEFAULT_TTL_MS, async () => {
    const items = await fetchJSON<HFModel[]>(`${HF_API}?sort=createdAt&direction=-1&limit=500&full=true`);
    return items
      .filter((m) => Array.isArray(m.tags) && getOpenLicense(m.tags) !== null && typeof m.createdAt === "string" && m.createdAt.length > 0)
      .map((m) => {
        const entry = mapModel(m);
        if (!m.createdAt) throw new Error(`HF model createdAt is required for ${m.id}`);
        return entry;
      })
      .sort((a, b) => {
        const da = Date.parse(a.createdAt!);
        const db = Date.parse(b.createdAt!);
        if (Number.isNaN(da) && Number.isNaN(db)) return 0;
        if (Number.isNaN(da)) return 1;
        if (Number.isNaN(db)) return -1;
        return db - da;
      });
  });
}
