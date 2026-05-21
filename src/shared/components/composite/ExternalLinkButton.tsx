import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { safeHref } from "../../utils/format";

interface ExternalLinkButtonProps {
  href: string | null | undefined;
  children?: ReactNode;
  showIcon?: boolean;
  className?: string;
  iconSize?: number;
}

export function ExternalLinkButton({ href, children, showIcon = true, className = "", iconSize = 14 }: ExternalLinkButtonProps) {
  const safeUrl = safeHref(href);

  if (!safeUrl) return null;

  return (
    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={`text-text-tertiary hover:text-text-primary transition-colors ${className}`}>
      {children || (showIcon && <ExternalLink size={iconSize} />)}
    </a>
  );
}
