import { X, ArrowLeftRight } from "lucide-react";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import { secondaryTextClass, textSecondaryClass } from "../../../shared/utils/cssConstants";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ArtificialAnalysisModel } from "../../../shared/types";

interface CompareBarProps {
  compareIds: string[];
  rankings: ArtificialAnalysisModel[];
  onRemove: (model: ArtificialAnalysisModel) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareBar({ compareIds, rankings, onRemove, onClear, onCompare }: CompareBarProps) {
  const { t } = useTranslation();
  const canOpenCompare = compareIds.length >= 2;

  if (compareIds.length === 0) return null;

  const compareModels = compareIds
    .map((id) => rankings.find((m) => (m.id || m.slug) === id))
    .filter((m): m is ArtificialAnalysisModel => !!m);

  return (
    <Card className="p-3">
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="flex flex-row gap-1.5 items-center flex-wrap">
          <p className={textSecondaryClass}>{t("selectedCount", { count: compareIds.length })}</p>
          {compareModels.map((model) => (
            <Badge key={model.id || model.slug} variant="outline" className="cursor-pointer" onClick={() => onRemove(model)}>
              {model.short_name || model.name}
              <X className="size-3 ml-0.5" />
            </Badge>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          <Button size="sm" variant="outline" onClick={onClear}>
            <X className="size-4" />
            {t("clear")}
          </Button>
          <Button size="sm" variant="outline" onClick={onCompare} disabled={!canOpenCompare}>
            <ArrowLeftRight className="size-4" />
            {t("compareSelected")}
          </Button>
        </div>
      </div>
      {!canOpenCompare && <p className={secondaryTextClass}>{t("compareLimit")}</p>}
    </Card>
  );
}
