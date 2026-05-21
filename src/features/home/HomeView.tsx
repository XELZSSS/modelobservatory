import { useMemo } from "react";
import { Rocket, Image, BarChart3, Mic } from "lucide-react";
import { Card, CardContent } from "../../shared/components/ui/card";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { BarStatsCard } from "../../shared/components/data/BarStatsCard";
import { IndexLineChart } from "../../shared/components/data/IndexLineChart";
import { getModelColor } from "../../shared/components/rankColor";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import type { ArtificialAnalysisModel } from "../../shared/types";
import { formatShortNumber } from "../../shared/utils/format";
import { PredictionsSection } from "../../shared/components/data/PredictionCards";
import { KpiCard, ToolUsageShareDonut, UptimeDisplay, ClockDisplay, ArenaT2ICard } from "./components";
import { SearchInput } from "./SearchInput";

function HomeContent() {
  const { t } = useTranslation();

  const { data: artificialData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(artificialData);
  const { data: dashboardData } = useSuspenseHomeDashboard();

  const artificialRankings = artificialData;
  const openSourceRankings = useMemo(() => dashboardData.opensource ?? [], [dashboardData.opensource]);
  const arenaT2IModels = useMemo(() => dashboardData.arena?.models ?? [], [dashboardData.arena]);

  const openRouterApps = useMemo(() => dashboardData.orRankings?.appUsageRankings ?? [], [dashboardData.orRankings]);
  const latestOpenRouterModel = dashboardData.orRankings?.tokenUsageRankings?.[0] ?? null;
  const ttsData = useMemo(() => dashboardData.tts ?? [], [dashboardData.tts]);
  const bestTtsModel = ttsData[0] ?? null;

  const downloadStats = useMemo(
    () =>
      openSourceRankings.slice(0, 5).map((model) => ({
        label: model.id.split("/").pop() || model.id,
        value: model.downloads,
        valueLabel: formatShortNumber(model.downloads),
      })),
    [openSourceRankings],
  );
  const hallucinationStats = useMemo(
    () =>
      hallucinationRankings.slice(0, 5).map((entry) => ({
        label: entry.model,
        value: entry.hallucinationRate,
        valueLabel: `${entry.hallucinationRate.toFixed(1)}%`,
      })),
    [hallucinationRankings],
  );

  const latestReleaseModel = useMemo(
    () =>
      artificialRankings.reduce(
        (best, m) => {
          if (!m.release_date) return best;
          if (!best?.release_date) return m;
          return m.release_date > best.release_date ? m : best;
        },
        null as ArtificialAnalysisModel | null,
      ),
    [artificialRankings],
  );

  const toolUsageShare = useMemo(() => {
    const total = openRouterApps.reduce((sum, app) => sum + app.totalTokens, 0);
    if (total <= 0) return { total, rows: [] as Array<{ name: string; value: number; share: number }> };
    const topRows = [...openRouterApps]
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, 4)
      .map((app) => ({ name: app.name, value: app.totalTokens, share: app.totalTokens / total }));
    const topTotal = topRows.reduce((sum, row) => sum + row.value, 0);
    const otherValue = total - topTotal;
    const rows = otherValue > 0 ? [...topRows, { name: t("otherTools"), value: otherValue, share: otherValue / total }] : topRows;
    return { total, rows };
  }, [openRouterApps, t]);

  const predictions = dashboardData.predictions ?? null;

  const kpiStrip = useMemo(
    () => [
      { label: t("openRouterRankings"), value: latestOpenRouterModel?.name || t("notAvailable"), Icon: BarChart3 },
      { label: t("bestT2IModel"), value: arenaT2IModels[0]?.model || t("notAvailable"), Icon: Image },
      { label: t("latestRelease"), value: latestReleaseModel?.short_name || latestReleaseModel?.name || t("notAvailable"), Icon: Rocket },
      { label: t("bestTtsModel"), value: bestTtsModel?.name || t("notAvailable"), Icon: Mic },
    ],
    [latestOpenRouterModel, arenaT2IModels, latestReleaseModel, bestTtsModel, t],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-2.5">
        {kpiStrip.map((kpi) => (
          <KpiCard key={kpi.label} icon={kpi.Icon} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      <IndexLineChart models={artificialRankings} />

      <div className="hidden sm:flex flex-row gap-2 items-center">
        <ClockDisplay />
        <UptimeDisplay />
        <SearchInput />
      </div>

      <SectionHeader title={t("statistics")} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr] gap-4">
        <BarStatsCard title={t("openSourceDownloadsStats")} source={t("huggingFaceSource")} rows={downloadStats} />
        <BarStatsCard title={t("hallucinationStats")} source={t("hallucinationSource")} rows={hallucinationStats} />
        <Card className="lg:order-3">
          <CardContent>
            <ToolUsageShareDonut total={toolUsageShare.total} rows={toolUsageShare.rows} />
          </CardContent>
        </Card>
      </div>

      {predictions && <PredictionsSection data={predictions} />}

      {arenaT2IModels.length > 0 && (
        <div>
          <SectionHeader title={t("textToImage")} meta={t("arenaAISource")} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {arenaT2IModels.slice(0, 8).map((entry, index) => (
              <div key={entry.model} className={index >= 4 ? "hidden lg:block" : ""}>
                <ArenaT2ICard entry={entry} rank={index + 1} color={getModelColor(index)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeView() {
  return (
    <SuspenseQuery>
      <HomeContent />
    </SuspenseQuery>
  );
}
