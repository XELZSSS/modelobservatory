import type { TFunction } from "../i18n";
import type { ArtificialAnalysisModel } from "../types";
import { formatBoolean, formatContext, formatCost, formatScore } from "./format";
import { normalizePercent } from "./math";

export interface CompareMetric {
  label: string;
  getValue: (model: ArtificialAnalysisModel) => string;
  getNumericValue?: (model: ArtificialAnalysisModel) => number | null | undefined;
  higherIsBetter?: boolean;
}

function scoreMetric(t: TFunction, labelKey: Parameters<TFunction>[0], getScore: (m: ArtificialAnalysisModel) => number | null | undefined): CompareMetric {
  return {
    label: t(labelKey),
    getValue: (model) => formatScore(t, getScore(model)),
    getNumericValue: getScore,
    higherIsBetter: true,
  };
}

function percentMetric(t: TFunction, labelKey: Parameters<TFunction>[0], getScore: (m: ArtificialAnalysisModel) => number | null | undefined): CompareMetric {
  return {
    label: t(labelKey),
    getValue: (model) => {
      const n = normalizePercent(getScore(model));
      if (n === null) return t("notAvailable");
      return `${n.toFixed(1)}%`;
    },
    getNumericValue: (model) => normalizePercent(getScore(model)),
    higherIsBetter: true,
  };
}

function getOutputSpeed(model: ArtificialAnalysisModel) {
  return model.speed?.median_output_speed ?? model.speed?.timescaleData?.median_output_speed;
}

function formatSpeed(t: TFunction, value?: number | null) {
  if (typeof value !== "number") return t("notAvailable");
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function buildRadarData(t: TFunction, models: ArtificialAnalysisModel[]) {
  return [
    { metric: t("intelligence"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.intelligence_index) ?? 0)) },
    { metric: t("coding"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.coding_index) ?? 0)) },
    { metric: t("agentic"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.agentic_index) ?? 0)) },
    { metric: t("gpqa"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.benchmarks?.gpqa) ?? 0)) },
    { metric: t("hle"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.benchmarks?.hle) ?? 0)) },
    { metric: t("scicode"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.benchmarks?.scicode) ?? 0)) },
    { metric: t("ifbench"), getValue: (model: ArtificialAnalysisModel) => Math.max(0, Math.min(100, normalizePercent(model.benchmarks?.ifbench) ?? 0)) },
  ].map((metric) => {
    const row: Record<string, string | number> = { metric: metric.metric };
    models.forEach((model, index) => {
      row[`model_${index}`] = Number(metric.getValue(model).toFixed(2));
    });
    return row;
  });
}

export function buildCompareMetrics(t: TFunction): CompareMetric[] {
  return [
    {
      label: t("creator"),
      getValue: (model) => model.model_creators?.name || t("notAvailable"),
    },
    {
      label: t("releaseDate"),
      getValue: (model) => model.release_date || t("notAvailable"),
    },
    {
      label: t("contextWindow"),
      getValue: (model) => formatContext(t, model),
      getNumericValue: (model) => model.context_window_tokens,
      higherIsBetter: true,
    },
    scoreMetric(t, "intelligenceIndex", (m) => m.intelligence_index),
    scoreMetric(t, "coding", (m) => m.coding_index),
    scoreMetric(t, "agentic", (m) => m.agentic_index),
    percentMetric(t, "gpqa", (m) => m.benchmarks?.gpqa),
    percentMetric(t, "hle", (m) => m.benchmarks?.hle),
    percentMetric(t, "scicode", (m) => m.benchmarks?.scicode),
    percentMetric(t, "ifbench", (m) => m.benchmarks?.ifbench),
    {
      label: t("outputSpeed"),
      getValue: (model) => formatSpeed(t, getOutputSpeed(model)),
      getNumericValue: getOutputSpeed,
      higherIsBetter: true,
    },
    {
      label: t("costToRun"),
      getValue: (model) => formatCost(t, model.pricing?.intelligence_index_cost?.total_cost),
      getNumericValue: (model) => model.pricing?.intelligence_index_cost?.total_cost,
      higherIsBetter: false,
    },
    {
      label: t("openWeights"),
      getValue: (model) => formatBoolean(t, model.is_open_weights),
    },
  ];
}
