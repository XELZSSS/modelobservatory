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
import { HEALTH_CHECK_INTERVAL, SYSTEM_STATS_INTERVAL, FIVE_MINUTES, THIRTY_MINUTES } from "../config";
import { apiFetch, api } from "../../api/client/httpClient";
import { normalizePercent } from "../utils/math";

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

function buildHallucinationRankings(models: ArtificialAnalysisModel[]): HallucinationRankingEntry[] {
  return models
    .flatMap((model) => {
      const total = model.omniscience_breakdown?.total;
      const rate = normalizePercent(total?.hallucination_rate);
      const acc = normalizePercent(total?.accuracy);
      const attempt = normalizePercent(total?.attempt_rate);
      const idx = normalizePercent(total?.omniscience);
      if (rate == null || acc == null || attempt == null || idx == null) return [];
      return [{ id: model.id, slug: model.slug, model: model.name, hallucinationRate: rate, accuracy: acc, attemptRate: attempt, omniscienceIndex: idx }];
    })
    .sort((a, b) => a.hallucinationRate - b.hallucinationRate);
}

export function useHallucinationRankings(data: ArtificialAnalysisModel[], enabled = true): HallucinationRankingEntry[] {
  return useMemo(() => (enabled && data.length > 0 ? buildHallucinationRankings(data) : []), [data, enabled]);
}
