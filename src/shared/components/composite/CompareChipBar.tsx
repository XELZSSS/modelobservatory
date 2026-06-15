import { X, Gamepad2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "../../i18n/useTranslation";
import { modelId } from "../../utils/modelId";
import type { ArtificialAnalysisModel } from "../../types";

export function CompareChipBar({
  models,
  onRemove,
  onAdd,
  onClear,
  addLabel,
}: {
  models: ArtificialAnalysisModel[];
  onRemove: (model: ArtificialAnalysisModel) => void;
  onAdd: () => void;
  onClear: () => void;
  addLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        {models.map((model) => (
          <span key={modelId(model)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-tertiary border border-border">
            <span className="text-sm font-medium truncate max-w-[120px]">{model.short_name || model.name}</span>
            <Button variant="ghost" size="icon" onClick={() => onRemove(model)} className="shrink-0" aria-label={`${t("remove")} ${model.short_name || model.name}`}>
              <X size={14} />
            </Button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Gamepad2 size={14} /> {addLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onClear}>
          <Trash2 size={14} /> {t("clear")}
        </Button>
      </div>
    </div>
  );
}
