import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { Badge } from "../../../shared/components/ui/badge";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatShortNumber } from "../../../shared/utils/format";
import type { OpenSourceModelEntry } from "../../../shared/types";

export function OsDetailContent({ model }: { model: OpenSourceModelEntry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <StatCard label={t("downloads")} value={formatShortNumber(model.downloads)} />
        <StatCard label={t("likes")} value={formatShortNumber(model.likes)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("creator")} value={model.author || t("notAvailable")} />
          <InfoRow compact label={t("license")} value={model.license || t("notAvailable")} />
          <InfoRow compact label={t("task")} value={model.task || t("notAvailable")} />
          <InfoRow compact label={t("releaseDate")} value={model.createdAt ? new Date(model.createdAt).toLocaleDateString() : t("notAvailable")} />
          <InfoRow compact label={t("lastUpdated")} value={model.lastModified ? new Date(model.lastModified).toLocaleDateString() : t("notAvailable")} />
        </InfoCard>
        <InfoCard title={t("repository")}>
          <a href={`https://huggingface.co/${model.id.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
            {model.id}
          </a>
        </InfoCard>
      </div>
      {model.tags.length > 0 && (
        <InfoCard title={t("tags")}>
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  );
}
