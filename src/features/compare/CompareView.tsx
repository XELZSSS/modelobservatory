import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Gamepad2, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from "recharts";
import { Button } from "../../shared/components/ui/button";
import { Card, CardContent } from "../../shared/components/ui/card";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { BackButton } from "../../shared/components/composite/BackButton";
import { secondaryTextClass, numberTextClass, chartTooltipStyle, textSecondaryClass } from "../../shared/utils/cssConstants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n";
import { useCompareStore } from "../../shared/stores/compareStore";
import { buildCompareMetrics, buildRadarData } from "../../shared/utils/compareMetrics";
import { useElementWidth } from "../../shared/hooks/useElementWidth";
import { getModelColor } from "../../shared/components/rankColor";
import { useArtificialRankings } from "../../shared/hooks/useQueries";
import { modelId } from "../../shared/utils/modelId";
import type { ArtificialAnalysisModel } from "../../shared/types";
import type { CompareMetric } from "../../shared/utils/compareMetrics";
import { approxEq } from "../../shared/utils/math";

function getWinnerStatus(value: number | null | undefined, metric: CompareMetric, models: ArtificialAnalysisModel[]): "win" | "loss" | null {
  if (value == null) return null;
  const values = models.map((m) => metric.getNumericValue?.(m)).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (values.length === 0) return null;
  const best = metric.higherIsBetter === false ? Math.min(...values) : Math.max(...values);
  const worst = metric.higherIsBetter === false ? Math.max(...values) : Math.min(...values);
  // Use tolerance comparison: best/worst come from Math.min/max over possibly-computed
  // floats (e.g. intelligence/blended), and `value` may be the same computation rendered
  // with ULP drift, so strict === misses legitimate ties. Check best first so that when
  // all values are (nearly) equal, the row is flagged as a win rather than a loss.
  if (approxEq(value, best)) return "win";
  if (approxEq(value, worst)) return "loss";
  return null;
}

const MetricValueDisplay = memo(function MetricValueDisplay({
  value,
  winner,
  iconSize = 12,
  className = "",
}: {
  value: string;
  winner: "win" | "loss" | null;
  iconSize?: number;
  className?: string;
}) {
  const winnerColor = winner === "win" ? "#10b981" : winner === "loss" ? "var(--destructive)" : undefined;

  return (
    <span className={`${numberTextClass} ${winner === "win" ? "font-bold" : ""} ${className}`} style={winnerColor ? { color: winnerColor } : undefined}>
      {value}
      {winner === "win" && <TrendingUp size={iconSize} className="inline ml-1" style={{ color: "#10b981" }} />}
      {winner === "loss" && <TrendingDown size={iconSize} className="inline ml-1" style={{ color: "var(--destructive)" }} />}
    </span>
  );
});

const ModelMetricRow = memo(function ModelMetricRow({
  model,
  index,
  metric,
  models,
  iconSize = 12,
  className = "",
}: {
  model: ArtificialAnalysisModel;
  index: number;
  metric: CompareMetric;
  models: ArtificialAnalysisModel[];
  iconSize?: number;
  className?: string;
}) {
  const numeric = metric.getNumericValue?.(model) ?? null;
  const winner = getWinnerStatus(numeric, metric, models);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs truncate" style={{ color: getModelColor(index) }}>
        {model.short_name || model.name}
      </span>
      <MetricValueDisplay value={metric.getValue(model)} winner={winner} iconSize={iconSize} className={className} />
    </div>
  );
});

const CompactMetricCards = memo(function CompactMetricCards({ metrics, models }: { metrics: CompareMetric[]; models: ArtificialAnalysisModel[] }) {
  return (
    <div className="flex flex-col gap-2">
      {metrics.map((metric, mIndex) => (
        <Card key={mIndex}>
          <CardContent className="p-3">
            <p className="text-xs font-bold text-text-secondary mb-2">{metric.label}</p>
            <div className="flex flex-col gap-1">
              {models.map((model, index) => (
                <ModelMetricRow key={models[index]?.id ?? index} model={model} index={index} metric={metric} models={models} iconSize={10} className="text-xs font-mono" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

const MetricTable = memo(function MetricTable({ metrics, models, t }: { metrics: CompareMetric[]; models: ArtificialAnalysisModel[]; t: TFunction }) {
  return (
    <div className="min-w-0 w-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-2 py-2 font-bold text-text-secondary">{t("metric")}</th>
            {models.map((model, index) => (
              <th key={models[index]?.id ?? index} className="text-right px-2 py-2 font-bold" style={{ color: getModelColor(index) }}>
                {model.short_name || model.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, mIndex) => (
            <tr key={mIndex} className="border-b border-border last:border-b-0">
              <td className="px-2 py-2 text-text-secondary">{metric.label}</td>
              {models.map((model, index) => {
                const numeric = metric.getNumericValue?.(model) ?? null;
                const winner = getWinnerStatus(numeric, metric, models);
                return (
                  <td key={models[index]?.id ?? index} className="px-2 py-2 text-right">
                    <MetricValueDisplay value={metric.getValue(model)} winner={winner} iconSize={12} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export function CompareView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const compareIds = useCompareStore((s) => s.compareIds);
  const removeCompareModel = useCompareStore((s) => s.removeCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const rankingsQ = useArtificialRankings();
  const models = useMemo(() => {
    if (!rankingsQ.data) return [];
    return compareIds.map((id) => rankingsQ.data!.find((m) => modelId(m) === id)).filter((m): m is ArtificialAnalysisModel => !!m);
  }, [compareIds, rankingsQ.data]);
  const [radarRef, radarWidth] = useElementWidth();
  const radarSize = Math.max(100, Math.min(radarWidth - 16, 500));

  const metrics = useMemo(() => buildCompareMetrics(t), [t]);
  const radarData = useMemo(() => buildRadarData(t, models), [models, t]);

  if (models.length < 2) {
    return (
      <div className="flex flex-col gap-4 items-center py-8">
        <p className={textSecondaryClass}>{t("compareNeedsTwo")}</p>
        <Button size="sm" variant="outline" onClick={() => navigate("/models")}>
          {t("backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <BackButton labelKey="backToModelRankings" to="/models" />
      <SectionHeader title={t("modelComparison")} />
      <p className={secondaryTextClass}>{t("artificialSource")}</p>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {models.map((model) => (
            <span key={modelId(model)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-tertiary border border-border">
              <span className="text-sm font-medium truncate max-w-[120px]">{model.short_name || model.name}</span>
              <Button variant="ghost" size="icon" onClick={() => removeCompareModel(model)} className="shrink-0" aria-label={`${t("remove")} ${model.short_name || model.name}`}>
                <X size={14} />
              </Button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate("/models")}>
            <Gamepad2 size={14} /> {t("addModel")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearCompare();
              navigate("/models");
            }}
          >
            <Trash2 size={14} /> {t("clear")}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
          <div ref={radarRef} className="hidden md:flex min-w-0 w-full md:w-1/2 items-center justify-center">
            <RadarChart width={radarSize} height={320} data={radarData} outerRadius={140} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              {models.map((model, index) => (
                <Radar
                  key={modelId(model) || index}
                  name={model.short_name || model.name}
                  dataKey={`model_${index}`}
                  stroke={getModelColor(index)}
                  fill={getModelColor(index)}
                  fillOpacity={0.08}
                  isAnimationActive={false}
                />
              ))}
              <Tooltip contentStyle={chartTooltipStyle} />
            </RadarChart>
          </div>
          <div className="min-w-0 w-full md:w-1/2 flex items-center">
            <div className="md:hidden w-full">
              <CompactMetricCards metrics={metrics} models={models} />
            </div>
            <div className="hidden md:block w-full">
              <MetricTable metrics={metrics} models={models} t={t} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
