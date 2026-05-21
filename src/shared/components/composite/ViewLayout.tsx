import { type ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

export function ViewLayout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {title && <SectionHeader title={title} className="mb-0.5" />}
      {children}
    </div>
  );
}
