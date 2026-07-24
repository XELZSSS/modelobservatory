import { cn } from "../../utils/cn";
import { memo, type ReactNode } from "react";

export const Card = memo(function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-md border border-border bg-bg-card overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
});

export const CardContent = memo(function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
});
