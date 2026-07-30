import { cn } from "../../utils/cn";
import { memo } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "top" | "left" | "none";
}

export const Card = memo(function Card({ children, className, accent = "none", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-card transition-shadow duration-200",
        className,
      )}
      {...props}
    >
      {accent === "top" && (
        <>
          <div className="h-1 bg-gradient-to-r from-accent to-info shrink-0" />
          {children}
        </>
      )}
      {accent === "left" && (
        <div className="flex min-w-0">
          <div className="w-1 bg-gradient-to-b from-accent to-info shrink-0" />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      )}
      {accent === "none" && children}
    </div>
  );
});

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export const CardContent = memo(function CardContent({ className, children, padding = "md", ...props }: CardContentProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
