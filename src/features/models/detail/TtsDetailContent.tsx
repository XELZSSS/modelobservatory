import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDollar } from "../../../shared/utils/format";
import { orNA } from "../../../shared/utils/cssConstants";
import type { TtsModel } from "../../../shared/types";
import { DetailLayout, StatGrid } from "../../../shared/components/composite/DetailLayout";

export function TtsDetailContent({ model }: { model: TtsModel }) {
  const { t } = useTranslation();
  return (
    <DetailLayout>
      <StatGrid columns={3}>
        <StatCard label={t("ttsQualityElo")} value={model.quality_elo?.toFixed(0) ?? t("notAvailable")} />
        <StatCard label={t("ttsSpeed")} value={model.speed_chars_per_sec?.toFixed(0) ?? t("notAvailable")} />
        <StatCard label={t("ttsPrice")} value={formatDollar(model.price_per_1m_chars, t)} />
      </StatGrid>
      <InfoCard title={t("modelInfo")}>
        <InfoRow compact label={t("provider")} value={orNA(model.provider, t)} />
        <InfoRow compact label={t("modelNameOrId")} value={model.name} />
      </InfoCard>
    </DetailLayout>
  );
}
