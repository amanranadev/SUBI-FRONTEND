"use client";

import * as React from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TASK_LIST_FILTERS,
  type TaskListFilterPayload,
} from "../types/task-filters";
import { TasksFilterDueDateSection } from "./tasks-filter-due-date-section";
import { TasksFilterStatusSection } from "./tasks-filter-status-section";

type TasksFilterPanelProps = {
  taskFilterMode: "active" | "completed";
  applied: TaskListFilterPayload;
  onApply: (next: TaskListFilterPayload) => void;
  onClose?: () => void;
  className?: string;
};

function listFiltersDirty(
  taskFilterMode: "active" | "completed",
  draft: TaskListFilterPayload,
  applied: TaskListFilterPayload,
) {
  const datesOrPresetChanged =
    draft.dateFrom !== applied.dateFrom ||
    draft.dateTo !== applied.dateTo ||
    draft.quickPresetId !== applied.quickPresetId;
  if (taskFilterMode === "completed") {
    return datesOrPresetChanged;
  }
  return (
    datesOrPresetChanged || draft.activeStatus !== applied.activeStatus
  );
}

export function TasksFilterPanel({
  taskFilterMode,
  applied,
  onApply,
  onClose,
  className,
}: TasksFilterPanelProps) {
  const [draft, setDraft] = React.useState<TaskListFilterPayload>(applied);

  const isDirty = React.useMemo(
    () => listFiltersDirty(taskFilterMode, draft, applied),
    [applied, draft, taskFilterMode],
  );

  const handleApply = () => {
    onApply(draft);
  };

  const handleReset = () => {
    const defaults = { ...DEFAULT_TASK_LIST_FILTERS };
    setDraft(defaults);
    onApply(defaults);
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-3 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight">Filters</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:!bg-muted hover:!text-foreground"
            onClick={handleReset}
          >
            Reset
          </Button>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:!bg-muted hover:!text-foreground"
              onClick={onClose}
              aria-label="Close filters"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-6 px-4 py-4">
        {taskFilterMode === "active" ? (
          <TasksFilterStatusSection
            value={draft.activeStatus}
            onChange={(activeStatus) =>
              setDraft((prev) => ({ ...prev, activeStatus }))
            }
          />
        ) : null}

        <TasksFilterDueDateSection
          dateFrom={draft.dateFrom}
          dateTo={draft.dateTo}
          quickPresetId={draft.quickPresetId}
          onQuickPresetChange={(quickPresetId) =>
            setDraft((prev) => ({ ...prev, quickPresetId }))
          }
          onCustomDatesChange={(dateFrom, dateTo) =>
            setDraft((prev) => ({
              ...prev,
              dateFrom,
              dateTo,
              quickPresetId: null,
            }))
          }
        />
      </div>

      <footer className="border-t border-black/[0.06] px-4 py-3 dark:border-white/10">
        <Button
          type="button"
          className="h-11 w-full gap-2 rounded-2xl text-sm font-semibold shadow-md"
          disabled={!isDirty}
          onClick={handleApply}
        >
          <Check className="size-4 shrink-0" aria-hidden />
          Apply filters
        </Button>
      </footer>
    </div>
  );
}
