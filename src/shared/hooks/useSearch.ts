import { useMemo } from "react";
import type { SearchResult } from "../types/search";
import { useArtificialRankings, useHomeDashboard, useTts, useOpenRouterRankings, useHallucinationRankings } from "./useApiQuery";

function searchDataset<T>(data: T[], term: string, fields: (item: T) => (string | undefined | null)[], mapResult: (item: T) => SearchResult): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of data) {
    if (fields(item).some((f) => f?.toLowerCase().includes(term))) results.push(mapResult(item));
  }
  return results;
}

export function useSearchAllRankings(searchTerm: string): SearchResult[] {
  const enabled = searchTerm.length >= 2;
  const artificialQ = useArtificialRankings(enabled);
  const dashboardQ = useHomeDashboard(enabled);
  const ttsQ = useTts(enabled);
  const orQ = useOpenRouterRankings(enabled);

  const artificialData = artificialQ.data ?? [];
  const openSourceRankings = dashboardQ.data?.opensource ?? [];
  const ttsData = ttsQ.data ?? [];
  const openRouterData = orQ.data?.tokenUsageRankings ?? [];
  const hallucinationRankings = useHallucinationRankings(artificialData, enabled);

  return useMemo(() => {
    if (!enabled) return [];
    const term = searchTerm.toLowerCase();
    return [
      ...searchDataset(
        artificialData,
        term,
        (m) => [m.name, m.slug, m.model_creators?.name],
        (m) => ({
          id: m.id,
          name: m.name,
          source: "modelRankings",
          score: m.intelligence_index,
          provider: m.model_creators?.name || null,
          link: `/model/aa/${m.slug || m.id}`,
        }),
      ),
      ...searchDataset(
        openRouterData,
        term,
        (m) => [m.name, m.id],
        (m) => ({
          id: m.id,
          name: m.name,
          source: "openRouterRankings",
          score: null,
          provider: m.creator || null,
          link: `/model/or/${m.id}`,
        }),
      ),
      ...searchDataset(
        openSourceRankings,
        term,
        (m) => [m.id],
        (m) => ({
          id: m.id,
          name: m.id,
          source: "openSourceRankings",
          score: null,
          provider: m.author || null,
          link: `/model/os/${m.id}`,
        }),
      ),
      ...searchDataset(
        hallucinationRankings,
        term,
        (m) => [m.model],
        (m) => ({
          id: m.id,
          name: m.model,
          source: "hallucinationRankings",
          score: m.omniscienceIndex,
          provider: null,
          link: `/model/hall/${m.slug || m.id}`,
        }),
      ),
      ...searchDataset(
        ttsData,
        term,
        (m) => [m.name],
        (m) => ({
          id: m.id,
          name: m.name,
          source: "tts",
          score: m.quality_elo,
          provider: m.provider || null,
          link: `/model/tts/${m.name}`,
        }),
      ),
    ]
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === term ? 1 : 0;
        const bExact = b.name.toLowerCase() === term ? 1 : 0;
        return aExact !== bExact ? bExact - aExact : (b.score ?? 0) - (a.score ?? 0);
      })
      .slice(0, 20);
  }, [searchTerm, artificialData, openRouterData, openSourceRankings, hallucinationRankings, ttsData]);
}
