import type { ArtificialAnalysisModel } from "../../types";
import { InfoRow } from "./InfoRow";
import { StatCard } from "./StatCard";
import { InfoCard } from "./InfoCard";
import { useTranslation } from "../../i18n/useTranslation";
import { formatBoolean, formatContext, formatCost, formatPricePerMillion, formatScore, benchmarkLabel } from "../../utils/format";
import { secondaryTextClass, orNA } from "../../utils/cssConstants";
import type { TFunction } from "../../i18n";

const MODALITY_STYLES = { text: "bg-green-100 text-green-800", image: "bg-blue-100 text-blue-800", speech: "bg-purple-100 text-purple-800", video: "bg-orange-100 text-orange-800" } as const;

function ModalitySection({ label, prefix, model, t }: { label: string; prefix: "input" | "output"; model: ArtificialAnalysisModel; t: TFunction }) {
  const key = (m: string) => `${prefix}_modality_${m}` as keyof ArtificialAnalysisModel;
  return (
    <div>
      <div className={`text-xs font-medium mb-1 ${secondaryTextClass}`}>{label}</div>
      <div className="flex gap-1.5">
        {(["text", "image", "speech", "video"] as const).map((m) =>
          model[key(m)] ? <span key={m} className={`px-2 py-0.5 text-xs rounded ${MODALITY_STYLES[m]}`}>{t(`modality${m.charAt(0).toUpperCase() + m.slice(1)}` as Parameters<TFunction>[0])}</span> : null,
        )}
      </div>
    </div>
  );
}

export function ModelDetailContent({ model }: { model: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  const pricing = model.pricing;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard label={t("intelligenceIndex")} value={formatScore(t, model.intelligence_index)} />
        <StatCard label={t("coding")} value={formatScore(t, model.coding_index)} />
        <StatCard label={t("agentic")} value={formatScore(t, model.agentic_index)} />
        <StatCard label={t("costToRun")} value={formatCost(t, pricing?.intelligence_index_cost?.total_cost)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("creator")} value={orNA(model.model_creators?.name, t)} />
          <InfoRow compact label={t("releaseDate")} value={orNA(model.release_date, t)} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(model.benchmarks).map(([key, value]) =>
              value == null ? null : <StatCard key={key} label={benchmarkLabel(key, t)} value={formatScore(t, value)} />,
            )}
          </div>
        </InfoCard>
      )}
      <InfoCard title={t("modalities")}>
        <div className="grid grid-cols-2 gap-2">
          <ModalitySection label={t("inputModality")} prefix="input" model={model} t={t} />
          <ModalitySection label={t("outputModality")} prefix="output" model={model} t={t} />
        </div>
      </InfoCard>
    </div>
  );
}
