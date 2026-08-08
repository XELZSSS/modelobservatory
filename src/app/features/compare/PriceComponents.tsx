import { memo } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { getModelColor } from "../../components/rankColor";
import { approxEq } from "../../../shared/utils/math";
import { formatScore, formatDollar } from "../../../shared/utils/format";
import type { ArtificialAnalysisModel } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import type { TFunction } from "../../../shared/i18n";
import { useTranslation } from "../../i18n/useTranslation";
import { PRICING_BLENDS } from "../../../shared/config";
import { useIsMobile } from "../../hooks/useIsMobile";

interface PriceRow {
  label: string;
  getValue: (m: ArtificialAnalysisModel) => number | null | undefined;
  format: (v: number) => string;
}

export function buildPriceRows(t: TFunction): PriceRow[] {
  return [
    { label: t("promptPrice"), getValue: (m) => m.pricing?.input, format: (v) => formatDollar(v) },
    { label: t("completionPrice"), getValue: (m) => m.pricing?.output, format: (v) => formatDollar(v) },
    { label: t("cacheHitPrice"), getValue: (m) => m.pricing?.cache_hit, format: (v) => formatDollar(v) },
    { label: t("blendedPrice"), getValue: (m) => m.pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1], format: (v) => formatDollar(v) },
  ];
}

export function getBestPrice(rows: PriceRow[], models: ArtificialAnalysisModel[]): Map<string, number> {
  const best = new Map<string, number>();
  for (const row of rows) {
    const values = models.map((m) => row.getValue(m)).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (values.length > 0) best.set(row.label, Math.min(...values));
  }
  return best;
}

export const WinnerMark = memo(function WinnerMark() {
  return (
    <span className={cn("inline-flex items-center gap-0.5", "text-xs font-bold", "text-success ml-1")}>
      <TrendingUp size={10} />
    </span>
  );
});

const PriceValue = memo(function PriceValue({ value, format, isBest }: { value: number | null | undefined; format: (v: number) => string; isBest: boolean }) {
  const { t } = useTranslation();
  return typeof value === "number" ? (
    <span className={cn("font-mono", isBest && "font-bold text-success")}>
      {format(value)}
      {isBest && <WinnerMark />}
    </span>
  ) : (
    <span className="text-text-tertiary">{t("notAvailable")}</span>
  );
});

function PriceTableDesktop({ priceRows, models, bestPrices }: { priceRows: PriceRow[]; models: ArtificialAnalysisModel[]; bestPrices: Map<string, number> }) {
  const { t } = useTranslation();
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-2 py-2 font-bold text-text-secondary">{t("metric")}</th>
            {models.map((model, index) => (
              <th key={model.id ?? index} className="text-right px-2 py-2 font-bold" style={{ color: getModelColor(index) }}>
                {model.short_name || model.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {priceRows.map((row) => {
            const best = bestPrices.get(row.label);
            return (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <td className="px-2 py-2 text-text-secondary">{row.label}</td>
                {models.map((model, index) => {
                  const v = row.getValue(model);
                  return (
                    <td key={model.id ?? index} className="px-2 py-2 text-right font-mono">
                      <PriceValue value={v} format={row.format} isBest={typeof v === "number" && best != null && approxEq(v, best)} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PriceTableMobile({ priceRows, models, bestPrices }: { priceRows: PriceRow[]; models: ArtificialAnalysisModel[]; bestPrices: Map<string, number> }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {priceRows.map((row) => {
        const best = bestPrices.get(row.label);
        return (
          <Card key={row.label}>
            <CardContent className="p-3">
              <p className="text-xs font-bold text-text-secondary mb-2">{row.label}</p>
              <div className="flex flex-col gap-1">
                {models.map((model, index) => {
                  const v = row.getValue(model);
                  return (
                    <div key={model.id ?? index} className="flex items-center justify-between gap-2">
                      <span className="text-xs truncate" style={{ color: getModelColor(index) }}>
                        {model.short_name || model.name}
                      </span>
                      <span className="text-xs">
                        <PriceValue value={v} format={row.format} isBest={typeof v === "number" && best != null && approxEq(v, best)} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const PriceTable = memo(function PriceTable({
  priceRows,
  models,
  bestPrices,
}: {
  priceRows: PriceRow[];
  models: ArtificialAnalysisModel[];
  bestPrices: Map<string, number>;
}) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <PriceTableMobile priceRows={priceRows} models={models} bestPrices={bestPrices} />
  ) : (
    <PriceTableDesktop priceRows={priceRows} models={models} bestPrices={bestPrices} />
  );
});

function EfficiencyTableDesktop({ models, costEfficiency, bestEfficiency }: { models: ArtificialAnalysisModel[]; costEfficiency: (number | null)[]; bestEfficiency: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-2 py-2 font-bold text-text-secondary">{t("modelNameOrId")}</th>
            <th className="text-right px-2 py-2 font-bold text-text-secondary">{t("intelligenceIndex")}</th>
            <th className="text-right px-2 py-2 font-bold text-text-secondary">{t("blendedPrice")}</th>
            <th className="text-right px-2 py-2 font-bold text-text-secondary">{t("intelligencePerDollar")}</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => {
            const eff = costEfficiency[index];
            const isBest = eff != null && bestEfficiency != null && approxEq(eff, bestEfficiency);
            return (
              <tr key={model.id ?? index} className="border-b border-border last:border-b-0">
                <td className="px-2 py-2" style={{ color: getModelColor(index) }}>
                  {model.short_name || model.name}
                </td>
                <td className="px-2 py-2 text-right font-mono">{formatScore(t, model.intelligence_index)}</td>
                <td className="px-2 py-2 text-right font-mono">{formatDollar(model.pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1], t)}</td>
                <td className="px-2 py-2 text-right font-mono">
                  {eff != null ? (
                    <span className={cn(isBest && "font-bold text-success")}>
                      {eff.toFixed(2)}
                      {isBest && <WinnerMark />}
                    </span>
                  ) : (
                    t("notAvailable")
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EfficiencyTableMobile({ models, costEfficiency, bestEfficiency }: { models: ArtificialAnalysisModel[]; costEfficiency: (number | null)[]; bestEfficiency: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {models.map((model, index) => {
        const eff = costEfficiency[index];
        const isBest = eff != null && bestEfficiency != null && approxEq(eff, bestEfficiency);
        return (
          <Card key={model.id ?? index}>
            <CardContent className="p-3">
              <p className="text-xs font-bold mb-2" style={{ color: getModelColor(index) }}>
                {model.short_name || model.name}
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{t("intelligenceIndex")}</span>
                  <span className="text-xs font-mono">{formatScore(t, model.intelligence_index)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{t("blendedPrice")}</span>
                  <span className="text-xs font-mono">{formatDollar(model.pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1], t)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{t("intelligencePerDollar")}</span>
                  <span className={cn("text-xs font-mono", isBest && "font-bold text-success")}>
                    {eff != null ? (
                      <>
                        {eff.toFixed(2)}
                        {isBest && <WinnerMark />}
                      </>
                    ) : (
                      t("notAvailable")
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const EfficiencyTable = memo(function EfficiencyTable({
  models,
  costEfficiency,
  bestEfficiency,
}: {
  models: ArtificialAnalysisModel[];
  costEfficiency: (number | null)[];
  bestEfficiency: number | null;
}) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <EfficiencyTableMobile models={models} costEfficiency={costEfficiency} bestEfficiency={bestEfficiency} />
  ) : (
    <EfficiencyTableDesktop models={models} costEfficiency={costEfficiency} bestEfficiency={bestEfficiency} />
  );
});