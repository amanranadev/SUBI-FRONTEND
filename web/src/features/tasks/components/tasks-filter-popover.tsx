"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/lib/utils";
import type { TaskListFilterPayload } from "../types/task-filters";
import { TasksFilterPanel } from "./tasks-filter-panel";

type TasksFilterPopoverProps = {
  taskFilterMode: "active" | "completed";
  applied: TaskListFilterPayload;
  hasActiveFilters: boolean;
  onApply: (next: TaskListFilterPayload) => void;
};

export function TasksFilterPopover({
  taskFilterMode,
  applied,
  hasActiveFilters,
  onApply,
}: TasksFilterPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [panelKey, setPanelKey] = React.useState(0);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setPanelKey((key) => key + 1);
    }
  };

  const handleApply = (payload: TaskListFilterPayload) => {
    onApply(payload);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full opacity-40 transition-opacity hover:opacity-100",
            hasActiveFilters && "opacity-100 text-primary",
          )}
          aria-label="Task filters"
        >
          <Filter className="size-5" />
          {hasActiveFilters ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(100vw-1.5rem,22rem)] border-black/[0.06] p-0 shadow-xl dark:border-white/10"
      >
        <TasksFilterPanel
          key={panelKey}
          taskFilterMode={taskFilterMode}
          applied={applied}
          onApply={handleApply}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
