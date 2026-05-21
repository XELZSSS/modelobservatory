import type React from "react";

interface BadgeProps {
  variant?: "default" | "outline";
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

export function Badge({ variant = "default", className, children, style, onClick }: BadgeProps) {
  const base = "inline-flex items-center text-xs font-semibold leading-[18px] px-2 py-0.5 rounded-md transition-colors";
  const variantClass = variant === "outline" ? "border border-border text-text-primary" : "bg-bg-tertiary text-text-primary";

  return (
    <span
      className={`${base} ${variantClass} ${className ?? ""}`}
      style={{ cursor: onClick ? "pointer" : undefined, ...style }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.currentTarget.click();
              }
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
