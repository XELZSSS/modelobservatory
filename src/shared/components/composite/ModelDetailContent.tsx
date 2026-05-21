import type { ArtificialAnalysisModel } from "../../types";
import { InfoRow } from "./InfoRow";
import { StatCard } from "./StatCard";
import { InfoCard } from "./InfoCard";
import { useTranslation } from "../../i18n/useTranslation";
import { formatBoolean, formatContext, formatCost, formatPricePerMillion, formatScore } from "../../utils/format";

export function ModelDetailContent({ model }: { model: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  const pricing = model.pricing;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-1.5">
        <StatCard label={t("intelligenceIndex")} value={formatScore(t, model.intelligence_index)} />
        <StatCard label={t("coding")} value={formatScore(t, model.coding_index)} />
        <StatCard label={t("agentic")} value={formatScore(t, model.agentic_index)} />
        <StatCard label={t("costToRun")} value={formatCost(t, pricing?.intelligence_index_cost?.total_cost)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("creator")} value={model.model_creators?.name || t("notAvailable")} />
          <InfoRow compact label={t("releaseDate")} value={model.release_date || t("notAvailable")} />
          <InfoRow compact label={t("contextWindow")} value={formatContext(t, model)} />
          <InfoRow compact label={t("openWeights")} value={formatBoolean(t, model.is_open_weights)} />
        </InfoCard>
        <InfoCard title={t("pricing")}>
          <InfoRow compact label={t("promptPrice")} value={formatPricePerMillion(t, pricing?.input)} />
          <InfoRow compact label={t("completionPrice")} value={formatPricePerMillion(t, pricing?.output)} />
          <InfoRow compact label={t("blendedPrice")} value={formatPricePerMillion(t, pricing?.blended?.["7_2_1"])} />
        </InfoCard>
      </div>
    </>
  );
}
