import { StatCard } from "../../../components/composite/StatCard";
import { InfoCard } from "../../../components/composite/InfoCard";
import { InfoRow } from "../../../components/composite/InfoRow";
import { Badge } from "../../../components/ui/badge";
import { useTranslation } from "../../../i18n/useTranslation";
import { formatShortNumber, formatDate, orNA } from "../../../../shared/utils/format";
import type { OpenSourceModelEntry } from "../../../../shared/types";
import { DetailLayout, StatGrid, InfoGrid } from "../../../components/composite/DetailLayout";

export function OsDetail({ model }: { model: OpenSourceModelEntry }) {
  const { t, lang } = useTranslation();
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
          <InfoRow compact label={t("releaseDate")} value={model.createdAt ? formatDate(model.createdAt, lang) : t("notAvailable")} />
          <InfoRow compact label={t("lastUpdated")} value={model.lastModified ? formatDate(model.lastModified, lang) : t("notAvailable")} />
        </InfoCard>
        <InfoCard title={t("repository")}>
          <a href={`https://huggingface.co/${model.id.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-info hover:underline break-all">
            {model.id}
          </a>
        </InfoCard>
      </InfoGrid>
      {model.tags.length > 0 && (
        <InfoCard title={t("tags")}>
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </InfoCard>
      )}
    </DetailLayout>
  );
}