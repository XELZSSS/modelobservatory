import { memo, type ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";

export const InfoRow = memo(function InfoRow({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  const textSize = compact ? "text-xs" : "text-sm";
  return (
    <div className={cn("flex flex-row justify-between min-w-0 py-1", compact ? "gap-2" : "gap-4")}>
      <p className={cn(textSize, "text-text-secondary truncate")}>{label}</p>
      <p className={cn(textSize, "font-mono tabular-nums text-right truncate text-text-primary font-medium")}>{value}</p>
    </div>
  );
});