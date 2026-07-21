import type { TranslationKey } from "../../shared/i18n";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";

import { cn } from "../../shared/utils/cn";
import { formatShortNumber, formatTrend } from "../../shared/utils/format";
import type { OpenRouterRankEntry, OpenRouterAppEntry } from "../../shared/types";

function trendClass(change?: number | null) {
  if (change == null || change === 0) return "bg-bg-tertiary text-text-secondary border-border";
  return change > 0
    ? "bg-success/10 text-success border-success/20"
    : "bg-destructive/10 text-destructive border-destructive/20";
}

const tokenColumn = <T extends { totalTokens?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "tokens", header: t("totalTokens"), accessorFn: (row) => row.totalTokens, sortable: true, align: "right",
  cell: (item) => <span className="font-mono font-bold text-text-primary">{formatShortNumber(item.totalTokens || 0)}</span>,
});

const requestColumn = <T extends { requestCount?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "requests", header: t("requests"), accessorFn: (row) => row.requestCount, sortable: true, align: "right", hiddenMd: true,
  cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.requestCount || 0)}</span>,
});

export function useOpenRouterColumns(
  t: (key: TranslationKey) => string,
): { modelColumns: DataTableColumn<OpenRouterRankEntry>[]; appColumns: DataTableColumn<OpenRouterAppEntry>[] } {
  const tagClass = "inline-flex items-center text-[11px] leading-[16px] px-1.5 py-0.5 rounded-[4px] border border-border bg-bg-secondary text-text-secondary";

  const modelColumns: DataTableColumn<OpenRouterRankEntry>[] = [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "45%",
      cell: (item) => (
        <>
          <RankingNameCell name={item.name} />
          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
            <span className={tagClass}>{t("requests")}: {formatShortNumber(item.requestCount || 0)}</span>
            {item.creator && <span className={tagClass}>{item.creator}</span>}
            <span className={cn(tagClass, item.change != null ? trendClass(item.change) : "")}>{formatTrend(item.change, t)}</span>
          </div>
        </>
      ),
    },
    tokenColumn<OpenRouterRankEntry>(t),
    requestColumn<OpenRouterRankEntry>(t),
    {
      id: "creator",
      header: t("provider"),
      accessorFn: (row) => row.creator,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <p className={cn("text-xs", "overflow-hidden text-ellipsis whitespace-nowrap", "text-right")}>{item.creator || t("unknown")}</p>,
    },
    {
      id: "trend",
      header: t("trend"),
      accessorFn: (row) => row.change,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <span className={cn(trendClass(item.change), "border rounded-[4px] text-xs py-0 px-1 font-mono inline-block")}>{formatTrend(item.change, t)}</span>,
    },
  ];

  const appColumns: DataTableColumn<OpenRouterAppEntry>[] = [
    {
      id: "app",
      header: t("openRouterApps"),
      width: "45%",
      cell: (item) => (
        <>
          <RankingNameCell name={item.name} />
          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
            <span className={tagClass}>{t("requests")}: {formatShortNumber(item.requestCount || 0)}</span>
            {item.categories?.length ? <span className={tagClass}>{item.categories.join(", ")}</span> : null}
          </div>
        </>
      ),
    },
    tokenColumn<OpenRouterAppEntry>(t),
    requestColumn<OpenRouterAppEntry>(t),
    {
      id: "category",
      header: t("category"),
      accessorFn: (row) => row.categories?.join(", "),
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <p className={cn("text-xs", "overflow-hidden text-ellipsis whitespace-nowrap", "text-right")}>{item.categories?.length ? item.categories.join(", ") : t("notAvailable")}</p>,
    },
  ];

  return { modelColumns, appColumns };
}
