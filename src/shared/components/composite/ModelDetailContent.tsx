import type { ArtificialAnalysisModel } from "../../types";
import { InfoRow } from "./InfoRow";
import { StatCard } from "./StatCard";
import { InfoCard } from "./InfoCard";
import { useTranslation } from "../../i18n/useTranslation";
import { formatBoolean, formatContext, formatCost, formatPricePerMillion, formatScore } from "../../utils/format";
import { secondaryTextClass } from "../../utils/cssConstants";

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
      {model.benchmarks && Object.values(model.benchmarks).some(v => v != null) && (
        <InfoCard title={t("benchmarks")}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {Object.entries(model.benchmarks).map(([key, value]) => {
              if (value == null) return null;
              const camelKey = key.split("_").map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join("");
              const labelKey = `benchmark${camelKey.charAt(0).toUpperCase() + camelKey.slice(1)}` as Parameters<typeof t>[0];
              return (
                <StatCard key={key} label={t(labelKey)} value={formatScore(t, value)} />
              );
            })}
          </div>
        </InfoCard>
      )}
      <InfoCard title={t("modalities")}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={`text-xs font-medium mb-1 ${secondaryTextClass}`}>{t("inputModality")}</div>
            <div className="flex gap-1.5">
              {model.input_modality_text && <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">{t("modalityText")}</span>}
              {model.input_modality_image && <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">{t("modalityImage")}</span>}
              {model.input_modality_speech && <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">{t("modalitySpeech")}</span>}
              {model.input_modality_video && <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-800">{t("modalityVideo")}</span>}
            </div>
          </div>
          <div>
            <div className={`text-xs font-medium mb-1 ${secondaryTextClass}`}>{t("outputModality")}</div>
            <div className="flex gap-1.5">
              {model.output_modality_text && <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">{t("modalityText")}</span>}
              {model.output_modality_image && <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">{t("modalityImage")}</span>}
              {model.output_modality_speech && <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">{t("modalitySpeech")}</span>}
              {model.output_modality_video && <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-800">{t("modalityVideo")}</span>}
            </div>
          </div>
        </div>
      </InfoCard>
    </>
  );
}
