import { TabButton } from "../../../shared/components/composite/TabButton";
import { secondaryTextClass } from "../../../shared/utils/cssConstants";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ViewMode, ReasoningFilter } from "./useAARankingFilters";

interface FilterToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  reasoningFilter: ReasoningFilter;
  onReasoningFilterChange: (filter: ReasoningFilter) => void;
  modalityFilter: string;
  onModalityFilterChange: (filter: string) => void;
}

export function FilterToolbar({ viewMode, onViewModeChange, reasoningFilter, onReasoningFilterChange, modalityFilter, onModalityFilterChange }: FilterToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end min-w-0">
      <div className="flex-1 min-w-0">
        <p className={secondaryTextClass}>{t("artificialSource")}</p>
        <div className="flex flex-row gap-1 mt-1 flex-wrap items-center">
          <TabButton active={viewMode === "rankings"} onClick={() => onViewModeChange("rankings")}>{t("modelRankings")}</TabButton>
          <TabButton active={viewMode === "pricing"} onClick={() => onViewModeChange("pricing")}>{t("pricing")}</TabButton>
          <span className="w-[1px] h-4 bg-border mx-1" />
          {([
            { key: "all" as const, label: t("all") },
            { key: "reasoning" as const, label: t("reasoning") },
            { key: "non-reasoning" as const, label: t("nonReasoning") },
          ]).map((tab) => (
            <TabButton key={tab.key} active={reasoningFilter === tab.key} onClick={() => onReasoningFilterChange(tab.key)}>{tab.label}</TabButton>
          ))}
          <span className="w-[1px] h-4 bg-border mx-1 hidden sm:block" />
          <div className="hidden sm:flex flex-row gap-1 items-center">
            {([
              { key: "all" as const, label: t("allModalities") },
              { key: "text" as const, label: t("textOnly") },
              { key: "image" as const, label: t("imageInput") },
              { key: "speech" as const, label: t("speechInput") },
              { key: "video" as const, label: t("videoInput") },
            ]).map((tab) => (
              <TabButton key={tab.key} active={modalityFilter === tab.key} onClick={() => onModalityFilterChange(tab.key)}>{tab.label}</TabButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
