import { fetchRsc, CACHE_TTL_MS } from "../http";
import { withCache } from "../cache";
import { parseRscPayload, dfsCollect, rscParseError } from "../parsers/rsc";
import { num } from "../parsers/coerce";
import { upstreamConfig } from "../../shared/config";
import type { TtsModel } from "../../shared/types";

function extractTts(body: string): TtsModel[] {
  const entries = parseRscPayload<TtsModel>(body, "pricePer1mCharacters", (tree) =>
    dfsCollect(tree, (node) => {
      if (typeof node !== "object" || !node || Array.isArray(node)) return null;
      const obj = node as Record<string, unknown>;
      const price = num(obj.pricePer1mCharacters);
      const model = obj.model as Record<string, unknown> | undefined;
      if (!model || typeof model !== "object" || price === null) return null;
      const qualityElo = num(model.qualityElo);
      const name = typeof model.name === "string" ? model.name : "";
      if (qualityElo === null || !name) return null;
      const creator = model.creator as Record<string, unknown> | undefined;
      const host = obj.host as Record<string, unknown> | undefined;
      const perf = obj.performance as Record<string, unknown> | undefined;
      return {
        id: typeof model.id === "string" ? model.id : name,
        name,
        provider: (typeof creator?.name === "string" ? creator.name : null) ?? (typeof host?.name === "string" ? host.name : null),
        quality_elo: qualityElo,
        speed_chars_per_sec: num(perf?.medianCharactersPerSecond),
        price_per_1m_chars: price,
      };
    }),
  );

  const seen = new Set<string>();
  return entries.filter((e) => seen.has(e.id) ? false : (seen.add(e.id), true))
    .sort((a, b) => (b.quality_elo ?? 0) - (a.quality_elo ?? 0));
}

export async function getTtsLeaderboard(): Promise<TtsModel[]> {
  return withCache("tts-leaderboard", CACHE_TTL_MS, async () => {
    const rsc = await fetchRsc(`${upstreamConfig.artificialAnalysis}/text-to-speech/models`, { headers: { RSC: "1", "Next-Router-State-Tree": "%5B%5D" } });
    let entries: TtsModel[];
    try {
      entries = extractTts(rsc);
    } catch (e) {
      throw new Error(rscParseError("pricePer1mCharacters", rsc, e), { cause: e });
    }
    if (entries.length === 0) throw new Error(rscParseError("pricePer1mCharacters", rsc));
    return entries;
  });
}
