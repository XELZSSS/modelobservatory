import type React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className, style, ...props }: CardProps) {
  return (
    <div className={`rounded-md border border-border bg-[var(--bg-card)] ${className ?? ""}`} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, style, ...props }: CardProps) {
  const hasPaddingClass = className && /\bp-[\d.]+\b/.test(className);
  const paddingClass = hasPaddingClass ? "" : "p-4";
  return (
    <div className={`${paddingClass} ${className ?? ""}`} style={style} {...props}>
      {children}
    </div>
  );
}
