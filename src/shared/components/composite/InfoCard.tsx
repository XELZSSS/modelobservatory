import { type ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-3 last:pb-3">
        <p className="text-xs font-bold mb-1.5">{title}</p>
        <div className="flex flex-col gap-1.5">{children}</div>
      </CardContent>
    </Card>
  );
}
