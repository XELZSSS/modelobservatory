import { memo, type ReactNode } from "react";

export const TagBadge = memo(function TagBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center text-[11px] leading-[16px] px-1.5 py-0.5 rounded-[4px] border border-border bg-bg-secondary text-text-secondary">
      {children}
    </span>
  );
});