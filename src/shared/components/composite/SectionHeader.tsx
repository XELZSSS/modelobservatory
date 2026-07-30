import { memo } from "react";
import { cn } from "../../utils/cn";

export const SectionHeader = memo(function SectionHeader({
  title,
  meta,
  className,
  accent = false,
}: {
  title: string;
  meta?: string;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-1 items-start sm:items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {accent && <div className="w-1 h-5 rounded-full bg-accent shrink-0" />}
        <p className="text-lg font-bold tracking-tight text-text-primary">{title}</p>
      </div>
      {meta && <p className="text-xs text-text-secondary">{meta}</p>}
    </div>
  );
});
