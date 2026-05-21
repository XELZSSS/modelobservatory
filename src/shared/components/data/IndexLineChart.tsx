import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent } from "../ui/card";
import { useTranslation } from "../../i18n/useTranslation";
import { useElementWidth } from "../../hooks/useElementWidth";
import { getModelColor } from "../rankColor";
import { chartTooltipStyle } from "../../utils/cssConstants";
import type { ArtificialAnalysisModel } from "../../types";

export function IndexLineChart({ models }: { models: ArtificialAnalysisModel[] }) {
  const { t } = useTranslation();
  const [chartRef, chartWidth] = useElementWidth();

  const top10 = useMemo(() => {
    return [...models]
      .filter((m) => m.intelligence_index != null)
      .sort((a, b) => (b.intelligence_index ?? 0) - (a.intelligence_index ?? 0))
      .slice(0, 10);
  }, [models]);

  const chartData = useMemo(() => {
    return top10.map((m) => ({
      name: m.short_name || m.name.split("/").pop() || m.name,
      intelligence: m.intelligence_index ?? null,
      coding: m.coding_index ?? null,
      agentic: m.agentic_index ?? null,
      math: m.math_index ?? null,
    }));
  }, [top10]);

  return (
    <Card>
      <CardContent>
        <div ref={chartRef} className="w-full h-[200px] overflow-hidden">
          {chartWidth > 0 && top10.length > 0 && (
            <LineChart width={chartWidth} height={200} data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="name" tick={false} stroke="var(--border)" />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                stroke="var(--border)"
                domain={['dataMin - 5', 'dataMax + 5']}
                tickCount={6}
                tickFormatter={(v: number) => v.toFixed(1)}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="intelligence" name={t("intelligence")} stroke={getModelColor(0)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
              <Line type="monotone" dataKey="coding" name={t("coding")} stroke={getModelColor(1)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
              <Line type="monotone" dataKey="agentic" name={t("agentic")} stroke={getModelColor(2)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
              <Line type="monotone" dataKey="math" name={t("math")} stroke={getModelColor(3)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls={false} />
            </LineChart>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
