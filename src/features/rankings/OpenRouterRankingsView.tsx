import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { ellipsisTextClasses, secondaryTextClass, modelCellClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { RankBadge } from "../../shared/components/composite/RankBadge";
import { StatCard } from "../../shared/components/composite/StatCard";
import { Card } from "../../shared/components/ui/card";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import type { OpenRouterAppEntry, OpenRouterRankingsPayload, OpenRouterRankEntry } from "../../shared/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatShortNumber, formatTrend, getRecommendation, categoryLabel } from "../../shared/utils/format";

interface OpenRouterRankingsViewProps {
  data?: OpenRouterRankingsPayload;
}

function trendClass(change?: number | null) {
  if (change == null || change === 0) return "bg-bg-tertiary text-text-secondary border-border";
  return change > 0
    ? "bg-green-500/10 text-green-500 border-green-500/20"
    : "bg-rose-500/10 text-rose-500 border-rose-500/20";
}

function ModelExpandedDetail({ item }: { item: OpenRouterRankEntry }) {
  const { t } = useTranslation();

  return (
    <div className="p-2.5 flex flex-col gap-1.5 text-left">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        <StatCard label={t("creatorOrVendor")} value={item.creator} />
        <StatCard label={t("inputTokens")} value={formatShortNumber(item.promptTokens || 0)} />
        <StatCard label={t("outputTokens")} value={formatShortNumber(item.completionTokens || 0)} />
        {item.reasoningTokens ? <StatCard label={t("reasoningTokens") || "Reasoning"} value={formatShortNumber(item.reasoningTokens)} /> : null}
      </div>
      <div className="flex flex-col gap-1 p-2 rounded-md bg-bg-secondary">
        <p className="text-xs font-bold text-text-primary">{t("techSelectionAdvice")}</p>
        <p className={`${secondaryTextClass} leading-relaxed`}>{getRecommendation(item.id, t)}</p>
      </div>
      <div className={`flex flex-row justify-between items-center ${secondaryTextClass}`}>
        <span>
          {t("apiModelId")}: <code className="font-mono bg-bg-secondary px-1">{item.id}</code>
        </span>
        <span>
          {t("todayCategory")}:{" "}
          <span className="font-bold uppercase">{categoryLabel(item.category, t)}</span>
        </span>
      </div>
    </div>
  );
}

function AppExpandedDetail({ item }: { item: OpenRouterAppEntry }) {
  const { t } = useTranslation();
  return (
    <div className="p-2.5 flex flex-col gap-1.5 text-left">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        <StatCard label={t("totalTokens")} value={formatShortNumber(item.totalTokens)} />
        <StatCard label={t("requests")} value={formatShortNumber(item.requestCount)} />
        <StatCard label={t("category")} value={item.categories.length ? item.categories.join(", ") : t("notAvailable")} />
      </div>
      {item.description && <p className={`${secondaryTextClass} leading-relaxed p-2 rounded-md bg-bg-secondary`}>{item.description}</p>}
      <div className={`flex flex-row justify-between items-center ${secondaryTextClass}`}>
        <span>
          ID: <code className="font-mono bg-bg-secondary px-1">{item.id}</code>
        </span>
        {item.url && <span className="truncate max-w-[60%]">{item.url}</span>}
      </div>
    </div>
  );
}

function getRowId(row: OpenRouterRankEntry) {
  return row.id;
}

function getAppRowId(row: OpenRouterAppEntry) {
  return row.id;
}

export function OpenRouterRankingsView({ data }: OpenRouterRankingsViewProps) {
  const { t } = useTranslation();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedAppRowId, setExpandedAppRowId] = useState<string | null>(null);

  const modelColumns = useMemo<DataTableColumn<OpenRouterRankEntry>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        width: "45%",
        cell: (item) => (
          <div className={modelCellClass}>
            <RankBadge rank={item.rank} />
            <p className="text-sm font-bold break-words leading-tight text-left">{item.name}</p>
          </div>
        ),
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
    ],
    [t],
  );

  const appColumns = useMemo<DataTableColumn<OpenRouterAppEntry>[]>(
    () => [
      {
        id: "app",
        header: t("openRouterApps"),
        width: "45%",
        cell: (item) => (
          <div className={modelCellClass}>
            <RankBadge rank={item.rank} />
            <p className="text-sm font-bold break-words leading-tight text-left">{item.name}</p>
          </div>
        ),
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
        accessorFn: (row) => row.categories.join(", "),
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (item) => <p className={`text-xs ${ellipsisTextClasses} text-right`}>{item.categories.length ? item.categories.join(", ") : t("notAvailable")}</p>,
      },
    ],
    [t],
  );

  if (!data) {
    return (
      <Card className="text-center border-dashed p-4">
        <ShieldAlert className="size-10 mx-auto text-text-secondary mb-2" />
        <p className={textSecondaryClass}>{t("noRankingsData")}</p>
      </Card>
    );
  }

  return (
    <ViewLayout>
      <p className={secondaryTextClass}>{t("openRouterSource")}</p>
      <div className="flex flex-col gap-2">
        <DataTable
          data={data.tokenUsageRankings}
          columns={modelColumns}
          getRowId={getRowId}
          expandedRowId={expandedRowId}
          onToggleExpand={setExpandedRowId}
          renderExpandedRow={(item) => <ModelExpandedDetail item={item} />}
        />
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <h3 className="text-sm font-bold text-text-primary">{t("openRouterApps")}</h3>
        <DataTable
          data={data.appUsageRankings}
          columns={appColumns}
          getRowId={getAppRowId}
          expandedRowId={expandedAppRowId}
          onToggleExpand={setExpandedAppRowId}
          renderExpandedRow={(item) => <AppExpandedDetail item={item} />}
        />
      </div>
    </ViewLayout>
  );
}
