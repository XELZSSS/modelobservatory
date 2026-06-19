import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui/button";
import { BackButton } from "../../shared/components/composite/BackButton";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { CompareChipBar } from "../../shared/components/composite/CompareChipBar";
import { secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCompareStore } from "../../shared/stores/compareStore";
import { useCompareModels } from "../../shared/hooks/useCompareModels";
import type { TranslationKey } from "../../shared/i18n";
import type { ArtificialAnalysisModel } from "../../shared/types";

interface ComparePageLayoutProps {
  backLabelKey: TranslationKey;
  backTo: string;
  backState?: Record<string, unknown>;
  title: string;
  children: (models: ArtificialAnalysisModel[]) => React.ReactNode;
}

export function ComparePageLayout({ backLabelKey, backTo, backState, title, children }: ComparePageLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const removeCompareModel = useCompareStore((s) => s.removeCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const models = useCompareModels();

  if (models.length < 2) {
    return (
      <div className="flex flex-col gap-4 items-center py-8">
        <p className={textSecondaryClass}>{t("compareNeedsTwo")}</p>
        <Button size="sm" variant="outline" onClick={() => navigate(backTo)}>
          {t("backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <BackButton labelKey={backLabelKey} to={backTo} state={backState} />
      <SectionHeader title={title} />
      <p className={secondaryTextClass}>{t("artificialSource")}</p>
      <CompareChipBar
        models={models}
        onRemove={removeCompareModel}
        onClear={() => { clearCompare(); navigate(backTo); }}
      />
      {children(models)}
    </div>
  );
}
