"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TasksFilterChipProps = {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function TasksFilterChip({
  selected = false,
  onClick,
  children,
  icon,
  className,
  disabled = false,
}: TasksFilterChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-black/[0.08] bg-background text-foreground hover:bg-muted/60 dark:border-white/10 dark:hover:bg-white/5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
