import type { ArtificialAnalysisModel } from "../../../shared/types";
import { InfoRow } from "./InfoRow";
import { StatCard } from "./StatCard";
import { InfoCard } from "./InfoCard";
import { useTranslation } from "../../i18n/useTranslation";
import { formatBoolean, formatContext, formatCost, formatPricePerMillion, formatScore, benchmarkLabel, orNA } from "../../../shared/utils/format";
import type { TFunction } from "../../../shared/i18n";
import { PRICING_BLENDS } from "../../../shared/config";
import { DetailLayout, StatGrid, InfoGrid } from "./DetailLayout";

const MODALITY_STYLES = {
  text: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  image: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  speech: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  video: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
} as const;

function ModalitySection({ label, prefix, model, t }: { label: string; prefix: "input" | "output"; model: ArtificialAnalysisModel; t: TFunction }) {
  const key = (m: string) => `${prefix}_modality_${m}` as keyof ArtificialAnalysisModel;
  return (
    <div>
      <div className="text-xs font-medium mb-2 text-text-secondary">{label}</div>
      <div className="flex gap-1.5 flex-wrap">
        {(["text", "image", "speech", "video"] as const).map((m) =>
          model[key(m)] ? (
            <span key={m} className={`px-2.5 py-0.5 text-xs font-medium rounded-md ${MODALITY_STYLES[m]}`}>
              {t(`modality${m.charAt(0).toUpperCase() + m.slice(1)}` as Parameters<TFunction>[0])}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

export function ModelDetailContent({ model }: { model: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  const pricing = model.pricing;
  return (
    <DetailLayout>
      <StatGrid columns={4}>
        <StatCard label={t("intelligenceIndex")} value={formatScore(t, model.intelligence_index)} />
        <StatCard label={t("coding")} value={formatScore(t, model.coding_index)} />
        <StatCard label={t("agentic")} value={formatScore(t, model.agentic_index)} />
        <StatCard label={t("costToRun")} value={formatCost(t, pricing?.intelligence_index_cost?.total_cost)} />
      </StatGrid>
      <InfoGrid>
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("creator")} value={orNA(model.model_creators?.name, t)} />
          <InfoRow compact label={t("releaseDate")} value={orNA(model.release_date, t)} />
          <InfoRow compact label={t("contextWindow")} value={formatContext(t, model)} />
          <InfoRow compact label={t("openWeights")} value={formatBoolean(t, model.is_open_weights)} />
        </InfoCard>
        <InfoCard title={t("pricing")}>
          <InfoRow compact label={t("promptPrice")} value={formatPricePerMillion(pricing?.input, t)} />
          <InfoRow compact label={t("completionPrice")} value={formatPricePerMillion(pricing?.output, t)} />
          <InfoRow compact label={t("blendedPrice")} value={formatPricePerMillion(pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1], t)} />
        </InfoCard>
      </InfoGrid>
      {model.benchmarks && Object.values(model.benchmarks).some((v) => v != null) && (
        <InfoCard title={t("benchmarks")}>
          <StatGrid columns={4}>
            {Object.entries(model.benchmarks).map(([key, value]) => (value == null ? null : <StatCard key={key} label={benchmarkLabel(key, t)} value={formatScore(t, value)} />))}
          </StatGrid>
        </InfoCard>
      )}
      <InfoCard title={t("modalities")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalitySection label={t("inputModality")} prefix="input" model={model} t={t} />
          <ModalitySection label={t("outputModality")} prefix="output" model={model} t={t} />
        </div>
      </InfoCard>
    </DetailLayout>
  );
}