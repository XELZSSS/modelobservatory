import { useMemo } from "react";
import { useQueries, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type {
  ArtificialAnalysisModel,
  HallucinationRankingEntry,
  OpenSourceModelEntry,
  OpenRouterRankingsPayload,
  HealthEntry,
  SystemStats,
  NewsItem,
  TtsModel,
  HomeDashboardData,
} from "../types";
import { HEALTH_CHECK_INTERVAL, SYSTEM_STATS_INTERVAL } from "../constants";
import { apiFetch, api } from "../../api/client/httpClient";
import { buildHallucinationRankings } from "../utils/artificial";

const FIVE_MINUTES = 5 * 60_000;

interface QueryCtx {
  signal?: AbortSignal;
}

function createApiQuery<T>(path: string, opts?: { staleTime?: number; refetchInterval?: number | false }) {
  const key = [path.split("?")[0]!.replace(/\//g, ":")];
  const defaults = { ...opts };
  return {
    use: (enabled = true) =>
      useQuery<T>({
        queryKey: key,
        queryFn: ({ signal }: QueryCtx) => apiFetch<T>(path, { signal }),
        ...defaults,
        enabled,
      }),
    useSuspense: () =>
      useSuspenseQuery<T>({
        queryKey: key,
        queryFn: ({ signal }: QueryCtx) => apiFetch<T>(path, { signal }),
        ...defaults,
      }),
  };
}

const qArtificial = createApiQuery<ArtificialAnalysisModel[]>(api.artificialIndex);
const qTts = createApiQuery<TtsModel[]>(api.ttsLeaderboard);
const qOpenSourceReleases = createApiQuery<OpenSourceModelEntry[]>(api.openSourceReleases);
const qOpenRouter = createApiQuery<OpenRouterRankingsPayload>(api.openRouterRankings, { staleTime: FIVE_MINUTES });
const qHealth = createApiQuery<HealthEntry[]>(api.health, { staleTime: 0, refetchInterval: HEALTH_CHECK_INTERVAL });
const qSystemStats = createApiQuery<SystemStats>(api.systemStats, { staleTime: 0, refetchInterval: SYSTEM_STATS_INTERVAL });
const qHomeDashboard = createApiQuery<HomeDashboardData>(api.homeDashboard, { staleTime: FIVE_MINUTES });

export const useArtificialRankings = qArtificial.use;
export const useSuspenseArtificialRankings = qArtificial.useSuspense;

export const useTtsLeaderboard = qTts.use;
export const useSuspenseTtsLeaderboard = qTts.useSuspense;

export const useOpenSourceReleases = qOpenSourceReleases.use;
export const useSuspenseOpenSourceReleases = qOpenSourceReleases.useSuspense;

export const useSuspenseHealthStatus = qHealth.useSuspense;

export const useSystemStats = qSystemStats.use;

export const useSuspenseHomeDashboard = qHomeDashboard.useSuspense;

export function useHallucinationRankings(data: ArtificialAnalysisModel[], enabled = true): HallucinationRankingEntry[] {
  return useMemo(
    () => (enabled && data.length > 0 ? buildHallucinationRankings(data) : []),
    [data, enabled],
  );
}

export function useOpenSourceModels(enabled = true) {
  return useQuery<OpenSourceModelEntry[]>({
    queryKey: ["openSourceModels"],
    queryFn: ({ signal }: QueryCtx) => apiFetch<OpenSourceModelEntry[]>(api.openSourceModels(), { signal }),
    staleTime: FIVE_MINUTES,
    enabled,
  });
}

export const useOpenRouterRankings = qOpenRouter.use;
export const useSuspenseOpenRouterRankings = qOpenRouter.useSuspense;

export const NEWS_CATEGORIES_LIST = ["official", "industry", "research", "agentic", "policy", "hardware", "funding", "opensource"] as const;

export function useAllNews() {
  return useQueries({
    queries: NEWS_CATEGORIES_LIST.map((cat) => ({
      queryKey: ["news", cat],
      queryFn: ({ signal }: QueryCtx) => apiFetch<NewsItem[]>(api.news(cat), { signal }),
      staleTime: FIVE_MINUTES,
      refetchInterval: FIVE_MINUTES,
    })),
  });
}

export interface SearchResult {
  id: string;
  name: string;
  source: string;
  score: number | null;
  provider: string | null;
  link: string;
}

export function useSearchAllRankings(searchTerm: string): SearchResult[] {
  const { data: artificialData } = useSuspenseArtificialRankings();
  const { data: dashboardData } = useSuspenseHomeDashboard();

  const openSourceRankings = useMemo(() => dashboardData.opensource ?? [], [dashboardData.opensource]);
  const ttsData = useMemo(() => dashboardData.tts ?? [], [dashboardData.tts]);
  const openRouterData = useMemo(() => dashboardData.orRankings?.tokenUsageRankings ?? [], [dashboardData.orRankings]);
  const hallucinationRankings = useHallucinationRankings(artificialData);

  return useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    for (const model of artificialData) {
      const name = model.name?.toLowerCase() || "";
      const slug = model.slug?.toLowerCase() || "";
      const creator = model.model_creators?.name?.toLowerCase() || "";
      if (name.includes(term) || slug.includes(term) || creator.includes(term)) {
        results.push({
          id: model.id,
          name: model.name,
          source: "modelRankings",
          score: model.intelligence_index,
          provider: model.model_creators?.name || null,
          link: `/model/aa/${model.slug || model.id}`,
        });
      }
    }

    for (const model of openRouterData) {
      const name = model.name?.toLowerCase() || "";
      const id = model.id?.toLowerCase() || "";
      if (name.includes(term) || id.includes(term)) {
        results.push({
          id: model.id,
          name: model.name,
          source: "openRouterRankings",
          score: null,
          provider: model.creator || null,
          link: `/model/or/${model.id}`,
        });
      }
    }

    for (const model of openSourceRankings) {
      const id = model.id?.toLowerCase() || "";
      if (id.includes(term)) {
        results.push({
          id: model.id,
          name: model.id,
          source: "openSourceRankings",
          score: null,
          provider: model.author || null,
          link: `/model/os/${model.id}`,
        });
      }
    }

    for (const model of hallucinationRankings) {
      const name = model.model?.toLowerCase() || "";
      if (name.includes(term)) {
        results.push({
          id: model.id,
          name: model.model,
          source: "hallucinationRankings",
          score: model.omniscienceIndex,
          provider: null,
          link: `/model/hall/${model.slug || model.id}`,
        });
      }
    }

    for (const model of ttsData) {
      const name = model.name?.toLowerCase() || "";
      if (name.includes(term)) {
        results.push({
          id: model.id,
          name: model.name,
          source: "tts",
          score: model.quality_elo,
          provider: model.provider || null,
          link: `/model/tts/${model.name}`,
        });
      }
    }

    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === term ? 1 : 0;
        const bExact = b.name.toLowerCase() === term ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return (b.score ?? 0) - (a.score ?? 0);
      })
      .slice(0, 20);
  }, [searchTerm, artificialData, openRouterData, openSourceRankings, hallucinationRankings, ttsData]);
}
