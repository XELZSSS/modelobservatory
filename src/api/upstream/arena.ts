import { withCache } from "../cache";
import { fetchText, CACHE_TTL_MS } from "../http";
import { parseRscScriptArray } from "../parsers/rsc";
import type { ArenaModel } from "../../shared/types";

const BASE = "https://arena.ai/leaderboard";

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
    rank: e.rank, rankUpper: e.rankUpper ?? null, rankLower: e.rankLower ?? null,
    model: e.modelDisplayName, modelKey: e.modelKey ?? null,
    vendor: e.modelOrganization ?? null, license: e.license ?? null,
    score: e.score ?? e.rating ?? null, ci: e.ci ?? null, votes: e.votes ?? null,
    rating: e.rating ?? null, ratingUpper: e.ratingUpper ?? null, ratingLower: e.ratingLower ?? null,
    modelOrganization: e.modelOrganization ?? null, modelUrl: e.modelUrl ?? null,
    pricePerImage: e.pricePerImage ?? null, pricePerSecond: e.pricePerSecond ?? null,
    releaseType: e.releaseType ?? null,
  };
}

export async function getLeaderboard(category: string): Promise<{ category: string; fetched_at: unknown; models: ArenaModel[] }> {
  return withCache(`arena-leaderboard:${category}`, CACHE_TTL_MS, async () => {
    const html = await fetchText(`${BASE}/${encodeURIComponent(category)}`);
    const raw = parseRscScriptArray<RawEntry>(html, "entries");
    const models = raw.map(mapEntry).filter((m): m is ArenaModel => m !== null);
    if (models.length === 0) {
      const head = html.slice(0, 200).replace(/\s+/g, " ").trim();
      throw new Error(
        `Arena RSC parsing failed for category "${category}". ` +
          `html length=${html.length}, hasEntriesMarker=${html.includes('"entries"')}, head="${head}"`,
      );
    }
    return { category, fetched_at: new Date().toISOString(), models };
  });
}
