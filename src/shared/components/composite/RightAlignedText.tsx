import { memo, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface RightAlignedTextProps {
  children: ReactNode;
  className?: string;
}

// Right-aligned table cell with single-line ellipsis truncation. Used for
// "provider" / "creator" / "category" columns across every rankings view.
export const RightAlignedText = memo(function RightAlignedText({ children, className }: RightAlignedTextProps) {
  return <p className={cn("overflow-hidden text-ellipsis whitespace-nowrap text-right", className)}>{children}</p>;
});
