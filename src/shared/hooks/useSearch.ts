import { useDeferredValue, useMemo } from "react";
import type { SearchResult } from "../types/search";
import { useArtificialRankings, useHomeDashboard, useTts, useOpenRouterRankings, useHallucinationRankings } from "./useApiQuery";

// Precomputed lowercase search index per dataset, rebuilt only when the data
// reference changes (not on every keystroke).
interface SearchIndex<T> {
  haystacks: string[][];
  items: T[];
}

function buildIndex<T>(data: T[], fields: (item: T) => (string | undefined | null)[]): SearchIndex<T> | null {
  if (data.length === 0) return null;
  return {
    items: data,
    haystacks: data.map((item) => fields(item).map((f) => (f ? f.toLowerCase() : ""))),
  };
}

function searchIndex<T>(index: SearchIndex<T>, term: string, mapResult: (item: T) => SearchResult): SearchResult[] {
  const results: SearchResult[] = [];
  for (let i = 0; i < index.items.length; i++) {
    if (index.haystacks[i]!.some((f) => f.includes(term))) results.push(mapResult(index.items[i]!));
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

  const artificialIndex = useMemo(() => buildIndex(artificialData, (m) => [m.name, m.slug, m.model_creators?.name]), [artificialData]);
  const openRouterIndex = useMemo(() => buildIndex(openRouterData, (m) => [m.name, m.id]), [openRouterData]);
  const openSourceIndex = useMemo(() => buildIndex(openSourceRankings, (m) => [m.id]), [openSourceRankings]);
  const hallucinationIndex = useMemo(() => buildIndex(hallucinationRankings, (m) => [m.model]), [hallucinationRankings]);
  const ttsIndex = useMemo(() => buildIndex(ttsData, (m) => [m.name]), [ttsData]);

  // Deferred so typing stays responsive; results lag behind the input slightly.
  const deferredTerm = useDeferredValue(searchTerm);

  return useMemo(() => {
    if (!enabled) return [];
    const term = deferredTerm.toLowerCase();
    const results: SearchResult[] = [];
    if (artificialIndex) {
      results.push(
        ...searchIndex(
          artificialIndex,
          term,
          (m) => ({
            id: m.id,
            name: m.name,
            source: "modelRankings",
            score: m.intelligence_index,
            provider: m.model_creators?.name || null,
            link: `/model/aa/${m.slug || m.id}`,
          }),
        ),
      );
    }
    if (openRouterIndex) {
      results.push(
        ...searchIndex(
          openRouterIndex,
          term,
          (m) => ({
            id: m.id,
            name: m.name,
            source: "openRouterRankings",
            score: null,
            provider: m.creator || null,
            link: `/model/or/${m.id}`,
          }),
        ),
      );
    }
    if (openSourceIndex) {
      results.push(
        ...searchIndex(
          openSourceIndex,
          term,
          (m) => ({
            id: m.id,
            name: m.id,
            source: "openSourceRankings",
            score: null,
            provider: m.author || null,
            link: `/model/os/${m.id}`,
          }),
        ),
      );
    }
    if (hallucinationIndex) {
      results.push(
        ...searchIndex(
          hallucinationIndex,
          term,
          (m) => ({
            id: m.id,
            name: m.model,
            source: "hallucinationRankings",
            score: m.omniscienceIndex,
            provider: null,
            link: `/model/hall/${m.slug || m.id}`,
          }),
        ),
      );
    }
    if (ttsIndex) {
      results.push(
        ...searchIndex(
          ttsIndex,
          term,
          (m) => ({
            id: m.id,
            name: m.name,
            source: "tts",
            score: m.quality_elo,
            provider: m.provider || null,
            link: `/model/tts/${m.name}`,
          }),
        ),
      );
    }
    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === term ? 1 : 0;
        const bExact = b.name.toLowerCase() === term ? 1 : 0;
        return aExact !== bExact ? bExact - aExact : (b.score ?? 0) - (a.score ?? 0);
      })
      .slice(0, 20);
  }, [enabled, deferredTerm, artificialIndex, openRouterIndex, openSourceIndex, hallucinationIndex, ttsIndex]);
}
