import { cn } from "../../utils/cn";
import type React from "react";

interface BadgeProps {
  variant?: "default" | "outline";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold leading-[18px] px-2 py-0.5 rounded-md transition-colors",
        variant === "outline" ? "border border-border text-text-primary" : "bg-bg-tertiary text-text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
