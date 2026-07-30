import { memo, type ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

export const InfoCard = memo(function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card accent="top">
      <CardContent padding="md">
        <p className="text-sm font-semibold mb-3 text-text-primary">{title}</p>
        <div className="flex flex-col gap-2 min-w-0">{children}</div>
      </CardContent>
    </Card>
  );
});
