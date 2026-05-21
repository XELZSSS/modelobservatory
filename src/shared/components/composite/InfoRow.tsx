import { memo, type ReactNode } from "react";
import { numberTextClass } from "../../utils/cssConstants";

export const InfoRow = memo(function InfoRow({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  const sizeClass = compact ? "text-xs" : "text-sm";
  const gapClass = compact ? "gap-2" : "gap-4";
  return (
    <div className={`flex flex-row ${gapClass} justify-between`}>
      <p className={`${sizeClass} text-text-secondary`}>{label}</p>
      <p className={`${sizeClass} ${numberTextClass} text-right`}>{value}</p>
    </div>
  );
});
