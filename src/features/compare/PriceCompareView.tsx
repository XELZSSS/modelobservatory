import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useElementWidth } from "../../shared/hooks/useElementWidth";
import { Card, CardContent } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
import { secondaryTextClass, winnerPriceClass, chartTooltipStyle } from "../../shared/utils/cssConstants";
import { cn } from "../../shared/utils/cn";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDollar } from "../../shared/utils/format";
import { getModelColor } from "../../shared/components/rankColor";
import { calcModelCost } from "../../shared/utils/costCalc";
import { approxEq } from "../../shared/utils/math";
import type { ArtificialAnalysisModel } from "../../shared/types";
import { buildPriceRows, getBestPrice, WinnerMark, PriceTableDesktop, PriceCardsMobile, EfficiencyTableDesktop, EfficiencyCardsMobile } from "./PriceComponents";
import { ComparePageLayout } from "./ComparePageLayout";

export function PriceCompareView() {
  const { t } = useTranslation();
  const [chartRef, chartWidth] = useElementWidth();

  return (
    <ComparePageLayout
      backLabelKey="backToPricing" backTo="/models"
      backState={{ viewMode: "pricing" }}
      title={t("priceComparison")}
    >
      {(models) => <PriceCompareContent models={models} chartRef={chartRef} chartWidth={chartWidth} />}
    </ComparePageLayout>
  );
}

function PriceCompareContent({ models, chartRef, chartWidth }: { models: ArtificialAnalysisModel[]; chartRef: React.RefObject<HTMLDivElement | null>; chartWidth: number }) {
  const { t } = useTranslation();

  const [promptTokens, setPromptTokens] = useState("10");
  const [completionTokens, setCompletionTokens] = useState("5");

  const priceRows = useMemo(() => buildPriceRows(t), [t]);
  const bestPrices = useMemo(() => getBestPrice(priceRows, models), [priceRows, models]);

  const costEfficiency = useMemo(() => {
    return models.map((model) => {
      const intelligence = model.intelligence_index;
      const blended = model.pricing?.blended?.["7_2_1"];
      if (intelligence == null || blended == null || blended === 0) return null;
      return intelligence / blended;
    });
  }, [models]);

  const bestEfficiency = useMemo(() => {
    const valid = costEfficiency.filter((v): v is number => v !== null);
    return valid.length > 0 ? Math.max(...valid) : null;
  }, [costEfficiency]);

  const calcPrompt = Math.max(0, Number(promptTokens) || 0);
  const calcCompletion = Math.max(0, Number(completionTokens) || 0);

  const monthlyCosts = useMemo(() => {
    return models.map((model) => calcModelCost(model, calcPrompt * 1_000_000, calcCompletion * 1_000_000));
  }, [models, calcPrompt, calcCompletion]);

  const bestMonthlyCost = useMemo(() => {
    const valid = monthlyCosts.filter((v): v is number => v !== null);
    return valid.length > 0 ? Math.min(...valid) : null;
  }, [monthlyCosts]);

  const chartData = useMemo(() => {
    return priceRows.map((row) => {
      const entry: Record<string, string | number> = { name: row.label };
      models.forEach((model, index) => {
        const v = row.getValue(model);
        entry[`model_${index}`] = typeof v === "number" ? v : 0;
      });
      return entry;
    });
  }, [priceRows, models]);

  return (
    <>
      {/* Price breakdown */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-3">{t("priceBreakdown")}</p>
          <PriceTableDesktop priceRows={priceRows} models={models} bestPrices={bestPrices} />
          <PriceCardsMobile priceRows={priceRows} models={models} bestPrices={bestPrices} />
        </CardContent>
      </Card>

      {/* Price comparison chart */}
      <Card className="p-4">
        <div ref={chartRef} className="w-full h-[220px]">
          {chartWidth > 0 && (
            <BarChart width={chartWidth} height={220} data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--text-tertiary)" tickFormatter={(v: number) => `$${v}`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
              {models.map((model, index) => (
                <Bar
                  key={model.id ?? index}
                  dataKey={`model_${index}`}
                  name={model.short_name || model.name}
                  fill={getModelColor(index)}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          )}
        </div>
      </Card>

      {/* Cost efficiency */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-3">{t("costEfficiency")}</p>
          <EfficiencyTableDesktop models={models} costEfficiency={costEfficiency} bestEfficiency={bestEfficiency} />
          <EfficiencyCardsMobile models={models} costEfficiency={costEfficiency} bestEfficiency={bestEfficiency} />
        </CardContent>
      </Card>

      {/* Monthly cost estimation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-3">{t("estimatedMonthlyCost")}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className={cn(secondaryTextClass, "whitespace-nowrap")}>{t("monthlyPromptTokens")}</label>
              <Input type="number" value={promptTokens} onChange={(e) => setPromptTokens(e.target.value)} className="w-20 h-7 text-xs" />
              <span className={secondaryTextClass}>M</span>
            </div>
            <div className="flex items-center gap-2">
              <label className={cn(secondaryTextClass, "whitespace-nowrap")}>{t("monthlyCompletionTokens")}</label>
              <Input type="number" value={completionTokens} onChange={(e) => setCompletionTokens(e.target.value)} className="w-20 h-7 text-xs" />
              <span className={secondaryTextClass}>M</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {models.map((model, index) => {
              const cost = monthlyCosts[index];
              const isBest = cost != null && bestMonthlyCost != null && approxEq(cost, bestMonthlyCost);
              return (
                <div key={model.id ?? index} className="flex items-center justify-between gap-2">
                  <span className="text-sm truncate" style={{ color: getModelColor(index) }}>
                    {model.short_name || model.name}
                  </span>
                  {cost != null ? (
                    <span className={cn("font-mono text-sm", isBest && winnerPriceClass)}>
                      {formatDollar(cost)}
                      {isBest && <WinnerMark />}
                    </span>
                  ) : (
                    <span className="text-sm text-text-tertiary">{t("notAvailable")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
