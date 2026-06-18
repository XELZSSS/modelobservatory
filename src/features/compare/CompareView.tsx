import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from "recharts";
import { Button } from "../../shared/components/ui/button";
import { Card, CardContent } from "../../shared/components/ui/card";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { BackButton } from "../../shared/components/composite/BackButton";
import { CompareChipBar } from "../../shared/components/composite/CompareChipBar";
import { secondaryTextClass, numberTextClass, chartTooltipStyle, textSecondaryClass } from "../../shared/utils/cssConstants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n";
import { useCompareStore } from "../../shared/stores/compareStore";
import { buildCompareMetrics, buildRadarData } from "../../shared/utils/compareMetrics";
import { useElementWidth } from "../../shared/hooks/useElementWidth";
import { getModelColor } from "../../shared/components/rankColor";
import { useCompareModels } from "../../shared/hooks/useCompareModels";
import { modelId } from "../../shared/utils/modelId";
import type { ArtificialAnalysisModel } from "../../shared/types";
import type { CompareMetric } from "../../shared/utils/compareMetrics";
import { approxEq } from "../../shared/utils/math";

function computeMetricWinners(metric: CompareMetric, models: ArtificialAnalysisModel[]): Map<string, "win" | "loss"> {
  const values = models.map((m) => ({ id: modelId(m), val: metric.getNumericValue?.(m) })).filter((v): v is { id: string; val: number } => typeof v.val === "number" && Number.isFinite(v.val));
  if (values.length === 0) return new Map();
  const best = metric.higherIsBetter === false ? Math.min(...values.map((v) => v.val)) : Math.max(...values.map((v) => v.val));
  const worst = metric.higherIsBetter === false ? Math.max(...values.map((v) => v.val)) : Math.min(...values.map((v) => v.val));
  const map = new Map<string, "win" | "loss">();
  for (const { id, val } of values) {
    if (approxEq(val, best)) map.set(id, "win");
    else if (approxEq(val, worst)) map.set(id, "loss");
  }
  return map;
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

interface ModelMetricRowProps {
  model: ArtificialAnalysisModel;
  index: number;
  metric: CompareMetric;
  winners: Map<string, "win" | "loss">;
  iconSize?: number;
  className?: string;
}

const ModelMetricRow = memo(function ModelMetricRow({ model, index, metric, winners, iconSize = 12, className = "" }: ModelMetricRowProps) {
  const winner = winners.get(modelId(model)) ?? null;
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
      {metrics.map((metric, mIndex) => {
        const winners = computeMetricWinners(metric, models);
        return (
          <Card key={mIndex}>
            <CardContent className="p-3">
              <p className="text-xs font-bold text-text-secondary mb-2">{metric.label}</p>
              <div className="flex flex-col gap-1">
                {models.map((model, index) => (
                  <ModelMetricRow key={modelId(model) || index} model={model} index={index} metric={metric} winners={winners} iconSize={10} className="text-xs font-mono" />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
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
              <th key={modelId(model) || index} className="text-right px-2 py-2 font-bold" style={{ color: getModelColor(index) }}>
                {model.short_name || model.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, mIndex) => {
            const winners = computeMetricWinners(metric, models);
            return (
              <tr key={mIndex} className="border-b border-border last:border-b-0">
                <td className="px-2 py-2 text-text-secondary">{metric.label}</td>
                {models.map((model, index) => (
                  <td key={modelId(model) || index} className="px-2 py-2 text-right">
                    <MetricValueDisplay value={metric.getValue(model)} winner={winners.get(modelId(model)) ?? null} iconSize={12} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export function CompareView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const removeCompareModel = useCompareStore((s) => s.removeCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const models = useCompareModels();
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

      <CompareChipBar
        models={models}
        onRemove={removeCompareModel}
        onAdd={() => navigate("/models")}
        onClear={() => {
          clearCompare();
          navigate("/models");
        }}
        addLabel={t("addModel")}
      />

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
              <CompactMetricCards metrics={metrics.filter((m) => m.mobileKey)} models={models} />
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
