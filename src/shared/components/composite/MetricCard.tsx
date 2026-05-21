import type { ReactNode, ComponentType } from "react";
import { Card, CardContent } from "../ui/card";
import { numberTextClass, secondaryTextClass } from "../../utils/cssConstants";

interface MetricCardProps {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  value: string | number | ReactNode;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({ icon: Icon, label, value, className = "", valueClassName = "" }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-2.5 sm:p-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-1 min-w-0">
          {Icon && <span className="text-text-secondary shrink-0"><Icon className="size-4" /></span>}
          <p className={`${secondaryTextClass} truncate`}>{label}</p>
        </div>
        <div className={`text-sm sm:text-base font-bold truncate ${numberTextClass} ${valueClassName}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
