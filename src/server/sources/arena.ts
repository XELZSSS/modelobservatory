import { upstreamConfig, DEFAULT_TTL_MS } from "../../shared/config";
import { ValidationError } from "../core/errors";
import { parseRscScriptArray } from "../parser/rsc";
import type { ArenaModel, ArenaPayload } from "../../shared/types";
import { createSource } from "./types";
import type { AppContext } from "../context";

const BASE = upstreamConfig.arena;
const ALLOWED_CATEGORIES = new Set(["text", "text-to-image", "image-editing", "video", "audio"]);

interface RawEntry {
  rank: number;
  rankUpper?: number;
  rankLower?: number;
  modelKey?: string;
  modelDisplayName?: string;
  score?: number;
  ci?: number;
  rating?: number;
  ratingUpper?: number;
  ratingLower?: number;
  votes?: number;
  modelOrganization?: string;
  modelUrl?: string;
  license?: string;
  pricePerImage?: number;
  pricePerSecond?: number;
  releaseType?: string;
}

function mapEntry(e: RawEntry): ArenaModel | null {
  if (e.rank == null || !e.modelDisplayName) return null;
  return {
    rank: e.rank,
    rankUpper: e.rankUpper ?? null,
    rankLower: e.rankLower ?? null,
    model: e.modelDisplayName,
    modelKey: e.modelKey ?? null,
    vendor: e.modelOrganization ?? null,
    license: e.license ?? null,
    score: e.score ?? e.rating ?? null,
    ci: e.ci ?? null,
    votes: e.votes ?? null,
    rating: e.rating ?? null,
    ratingUpper: e.ratingUpper ?? null,
    ratingLower: e.ratingLower ?? null,
    modelUrl: e.modelUrl ?? null,
    pricePerImage: e.pricePerImage ?? null,
    pricePerSecond: e.pricePerSecond ?? null,
    releaseType: e.releaseType ?? null,
  };
}

export const getArenaLeaderboard = createSource<{ category: string }, ArenaPayload>({
  cacheKey: (p) => `arena-leaderboard:${p.category}`,
  defaultTtl: DEFAULT_TTL_MS,
  fetch: async (ctx: AppContext, params) => {
    const { category } = params;
    if (!ALLOWED_CATEGORIES.has(category)) {
      throw new ValidationError(`Invalid arena category "${category}". Valid: ${Array.from(ALLOWED_CATEGORIES).join(", ")}`);
    }
    const html = await ctx.http.text(`${BASE}/${encodeURIComponent(category)}`);
    const raw = parseRscScriptArray<RawEntry>(html, "entries");
    const models = raw.map(mapEntry).filter((m): m is ArenaModel => m !== null);
    if (models.length === 0) {
      const head = html.slice(0, 200).replace(/\s+/g, " ").trim();
      throw new Error(`Arena RSC parsing failed for category "${category}". html length=${html.length}, hasEntriesMarker=${html.includes('"entries"')}, head="${head}"`);
    }
    return { data: { category, fetched_at: new Date().toISOString(), models } };
  },
});