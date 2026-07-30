import { memo, useCallback, useMemo, useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings, useSuspenseHealthStatus, useSystemStats } from "../../shared/hooks/useApiQuery";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { PredictionsSection } from "../../shared/components/data/PredictionCards";
import { StatCard } from "../../shared/components/composite/StatCard";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { InfoRow } from "../../shared/components/composite/InfoRow";
import { Card, CardContent } from "../../shared/components/ui/card";
import { PageContainer, PageSection, PageHeader } from "../../shared/components/layout/PageContainer";
import { getModelColor, COOL_COLORS } from "../../shared/components/rankColor";
import { Cell, Pie, PieChart, ResponsiveContainer, Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { chartTooltipStyle } from "../../shared/utils/format";
import { formatShortNumber } from "../../shared/utils/format";
import { cn } from "../../shared/utils/cn";
import { useElementWidth } from "../../shared/hooks/useElementWidth";
import type { ArenaModel, ArtificialAnalysisModel } from "../../shared/types";

import { useHomeDashboardData, type HomeKpi, type HomeBarStat, type HomeToolUsage, type HomeProviderStat } from "./useHomeDashboardData";
import { SearchInput } from "./SearchInput";

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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return <StatusBarPill>{now.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</StatusBarPill>;
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
  return (
    <Card accent="top">
      <CardContent padding="md">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Provider Speed</p>
        <div className="flex flex-col gap-2.5">
          {providerStats.slice(0, 6).map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
              <span className="text-sm font-semibold font-mono ml-3 shrink-0">{p.avgSpeed.toFixed(1)} tok/s</span>
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

const ToolUsageShareDonut = memo(function ToolUsageShareDonut({ total, rows }: { total: number; rows: Array<{ name: string; value: number; share: number }> }) {
  const { t, lang } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = hoveredIndex != null ? rows[hoveredIndex] : null;

  const percent = (v: number) => v.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">{t("toolUsageShare")}</p>
      <p className="text-xs text-text-secondary -mt-1">{t("openRouterSource")}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">{t("notAvailable")}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-full max-w-[220px] aspect-square shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onMouseLeave={() => setHoveredIndex(null)} aria-label={t("toolUsageShare")}>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={68}
                  paddingAngle={1}
                  stroke="var(--bg-card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {rows.map((row, index) => (
                    <Cell
                      key={row.name}
                      fill={getModelColor(index)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {center ? (
                <>
                  <span className="text-xs font-bold leading-none text-center">{center.name}</span>
                  <span className="text-base font-bold leading-none mt-1 font-mono">{formatShortNumber(center.value)}</span>
                  <span className="text-xs text-text-secondary leading-none mt-0.5">{(center.share * 100).toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold leading-none font-mono">{formatShortNumber(total)}</span>
                  <span className="text-xs text-text-secondary leading-none mt-0.5">{t("tokens")}</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 min-w-0 flex-1">
            {rows.map((row, index) => (
              <div key={row.name} className="grid grid-cols-[10px_1fr_auto] gap-2.5 items-center min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getModelColor(index) }} />
                <span className="text-sm truncate">{row.name}</span>
                <span className="text-sm font-semibold font-mono">{percent(row.share)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const RankedStatCard = memo(function RankedStatCard({ title, source, rows }: { title: string; source: string; rows: HomeBarStat[] }) {
  const { t } = useTranslation();
  return (
    <Card accent="top">
      <CardContent padding="md">
        <p className="text-sm font-semibold mb-1">{title}</p>
        <p className="text-xs text-text-secondary mb-3">{source}</p>
        {rows.length === 0 ? (
          <p className="text-sm text-text-secondary">{t("notAvailable")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={`${row.label}-${i}`} className="flex items-center gap-3 h-6">
                <span className="text-xs font-bold w-5 text-center shrink-0" style={{ color: COOL_COLORS[i % COOL_COLORS.length] }}>
                  {i + 1}
                </span>
                <span className="text-sm truncate min-w-0 flex-1">{row.label}</span>
                <span className="text-sm font-semibold font-mono shrink-0">{row.valueLabel}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const IndexLineChart = memo(function IndexLineChart({ models }: { models: ArtificialAnalysisModel[] }) {
  const { t } = useTranslation();
  const [chartRef, chartWidth] = useElementWidth();
  const top10 = useMemo(
    () =>
      [...models]
        .filter((m) => m.intelligence_index != null)
        .sort((a, b) => (b.intelligence_index ?? 0) - (a.intelligence_index ?? 0))
        .slice(0, 10),
    [models],
  );
  const chartData = useMemo(
    () =>
      top10.map((m) => ({
        name: m.short_name || m.name.split("/").pop() || m.name,
        intelligence: m.intelligence_index ?? null,
        coding: m.coding_index ?? null,
        agentic: m.agentic_index ?? null,
      })),
    [top10],
  );
  return (
    <Card accent="top">
      <CardContent padding="md">
        <p className="text-sm font-semibold mb-3">{t("intelligenceIndex")} — Top 10</p>
        <div ref={chartRef} className="w-full h-[200px]">
          {chartWidth > 0 && top10.length > 0 && (
            <LineChart width={chartWidth} height={200} data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} stroke="var(--border)" />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                stroke="var(--border)"
                domain={[0, 100]}
                tickCount={6}
                tickFormatter={(v: number) => Math.round(v).toString()}
              />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => Math.round(Number(value))} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line type="monotone" dataKey="intelligence" name={t("intelligence")} stroke={getModelColor(0)} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
              <Line type="monotone" dataKey="coding" name={t("coding")} stroke={getModelColor(1)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
              <Line type="monotone" dataKey="agentic" name={t("agentic")} stroke={getModelColor(2)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
            </LineChart>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const StatisticsSection = memo(function StatisticsSection({
  downloadStats,
  hallucinationStats,
  toolUsageShare,
}: {
  downloadStats: HomeBarStat[];
  hallucinationStats: HomeBarStat[];
  toolUsageShare: HomeToolUsage;
}) {
  const { t } = useTranslation();
  return (
    <PageSection title={t("statistics")}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RankedStatCard title={t("openSourceDownloadsStats")} source={t("huggingFaceSource")} rows={downloadStats} />
        <RankedStatCard title={t("hallucinationStats")} source={t("hallucinationSource")} rows={hallucinationStats} />
        <div className="md:col-span-1">
          <Card accent="top" className="h-full">
            <CardContent padding="md" className="h-full">
              <ToolUsageShareDonut total={toolUsageShare.total} rows={toolUsageShare.rows} />
            </CardContent>
          </Card>
        </div>
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

      <PageHeader title="Model Observatory" description={t("artificialSource")} />
      <div className="mb-6">
        <KpiStrip kpis={kpiStrip} />
      </div>

      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <IndexLineChart models={artificialData} />
          </div>
          <div className="hidden lg:block">
            <ProviderSpeedCard providerStats={providerStats} />
          </div>
        </div>
        <div className="mt-4 lg:hidden">
          <ProviderSpeedCard providerStats={providerStats} />
        </div>
      </PageSection>

      <StatisticsSection downloadStats={downloadStats} hallucinationStats={hallucinationStats} toolUsageShare={toolUsageShare} />

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
  const { t } = useTranslation();
  useDocumentTitle("Model Observatory");
  return (
    <SuspenseQuery>
      <HomeContent />
    </SuspenseQuery>
  );
}
