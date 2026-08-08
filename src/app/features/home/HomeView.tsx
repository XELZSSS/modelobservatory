import { memo, useState, useEffect, lazy, Suspense, type ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings, useSuspenseHealthStatus, useSystemStats } from "../../api/queries";
import { SuspenseQuery } from "../../components/feedback/SuspenseQuery";
import { PredictionsSection } from "../../components/data/PredictionCards";
import { StatCard } from "../../components/composite/StatCard";
import { Card, CardContent } from "../../components/ui/card";
import { PageContainer, PageSection } from "../../components/layout/PageContainer";
import { getModelColor } from "../../components/rankColor";
import { formatDateTime } from "../../../shared/utils/format";
import type { ArenaModel, ArtificialAnalysisModel } from "../../../shared/types";

import { useHomeDashboardData, type HomeKpi, type HomeProviderStat } from "./useHomeDashboardData";
import { SearchInput } from "./SearchInput";

const IndexLineChart = lazy(() => import("./charts").then((m) => ({ default: m.IndexLineChart })));
const StatisticsSection = lazy(() => import("./charts").then((m) => ({ default: m.StatisticsSection })));

const StatusBarPill = memo(function StatusBarPill({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg bg-bg-card text-xs text-text-secondary">
      {children}
    </div>
  );
});

const UptimeDisplay = memo(function UptimeDisplay() {
  const { t } = useTranslation();
  const statsQ = useSystemStats();
  const uptime = statsQ.data?.uptime ?? 0;
  if (uptime <= 0) return null;
  const fmt = (s: number) => {
    if (s < 60) return t("uptimeSeconds", { value: Math.round(s) });
    if (s < 3600) return t("uptimeMinutes", { value: Math.floor(s / 60), value2: Math.round(s % 60) });
    if (s < 86400) return t("uptimeHours", { value: Math.floor(s / 3600), value2: Math.floor((s % 3600) / 60) });
    return t("uptimeDays", { value: Math.floor(s / 86400), value2: Math.floor((s % 86400) / 3600) });
  };
  return <StatusBarPill><span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />{t("uptime")}: {fmt(uptime)}</StatusBarPill>;
});

const ClockDisplay = memo(function ClockDisplay() {
  const { t, lang } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return <StatusBarPill>{formatDateTime(now, lang)}</StatusBarPill>;
});

const KpiStrip = memo(function KpiStrip({ kpis }: { kpis: HomeKpi[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map((kpi, i) => (
        <StatCard key={kpi.label} icon={kpi.Icon} label={kpi.label} value={kpi.value} />
      ))}
    </div>
  );
});

const ProviderSpeedCard = memo(function ProviderSpeedCard({ providerStats }: { providerStats: HomeProviderStat[] }) {
  const { t } = useTranslation();
  return (
    <Card accent="top" className="h-full">
      <CardContent padding="md" className="flex flex-col h-full">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t("providerSpeed")}</p>
        <div className="flex flex-col gap-2.5 flex-1 justify-center">
          {providerStats.slice(0, 6).map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
              <span className="text-sm font-semibold font-mono ml-3 shrink-0">{p.avgSpeed.toFixed(1)} {t("tokensPerSecond")}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const ArenaT2ICard = memo(function ArenaT2ICard({ entry, rank, color }: { entry: ArenaModel; rank: number; color: string }) {
  const { t } = useTranslation();
  return (
    <Card accent="left">
      <div className="flex flex-col gap-2.5 p-4 w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold truncate">{entry.model}</span>
          </div>
          <span className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "18", color }}>
            #{rank}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span>ELO: <strong className="text-text-primary font-semibold" style={{ color }}>{entry.score != null ? entry.score.toFixed(0) : t("notAvailable")}</strong></span>
          <span>{t("votes")}: <strong className="text-text-primary font-semibold">{entry.votes != null ? entry.votes.toLocaleString() : t("notAvailable")}</strong></span>
          <span>{t("license")}: <strong className="text-text-primary font-semibold">{entry.license || t("notAvailable")}</strong></span>
        </div>
      </div>
    </Card>
  );
});

const ArenaT2ISection = memo(function ArenaT2ISection({ models }: { models: ArenaModel[] }) {
  const { t } = useTranslation();
  if (models.length === 0) return null;
  return (
    <PageSection title={t("textToImage")} description={t("arenaAISource")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {models.slice(0, 8).map((entry, index) => (
          <ArenaT2ICard key={entry.model} entry={entry} rank={index + 1} color={getModelColor(index)} />
        ))}
      </div>
    </PageSection>
  );
});

const HomeContent = memo(function HomeContent() {
  const { t } = useTranslation();

  const { data: artificialData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(artificialData);
  const { data: dashboardData } = useSuspenseHomeDashboard();
  const { data: healthData } = useSuspenseHealthStatus();

  const predictions = dashboardData.predictions ?? null;
  const { downloadStats, hallucinationStats, toolUsageShare, kpiStrip, providerStats, arenaT2IModels } = useHomeDashboardData(
    artificialData,
    hallucinationRankings,
    dashboardData,
    t,
  );

  const healthyCount = healthData.filter((e) => e.status === "ok").length;
  const totalCount = healthData.length;

  return (
    <PageContainer>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <ClockDisplay />
        <UptimeDisplay />
        <StatusBarPill>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${healthyCount === totalCount ? "bg-success" : "bg-destructive"}`} />
          {t("dataSources")}: {healthyCount}/{totalCount}
        </StatusBarPill>
        <div className="ml-auto">
          <SearchInput />
        </div>
      </div>

      <div className="mb-6">
        <KpiStrip kpis={kpiStrip} />
      </div>

      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Suspense fallback={<Card accent="top"><CardContent padding="md"><p className="text-sm font-semibold mb-3">{t("intelligenceIndex")} — Top 10</p><div className="h-[200px] animate-pulse bg-bg-secondary rounded-lg" /></CardContent></Card>}>
              <IndexLineChart models={artificialData} />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <ProviderSpeedCard providerStats={providerStats} />
          </div>
        </div>
        <div className="mt-4 lg:hidden">
          <ProviderSpeedCard providerStats={providerStats} />
        </div>
      </PageSection>

      <Suspense fallback={null}>
        <StatisticsSection downloadStats={downloadStats} hallucinationStats={hallucinationStats} toolUsageShare={toolUsageShare} />
      </Suspense>

      <ArenaT2ISection models={arenaT2IModels} />

      {predictions && (
        <PageSection title={t("marketPredictions")}>
          <PredictionsSection data={predictions} />
        </PageSection>
      )}
    </PageContainer>
  );
});

export function HomeView() {
  return (
    <SuspenseQuery>
      <HomeContent />
    </SuspenseQuery>
  );
}