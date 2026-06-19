import { withCache } from "../cache";
import { DEFAULT_TTL_MS } from "../../shared/config";
import { fetchAndParseRsc, dfsCollect } from "../parsers/rsc";
import { num } from "../parsers/coerce";
import { deduplicateBy } from "../utils";
import type { TtsModel } from "../../shared/types";

export async function getTtsLeaderboard(): Promise<TtsModel[]> {
  return withCache("tts-leaderboard", DEFAULT_TTL_MS, async () => {
    const entries = await fetchAndParseRsc<TtsModel>("/text-to-speech/models", "pricePer1mCharacters", (tree) =>
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
    return deduplicateBy(entries, (e) => e.id)
      .sort((a, b) => (b.quality_elo ?? 0) - (a.quality_elo ?? 0));
  });
}
