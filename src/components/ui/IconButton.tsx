"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
}

/** Square icon button used across the toolbar and panels. */
export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton({ active, label, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        title={label}
        aria-label={label}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 transition-colors",
          "hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
          active && "bg-accent-soft text-accent",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
