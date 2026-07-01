"use client";

import type { ReactNode } from "react";

export function TasksFilterSectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}
