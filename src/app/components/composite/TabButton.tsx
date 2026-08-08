import { memo, type ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";

interface TabButtonProps {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
  id?: string;
  tabIndex?: number;
  "aria-controls"?: string;
}

export const TabButton = memo(function TabButton({
  active,
  onClick,
  children,
  className,
  size = "md",
  id,
  tabIndex,
  "aria-controls": ariaControls,
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={ariaControls}
      tabIndex={tabIndex ?? (active ? 0 : -1)}
      onClick={onClick}
      className={cn(
        "rounded-md font-medium transition-colors duration-150 whitespace-nowrap shrink-0",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "bg-bg-card text-text-primary shadow-sm border border-border"
          : "text-text-secondary hover:text-text-primary border border-transparent",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1",
        className,
      )}
    >
      {children}
    </button>
  );
});