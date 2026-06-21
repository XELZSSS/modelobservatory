import { memo, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { numberTextClass } from "../../utils/cssConstants";

export const InfoRow = memo(function InfoRow({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  return (
    <div className={cn("flex flex-row justify-between", compact ? "gap-2" : "gap-4")}>
      <p className={cn(compact ? "text-xs" : "text-sm", "text-text-secondary")}>{label}</p>
      <p className={cn(compact ? "text-xs" : "text-sm", numberTextClass, "text-right")}>{value}</p>
    </div>
  );
});
