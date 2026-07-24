import { memo, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export const InfoRow = memo(function InfoRow({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  const textSize = compact ? "text-xs" : "text-sm";
  return (
    <div className={cn("flex flex-row justify-between min-w-0", compact ? "gap-2" : "gap-4")}>
      <p className={cn(textSize, "text-text-secondary truncate")}>{label}</p>
      <p className={cn(textSize, "tabular-nums font-mono", "text-right truncate")}>{value}</p>
    </div>
  );
});
