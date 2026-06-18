import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDollar } from "../../../shared/utils/format";
import type { TtsModel } from "../../../shared/types";

export function TtsDetailContent({ model }: { model: TtsModel }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={t("ttsQualityElo")} value={model.quality_elo?.toFixed(0) ?? t("notAvailable")} />
        <StatCard label={t("ttsSpeed")} value={model.speed_chars_per_sec?.toFixed(0) ?? t("notAvailable")} />
        <StatCard label={t("ttsPrice")} value={formatDollar(model.price_per_1m_chars, t)} />
      </div>
      <InfoCard title={t("modelInfo")}>
        <InfoRow compact label={t("provider")} value={model.provider || t("notAvailable")} />
        <InfoRow compact label={t("modelNameOrId")} value={model.name} />
      </InfoCard>
    </div>
  );
}
