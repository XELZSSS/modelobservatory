import { memo } from "react";
import { textSecondaryClass } from "../../utils/cssConstants";

export const SectionHeader = memo(function SectionHeader({ title, meta, className }: { title: string; meta?: string; className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 mb-1.5 items-start sm:items-center justify-between ${className || ""}`}>
      <p className="text-base font-bold">{title}</p>
      {meta && <p className={textSecondaryClass}>{meta}</p>}
    </div>
  );
});
