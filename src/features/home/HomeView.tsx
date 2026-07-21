import { memo, useMemo, useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings, useSuspenseHomeDashboard, useHallucinationRankings, useSuspenseHealthStatus, useSystemStats } from "../../shared/hooks/useApiQuery";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { PredictionsSection } from "../../shared/components/data/PredictionCards";
import { StatCard } from "../../shared/components/composite/StatCard";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { InfoRow } from "../../shared/components/composite/InfoRow";
import { Card, CardContent } from "../../shared/components/ui/card";
import { getModelColor, COOL_COLORS } from "../../shared/components/rankColor";
import { Cell, Pie, PieChart, ResponsiveContainer, Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { numberTextClass, secondaryTextClass, textSecondaryClass, chartTooltipStyle } from "../../shared/utils/cssConstants";
import { formatShortNumber } from "../../shared/utils/format";
import { cn } from "../../shared/utils/cn";
import { useElementWidth } from "../../shared/hooks/useElementWidth";
import type { ArenaModel, ArtificialAnalysisModel } from "../../shared/types";

import { useHomeDashboardData, type HomeKpi, type HomeBarStat, type HomeToolUsage, type HomeProviderStat } from "./useHomeDashboardData";
import { SearchInput } from "./SearchInput";

const StatusBarPill = memo(function StatusBarPill({ children }: { children: ReactNode }) {
  return <div className="flex items-center px-1.5 py-[3px] border border-border rounded-md bg-bg-primary"><span className={cn(textSecondaryClass, "whitespace-nowrap tabular-nums")}>{children}</span></div>;
});

function UptimeDisplay() {
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
  return <StatusBarPill>{t("uptime")}: {fmt(uptime)}</StatusBarPill>;
}

const ClockDisplay = memo(function ClockDisplay() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  return <StatusBarPill>{now.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</StatusBarPill>;
});

const KpiStrip = memo(function KpiStrip({ kpis }: { kpis: HomeKpi[] }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-2.5">{kpis.map((kpi, i) => <div key={kpi.label} className={cn(i >= 2 && "hidden sm:block")}><StatCard icon={kpi.Icon} label={kpi.label} value={kpi.value} /></div>)}</div>;
});

function ProviderSpeedCard({ providerStats }: { providerStats: HomeProviderStat[] }) {
  return <Card className="h-fit"><CardContent className="p-4"><div className="flex flex-col gap-3">{providerStats.slice(0, 6).map((p) => <div key={p.name} className="flex items-center justify-between"><div className="flex items-center gap-2.5 min-w-0"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} /><span className="text-sm font-medium truncate">{p.name}</span></div><span className="text-sm font-mono font-semibold ml-3 shrink-0">{p.avgSpeed.toFixed(1)} tok/s</span></div>)}</div></CardContent></Card>;
}

const ArenaT2ICard = memo(function ArenaT2ICard({ entry, rank, color }: { entry: ArenaModel; rank: number; color: string }) {
  const { t } = useTranslation();
  return <Card><CardContent className="min-h-[132px] p-3 last:pb-3"><div className="flex flex-col gap-3 h-full justify-between"><div className="flex flex-row gap-2 items-start justify-between min-w-0"><div className="flex flex-row gap-1.5 items-center min-w-0"><span className="w-[3px] h-5 shrink-0" style={{ backgroundColor: color }} /><p className="text-base truncate min-w-0 font-bold">{entry.model}</p></div><span className="text-sm font-extrabold shrink-0" style={{ color }}>#{rank}</span></div><hr className="border-t border-border" /><div className="flex flex-col gap-1.5"><InfoRow label={t("eloScore")} value={<span style={{ color, fontWeight: 700 }}>{entry.score != null ? entry.score.toFixed(0) : t("notAvailable")}</span>} /><InfoRow label={t("votes")} value={entry.votes != null ? entry.votes.toLocaleString() : t("notAvailable")} /><InfoRow label={t("license")} value={entry.license || t("notAvailable")} /></div></div></CardContent></Card>;
});

function ArenaT2ISection({ models }: { models: ArenaModel[] }) {
  const { t } = useTranslation();
  if (models.length === 0) return null;
  return <div><SectionHeader title={t("textToImage")} meta={t("arenaAISource")} /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">{models.slice(0, 8).map((entry, index) => <div key={entry.model} className={cn(index >= 2 && "hidden sm:block")}><ArenaT2ICard entry={entry} rank={index + 1} color={getModelColor(index)} /></div>)}</div></div>;
}

function ToolUsageShareDonut({ total, rows }: { total: number; rows: Array<{ name: string; value: number; share: number }> }) {
  const { t, lang } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = hoveredIndex != null ? rows[hoveredIndex] : null;

  const percent = (v: number) =>
    v.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-[1px]">
        <p className="text-sm font-bold">{t("toolUsageShare")}</p>
        <p className={secondaryTextClass}>{t("openRouterSource")}</p>
      </div>
      {rows.length === 0 ? (
        <p className={textSecondaryClass}>{t("notAvailable")}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full max-w-[240px] aspect-square shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onMouseLeave={() => setHoveredIndex(null)} aria-label={t("toolUsageShare")}>
                <Pie data={rows} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72} paddingAngle={0}
                  stroke="var(--bg-secondary)" strokeWidth={1} isAnimationActive={false}
                >
                  {rows.map((row, index) => (
                    <Cell key={row.name} fill={getModelColor(index)}
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
                  <span className={cn("text-sm font-bold leading-none text-center", numberTextClass)}>{center.name}</span>
                  <span className={cn("text-base font-bold leading-none mt-1.5", numberTextClass)}>{formatShortNumber(center.value)}</span>
                  <span className={cn(textSecondaryClass, "leading-none mt-0.5")}>{(center.share * 100).toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <span className={cn("text-base font-bold leading-none", numberTextClass)}>{formatShortNumber(total)}</span>
                  <span className={cn(textSecondaryClass, "leading-none mt-0.5")}>{t("tokens")}</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 min-w-0 flex-1">
            {rows.map((row, index) => (
              <div key={row.name} className="grid grid-cols-[12px_1fr_auto] gap-2 items-center min-w-0">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: getModelColor(index) }} />
                <span className="text-sm truncate">{row.name}</span>
                <span className="text-sm font-mono font-semibold">{percent(row.share)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RankedStatCard({ title, source, rows }: { title: string; source: string; rows: HomeBarStat[] }) {
  const { t } = useTranslation();
  return <Card><CardContent><div className="flex flex-col gap-0.5 mb-2"><p className="text-sm font-bold">{title}</p><p className={secondaryTextClass}>{source}</p></div>{rows.length === 0 ? <p className={textSecondaryClass}>{t("notAvailable")}</p> : <div className="flex flex-col gap-2">{rows.map((row, i) => <div key={`${row.label}-${i}`} className="flex items-center gap-3 h-[26px]"><span className="text-xs font-bold w-5 text-center shrink-0" style={{ color: COOL_COLORS[i % COOL_COLORS.length] }}>{i + 1}</span><span className="text-sm truncate min-w-0 flex-1">{row.label}</span><span className={cn("text-sm font-bold shrink-0", numberTextClass)}>{row.valueLabel}</span></div>)}</div>}</CardContent></Card>;
}

function IndexLineChart({ models }: { models: ArtificialAnalysisModel[] }) {
  const { t } = useTranslation();
  const [chartRef, chartWidth] = useElementWidth();
  const top10 = useMemo(() => [...models].filter((m) => m.intelligence_index != null).sort((a, b) => (b.intelligence_index ?? 0) - (a.intelligence_index ?? 0)).slice(0, 10), [models]);
  const chartData = useMemo(() => top10.map((m) => ({ name: m.short_name || m.name.split("/").pop() || m.name, intelligence: m.intelligence_index ?? null, coding: m.coding_index ?? null, agentic: m.agentic_index ?? null })), [top10]);
  return <Card><CardContent><div ref={chartRef} className="w-full h-[180px] overflow-hidden">{chartWidth > 0 && top10.length > 0 && <LineChart width={chartWidth} height={180} data={chartData} margin={{ top: 2, right: 8, bottom: 2, left: 0 }}><CartesianGrid stroke="var(--border)" /><XAxis dataKey="name" tick={false} stroke="var(--border)" /><YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} stroke="var(--border)" domain={[0, 100]} tickCount={6} tickFormatter={(v: number) => Math.round(v).toString()} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => Math.round(Number(value))} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Line type="monotone" dataKey="intelligence" name={t("intelligence")} stroke={getModelColor(0)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} /><Line type="monotone" dataKey="coding" name={t("coding")} stroke={getModelColor(1)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} /><Line type="monotone" dataKey="agentic" name={t("agentic")} stroke={getModelColor(2)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} /></LineChart>}</div></CardContent></Card>;
}

function StatisticsSection({ downloadStats, hallucinationStats, toolUsageShare }: { downloadStats: HomeBarStat[]; hallucinationStats: HomeBarStat[]; toolUsageShare: HomeToolUsage }) {
  const { t } = useTranslation();
  return <><SectionHeader title={t("statistics")} /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><RankedStatCard title={t("openSourceDownloadsStats")} source={t("huggingFaceSource")} rows={downloadStats} /><RankedStatCard title={t("hallucinationStats")} source={t("hallucinationSource")} rows={hallucinationStats} /><Card className="hidden sm:block"><CardContent><ToolUsageShareDonut total={toolUsageShare.total} rows={toolUsageShare.rows} /></CardContent></Card></div></>;
}

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
          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${healthyCount === totalCount ? "bg-success" : "bg-destructive"}`} />
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
  const { t } = useTranslation();
  useEffect(() => { document.title = "Model Observatory"; }, []);
  return (
    <SuspenseQuery>
      <HomeContent />
    </SuspenseQuery>
  );
}
