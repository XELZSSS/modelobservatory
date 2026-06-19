import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { getModelColor } from "../../shared/components/rankColor";
import { numberTextClass, secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { formatShortNumber } from "../../shared/utils/format";

export function ToolUsageShareDonut({ total, rows }: { total: number; rows: Array<{ name: string; value: number; share: number }> }) {
  const { t, lang } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = hoveredIndex != null ? rows[hoveredIndex] : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-[1px]">
        <p className="text-sm font-bold">{t("toolUsageShare")}</p>
        <p className={secondaryTextClass}>{t("openRouterSource")}</p>
      </div>
      {rows.length === 0 ? (
        <p className={textSecondaryClass}>{t("notAvailable")}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative size-40 shrink-0">
            <ResponsiveContainer width={160} height={160}>
              <PieChart onMouseLeave={() => setHoveredIndex(null)} aria-label={t("toolUsageShare")}>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={72}
                  paddingAngle={0}
                  stroke="var(--bg-secondary)"
                  strokeWidth={1}
                  isAnimationActive={false}
                >
                  {rows.map((row, index) => (
                    <Cell
                      key={row.name}
                      fill={getModelColor(index)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {center ? (
                <>
                  <span className={`text-sm font-bold leading-none text-center ${numberTextClass}`}>{center.name}</span>
                  <span className={`text-base font-bold leading-none mt-1.5 ${numberTextClass}`}>{formatShortNumber(center.value)}</span>
                  <span className={`${textSecondaryClass} leading-none mt-0.5`}>{(center.share * 100).toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <span className={`text-base font-bold leading-none ${numberTextClass}`}>{formatShortNumber(total)}</span>
                  <span className={`${textSecondaryClass} leading-none mt-0.5`}>{t("tokens")}</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 min-w-0 flex-1">
            {rows.map((row, index) => {
              const percent = row.share.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
              return (
                <div key={row.name} className="grid grid-cols-[12px_1fr_auto] gap-2 items-center min-w-0">
                  <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: getModelColor(index) }} />
                  <span className="text-sm truncate text-text-primary">{row.name}</span>
                  <span className={`text-sm font-bold text-right ${numberTextClass}`}>{percent}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
