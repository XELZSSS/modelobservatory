import { StatCard } from "../../../components/composite/StatCard";
import { InfoCard } from "../../../components/composite/InfoCard";
import { InfoRow } from "../../../components/composite/InfoRow";
import { useTranslation } from "../../../i18n/useTranslation";
import { formatDollar, orNA } from "../../../../shared/utils/format";
import type { TtsModel } from "../../../../shared/types";
import { DetailLayout, StatGrid } from "../../../components/composite/DetailLayout";

export function TtsDetail({ model }: { model: TtsModel }) {
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