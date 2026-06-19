export const ellipsisTextClasses = "overflow-hidden text-ellipsis whitespace-nowrap";
export const numberTextClass = "tabular-nums";
export const secondaryTextClass = "text-xs text-text-secondary";
export const smallBoldClass = "text-xs font-bold";
export const modelCellClass = "flex items-center gap-2 min-w-0";
export const modelNameCellClass = "text-sm font-bold break-words min-w-0";
export const textSecondaryClass = "text-sm text-text-secondary";

/** @deprecated Use secondaryTextClass for xs, textSecondaryClass for sm */
export const secondaryTextXsClass = secondaryTextClass;

export const winnerPriceClass = "font-bold text-green-500";
export const chartTooltipStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  fontSize: "12px",
  borderRadius: "6px",
} as const;

