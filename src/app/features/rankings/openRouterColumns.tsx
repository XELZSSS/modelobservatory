import type { TranslationKey } from "../../../shared/i18n";
import type { DataTableColumn } from "../../components/data/DataTable";
import { TagBadge } from "../../components/ui/tag-badge";
import { RankingNameCell } from "../../components/composite/RankingNameCell";
import { RightAlignedText } from "../../components/composite/RightAlignedText";

import { cn } from "../../../shared/utils/cn";
import { formatShortNumber, formatTrend } from "../../../shared/utils/format";
import type { OpenRouterRankEntry, OpenRouterAppEntry } from "../../../shared/types";

function trendClass(change?: number | null) {
  if (change == null || change === 0) return "bg-bg-tertiary text-text-secondary border-border";
  return change > 0 ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20";
}

const tokenColumn = <T extends { totalTokens?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "tokens",
  header: "",
  accessorFn: (row) => row.totalTokens,
  sortable: true,
  align: "right",
  cell: (item) => <span className="font-mono font-semibold text-text-primary">{formatShortNumber(item.totalTokens || 0)}</span>,
});

const requestColumn = <T extends { requestCount?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "requests",
  header: "",
  accessorFn: (row) => row.requestCount,
  sortable: true,
  align: "right",
  hiddenMd: true,
  cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.requestCount || 0)}</span>,
});

const imageColumn = <T extends { imageOutputRequests?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "images",
  header: "",
  accessorFn: (row) => row.imageOutputRequests,
  sortable: true,
  align: "right",
  hiddenMd: true,
  cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.imageOutputRequests || 0)}</span>,
});

const videoColumn = <T extends { videoOutputSeconds?: number | null }>(t: (key: TranslationKey) => string): DataTableColumn<T> => ({
  id: "video",
  header: "",
  accessorFn: (row) => row.videoOutputSeconds,
  sortable: true,
  align: "right",
  hiddenMd: true,
  cell: (item) => <span className="font-mono text-text-secondary">{formatShortNumber(item.videoOutputSeconds || 0)}</span>,
});

export function buildOpenRouterColumns(t: (key: TranslationKey) => string): {
  modelColumns: DataTableColumn<OpenRouterRankEntry>[];
  appColumns: DataTableColumn<OpenRouterAppEntry>[];
} {
  const modelColumns: DataTableColumn<OpenRouterRankEntry>[] = [
    {
      id: "model",
      header: "",
      width: "45%",
      cell: (item) => (
        <>
          <RankingNameCell name={item.name} />
          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
            <TagBadge>
              {t("requests")}: {formatShortNumber(item.requestCount || 0)}
            </TagBadge>
            {item.imageOutputRequests ? (
              <TagBadge>
                {t("images")}: {formatShortNumber(item.imageOutputRequests)}
              </TagBadge>
            ) : null}
            {item.videoOutputSeconds ? (
              <TagBadge>
                {t("videoSeconds")}: {formatShortNumber(item.videoOutputSeconds)}
              </TagBadge>
            ) : null}
            {item.creator && <TagBadge>{item.creator}</TagBadge>}
            <span
              className={cn(
                "inline-flex items-center text-[11px] leading-[16px] px-1.5 py-0.5 rounded-[4px] border",
                item.change != null ? trendClass(item.change) : "border-border bg-bg-secondary text-text-secondary",
              )}
            >
              {formatTrend(item.change, t)}
            </span>
          </div>
        </>
      ),
    },
    tokenColumn<OpenRouterRankEntry>(t),
    requestColumn<OpenRouterRankEntry>(t),
    imageColumn<OpenRouterRankEntry>(t),
    videoColumn<OpenRouterRankEntry>(t),
    {
      id: "creator",
      header: "",
      accessorFn: (row) => row.creator,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <RightAlignedText className="text-xs">{item.creator || t("unknown")}</RightAlignedText>,
    },
    {
      id: "trend",
      header: "",
      accessorFn: (row) => row.change,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => <span className={cn(trendClass(item.change), "border rounded text-xs py-0 px-1 font-mono inline-block")}>{formatTrend(item.change, t)}</span>,
    },
  ];

  const appColumns: DataTableColumn<OpenRouterAppEntry>[] = [
    {
      id: "app",
      header: "",
      width: "45%",
      cell: (item) => (
        <>
          <RankingNameCell name={item.name} />
          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
            <TagBadge>
              {t("requests")}: {formatShortNumber(item.requestCount || 0)}
            </TagBadge>
            {item.categories?.length ? <TagBadge>{item.categories.join(", ")}</TagBadge> : null}
          </div>
        </>
      ),
    },
    tokenColumn<OpenRouterAppEntry>(t),
    requestColumn<OpenRouterAppEntry>(t),
    {
      id: "category",
      header: "",
      accessorFn: (row) => row.categories?.join(", "),
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (item) => (
        <RightAlignedText className="text-xs">{item.categories?.length ? item.categories.join(", ") : t("notAvailable")}</RightAlignedText>
      ),
    },
  ];

  return { modelColumns, appColumns };
}