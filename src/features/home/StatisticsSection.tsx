import { Card, CardContent } from "../../shared/components/ui/card";
import { BarStatsCard } from "../../shared/components/data/BarStatsCard";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { ToolUsageShareDonut } from "./ToolUsageShareDonut";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COOL_COLORS } from "../../shared/components/rankColor";
import { numberTextClass, secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import type { HomeBarStat, HomeToolUsage } from "./useHomeDashboardData";

function RankedStatCard({ title, source, rows }: { title: string; source: string; rows: HomeBarStat[] }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-0.5 mb-2">
          <p className="text-sm font-bold">{title}</p>
          <p className={secondaryTextClass}>{source}</p>
        </div>
        {rows.length === 0 ? (
          <p className={textSecondaryClass}>{t("notAvailable")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={`${row.label}-${i}`} className="flex items-center gap-3 h-[26px]">
                <span className="text-xs font-bold w-5 text-center shrink-0" style={{ color: COOL_COLORS[i % COOL_COLORS.length] }}>{i + 1}</span>
                <span className="text-sm truncate min-w-0 flex-1">{row.label}</span>
                <span className={`text-sm font-bold shrink-0 ${numberTextClass}`}>{row.valueLabel}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatisticsSectionProps {
  downloadStats: HomeBarStat[];
  hallucinationStats: HomeBarStat[];
  toolUsageShare: HomeToolUsage;
}

export function StatisticsSection({ downloadStats, hallucinationStats, toolUsageShare }: StatisticsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionHeader title={t("statistics")} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RankedStatCard title={t("openSourceDownloadsStats")} source={t("huggingFaceSource")} rows={downloadStats} />
        <BarStatsCard title={t("hallucinationStats")} source={t("hallucinationSource")} rows={hallucinationStats} />
        <Card className="hidden md:block">
          <CardContent>
            <ToolUsageShareDonut total={toolUsageShare.total} rows={toolUsageShare.rows} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
