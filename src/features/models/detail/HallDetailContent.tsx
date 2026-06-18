import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ModelDetailContent } from "../../../shared/components/composite/ModelDetailContent";
import type { HallucinationRankingEntry, ArtificialAnalysisModel } from "../../../shared/types";

export function HallDetailContent({ model, aaModel }: { model: HallucinationRankingEntry; aaModel?: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  // Values are already in percentage form (0-100) via normalizePercent in buildHallucinationRankings
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard label={t("omniscienceIndex")} value={model.omniscienceIndex.toFixed(1)} />
        <StatCard label={t("accuracy")} value={`${model.accuracy.toFixed(1)}%`} />
        <StatCard label={t("hallucinationRate")} value={`${model.hallucinationRate.toFixed(1)}%`} />
        <StatCard label={t("attemptRate")} value={`${model.attemptRate.toFixed(1)}%`} />
      </div>
      <InfoCard title={t("modelInfo")}>
        <InfoRow compact label={t("modelNameOrId")} value={model.model} />
        <InfoRow compact label="Slug" value={model.slug} />
        {aaModel?.model_creators?.name && <InfoRow compact label={t("creator")} value={aaModel.model_creators.name} />}
        {aaModel?.release_date && <InfoRow compact label={t("releaseDate")} value={aaModel.release_date} />}
      </InfoCard>
      {aaModel && (
        <>
          <p className="text-xs font-bold text-text-secondary mt-2">{t("modelDetail")}</p>
          <ModelDetailContent model={aaModel} />
        </>
      )}
    </div>
  );
}
