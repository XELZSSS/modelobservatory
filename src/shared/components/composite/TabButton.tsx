import type { ReactNode } from "react";

export function TabButton({ active, onClick, children, size = "md" }: { active: boolean; onClick: () => void; children: ReactNode; size?: "sm" | "md" }) {
  const h = size === "sm" ? "min-h-[28px]" : "min-h-[36px]";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`${h} py-1 px-2 md:px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-selected text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-hover"}`}
    >
      {children}
    </button>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-xs px-2 py-0.5 rounded-[4px] border font-semibold cursor-pointer transition-colors ${active ? "border-text-primary bg-text-primary text-bg-secondary" : "border-border text-text-secondary hover:text-text-primary"}`}
    >
      {children}
    </button>
  );
}
