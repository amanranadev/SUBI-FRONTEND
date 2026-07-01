"use client";

import { Circle, CircleDashed, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskActiveStatusFilter } from "../types/task-filters";
import { TasksFilterChip } from "./tasks-filter-chip";
import { TasksFilterSectionTitle } from "./tasks-filter-section-title";

const STATUS_ITEMS: {
  value: TaskActiveStatusFilter;
  label: string;
  iconKind: "all" | "open" | "skipped";
}[] = [
  { value: "all", label: "All", iconKind: "all" },
  { value: "open", label: "ACTIVE", iconKind: "open" },
  { value: "skipped", label: "Skipped", iconKind: "skipped" },
];

function StatusIcon({
  kind,
  selected,
}: {
  kind: "all" | "open" | "skipped";
  selected: boolean;
}) {
  const iconClass = "size-3.5 shrink-0";
  if (kind === "all") {
    return <List className={iconClass} strokeWidth={2} aria-hidden />;
  }
  if (kind === "open") {
    return (
      <Circle
        className={cn(iconClass, selected && "fill-current")}
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  return <CircleDashed className={iconClass} strokeWidth={2} aria-hidden />;
}

type TasksFilterStatusSectionProps = {
  value: TaskActiveStatusFilter;
  onChange: (next: TaskActiveStatusFilter) => void;
};

export function TasksFilterStatusSection({
  value,
  onChange,
}: TasksFilterStatusSectionProps) {
  return (
    <section className="space-y-2.5">
      <TasksFilterSectionTitle>Status</TasksFilterSectionTitle>
      <div className="flex flex-wrap gap-2">
        {STATUS_ITEMS.map((item) => (
          <TasksFilterChip
            key={item.value}
            selected={value === item.value}
            onClick={() => onChange(item.value)}
            icon={
              <StatusIcon kind={item.iconKind} selected={value === item.value} />
            }
          >
            {item.label}
          </TasksFilterChip>
        ))}
      </div>
    </section>
  );
}
