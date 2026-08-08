import type { ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
        {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function PageSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-accent shrink-0" />
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {description && <span className="text-xs text-text-secondary ml-1">{description}</span>}
        </div>
      )}
      {children}
    </div>
  );
}