import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings, useSuspenseHealthStatus } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { IndexLineChart } from "../../shared/components/data/IndexLineChart";
import { PredictionsSection } from "../../shared/components/data/PredictionCards";

import { useHomeDashboardData } from "./useHomeDashboardData";
import { ClockDisplay, UptimeDisplay, StatusBarPill } from "./StatusBarWidgets";
import { SearchInput } from "./SearchInput";
import { KpiStrip } from "./KpiStrip";
import { ProviderSpeedCard } from "./ProviderSpeedCard";
import { StatisticsSection } from "./StatisticsSection";
import { ArenaT2ISection } from "./ArenaT2ISection";

function HomeContent() {
  const { t } = useTranslation();

  const { data: artificialData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(artificialData);
  const { data: dashboardData } = useSuspenseHomeDashboard();
  const { data: healthData } = useSuspenseHealthStatus();

  const predictions = dashboardData.predictions ?? null;
  const { downloadStats, hallucinationStats, toolUsageShare, kpiStrip, providerStats, arenaT2IModels } = useHomeDashboardData(artificialData, hallucinationRankings, dashboardData, t);

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

      <KpiStrip kpis={kpiStrip} />

      <div className="hidden sm:grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <IndexLineChart models={artificialData} />
        </div>
        <ProviderSpeedCard providerStats={providerStats} />
      </div>
      <div className="sm:hidden">
        <IndexLineChart models={artificialData} />
      </div>

      <StatisticsSection downloadStats={downloadStats} hallucinationStats={hallucinationStats} toolUsageShare={toolUsageShare} />

      <ArenaT2ISection models={arenaT2IModels} />

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
