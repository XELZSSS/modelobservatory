import { Input } from "../../../shared/components/ui/input";
import { secondaryTextClass, textSecondaryClass } from "../../../shared/utils/cssConstants";
import { formatDollar } from "../../../shared/utils/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface PricingInputsProps {
  promptTokens: string;
  onPromptTokensChange: (v: string) => void;
  completionTokens: string;
  onCompletionTokensChange: (v: string) => void;
  avgCost: number;
}

export function PricingInputs({ promptTokens, onPromptTokensChange, completionTokens, onCompletionTokensChange, avgCost }: PricingInputsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 flex-wrap items-center p-2 rounded-md border border-border">
      <Input type="number" value={promptTokens} onChange={(e) => onPromptTokensChange(e.target.value)} className="w-full sm:w-44 border-border" placeholder={t("monthlyPromptTokens")} />
      <Input type="number" value={completionTokens} onChange={(e) => onCompletionTokensChange(e.target.value)} className="w-full sm:w-44 border-border" placeholder={t("monthlyCompletionTokens")} />
      <div className="flex items-center">
        <span className={textSecondaryClass}>{t("estimatedMonthlyCost")}: </span>
        <span className="text-base font-bold ml-1">{formatDollar(avgCost)}</span>
        <span className={`${secondaryTextClass} ml-[2px]`}>{t("perModelAvg")}</span>
      </div>
    </div>
  );
}
