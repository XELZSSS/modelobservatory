import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { Badge } from "../../../shared/components/ui/badge";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatShortNumber } from "../../../shared/utils/format";
import { orNA } from "../../../shared/utils/cssConstants";
import type { OpenSourceModelEntry } from "../../../shared/types";
import { DetailLayout, StatGrid, InfoGrid } from "../../../shared/components/composite/DetailLayout";

export function OsDetailContent({ model }: { model: OpenSourceModelEntry }) {
  const { t } = useTranslation();
  return (
    <DetailLayout>
      <StatGrid columns={2}>
        <StatCard label={t("downloads")} value={formatShortNumber(model.downloads)} />
        <StatCard label={t("likes")} value={formatShortNumber(model.likes)} />
      </StatGrid>
      <InfoGrid>
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("creator")} value={orNA(model.author, t)} />
          <InfoRow compact label={t("license")} value={orNA(model.license, t)} />
          <InfoRow compact label={t("task")} value={orNA(model.task, t)} />
          <InfoRow compact label={t("releaseDate")} value={model.createdAt ? new Date(model.createdAt).toLocaleDateString() : t("notAvailable")} />
          <InfoRow compact label={t("lastUpdated")} value={model.lastModified ? new Date(model.lastModified).toLocaleDateString() : t("notAvailable")} />
        </InfoCard>
        <InfoCard title={t("repository")}>
          <a href={`https://huggingface.co/${model.id.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
            {model.id}
          </a>
        </InfoCard>
      </InfoGrid>
      {model.tags.length > 0 && (
        <InfoCard title={t("tags")}>
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </InfoCard>
      )}
    </DetailLayout>
  );
}
