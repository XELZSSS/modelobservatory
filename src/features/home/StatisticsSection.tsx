import { Card, CardContent } from "../../shared/components/ui/card";
import { BarStatsCard } from "../../shared/components/data/BarStatsCard";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { ToolUsageShareDonut } from "./ToolUsageShareDonut";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HomeBarStat, HomeToolUsage } from "./useHomeDashboardData";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr] gap-4">
        <BarStatsCard title={t("openSourceDownloadsStats")} source={t("huggingFaceSource")} rows={downloadStats} />
        <BarStatsCard title={t("hallucinationStats")} source={t("hallucinationSource")} rows={hallucinationStats} />
        <Card className="hidden md:block md:order-3">
          <CardContent>
            <ToolUsageShareDonut total={toolUsageShare.total} rows={toolUsageShare.rows} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
