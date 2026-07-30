import { useMemo, useState } from "react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";

import { cn } from "../../shared/utils/cn";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { useSuspenseOpenSourceReleases, useSuspenseArtificialRankings } from "../../shared/hooks/useApiQuery";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { TabContainer, type TabItem } from "../../shared/components/composite/TabContainer";
import type { FeedEntry, DatedModel } from "./types";
import { useReleaseFeedEntries, useReleaseDateRows } from "./useReleaseData";
import { PageContainer, PageHeader } from "../../shared/components/layout/PageContainer";

const getFeedSearchFields = (e: FeedEntry) => [e.name, e.id];

function FeedTab({ allEntries }: { allEntries: FeedEntry[] }) {
  const { t } = useTranslation();
  const feedRows = useFilteredData(allEntries, getFeedSearchFields);

  const feedColumns = useMemo<DataTableColumn<FeedEntry>[]>(() => {
    const getTypeMeta = (type: FeedEntry["type"]) => {
      switch (type) {
        case "update":
          return { label: t("releaseUpdate"), color: "text-info" };
        case "opensource":
          return { label: t("releaseOpenSource"), color: "text-warning" };
        default:
          return { label: type, color: "text-text-secondary" };
      }
    };

    return [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (row) => (
          <div className="min-w-0">
            <p className="text-sm font-medium break-words overflow-wrap-anywhere">{row.name}</p>
            <div className="flex md:hidden mt-1 items-center gap-1.5">
              <span className={cn("text-xs font-semibold", getTypeMeta(row.type).color)}>{getTypeMeta(row.type).label}</span>
              <span className="text-xs text-text-tertiary">{row.date}</span>
            </div>
          </div>
        ),
      },
      {
        id: "date",
        header: t("date"),
        accessorFn: (r) => r.ts,
        sortable: true,
        align: "right",
        width: 100,
        hiddenMd: true,
        cell: (row) => <span className="text-xs">{row.date}</span>,
      },
      {
        id: "type",
        header: t("type"),
        sortable: true,
        align: "right",
        width: 140,
        hiddenMd: true,
        cell: (row) => {
          const meta = getTypeMeta(row.type);
          return <span className={cn("text-xs font-semibold", meta.color)}>{meta.label}</span>;
        },
      },
    ];
  }, [t]);

  return <DataTable data={feedRows} columns={feedColumns} getRowId={(r) => r.id} hideHeader />;
}

function ReleaseDatesTab({ releaseRows }: { releaseRows: DatedModel[] }) {
  const { t } = useTranslation();

  const releaseColumns = useMemo<DataTableColumn<DatedModel>[]>(
    () => [
      { id: "model", header: "", cell: (row) => <span className="text-sm font-semibold break-words min-w-0">{row.model.name}</span> },
      {
        id: "creator",
        header: "",
        sortable: true,
        align: "right",
        width: "24%",
        hiddenMd: true,
        cell: (row) => (
          <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap text-right">{row.model.model_creators?.name || t("notAvailable")}</span>
        ),
      },
      {
        id: "releaseDate",
        header: "",
        accessorFn: (r) => r.time,
        sortable: true,
        align: "right",
        width: "18%",
        hiddenMd: true,
        cell: (row) => new Date(row.time).toLocaleDateString(),
      },
    ],
    [t],
  );

  return <DataTable data={releaseRows} columns={releaseColumns} hideHeader />;
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
    <PageContainer>
      <PageHeader title={t(lockedMode ? "scoreRelease" : "releases")} description={mode === "feed" ? t("releaseDataSource") : t("artificialSource")} />
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
          {mode === "feed" ? t("events", { count: allEntries.length }) : t("modelsTotal", { count: releaseRows.length })}
        </span>
      </div>
      {lockedMode ? (
        <ReleaseDatesTab releaseRows={releaseRows} />
      ) : (
        <TabContainer tabs={tabs} activeTab={mode} onTabChange={(id) => setMode(id as "feed" | "release-dates")} tabSize="sm">
          {mode === "feed" ? <FeedTab allEntries={allEntries} /> : <ReleaseDatesTab releaseRows={releaseRows} />}
        </TabContainer>
      )}
    </PageContainer>
  );
}

export function ReleasesView({ defaultMode, lockedMode = false }: { defaultMode?: "feed" | "release-dates"; lockedMode?: boolean }) {
  const { t } = useTranslation();
  useDocumentTitle(t("releases"));
  return (
    <SuspenseQuery>
      <ReleasesContent defaultMode={defaultMode || "feed"} lockedMode={lockedMode} />
    </SuspenseQuery>
  );
}
