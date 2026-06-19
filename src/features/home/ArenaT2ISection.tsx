import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { getModelColor } from "../../shared/components/rankColor";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ArenaModel } from "../../shared/types";
import { ArenaT2ICard } from "./ArenaT2ICard";

export function ArenaT2ISection({ models }: { models: ArenaModel[] }) {
  const { t } = useTranslation();

  if (models.length === 0) return null;

  return (
    <div>
      <SectionHeader title={t("textToImage")} meta={t("arenaAISource")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {models.slice(0, 8).map((entry, index) => (
          <div key={entry.model} className={index >= 2 ? "hidden sm:block" : ""}>
            <ArenaT2ICard entry={entry} rank={index + 1} color={getModelColor(index)} />
          </div>
        ))}
      </div>
    </div>
  );
}
