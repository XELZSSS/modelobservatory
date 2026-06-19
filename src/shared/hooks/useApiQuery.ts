import { useMemo } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type {
  ArtificialAnalysisModel,
  HallucinationRankingEntry,
  OpenSourceModelEntry,
  OpenRouterRankingsPayload,
  HealthEntry,
  SystemStats,
  TtsModel,
  HomeDashboardData,
} from "../types";
import { HEALTH_CHECK_INTERVAL, SYSTEM_STATS_INTERVAL, FIVE_MINUTES, THIRTY_MINUTES } from "../constants";
import { apiFetch, api } from "../../api/client/httpClient";
import { buildHallucinationRankings } from "../utils/artificial";

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

const qArtificial = createApiQuery<ArtificialAnalysisModel[]>(api.artificialIndex, { staleTime: THIRTY_MINUTES });
const qTts = createApiQuery<TtsModel[]>(api.ttsLeaderboard, { staleTime: THIRTY_MINUTES });
const qOpenSourceReleases = createApiQuery<OpenSourceModelEntry[]>(api.openSourceReleases, { staleTime: THIRTY_MINUTES });
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

export function useOpenSourceModels(enabled = true) {
  return useQuery<OpenSourceModelEntry[]>({
    queryKey: ["openSourceModels"],
    queryFn: fetcher<OpenSourceModelEntry[]>(api.openSourceModels()),
    staleTime: FIVE_MINUTES,
    enabled,
  });
}

export function useHallucinationRankings(data: ArtificialAnalysisModel[], enabled = true): HallucinationRankingEntry[] {
  return useMemo(() => (enabled && data.length > 0 ? buildHallucinationRankings(data) : []), [data, enabled]);
}
