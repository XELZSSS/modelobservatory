import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export function TabButton({ active, onClick, children, size = "md", id, "aria-controls": ariaControls }: { active: boolean; onClick: () => void; children: ReactNode; size?: "sm" | "md"; id?: string; "aria-controls"?: string }) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={ariaControls}
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "py-1 px-2 md:px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors",
        size === "sm" ? "min-h-[28px]" : "min-h-[36px]",
        active ? "bg-selected text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-hover",
      )}
    >
      {children}
    </button>
  );
}
