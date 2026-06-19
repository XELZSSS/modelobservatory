import type { TranslationKey } from "../../shared/i18n";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";
import { ellipsisTextClasses } from "../../shared/utils/cssConstants";
import { formatShortNumber, formatTrend } from "../../shared/utils/format";
import type { OpenRouterRankEntry, OpenRouterAppEntry } from "../../shared/types";

export function trendClass(change?: number | null) {
  if (change == null || change === 0) return "bg-bg-tertiary text-text-secondary border-border";
  return change > 0
    ? "bg-green-500/10 text-green-500 border-green-500/20"
    : "bg-rose-500/10 text-rose-500 border-rose-500/20";
}

export function useOpenRouterColumns(
  t: (key: TranslationKey) => string,
): { modelColumns: DataTableColumn<OpenRouterRankEntry>[]; appColumns: DataTableColumn<OpenRouterAppEntry>[] } {
  const modelColumns: DataTableColumn<OpenRouterRankEntry>[] = [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "45%",
      cell: (item) => <RankingNameCell rank={item.rank} name={item.name} />,
    },
    {
      id: "tokens",
      header: t("totalTokens"),
      accessorFn: (row) => row.totalTokens,
      sortable: true,
      align: "right",
      cell: (item) => <span className="font-mono font-bold text-text-primary">{formatShortNumber(item.totalTokens || 0)}</span>,
    },
    {
      id: "requests",
      header: t("requests"),
      accessorFn: (row) => row.requestCount,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.requestCount || 0)}</span>,
    },
    {
      id: "creator",
      header: t("provider"),
      accessorFn: (row) => row.creator,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <p className={`text-xs ${ellipsisTextClasses} text-right`}>{item.creator || t("unknown")}</p>,
    },
    {
      id: "trend",
      header: t("trend"),
      accessorFn: (row) => row.change,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <span className={`${trendClass(item.change)} border rounded-[4px] text-xs py-0 px-1 font-mono inline-block`}>{formatTrend(item.change, t)}</span>,
    },
  ];

  const appColumns: DataTableColumn<OpenRouterAppEntry>[] = [
    {
      id: "app",
      header: t("openRouterApps"),
      width: "45%",
      cell: (item) => <RankingNameCell rank={item.rank} name={item.name} />,
    },
    {
      id: "tokens",
      header: t("totalTokens"),
      accessorFn: (row) => row.totalTokens,
      sortable: true,
      align: "right",
      cell: (item) => <span className="font-mono font-bold text-text-primary">{formatShortNumber(item.totalTokens || 0)}</span>,
    },
    {
      id: "requests",
      header: t("requests"),
      accessorFn: (row) => row.requestCount,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.requestCount || 0)}</span>,
    },
    {
      id: "category",
      header: t("category"),
      accessorFn: (row) => row.categories?.join(", "),
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <p className={`text-xs ${ellipsisTextClasses} text-right`}>{item.categories?.length ? item.categories.join(", ") : t("notAvailable")}</p>,
    },
  ];

  return { modelColumns, appColumns };
}
