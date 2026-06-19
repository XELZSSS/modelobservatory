import { memo } from "react";
import { Card, CardContent } from "../../shared/components/ui/card";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InfoRow } from "../../shared/components/composite/InfoRow";
import type { ArenaModel } from "../../shared/types";

export const ArenaT2ICard = memo(function ArenaT2ICard({ entry, rank, color }: { entry: ArenaModel; rank: number; color: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="min-h-[132px] p-3 last:pb-3">
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="flex flex-row gap-2 items-start justify-between min-w-0">
            <div className="flex flex-row gap-1.5 items-center min-w-0">
              <span className="w-[3px] h-5 shrink-0" style={{ backgroundColor: color }} />
              <p className="text-base truncate min-w-0 font-bold">{entry.model}</p>
            </div>
            <span className="text-sm font-extrabold shrink-0" style={{ color }}>
              #{rank}
            </span>
          </div>
          <hr className="border-t border-border" />
          <div className="flex flex-col gap-1.5">
            <InfoRow label={t("eloScore")} value={<span style={{ color, fontWeight: 700 }}>{entry.score != null ? entry.score.toFixed(0) : t("notAvailable")}</span>} />
            <InfoRow label={t("votes")} value={entry.votes != null ? entry.votes.toLocaleString() : t("notAvailable")} />
            <InfoRow label={t("license")} value={entry.license || t("notAvailable")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
