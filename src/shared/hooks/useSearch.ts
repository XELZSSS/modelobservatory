import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsItem } from "../types";
import { FIVE_MINUTES } from "../constants";
import { apiFetch, api } from "../../api/client/httpClient";
import type { SearchResult } from "../types/search";
import { useArtificialRankings, useSuspenseHomeDashboard, useSuspenseTtsLeaderboard, useOpenRouterRankings, useHallucinationRankings } from "./useApiQuery";

interface QueryCtx { signal?: AbortSignal }

export function useNewsByCategory(category: string) {
  return useQuery<NewsItem[]>({
    queryKey: ["news", category],
    queryFn: ({ signal }: QueryCtx) => apiFetch<NewsItem[]>(api.news(category), signal),
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
  });
}

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
  const dashboardQ = useSuspenseHomeDashboard();
  const ttsQ = useSuspenseTtsLeaderboard();
  const orQ = useOpenRouterRankings(enabled);

  const artificialData = useMemo(() => artificialQ.data ?? [], [artificialQ.data]);
  const openSourceRankings = useMemo(() => dashboardQ.data.opensource ?? [], [dashboardQ.data.opensource]);
  const ttsData = useMemo(() => ttsQ.data ?? [], [ttsQ.data]);
  const openRouterData = useMemo(() => orQ.data?.tokenUsageRankings ?? [], [orQ.data]);
  const hallucinationRankings = useHallucinationRankings(artificialData, enabled);

  return useMemo(() => {
    if (!enabled) return [];
    const term = searchTerm.toLowerCase();
    return [
      ...searchDataset(artificialData, term, (m) => [m.name, m.slug, m.model_creators?.name], (m) => ({
        id: m.id, name: m.name, source: "modelRankings", score: m.intelligence_index,
        provider: m.model_creators?.name || null, link: `/model/aa/${m.slug || m.id}`,
      })),
      ...searchDataset(openRouterData, term, (m) => [m.name, m.id], (m) => ({
        id: m.id, name: m.name, source: "openRouterRankings", score: null,
        provider: m.creator || null, link: `/model/or/${m.id}`,
      })),
      ...searchDataset(openSourceRankings, term, (m) => [m.id], (m) => ({
        id: m.id, name: m.id, source: "openSourceRankings", score: null,
        provider: m.author || null, link: `/model/os/${m.id}`,
      })),
      ...searchDataset(hallucinationRankings, term, (m) => [m.model], (m) => ({
        id: m.id, name: m.model, source: "hallucinationRankings", score: m.omniscienceIndex,
        provider: null, link: `/model/hall/${m.slug || m.id}`,
      })),
      ...searchDataset(ttsData, term, (m) => [m.name], (m) => ({
        id: m.id, name: m.name, source: "tts", score: m.quality_elo,
        provider: m.provider || null, link: `/model/tts/${m.name}`,
      })),
    ].sort((a, b) => {
      const aExact = a.name.toLowerCase() === term ? 1 : 0;
      const bExact = b.name.toLowerCase() === term ? 1 : 0;
      return aExact !== bExact ? bExact - aExact : (b.score ?? 0) - (a.score ?? 0);
    }).slice(0, 20);
  }, [enabled, searchTerm, artificialData, openRouterData, openSourceRankings, hallucinationRankings, ttsData]);
}
