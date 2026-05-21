import { memo, type ReactNode } from "react";
import { Card, CardContent } from "../ui/card";
import { numberTextClass, secondaryTextClass } from "../../utils/cssConstants";

export const StatCard = memo(function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card>
      <CardContent className="text-center p-2.5">
        <p className={`${secondaryTextClass} uppercase`}>{label}</p>
        <p className={`text-sm mt-0.5 font-bold ${numberTextClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
});
