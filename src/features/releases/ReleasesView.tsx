import { useMemo, useState } from "react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ellipsisTextClasses, secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { useSuspenseOpenSourceReleases, useSuspenseArtificialRankings } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { TabContainer, type TabItem } from "../../shared/components/composite/TabContainer";
import type { FeedEntry, DatedModel } from "./types";
import { useReleaseFeedEntries, useReleaseDateRows } from "./useReleaseData";

const getFeedSearchFields = (e: FeedEntry) => [e.name, e.id];

function FeedTab({ allEntries }: { allEntries: FeedEntry[] }) {
  const { t } = useTranslation();
  const feedRows = useFilteredData(allEntries, getFeedSearchFields);

  const feedColumns = useMemo<DataTableColumn<FeedEntry>[]>(() => {
    const getTypeMeta = (type: FeedEntry["type"]) => {
      switch (type) {
        case "update": return { label: t("releaseUpdate"), color: "text-blue-600 dark:text-blue-400" };
        case "opensource": return { label: t("releaseOpenSource"), color: "text-amber-600 dark:text-amber-400" };
        default: return { label: type, color: "text-text-secondary" };
      }
    };

    return [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (row) => (
          <div className="min-w-0">
            <p className="text-sm break-words overflow-wrap-anywhere">{row.name}</p>
            <div className="flex md:hidden mt-[2px] items-center gap-1.5">
              <span className={`text-xs font-semibold ${getTypeMeta(row.type).color}`}>{getTypeMeta(row.type).label}</span>
              <span className="text-xs text-text-tertiary">{row.date}</span>
            </div>
          </div>
        ),
      },
      {
        id: "date", header: t("date"), accessorFn: (r) => r.ts, sortable: true, align: "right", width: 100, hiddenMd: true,
        cell: (row) => <span className="text-xs">{row.date}</span>,
      },
      {
        id: "type", header: t("type"), sortable: true, align: "right", width: 140, hiddenMd: true,
        cell: (row) => { const meta = getTypeMeta(row.type); return <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>; },
      },
    ];
  }, [t]);

  return <DataTable data={feedRows} columns={feedColumns} getRowId={(r) => r.id} />;
}

function ReleaseDatesTab({ releaseRows }: { releaseRows: DatedModel[] }) {
  const { t } = useTranslation();

  const releaseColumns = useMemo<DataTableColumn<DatedModel>[]>(
    () => [
      { id: "model", header: t("modelNameOrId"), cell: (row) => <span className="text-sm font-bold break-words min-w-0">{row.model.name}</span> },
      { id: "creator", header: t("creator"), sortable: true, align: "right", width: "24%", hiddenMd: true,
        cell: (row) => <span className={`text-sm ${ellipsisTextClasses} text-right`}>{row.model.model_creators?.name || t("notAvailable")}</span>,
      },
      { id: "releaseDate", header: t("releaseDate"), accessorFn: (r) => r.time, sortable: true, align: "right", width: "18%",
        cell: (row) => new Date(row.time).toLocaleDateString(),
      },
    ],
    [t],
  );

  return <DataTable data={releaseRows} columns={releaseColumns} />;
}

function ReleasesContent({ defaultMode, lockedMode }: { defaultMode: "feed" | "release-dates"; lockedMode: boolean }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"feed" | "release-dates">(defaultMode);
  const { data: openSourceReleases } = useSuspenseOpenSourceReleases();
  const { data: artificialRankings } = useSuspenseArtificialRankings();

  const allEntries = useReleaseFeedEntries(openSourceReleases);
  const releaseRows = useReleaseDateRows(artificialRankings);

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "feed", label: t("releases") },
      { id: "release-dates", label: t("scoreRelease") },
    ],
    [t],
  );

  return (
    <ViewLayout>
      <div className="flex items-center justify-between mb-1">
        <p className={textSecondaryClass}>{mode === "feed" ? t("events", { count: allEntries.length }) : t("modelsTotal", { count: releaseRows.length })}</p>
      </div>
      <p className={secondaryTextClass}>{mode === "feed" ? t("releaseDataSource") : t("artificialSource")}</p>
      {lockedMode ? (
        <ReleaseDatesTab releaseRows={releaseRows} />
      ) : (
        <TabContainer tabs={tabs} defaultTabId={mode} onTabChange={(id) => setMode(id as "feed" | "release-dates")} tabSize="sm">
          {mode === "feed" ? <FeedTab allEntries={allEntries} /> : <ReleaseDatesTab releaseRows={releaseRows} />}
        </TabContainer>
      )}
    </ViewLayout>
  );
}

export function ReleasesView({ defaultMode, lockedMode = false }: { defaultMode?: "feed" | "release-dates"; lockedMode?: boolean }) {
  return (
    <SuspenseQuery>
      <ReleasesContent defaultMode={defaultMode || "feed"} lockedMode={lockedMode} />
    </SuspenseQuery>
  );
}
