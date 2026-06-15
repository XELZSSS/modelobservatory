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

interface QueryCtx { signal?: AbortSignal }

const fetcher = <T>(path: string) => ({ signal }: QueryCtx) => apiFetch<T>(path, signal);

function createApiQuery<T>(path: string, opts?: { staleTime?: number; refetchInterval?: number | false }) {
  const key = [path.split("?")[0]!.replace(/\//g, ":")];
  const qf = fetcher<T>(path);
  return {
    use: (enabled = true) => useQuery<T>({ queryKey: key, queryFn: qf, ...opts, enabled }),
    useSuspense: () => useSuspenseQuery<T>({ queryKey: key, queryFn: qf, ...opts }),
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
export const useOpenRouterRankings = qOpenRouter.use;
export const useSuspenseOpenRouterRankings = qOpenRouter.useSuspense;

export function useHallucinationRankings(data: ArtificialAnalysisModel[], enabled = true): HallucinationRankingEntry[] {
  return useMemo(() => (enabled && data.length > 0 ? buildHallucinationRankings(data) : []), [data, enabled]);
}

export function useOpenSourceModels(enabled = true) {
  return useQuery<OpenSourceModelEntry[]>({
    queryKey: ["openSourceModels"],
    queryFn: fetcher<OpenSourceModelEntry[]>(api.openSourceModels()),
    staleTime: FIVE_MINUTES,
    enabled,
  });
}

export const NEWS_CATEGORIES_LIST = ["official", "industry", "research", "agentic", "policy", "hardware", "funding", "opensource"] as const;

export function useAllNews() {
  return useQueries({
    queries: NEWS_CATEGORIES_LIST.map((cat) => ({
      queryKey: ["news", cat],
      queryFn: fetcher<NewsItem[]>(api.news(cat)),
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

function searchDataset<T>(data: T[], term: string, fields: (item: T) => (string | undefined | null)[], mapResult: (item: T) => SearchResult): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of data) {
    if (fields(item).some((f) => f?.toLowerCase().includes(term))) results.push(mapResult(item));
  }
  return results;
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
  }, [searchTerm, artificialData, openRouterData, openSourceRankings, hallucinationRankings, ttsData]);
}
