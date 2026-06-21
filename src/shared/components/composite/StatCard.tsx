import { memo, type ReactNode, type ComponentType } from "react";
import { cn } from "../../utils/cn";
import { Card, CardContent } from "../ui/card";
import { numberTextClass, secondaryTextClass } from "../../utils/cssConstants";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  valueClassName?: string;
}

export const StatCard = memo(function StatCard({ label, value, icon: Icon, className, valueClassName }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className={cn("text-center p-3")}>
        <div className="flex items-center justify-center gap-1.5 mb-1.5 min-w-0">
          {Icon && (
            <span className="text-text-secondary shrink-0">
              <Icon className="size-4" />
            </span>
          )}
          <p className={cn(secondaryTextClass, "uppercase truncate")}>{label}</p>
        </div>
        <p className={cn("text-sm mt-0.5 font-bold", numberTextClass, valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
});
