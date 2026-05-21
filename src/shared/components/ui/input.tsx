import type React from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  className?: string;
}

const noSpinners = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`h-8 px-2.5 text-sm rounded-md border border-border bg-bg-primary text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-text-tertiary ${type === "number" ? noSpinners : ""} ${className ?? ""}`}
      {...props}
    />
  );
}
