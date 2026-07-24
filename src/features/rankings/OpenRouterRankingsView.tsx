import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { DataTable } from "../../shared/components/data/DataTable";

import { cn } from "../../shared/utils/cn";
import { StatCard } from "../../shared/components/composite/StatCard";
import { Card } from "../../shared/components/ui/card";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import type { OpenRouterAppEntry, OpenRouterRankingsPayload, OpenRouterRankEntry } from "../../shared/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatShortNumber, categoryLabel } from "../../shared/utils/format";
import { getRecommendation } from "../../shared/utils/recommendation";
import { useOpenRouterColumns } from "./useOpenRouterColumns";

function ModelExpandedDetail({ item }: { item: OpenRouterRankEntry }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 flex flex-col gap-3 text-left">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <StatCard label={t("creatorOrVendor")} value={item.creator} />
        <StatCard label={t("inputTokens")} value={formatShortNumber(item.promptTokens || 0)} />
        <StatCard label={t("outputTokens")} value={formatShortNumber(item.completionTokens || 0)} />
        {item.reasoningTokens ? <StatCard label={t("reasoningTokens") || "Reasoning"} value={formatShortNumber(item.reasoningTokens)} /> : null}
      </div>
      <div className="flex flex-col gap-1.5 p-3 rounded-md bg-bg-secondary">
        <p className="text-xs font-bold text-text-primary">{t("techSelectionAdvice")}</p>
        <p className={cn("text-xs text-text-secondary", "leading-relaxed")}>{getRecommendation(item.id, t)}</p>
      </div>
      <div className={cn("flex flex-row justify-between items-center", "text-xs text-text-secondary")}>
        <span>
          {t("apiModelId")}: <code className="font-mono bg-bg-secondary px-1">{item.id}</code>
        </span>
        <span>
          {t("todayCategory")}: <span className="font-bold uppercase">{categoryLabel(item.category, t)}</span>
        </span>
      </div>
    </div>
  );
}

function AppExpandedDetail({ item }: { item: OpenRouterAppEntry }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 flex flex-col gap-3 text-left">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <StatCard label={t("totalTokens")} value={formatShortNumber(item.totalTokens)} />
        <StatCard label={t("requests")} value={formatShortNumber(item.requestCount)} />
        <StatCard label={t("category")} value={item.categories?.length ? item.categories.join(", ") : t("notAvailable")} />
      </div>
      {item.description && <p className={cn("text-xs text-text-secondary", "leading-relaxed p-2 rounded-md bg-bg-secondary")}>{item.description}</p>}
      <div className={cn("flex flex-row justify-between items-center", "text-xs text-text-secondary")}>
        <span>
          ID: <code className="font-mono bg-bg-secondary px-1">{item.id}</code>
        </span>
        {item.url && <span className="truncate max-w-[60%]">{item.url}</span>}
      </div>
    </div>
  );
}

export function OpenRouterRankingsView({ data }: { data?: OpenRouterRankingsPayload }) {
  const { t } = useTranslation();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedAppRowId, setExpandedAppRowId] = useState<string | null>(null);
  const { modelColumns, appColumns } = useOpenRouterColumns(t);

  if (!data) {
    return (
      <Card className="text-center border-dashed p-4">
        <ShieldAlert className="size-10 mx-auto text-text-secondary mb-2" />
        <p className="text-sm text-text-secondary">{t("noRankingsData")}</p>
      </Card>
    );
  }

  return (
    <ViewLayout>
      <p className="text-xs text-text-secondary">{t("openRouterSource")}</p>
      <div className="flex flex-col gap-3">
        <DataTable
          data={data.tokenUsageRankings ?? []}
          columns={modelColumns}
          getRowId={(r) => r.id}
          expandedRowId={expandedRowId}
          onToggleExpand={setExpandedRowId}
          renderExpandedRow={(item) => <ModelExpandedDetail item={item} />}
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-text-primary">{t("openRouterApps")}</h3>
        <DataTable
          data={data.appUsageRankings ?? []}
          columns={appColumns}
          getRowId={(r) => r.id}
          expandedRowId={expandedAppRowId}
          onToggleExpand={setExpandedAppRowId}
          renderExpandedRow={(item) => <AppExpandedDetail item={item} />}
        />
      </div>
    </ViewLayout>
  );
}
