import { useMemo } from "react";
import { Rocket, Image, BarChart3, Mic } from "lucide-react";
import { Card, CardContent } from "../../shared/components/ui/card";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings, useSuspenseHealthStatus } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { BarStatsCard } from "../../shared/components/data/BarStatsCard";
import { IndexLineChart } from "../../shared/components/data/IndexLineChart";
import { getModelColor } from "../../shared/components/rankColor";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import type { ArtificialAnalysisModel } from "../../shared/types";
import { formatShortNumber } from "../../shared/utils/format";
import { PredictionsSection } from "../../shared/components/data/PredictionCards";
import { KpiCard, ToolUsageShareDonut, UptimeDisplay, ClockDisplay, ArenaT2ICard, StatusBarPill } from "./components";
import { SearchInput } from "./SearchInput";

function HomeContent() {
  const { t } = useTranslation();

  const { data: artificialData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(artificialData);
  const { data: dashboardData } = useSuspenseHomeDashboard();
  const { data: healthData } = useSuspenseHealthStatus();

  const predictions = dashboardData.predictions ?? null;

  const { downloadStats, hallucinationStats, toolUsageShare, kpiStrip, providerStats, arenaT2IModels } = useMemo(() => {
    const openSourceRankings = dashboardData.opensource ?? [];
    const arenaT2IModels = dashboardData.arena?.models ?? [];
    const openRouterApps = dashboardData.orRankings?.appUsageRankings ?? [];
    const latestOpenRouterModel = dashboardData.orRankings?.tokenUsageRankings?.[0] ?? null;
    const ttsData = dashboardData.tts ?? [];
    const bestTtsModel = ttsData[0] ?? null;
    const dlStats = openSourceRankings.slice(0, 5).map((model) => ({
      label: model.id.split("/").pop() || model.id,
      value: model.downloads,
      valueLabel: formatShortNumber(model.downloads),
    }));

    const halStats = hallucinationRankings.slice(0, 5).map((entry) => ({
      label: entry.model,
      value: entry.hallucinationRate,
      valueLabel: `${entry.hallucinationRate.toFixed(1)}%`,
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
    let usageShare: { total: number; rows: Array<{ name: string; value: number; share: number }> };
    if (total <= 0) {
      usageShare = { total, rows: [] };
    } else {
      const topRows = [...openRouterApps]
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, 4)
        .map((app) => ({ name: app.name, value: app.totalTokens, share: app.totalTokens / total }));
      const topTotal = topRows.reduce((sum, row) => sum + row.value, 0);
      const otherValue = total - topTotal;
      usageShare = { total, rows: otherValue > 0 ? [...topRows, { name: t("otherTools"), value: otherValue, share: otherValue / total }] : topRows };
    }

    const kpis = [
      { label: t("openRouterRankings"), value: latestOpenRouterModel?.name || t("notAvailable"), Icon: BarChart3 },
      { label: t("bestT2IModel"), value: arenaT2IModels[0]?.model || t("notAvailable"), Icon: Image },
      { label: t("latestRelease"), value: latestRelease?.short_name || latestRelease?.name || t("notAvailable"), Icon: Rocket },
      { label: t("bestTtsModel"), value: bestTtsModel?.name || t("notAvailable"), Icon: Mic },
    ];

    const providers = new Map<string, { models: ArtificialAnalysisModel[]; color: string }>();
    for (const m of artificialData) {
      const name = m.model_creators?.name || "Unknown";
      const color = m.model_creators?.color || "#6b7280";
      let bucket = providers.get(name);
      if (!bucket) { bucket = { models: [], color }; providers.set(name, bucket); }
      bucket.models.push(m);
    }
    const provStats = Array.from(providers.entries())
      .map(([name, { models, color }]) => {
        const speeds = models.map((m) => m.speed?.median_output_speed ?? m.speed?.timescaleData?.median_output_speed).filter((s): s is number => s != null);
        const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
        return { name, color, avgSpeed, count: models.length };
      })
      .sort((a, b) => b.avgSpeed - a.avgSpeed);

    return { downloadStats: dlStats, hallucinationStats: halStats, toolUsageShare: usageShare, kpiStrip: kpis, providerStats: provStats, arenaT2IModels };
  }, [artificialData, hallucinationRankings, dashboardData, t]);

  const healthyCount = healthData.filter((e) => e.status === "ok").length;
  const totalCount = healthData.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <ClockDisplay />
        <UptimeDisplay />
        <StatusBarPill>
          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${healthyCount === totalCount ? "bg-green-500" : "bg-red-500"}`} />
          {t("dataSources")}: {healthyCount}/{totalCount}
        </StatusBarPill>
        <SearchInput />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-2.5">
        {kpiStrip.map((kpi) => (
          <KpiCard key={kpi.label} icon={kpi.Icon} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <IndexLineChart models={artificialData} />
        <Card className="h-fit">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {providerStats.slice(0, 6).map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold ml-3 shrink-0">{p.avgSpeed.toFixed(1)} tok/s</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

      {predictions && <PredictionsSection data={predictions} />}
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
