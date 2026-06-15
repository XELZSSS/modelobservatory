import { memo, useState, useEffect, type ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../shared/components/ui/card";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSystemStats } from "../../shared/hooks/useQueries";
import { getModelColor } from "../../shared/components/rankColor";
import { InfoRow } from "../../shared/components/composite/InfoRow";
import { numberTextClass, secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { formatShortNumber } from "../../shared/utils/format";
import type { ArenaModel } from "../../shared/types";
import { StatCard } from "../../shared/components/composite/StatCard";

export { StatCard as KpiCard };

export function ToolUsageShareDonut({ total, rows }: { total: number; rows: Array<{ name: string; value: number; share: number }> }) {
  const { t, lang } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = hoveredIndex != null ? rows[hoveredIndex] : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-[1px]">
        <p className="text-sm font-bold">{t("toolUsageShare")}</p>
        <p className={secondaryTextClass}>{t("openRouterSource")}</p>
      </div>
      {rows.length === 0 ? (
        <p className={textSecondaryClass}>{t("notAvailable")}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-5 items-center">
          <div className="relative size-60 shrink-0">
            <ResponsiveContainer width={240} height={240}>
              <PieChart onMouseLeave={() => setHoveredIndex(null)} aria-label={t("toolUsageShare")}>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={0}
                  stroke="var(--bg-secondary)"
                  strokeWidth={1}
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
                  <span className={`text-sm font-bold leading-none text-center ${numberTextClass}`}>{center.name}</span>
                  <span className={`text-xl font-bold leading-none mt-2 ${numberTextClass}`}>{formatShortNumber(center.value)}</span>
                  <span className={`${textSecondaryClass} leading-none mt-1`}>{(center.share * 100).toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <span className={`text-xl font-bold leading-none ${numberTextClass}`}>{formatShortNumber(total)}</span>
                  <span className={`${textSecondaryClass} leading-none mt-1`}>{t("tokens")}</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2.5 min-w-0 flex-1">
            {rows.map((row, index) => {
              const percent = row.share.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
              return (
                <div key={row.name} className="grid grid-cols-[12px_1fr_auto] gap-2 items-center min-w-0">
                  <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: getModelColor(index) }} />
                  <span className="text-sm truncate text-text-primary">{row.name}</span>
                  <span className={`text-sm font-bold text-right ${numberTextClass}`}>{percent}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const StatusBarPill = memo(function StatusBarPill({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-1.5 py-[3px] border border-border rounded-md bg-bg-primary">
      <span className={`${textSecondaryClass} whitespace-nowrap tabular-nums`}>{children}</span>
    </div>
  );
});

export function UptimeDisplay() {
  const { t } = useTranslation();
  const statsQ = useSystemStats();
  const uptime = statsQ.data?.uptime ?? 0;

  function fmtUptime(s: number): string {
    if (s < 60) return t("uptimeSeconds", { value: Math.round(s) });
    if (s < 3600) return t("uptimeMinutes", { value: Math.floor(s / 60), value2: Math.round(s % 60) });
    if (s < 86400) return t("uptimeHours", { value: Math.floor(s / 3600), value2: Math.floor((s % 3600) / 60) });
    return t("uptimeDays", { value: Math.floor(s / 86400), value2: Math.floor((s % 86400) / 3600) });
  }

  if (uptime <= 0) return null;

  return (
    <StatusBarPill>
      {t("uptime")}: {fmtUptime(uptime)}
    </StatusBarPill>
  );
}

export const ClockDisplay = memo(function ClockDisplay() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const text = now.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  return <StatusBarPill>{text}</StatusBarPill>;
});

export const ArenaT2ICard = memo(function ArenaT2ICard({ entry, rank, color }: { entry: ArenaModel; rank: number; color: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="min-h-[132px] p-3 last:pb-3">
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="flex flex-row gap-2 items-start justify-between min-w-0">
            <div className="flex flex-row gap-1.5 items-center min-w-0">
              <span className="w-[3px] h-5 shrink-0" style={{ backgroundColor: color }} />
              <p className="text-base truncate min-w-0 font-bold">{entry.model}</p>
            </div>
            <span className="text-sm font-extrabold shrink-0" style={{ color }}>
              #{rank}
            </span>
          </div>
          <hr className="border-t border-border" />
          <div className="flex flex-col gap-1.5">
            <InfoRow label={t("eloScore")} value={<span style={{ color, fontWeight: 700 }}>{entry.score != null ? entry.score.toFixed(0) : t("notAvailable")}</span>} />
            <InfoRow label={t("votes")} value={entry.votes != null ? entry.votes.toLocaleString() : t("notAvailable")} />
            <InfoRow label={t("license")} value={entry.license || t("notAvailable")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
