import { type ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-2.5 last:pb-2.5">
        <p className="text-xs font-bold mb-1">{title}</p>
        <div className="flex flex-col gap-1">{children}</div>
      </CardContent>
    </Card>
  );
}
