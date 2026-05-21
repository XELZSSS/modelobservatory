import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "ghost-icon";
  size?: "default" | "sm" | "icon";
  children?: React.ReactNode;
}

const baseClass = "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<string, string> = {
  default: "bg-primary text-bg-primary hover:opacity-90",
  outline: "border border-border text-text-primary hover:bg-hover",
  ghost: "text-text-primary hover:bg-hover",
  "ghost-icon": "p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-50",
  link: "text-text-primary underline-offset-4 hover:underline",
};

const sizeClass: Record<string, string> = {
  default: "h-9 px-4 text-sm rounded-md",
  sm: "h-7 px-2.5 text-xs rounded-md",
  icon: "size-8 rounded-md",
};

export function Button({ variant = "default", size = "default", className, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={`${baseClass} ${variantClass[variant] ?? variantClass.default} ${sizeClass[size] ?? sizeClass.default} ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}
