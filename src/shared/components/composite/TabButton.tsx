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

