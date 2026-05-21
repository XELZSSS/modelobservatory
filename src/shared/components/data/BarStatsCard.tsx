import { Fragment } from "react";
import { Card, CardContent } from "../ui/card";
import { COOL_COLORS } from "../rankColor";
import { numberTextClass, secondaryTextClass, textSecondaryClass } from "../../utils/cssConstants";
import { useTranslation } from "../../i18n/useTranslation";

interface BarStatRow {
  label: string;
  value: number;
  valueLabel: string;
}

interface BarStatsCardProps {
  title: string;
  source: string;
  rows: BarStatRow[];
  onOpen?: () => void;
  className?: string;
}

export function BarStatsCard({ title, source, rows, onOpen, className }: BarStatsCardProps) {
  const maxValue = Math.max(...rows.map((row) => row.value), 0);
  const { t } = useTranslation();
  return (
    <Card className={`${onOpen ? "cursor-pointer" : ""} ${className || ""}`} onClick={onOpen}>
      <CardContent>
        <div className="flex flex-col gap-0.5 mb-2">
          <p className="text-sm font-bold">{title}</p>
          <p className={secondaryTextClass}>{source}</p>
        </div>
        <div className="flex flex-col gap-2">
          {rows.length === 0 ? (
            <p className={textSecondaryClass}>{t("notAvailable")}</p>
          ) : (
            rows.map((row, index) => {
              const width = maxValue > 0 ? Math.max(4, (row.value / maxValue) * 100) : 0;
              const base = COOL_COLORS[index % COOL_COLORS.length]!;
              return (
                <Fragment key={`${row.label}-${index}`}>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center mb-0.5">
                    <p className="text-sm truncate">{row.label}</p>
                    <p className={`text-sm font-bold text-right ${numberTextClass}`}>{row.valueLabel}</p>
                  </div>
                  <div className="h-[14px] bg-bg-tertiary overflow-hidden rounded-full" role="progressbar" aria-valuenow={row.value} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${width}%`, backgroundColor: base, transformOrigin: "left", animation: "bar-grow 250ms cubic-bezier(0.4, 0, 0.2, 1) both" }}
                    />
                  </div>
                </Fragment>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
