import { useMemo } from "react";
import { Rocket, Image, BarChart3, Mic } from "lucide-react";
import type { ArtificialAnalysisModel, HallucinationRankingEntry, HomeDashboardData } from "../../shared/types";
import type { TranslationKey } from "../../shared/i18n";
import { formatShortNumber } from "../../shared/utils/format";
import { groupByProvider } from "../../shared/utils/providerStats";

export interface HomeKpi {
  label: string;
  value: string;
  Icon: typeof Rocket;
}

export interface HomeProviderStat {
  name: string;
  color: string;
  avgSpeed: number;
  count: number;
}

export interface HomeBarStat {
  label: string;
  value: number;
  valueLabel: string;
}

export interface HomeToolUsage {
  total: number;
  rows: Array<{ name: string; value: number; share: number }>;
}

export function useHomeDashboardData(
  artificialData: ArtificialAnalysisModel[],
  hallucinationRankings: HallucinationRankingEntry[],
  dashboardData: HomeDashboardData,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
) {
  return useMemo(() => {
    const openSourceRankings = dashboardData.opensource ?? [];
    const arenaT2IModels = dashboardData.arena?.models ?? [];
    const openRouterApps = dashboardData.orRankings?.appUsageRankings ?? [];
    const latestOpenRouterModel = dashboardData.orRankings?.tokenUsageRankings?.[0] ?? null;
    const ttsData = dashboardData.tts ?? [];
    const bestTtsModel = ttsData[0] ?? null;

    const downloadStats: HomeBarStat[] = openSourceRankings.slice(0, 5).map((model) => ({
      label: model.id.split("/").pop() || model.id,
      value: model.downloads,
      valueLabel: formatShortNumber(model.downloads),
    }));

    const hallucinationStats: HomeBarStat[] = hallucinationRankings
      .slice()
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5)
      .map((entry) => ({
        label: entry.model,
        value: entry.accuracy,
        valueLabel: `${entry.accuracy.toFixed(1)}%`,
      }));

    const latestRelease = artificialData.reduce(
      (best, m) => {
        if (!m.release_date) return best;
        if (!best?.release_date) return m;
        return m.release_date > best.release_date ? m : best;
      },
      null as ArtificialAnalysisModel | null,
    );

    const total = openRouterApps.reduce((sum, app) => sum + app.totalTokens, 0);
    let toolUsageShare: HomeToolUsage;
    if (total <= 0) {
      toolUsageShare = { total, rows: [] };
    } else {
      const topRows = [...openRouterApps]
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, 4)
        .map((app) => ({ name: app.name, value: app.totalTokens, share: app.totalTokens / total }));
      const topTotal = topRows.reduce((sum, row) => sum + row.value, 0);
      const otherValue = total - topTotal;
      toolUsageShare = { total, rows: otherValue > 0 ? [...topRows, { name: t("otherTools"), value: otherValue, share: otherValue / total }] : topRows };
    }

    const kpiStrip: HomeKpi[] = [
      { label: t("openRouterRankings"), value: latestOpenRouterModel?.name || t("notAvailable"), Icon: BarChart3 },
      { label: t("bestT2IModel"), value: arenaT2IModels[0]?.model || t("notAvailable"), Icon: Image },
      { label: t("latestRelease"), value: latestRelease?.short_name || latestRelease?.name || t("notAvailable"), Icon: Rocket },
      { label: t("bestTtsModel"), value: bestTtsModel?.name || t("notAvailable"), Icon: Mic },
    ];

    const providers = groupByProvider(artificialData);
    const providerStats: HomeProviderStat[] = providers
      .map(({ name, color, models }) => {
        const speeds = models.map((m) => m.speed?.median_output_speed ?? m.speed?.timescaleData?.median_output_speed).filter((s): s is number => s != null);
        const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
        return { name, color, avgSpeed, count: models.length };
      })
      .sort((a, b) => b.avgSpeed - a.avgSpeed);

    return { downloadStats, hallucinationStats, toolUsageShare, kpiStrip, providerStats, arenaT2IModels };
  }, [artificialData, hallucinationRankings, dashboardData, t]);
}
