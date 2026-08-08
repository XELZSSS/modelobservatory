import { memo, type ReactNode, type ComponentType } from "react";
import { cn } from "../../../shared/utils/cn";
import { Card, CardContent } from "../ui/card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  valueClassName?: string;
  trend?: "up" | "down" | "neutral";
}

export const StatCard = memo(function StatCard({ label, value, icon: Icon, className, valueClassName, trend }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent padding="sm" className="text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1.5 min-w-0">
          {Icon && (
            <span className="text-text-secondary shrink-0">
              <Icon className="size-3.5" />
            </span>
          )}
          <p className={cn("text-[11px] text-text-secondary font-medium uppercase tracking-wider truncate")}>{label}</p>
        </div>
        <p
          className={cn(
            "text-base font-bold tracking-tight",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            valueClassName,
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
});